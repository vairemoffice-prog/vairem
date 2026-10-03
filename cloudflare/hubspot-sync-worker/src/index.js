/**
 * Syncs a VAIREM order to HubSpot CRM: upserts the contact, updates their
 * LTV/refill/order-count properties, and creates a Deal for the order.
 *
 * Runs as a Cloudflare Worker because this call needs the HubSpot Private
 * App token, which must never reach the browser — the static site (GitHub
 * Pages) can only call this Worker's public URL, never HubSpot directly.
 *
 * Required Worker secrets (set with `wrangler secret put` or in the
 * Cloudflare dashboard):
 *   HUBSPOT_PRIVATE_APP_TOKEN
 *   STRIPE_SECRET_KEY        sk_test_... (sandbox) / sk_live_... (production)
 *   STRIPE_WEBHOOK_SECRET    whsec_... of the webhook pointing at /stripe-webhook
 *
 * Routes:
 *   POST /                 legacy: sync an order straight to HubSpot (no payment)
 *   POST /abandoned        opted-in cart reminder: stores the cart on the contact
 *   POST /checkout         create a Stripe Checkout Session, returns { url }
 *   GET  /session?id=cs_…  { paid, orderNr } for the return page
 *   POST /stripe-webhook   Stripe (payment_intent.succeeded) -> HubSpot sync
 *
 * Required custom HubSpot contact properties (create these once in the
 * HubSpot portal — Settings -> Properties -> Contact properties). HubSpot
 * derives the internal name from the label you type, so it rarely comes
 * out as the name below — after creating each one, check its actual
 * internal name and update the constants below to match:
 *   PROP_LTV          number   Lifetime value in PLN
 *   PROP_ORDER_COUNT  number   Total number of orders (refill count)
 *   PROP_LAST_ORDER   date     Timestamp of the most recent order
 *
 * Expected POST body (JSON), sent by checkout.html:
 *   {
 *     "orderNr": "VR-XYZ123",
 *     "email": "person@example.com",
 *     "name": "Jan Kowalski",
 *     "phone": "+48 000 000 000",
 *     "items": [{ "nr": "017", "name": "Before It Dries", "qty": 1, "price": 189 }],
 *     "total": 189
 *   }
 */

const ALLOWED_ORIGIN = 'https://vairemoffice-prog.github.io';
const HUBSPOT_API = 'https://api.hubapi.com';

// Actual internal names of the custom contact properties in the VAIREM
// HubSpot portal — see the comment above for how these are assigned.
const PROP_LTV = 'vairem__ltv_pln';
const PROP_ORDER_COUNT = 'vairem__liczba_zamowien';
const PROP_LAST_ORDER = 'vairem__ostatnie_zamowienie';

// Abandoned-cart reminder properties (see README, section 8). Create them in
// HubSpot and confirm the internal names — update here if they differ.
//   PROP_CART_CONSENT  single checkbox        zgoda na przypomnienie ("true")
//   PROP_CART_ITEMS    single-line text       produkty w porzuconym koszyku
//   PROP_CART_VALUE    number                 wartość porzuconego koszyka (PLN)
const PROP_CART_CONSENT = 'vairem__zgoda_na_przypomnienie';
const PROP_CART_ITEMS = 'vairem__produkty_w_koszyku';
const PROP_CART_VALUE = 'vairem__wartosc_koszyka_pln';

// Legacy unauthenticated sync endpoint (POST /). The old checkout called it
// directly; with Stripe the sync happens from the verified webhook instead.
// Set to false once the Stripe checkout is live so nobody can create deals
// without paying.
const LEGACY_SYNC_ENABLED = false;

// ---- Shop / Stripe settings ------------------------------------------------
const SITE = 'https://vairemoffice-prog.github.io/vairem';
const STRIPE_API = 'https://api.stripe.com/v1';
// Prices are authoritative HERE — never trust amounts sent by the browser.
const PRODUCTS = {
  '017': { name: 'Before It Dries', price: 249 },
  '042': { name: 'Within', price: 249 },
  '086': { name: 'Afterlight', price: 249 },
};
const DISCOUNT_CODE = 'WITAJ10';
const DISCOUNT_RATE = 0.1;
const SHIPPING_COST = 9.99; // zł
const FREE_SHIPPING_ABOVE = 300; // zł, compared after the discount
const WEBHOOK_TOLERANCE_SECONDS = 300;

