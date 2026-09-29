// OpticAir — receives website form submissions and creates a Lead in Housecall Pro.
// Requires the Vercel env var HCP_API_KEY (Housecall Pro MAX plan API key).
// Until that key is set, it responds gracefully so the form still works (lead is just not delivered).
//
// Optional marketing attribution (see lib/attribution.js) arrives as body.attribution. It is untrusted:
// it is re-validated against an allowlist here, and a missing/invalid value never blocks the lead.
// Optional env var HCP_LEAD_SOURCE_MAP: JSON object renaming any lead-source name below to a different
// existing HCP lead source, e.g. {"QR / Printed Marketing":"QR Codes"}. Not needed while names match.
let attributionLib = null;
try {
  attributionLib = require('../lib/attribution.js');
} catch (e) {
  // Never let attribution take the lead endpoint down; leads are then sent without it.
  console.error('[create-lead] attribution module unavailable:', e && e.message);
}

// Housecall Pro only accepts lead-source names that already exist in the account (anything else is
// rejected with HTTP 400), so every attribution channel maps onto this fixed list. Placement detail
// such as utm_content=lawn_sign stays in the lead note, never in the lead-source name.
const HCP_SOURCE_BY_CHANNEL = {
  paid_search: 'Google Ads',              // gclid/gbraid/wbraid or paid Google UTMs (Microsoft Ads → Website)
  organic_search: 'Organic Search',
  qr: 'QR / Printed Marketing',
  offline: 'QR / Printed Marketing',      // utm_medium=print/flyer/sign…, utm_source=offline
  social: 'Social',
  paid_social: 'Social',
  email: 'Email',
  referral: 'Referral',
  local: 'Google Business Profile',       // utm_source=gbp / gmb
};
// Direct visits, missing attribution, anything outside the list above, and the 400/422 fallback.
const WEBSITE_LEAD_SOURCE = 'Website';

function parseLeadSourceMap(json) {
  if (!json) return {};
  try {
    const map = JSON.parse(json);
    return map && typeof map === 'object' && !Array.isArray(map) ? map : {};
  } catch (e) {
    console.error('[create-lead] HCP_LEAD_SOURCE_MAP is not valid JSON; ignoring it');
    return {};
  }
}

// HCP lead source for the last meaningful touch — always one of the fixed names above.
function resolveLeadSource(attribution, mapJson) {
  if (!attribution) return null;
  const { channel, label } = attributionLib.leadSource(attribution);
  let source = Object.prototype.hasOwnProperty.call(HCP_SOURCE_BY_CHANNEL, channel)
    ? HCP_SOURCE_BY_CHANNEL[channel] : WEBSITE_LEAD_SOURCE;
  if (channel === 'paid_search' && label !== 'Google Ads') source = WEBSITE_LEAD_SOURCE;
  const map = parseLeadSourceMap(mapJson);
  const mapped = Object.prototype.hasOwnProperty.call(map, source) ? map[source] : null;
  return typeof mapped === 'string' && mapped.trim() ? mapped.trim().slice(0, 100) : source;
}

function describeTouch(t) {
  const parts = [];
  if (t.source || t.medium) parts.push((t.source || '(no source)') + ' / ' + (t.medium || '(no medium)'));
  else if (t.referrer) parts.push('referral from ' + t.referrer);
  else parts.push('direct');
  if (t.campaign) parts.push('campaign: ' + t.campaign);
  if (t.content) parts.push('content: ' + t.content);
  if (t.term) parts.push('term: ' + t.term);
  if (t.referrer && (t.source || t.medium)) parts.push('referrer: ' + t.referrer);
  if (t.landingPage) parts.push('landing: ' + t.landingPage);
  parts.push(t.capturedAt.slice(0, 10));
  return parts.join(' · ');
}

