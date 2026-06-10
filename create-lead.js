// OpticAir — receives website form submissions and creates a Lead in Housecall Pro.
// Requires the Vercel env var HCP_API_KEY (Housecall Pro MAX plan API key).
// Until that key is set, it responds gracefully so the form still works (lead is just not delivered).
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  if (!body || typeof body !== 'object') body = {};

  const get = (k) => (body[k] == null ? '' : String(body[k]).trim());
  const name = get('name'), phone = get('phone'), email = get('email');
  const address = get('address'), city = get('city'), service = get('service');
  const urgency = get('urgency'), notes = get('notes'), page = get('page');

  if (!name && !phone && !email) {
    return res.status(400).json({ ok: false, error: 'Missing contact details' });
  }

  const parts = name.split(/\s+/).filter(Boolean);
  const first_name = parts.shift() || 'Website lead';
  const last_name = parts.join(' ');

  const lines = [];
  if (service) lines.push('Service requested: ' + service);
  if (urgency) lines.push('Timing: ' + urgency);
  if (city) lines.push('City/area: ' + city);
  if (notes) lines.push('Notes: ' + notes);
  lines.push('Submitted via OpticAir website' + (page ? ' (' + page + ')' : ''));
  const note = lines.join('\n');

  const key = process.env.HCP_API_KEY;
  if (!key) {
    console.error('[create-lead] HCP_API_KEY not set; lead not delivered:', { name, phone, email });
    return res.status(200).json({ ok: true, delivered: false });
  }

  const customer = { first_name, notifications_enabled: false, lead_source: 'Website' };
  if (last_name) customer.last_name = last_name;
  if (email) customer.email = email;
  if (phone) customer.mobile_number = phone;

  const payload = { customer, lead_source: 'OpticAir Website', note };
  if (address || city) {
    payload.address = {};
    if (address) payload.address.street = address;
    if (city) payload.address.city = city;
  }

  try {
    const r = await fetch('https://api.housecallpro.com/leads', {
      method: 'POST',
      headers: {
        'Authorization': 'Token ' + key,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!r.ok) {
      const text = await r.text().catch(() => '');
      console.error('[create-lead] HCP error', r.status, text);
      return res.status(200).json({ ok: true, delivered: false });
    }
    return res.status(200).json({ ok: true, delivered: true });
  } catch (err) {
    console.error('[create-lead] request failed', err);
    return res.status(200).json({ ok: true, delivered: false });
  }
};