// Deal stage ID of "Zamknięcie Wygrane" (closed won) in the portal's default
// pipeline. Stage IDs are portal-specific; list them via
// GET /crm/v3/pipelines/deals.
const DEAL_STAGE_CLOSED_WON = '6161511673';

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin === ALLOWED_ORIGIN ? origin : ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

async function hubspotFetch(path, token, init) {
  const res = await fetch(`${HUBSPOT_API}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init && init.headers),
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`HubSpot ${path} -> ${res.status}: ${body}`);
  }
  return res.status === 204 ? null : res.json();
}

async function upsertContact(order, token) {
  const [firstname, ...rest] = (order.name || '').trim().split(' ');
  const lastname = rest.join(' ');

  // Read current LTV/order-count so we can increment them instead of
  // overwriting — HubSpot has no atomic "add to number property" call.
  let current = null;
  try {
    current = await hubspotFetch(
      `/crm/v3/objects/contacts/${encodeURIComponent(order.email)}?idProperty=email&properties=${PROP_LTV},${PROP_ORDER_COUNT}`,
      token,
      { method: 'GET' }
    );
  } catch (e) {
    current = null; // contact doesn't exist yet — that's fine, upsert creates it
  }

  const prevLtv = Number((current && current.properties && current.properties[PROP_LTV]) || 0);
  const prevOrders = Number((current && current.properties && current.properties[PROP_ORDER_COUNT]) || 0);

  // HubSpot "date picker" properties require midnight UTC as epoch
  // milliseconds (a string) — a full ISO timestamp with a time-of-day
  // component is rejected.
  const now = new Date();
  const midnightUtcMs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

  const contact = await hubspotFetch('/crm/v3/objects/contacts/batch/upsert', token, {
    method: 'POST',
    body: JSON.stringify({
      inputs: [
        {
          idProperty: 'email',
          id: order.email,
          properties: {
            email: order.email,
            firstname: firstname || undefined,
            lastname: lastname || undefined,
            phone: order.phone || undefined,
            [PROP_LTV]: (prevLtv + Number(order.total || 0)).toString(),
            [PROP_ORDER_COUNT]: (prevOrders + 1).toString(),
            [PROP_LAST_ORDER]: String(midnightUtcMs),
          },
        },
      ],
    }),
  });

  return contact.results[0].id;
}

async function createDeal(order, contactId, token) {
  const itemsSummary = (order.items || [])
    .map(i => `${i.nr} ${i.name} x${i.qty}`)
    .join(', ');

  const deal = await hubspotFetch('/crm/v3/objects/deals', token, {
    method: 'POST',
    body: JSON.stringify({
      properties: {
        dealname: order.orderNr || `VAIREM order ${Date.now()}`,
        amount: String(order.total || 0),
        dealstage: DEAL_STAGE_CLOSED_WON,
        pipeline: 'default',
        description: itemsSummary,
      },
      associations: [
        {
          to: { id: contactId },
          types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }], // deal -> contact
        },
      ],
    }),
  });

  return deal.id;
}

// ---------------------------------------------------------------------------
// Stripe helpers
// ---------------------------------------------------------------------------

function toGrosze(zl) {
  return Math.round(zl * 100);
}

// Flatten nested objects/arrays into Stripe's bracketed form encoding:
//   { line_items: [{ quantity: 1 }] } -> line_items[0][quantity]=1
function encodeForm(obj, prefix, out = new URLSearchParams()) {
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue;
    const name = prefix ? `${prefix}[${key}]` : key;
    if (Array.isArray(value)) {
      value.forEach((v, i) => {
        if (v !== null && typeof v === 'object') encodeForm(v, `${name}[${i}]`, out);
        else out.append(`${name}[${i}]`, String(v));
      });
    } else if (typeof value === 'object') {
      encodeForm(value, name, out);
    } else {
      out.append(name, String(value));
    }
  }
  return out;
}

async function stripeFetch(path, key, { method = 'GET', body } = {}) {
  const res = await fetch(`${STRIPE_API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      ...(body ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
    },
    body: body ? encodeForm(body).toString() : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data && data.error && data.error.message) || `HTTP ${res.status}`;
    throw new Error(`Stripe ${path}: ${msg}`);
  }
  return data;
}