// Compact, plain-text attribution block for the HCP lead note. Every value has already been
// through attributionLib.sanitizeState (allowlisted keys, no control chars/markup, bounded length).
function attributionNoteLines(attribution, leadSourceLabel) {
  const first = attribution.firstTouch, last = attribution.lastTouch;
  const sameVisit = JSON.stringify(first) === JSON.stringify(last);
  const lines = [
    'Lead source (website attribution): ' + leadSourceLabel,
    'Last touch: ' + describeTouch(last),
    'First touch: ' + (sameVisit ? 'same visit' : describeTouch(first)),
  ];
  const ids = [];
  [last, first].forEach((t) => {
    attributionLib.CLICK_ID_PARAMS.forEach((k) => {
      if (t[k] && !ids.some((s) => s === k + '=' + t[k])) ids.push(k + '=' + t[k]);
    });
  });
  if (ids.length) lines.push('Google click IDs: ' + ids.join(' '));
  return lines;
}

async function postLead(key, payload) {
  return fetch('https://api.housecallpro.com/leads', {
    method: 'POST',
    headers: {
      'Authorization': 'Token ' + key,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

module.exports = async function handler(req, res) {
  // CORS — the form is served from opticair.ca (GoDaddy) and posts cross-origin to this Vercel function.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

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
  const state = get('state') || get('province') || 'ON';
  const zip = get('zip') || get('postal') || get('postalCode') || get('postal_code');

  if (!name && !phone && !email) {
    return res.status(400).json({ ok: false, error: 'Missing contact details' });
  }

  const parts = name.split(/\s+/).filter(Boolean);
  const first_name = parts.shift() || 'Website lead';
  const last_name = parts.join(' ');

  const lines = [];
  if (service) lines.push('Service requested: ' + service);
  if (urgency) lines.push('Timing: ' + urgency);
  if (address) lines.push('Service address: ' + address + (city ? ', ' + city : ''));
  else if (city) lines.push('City/area: ' + city);
  if (notes) lines.push('Notes: ' + notes);
  lines.push('Submitted via OpticAir website' + (page ? ' (' + page + ')' : ''));

  let attribution = null, leadSource = null;
  try {
    attribution = attributionLib.sanitizeState(body.attribution);
    leadSource = resolveLeadSource(attribution, process.env.HCP_LEAD_SOURCE_MAP);
    if (attribution) lines.push(...attributionNoteLines(attribution, leadSource));
  } catch (e) {
    console.error('[create-lead] attribution ignored:', e && e.message);
    attribution = null; leadSource = null;
  }
  const note = lines.join('\n');

  const key = process.env.HCP_API_KEY;
  if (!key) {
    console.error('[create-lead] HCP_API_KEY not set; lead not delivered:', { name, phone, email });
    return res.status(200).json({ ok: true, delivered: false });
  }

  // Build a structured service address. Province defaults to Ontario (ON) for the Ottawa service area.
  let addr = null;
  if (address || city) {
    addr = {};
    if (address) addr.street = address;
    if (city) addr.city = city;
    if (state) addr.state = state;
    if (zip) addr.zip = zip;
  }

  const customer = { first_name, notifications_enabled: false, lead_source: leadSource || WEBSITE_LEAD_SOURCE };
  if (last_name) customer.last_name = last_name;
  if (email) customer.email = email;
  if (phone) customer.mobile_number = phone;
  // Attach the address to the customer record so it carries over to the job (no manual entry needed).
  if (addr) customer.addresses = [addr];

  const payload = { customer, lead_source: leadSource || WEBSITE_LEAD_SOURCE, note };
  // Also set the lead's top-level address.
  if (addr) payload.address = addr;

  try {
    let r = await postLead(key, payload);
    // An attribution-derived lead source must never cost us the lead: if HCP rejects the request
    // as invalid, resend once with the default "Website" source (the note keeps the attribution).
    if (!r.ok && leadSource && leadSource !== WEBSITE_LEAD_SOURCE && (r.status === 400 || r.status === 422)) {
      console.error('[create-lead] HCP rejected lead with attributed lead source; retrying with default', r.status);
      customer.lead_source = WEBSITE_LEAD_SOURCE;
      payload.lead_source = WEBSITE_LEAD_SOURCE;
      r = await postLead(key, payload);
    }
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

// Exposed for tests.
module.exports.resolveLeadSource = resolveLeadSource;
module.exports.attributionNoteLines = attributionNoteLines;
