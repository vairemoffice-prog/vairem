/**
 * Syncs a VAIREM order to HubSpot CRM: upserts the contact, updates their
 * LTV/refill/order-count properties, and creates a Deal for the order.
 *
 * Runs as a Cloudflare Worker because this call needs the HubSpot Private
 * App token, which must never reach the browser — the static site (GitHub
 * Pages) can only call this Worker's public URL, never HubSpot directly.
 *
 * Required Worker secret (set with `wrangler secret put`):
 *   HUBSPOT_PRIVATE_APP_TOKEN
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

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin === ALLOWED_ORIGIN ? origin : ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
        dealstage: 'closedwon',
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

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(origin) });
    }
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders(origin) });
    }
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
      return new Response(JSON.stringify({ ok: true, contactId, dealId }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
      });
    } catch (e) {
      return new Response(JSON.stringify({ ok: false, error: String(e) }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
      });
    }
  },
};