// Price an order from the catalogue above. Returns null for invalid input.
function priceOrder(rawItems, discountCode) {
  if (!Array.isArray(rawItems) || rawItems.length === 0 || rawItems.length > 20) return null;
  const items = [];
  let subtotal = 0;
  for (const raw of rawItems) {
    const product = PRODUCTS[String(raw && raw.nr)];
    const qty = Number(raw && raw.qty);
    if (!product || !Number.isInteger(qty) || qty < 1 || qty > 20) return null;
    items.push({ nr: String(raw.nr), name: product.name, qty, price: product.price });
    subtotal += product.price * qty;
  }
  const discount =
    String(discountCode || '').trim().toUpperCase() === DISCOUNT_CODE
      ? Math.round(subtotal * DISCOUNT_RATE)
      : 0;
  const shipping = subtotal - discount > FREE_SHIPPING_ABOVE ? 0 : SHIPPING_COST;
  return { items, subtotal, discount, shipping, total: subtotal - discount + shipping };
}

function paymentMethodTypesFor(method) {
  const m = String(method || '').toLowerCase();
  if (m.includes('blik')) return ['blik'];
  if (m.includes('przelew')) return ['p24'];
  return ['card']; // card, Apple Pay and Google Pay all run through "card"
}

async function createCheckoutSession(order, env) {
  const priced = priceOrder(order.items, order.discountCode);
  if (!priced) throw Object.assign(new Error('Invalid items'), { status: 400 });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(order.email || '')) {
    throw Object.assign(new Error('Invalid email'), { status: 400 });
  }
  const orderNr = /^VR-[A-Z0-9]{3,20}$/.test(order.orderNr || '')
    ? order.orderNr
    : `VR-${Date.now().toString(36).toUpperCase()}`;

  const orderMeta = {
    orderNr,
    email: order.email,
    name: String(order.name || '').slice(0, 200),
    phone: String(order.phone || '').slice(0, 50),
    city: String(order.city || '').slice(0, 100),
    items: priced.items.map(i => `${i.nr}x${i.qty}`).join(','),
  };

  const params = {
    mode: 'payment',
    locale: 'pl',
    customer_email: order.email,
    success_url: `${SITE}/checkout.html?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE}/checkout.html?canceled=1`,
    payment_method_types: paymentMethodTypesFor(order.method),
    line_items: priced.items.map(i => ({
      quantity: i.qty,
      price_data: {
        currency: 'pln',
        unit_amount: toGrosze(i.price),
        product_data: { name: `${i.nr} ${i.name}` },
      },
    })),
    shipping_options: [
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          display_name: 'Wysyłka',
          fixed_amount: { amount: toGrosze(priced.shipping), currency: 'pln' },
        },
      },
    ],
    metadata: orderMeta,
    // The webhook listens to payment_intent.succeeded, so the order details
    // have to be on the PaymentIntent as well (not only on the session).
    payment_intent_data: { metadata: orderMeta, description: `VAIREM ${orderNr}` },
  };

  if (priced.discount > 0) {
    const coupon = await stripeFetch('/coupons', env.STRIPE_SECRET_KEY, {
      method: 'POST',
      body: {
        amount_off: toGrosze(priced.discount),
        currency: 'pln',
        duration: 'once',
        max_redemptions: 1,
        name: DISCOUNT_CODE,
      },
    });
    params.discounts = [{ coupon: coupon.id }];
  }

  const session = await stripeFetch('/checkout/sessions', env.STRIPE_SECRET_KEY, {
    method: 'POST',
    body: params,
  });
  return { url: session.url, orderNr, total: priced.total };
}

