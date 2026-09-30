/**
 * Creates Stripe Checkout Sessions for VAIREM orders (TEST MODE).
 *
 * Runs as a Cloudflare Worker because creating a Checkout Session needs the
 * Stripe secret key, which must never reach the browser. Prices live HERE,
 * never in the request: the browser only sends product numbers + quantities,
 * so a visitor cannot tamper with what they pay.
 *
 * Required Worker secret (set with `wrangler secret put`):
 *   STRIPE_SECRET_KEY   -- sk_test_... (this Worker refuses live keys)
 *
 * Endpoints:
 *   POST /create-session   { orderNr, email, items:[{nr,qty}], promo, returnUrl }
 *                          -> { url, id }   (redirect the browser to url)
 *   GET  /session-status?id=cs_test_...
 *                          -> { paid, orderNr, email, total, items }
 */

const ALLOWED_ORIGIN = 'https://vairemoffice-prog.github.io';
const STRIPE_API = 'https://api.stripe.com/v1';

// Authoritative price list, in grosze (1 zł = 100). The site still shows
// "[CENA]" (price 0), so these are TEST PLACEHOLDERS — set the real prices
// here (and in js/app.js / checkout.html for display) before going live.
const PRODUCTS = {
  '017': { name: 'Before It Dries', unit: 18900 },
  '042': { name: 'Within', unit: 18900 },
  '086': { name: 'Afterlight', unit: 18900 },
};

const PROMO_CODE = 'WITAJ10';
const PROMO_PERCENT = 10;

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin === ALLOWED_ORIGIN ? origin : ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  });
}

async function stripe(path, key, params) {
  const res = await fetch(STRIPE_API + path, {
    method: params ? 'POST' : 'GET',
    headers: {
      Authorization: `Bearer ${key}`,
      ...(params ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
    },
    body: params ? params.toString() : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error((data.error && data.error.message) || `Stripe ${path} -> ${res.status}`);
  return data;
}

async function createSession(body, env) {
  const email = String(body.email || '').trim();
  const orderNr = String(body.orderNr || '').trim();
  if (!email || !/^VR-[A-Z0-9]+$/.test(orderNr)) throw new Error('Invalid order');

  // The browser sends the URL of checkout.html so this works under any base
  // path; only URLs on the allowed origin are accepted (no open redirect).
  const returnUrl = String(body.returnUrl || '');
  if (!returnUrl.startsWith(ALLOWED_ORIGIN + '/') || returnUrl.includes('?') || returnUrl.includes('#')) {
    throw new Error('Invalid return URL');
  }

  const items = (Array.isArray(body.items) ? body.items : [])
    .map(i => ({ p: PRODUCTS[String(i.nr)], nr: String(i.nr), qty: Math.floor(Number(i.qty)) }))
    .filter(i => i.p && i.qty >= 1 && i.qty <= 20);
  if (!items.length) throw new Error('Empty cart');

  const params = new URLSearchParams();
  params.set('mode', 'payment');
  params.set('customer_email', email);
  params.set('client_reference_id', orderNr);
  params.set('metadata[orderNr]', orderNr);
  params.set('metadata[items]', items.map(i => `${i.nr}x${i.qty}`).join(','));
  // Payment methods (card, Apple/Google Pay, BLIK, Przelewy24) come from the
  // Stripe Dashboard -> Settings -> Payment methods, so none are hardcoded.
  params.set('success_url', `${returnUrl}?paid=1&session_id={CHECKOUT_SESSION_ID}`);
  params.set('cancel_url', `${returnUrl}?canceled=1`);
  items.forEach((i, idx) => {
    params.set(`line_items[${idx}][quantity]`, String(i.qty));
    params.set(`line_items[${idx}][price_data][currency]`, 'pln');
    params.set(`line_items[${idx}][price_data][unit_amount]`, String(i.p.unit));
    params.set(`line_items[${idx}][price_data][product_data][name]`, `${i.nr} ${i.p.name} · 200 ml`);
  });

  if (String(body.promo || '').trim().toUpperCase() === PROMO_CODE) {
    const coupon = await stripe('/coupons', env.STRIPE_SECRET_KEY, new URLSearchParams({
      percent_off: String(PROMO_PERCENT), duration: 'once', name: PROMO_CODE,
    }));
    params.set('discounts[0][coupon]', coupon.id);
  }

  const session = await stripe('/checkout/sessions', env.STRIPE_SECRET_KEY, params);
  return { url: session.url, id: session.id };
}

async function sessionStatus(id, env) {
  if (!/^cs_test_[A-Za-z0-9]+$/.test(id)) throw new Error('Invalid session id');
  const s = await stripe(`/checkout/sessions/${id}?expand[]=line_items`, env.STRIPE_SECRET_KEY);
  return {
    paid: s.payment_status === 'paid',
    orderNr: s.client_reference_id,
    email: s.customer_details && s.customer_details.email,
    total: s.amount_total / 100,
    items: ((s.line_items && s.line_items.data) || []).map(li => ({ name: li.description, qty: li.quantity })),
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders(origin) });
    if (!env.STRIPE_SECRET_KEY || !env.STRIPE_SECRET_KEY.startsWith('sk_test_')) {
      return json({ error: 'Worker not configured with a Stripe test key' }, 500, origin);
    }

    try {
      if (request.method === 'POST' && url.pathname === '/create-session') {
        return json(await createSession(await request.json(), env), 200, origin);
      }
      if (request.method === 'GET' && url.pathname === '/session-status') {
        return json(await sessionStatus(url.searchParams.get('id') || '', env), 200, origin);
      }
      return json({ error: 'Not found' }, 404, origin);
    } catch (e) {
      return json({ error: String(e.message || e) }, 400, origin);
    }
  },
};