// Verify the `Stripe-Signature` header (HMAC-SHA256 over "<t>.<raw body>").
async function verifyStripeSignature(rawBody, header, secret) {
  if (!header || !secret) return false;
  const parts = header.split(',').map(p => p.trim().split('='));
  const t = (parts.find(p => p[0] === 't') || [])[1];
  const candidates = parts.filter(p => p[0] === 'v1').map(p => p[1]);
  if (!t || candidates.length === 0) return false;
  if (Math.abs(Date.now() / 1000 - Number(t)) > WEBHOOK_TOLERANCE_SECONDS) return false;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${t}.${rawBody}`));
  const expected = Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  // Constant-time comparison against every v1 signature in the header.
  return candidates.some(c => {
    if (c.length !== expected.length) return false;
    let diff = 0;
    for (let i = 0; i < c.length; i++) diff |= c.charCodeAt(i) ^ expected.charCodeAt(i);
    return diff === 0;
  });
}

// A succeeded PaymentIntent of our checkout -> HubSpot contact + deal.
// Idempotent on orderNr, because Stripe retries failed webhook deliveries.
async function syncPaidPayment(pi, token) {
  const meta = pi.metadata || {};
  const orderNr = meta.orderNr;

  const existing = await hubspotFetch('/crm/v3/objects/deals/search', token, {
    method: 'POST',
    body: JSON.stringify({
      filterGroups: [{ filters: [{ propertyName: 'dealname', operator: 'EQ', value: orderNr }] }],
      limit: 1,
    }),
  });
  if (existing.total > 0) return { skipped: true, orderNr };

  const items = String(meta.items || '')
    .split(',')
    .map(entry => entry.split('x'))
    .filter(([nr, qty]) => PRODUCTS[nr] && Number(qty) > 0)
    .map(([nr, qty]) => ({ nr, name: PRODUCTS[nr].name, qty: Number(qty) }));

  const order = {
    orderNr,
    email: meta.email || pi.receipt_email,
    name: meta.name || '',
    phone: meta.phone || '',
    items,
    total: (pi.amount_received || pi.amount || 0) / 100,
  };
  if (!order.email) throw new Error(`PaymentIntent ${pi.id} has no e-mail`);

  const contactId = await upsertContact(order, token);
  const dealId = await createDeal(order, contactId, token);
  await clearAbandonedCart(order.email, token);
  return { orderNr, contactId, dealId };
}

// ---------------------------------------------------------------------------
// Request handling
// ---------------------------------------------------------------------------

function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  });
}

async function handleLegacySync(request, env, origin) {
  if (!LEGACY_SYNC_ENABLED) return json({ ok: false, error: 'Disabled' }, 410, origin);
  if (!env.HUBSPOT_PRIVATE_APP_TOKEN) {
    return new Response('Worker not configured', { status: 500, headers: corsHeaders(origin) });
  }

  let order;
  try {
    order = await request.json();
  } catch (e) {
    return new Response('Invalid JSON', { status: 400, headers: corsHeaders(origin) });
  }
  if (!order || !order.email) {
    return new Response('Missing email', { status: 400, headers: corsHeaders(origin) });
  }

  try {
    const contactId = await upsertContact(order, env.HUBSPOT_PRIVATE_APP_TOKEN);
    const dealId = await createDeal(order, contactId, env.HUBSPOT_PRIVATE_APP_TOKEN);
    return json({ ok: true, contactId, dealId }, 200, origin);
  } catch (e) {
    return json({ ok: false, error: String(e) }, 502, origin);
  }
}

// Opt-in cart reminder. The browser sends { email, name, consent: true, items };
// the cart is re-priced here from PRODUCTS, never taken from the browser. Only
// writes the cart properties; a HubSpot workflow does the actual e-mailing.
async function handleAbandoned(request, env, origin) {
  if (!env.HUBSPOT_PRIVATE_APP_TOKEN) return json({ ok: false, error: 'Not configured' }, 500, origin);
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ ok: false, error: 'Invalid JSON' }, 400, origin);
  }
  const email = String((body && body.email) || '').trim();
  if (!body || body.consent !== true) return json({ ok: false, error: 'Consent required' }, 400, origin);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 200) {
    return json({ ok: false, error: 'Invalid email' }, 400, origin);
  }
  const priced = priceOrder(body.items, '');
  if (!priced) return json({ ok: false, error: 'Invalid items' }, 400, origin);

  const [firstname, ...rest] = String(body.name || '').trim().slice(0, 200).split(' ');
  try {
    await hubspotFetch('/crm/v3/objects/contacts/batch/upsert', env.HUBSPOT_PRIVATE_APP_TOKEN, {
      method: 'POST',
      body: JSON.stringify({
        inputs: [
          {
            idProperty: 'email',
            id: email,
            properties: {
              email,
              firstname: firstname || undefined,
              lastname: rest.join(' ') || undefined,
              [PROP_CART_CONSENT]: 'true',
              [PROP_CART_ITEMS]: priced.items.map(i => `${i.nr} ${i.name} x${i.qty}`).join(', '),
              [PROP_CART_VALUE]: String(priced.subtotal),
            },
          },
        ],
      }),
    });
    return json({ ok: true }, 200, origin);
  } catch (e) {
    console.log(`abandoned: failed ${String(e).slice(0, 300)}`);
    return json({ ok: false, error: 'Sync failed' }, 502, origin);
  }
}

// After a paid order, empty the cart properties so the reminder workflow does
// not fire. Best effort and separate from the order sync: if the properties do
// not exist yet this must never break order processing.
async function clearAbandonedCart(email, token) {
  try {
    await hubspotFetch('/crm/v3/objects/contacts/batch/upsert', token, {
      method: 'POST',
      body: JSON.stringify({
        inputs: [{ idProperty: 'email', id: email, properties: { email, [PROP_CART_ITEMS]: '', [PROP_CART_VALUE]: '' } }],
      }),
    });
  } catch (e) {
    console.log(`clearAbandonedCart: ${String(e).slice(0, 200)}`);
  }
}

async function handleCheckout(request, env, origin) {
  if (!env.STRIPE_SECRET_KEY) return json({ ok: false, error: 'Payments not configured' }, 500, origin);
  let order;
  try {
    order = await request.json();
  } catch (e) {
    return json({ ok: false, error: 'Invalid JSON' }, 400, origin);
  }
  try {
    const result = await createCheckoutSession(order || {}, env);
    return json({ ok: true, ...result }, 200, origin);
  } catch (e) {
    return json({ ok: false, error: String(e.message || e) }, e.status || 502, origin);
  }
}

async function handleSessionStatus(url, env, origin) {
  const id = url.searchParams.get('id') || '';
  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(id)) return json({ ok: false, error: 'Bad id' }, 400, origin);
  if (!env.STRIPE_SECRET_KEY) return json({ ok: false, error: 'Payments not configured' }, 500, origin);
  try {
    const session = await stripeFetch(`/checkout/sessions/${id}`, env.STRIPE_SECRET_KEY);
    return json(
      {
        ok: true,
        paid: session.payment_status === 'paid',
        status: session.status,
        orderNr: (session.metadata && session.metadata.orderNr) || null,
      },
      200,
      origin
    );
  } catch (e) {
    return json({ ok: false, error: 'Lookup failed' }, 502, origin);
  }
}

async function handleStripeWebhook(request, env) {
  if (!env.STRIPE_WEBHOOK_SECRET || !env.HUBSPOT_PRIVATE_APP_TOKEN) {
    return new Response('Not configured', { status: 500 });
  }
  const raw = await request.text();
  const valid = await verifyStripeSignature(raw, request.headers.get('Stripe-Signature'), env.STRIPE_WEBHOOK_SECRET);
  if (!valid) {
    console.log('stripe-webhook: rejected, bad signature');
    return new Response('Bad signature', { status: 400 });
  }

  let event;
  try {
    event = JSON.parse(raw);
  } catch (e) {
    return new Response('Invalid JSON', { status: 400 });
  }

  // Only payments created by our checkout carry an orderNr in their metadata;
  // thin payloads have no data.object at all.
  const payment = event.data && event.data.object;
  const isOurPayment =
    event.type === 'payment_intent.succeeded' && payment && payment.metadata && payment.metadata.orderNr;
  if (!isOurPayment) {
    console.log(`stripe-webhook: ignored ${event.type}`);
    return new Response('Ignored', { status: 200 });
  }

  try {
    const result = await syncPaidPayment(payment, env.HUBSPOT_PRIVATE_APP_TOKEN);
    console.log(`stripe-webhook: synced ${JSON.stringify(result)}`);
    return new Response(JSON.stringify(result), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    // 5xx makes Stripe retry the delivery.
    console.log(`stripe-webhook: sync failed ${String(e).slice(0, 300)}`);
    return new Response(String(e), { status: 500 });
  }
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(origin) });
    }

    if (url.pathname === '/stripe-webhook' && request.method === 'POST') {
      return handleStripeWebhook(request, env);
    }
    if (url.pathname === '/abandoned' && request.method === 'POST') {
      return handleAbandoned(request, env, origin);
    }
    if (url.pathname === '/checkout' && request.method === 'POST') {
      return handleCheckout(request, env, origin);
    }
    if (url.pathname === '/session' && request.method === 'GET') {
      return handleSessionStatus(url, env, origin);
    }
    if (url.pathname === '/' && request.method === 'POST') {
      return handleLegacySync(request, env, origin);
    }
    return new Response('Method not allowed', { status: 405, headers: corsHeaders(origin) });
  },
};
