// Lead API: legacy behaviour unchanged, attribution validated/bounded, HCP lead source + note.
// global fetch is stubbed — no request ever reaches Housecall Pro.
const test = require('node:test');
const assert = require('node:assert/strict');
const handler = require('../api/create-lead.js');

const AT = '2026-09-20T15:04:05.000Z';
const CONTACT_FORM = {
  name: 'Jane Q Doe', phone: '613-555-0100', email: 'jane@example.com', address: '1 Main St',
  service: 'AC repair', notes: 'Preferred contact: Phone', page: 'contact-form',
};

function mockRes() {
  return {
    statusCode: 200, headers: {}, body: undefined,
    setHeader(k, v) { this.headers[k] = v; },
    status(c) { this.statusCode = c; return this; },
    json(b) { this.body = b; return this; },
    end() { return this; },
  };
}

// Runs the real handler with HCP stubbed. `responses` are returned in order for successive calls.
async function run(body, { responses = [{ ok: true, status: 200 }], env = {}, raw = false } = {}) {
  const calls = [], errors = [];
  const envKeys = ['HCP_API_KEY', 'HCP_LEAD_SOURCE_MAP'];
  const saved = { fetch: global.fetch, error: console.error, env: envKeys.map((k) => [k, process.env[k]]) };
  global.fetch = async (url, init) => {
    calls.push({ url, init, payload: JSON.parse(init.body) });
    const r = responses[Math.min(calls.length - 1, responses.length - 1)];
    if (r.throws) throw new Error('network down');
    return { ok: r.ok, status: r.status, text: async () => 'hcp says no' };
  };
  console.error = (...args) => errors.push(args.map(String).join(' '));
  process.env.HCP_API_KEY = 'test-key';
  delete process.env.HCP_LEAD_SOURCE_MAP;
  Object.assign(process.env, env);
  const res = mockRes();
  try {
    await handler({ method: 'POST', body: raw ? body : JSON.stringify(body) }, res);
  } finally {
    global.fetch = saved.fetch;
    console.error = saved.error;
    for (const [k, v] of saved.env) { if (v === undefined) delete process.env[k]; else process.env[k] = v; }
  }
  return { res, calls, errors };
}

const BASE_PAYLOAD = {
  customer: {
    first_name: 'Jane', last_name: 'Q Doe', notifications_enabled: false, lead_source: 'Website',
    email: 'jane@example.com', mobile_number: '613-555-0100',
    addresses: [{ street: '1 Main St', state: 'ON' }],
  },
  lead_source: 'Website',
  note: 'Service requested: AC repair\nService address: 1 Main St\nNotes: Preferred contact: Phone\n' +
        'Submitted via OpticAir website (contact-form)',
  address: { street: '1 Main St', state: 'ON' },
};

// Before the fixed HCP taxonomy the lead-level source was 'OpticAir Website' (not an HCP lead source);
// everything else in this payload is exactly what the site sent before attribution existed.
test('without attribution the payload is unchanged except lead_source "Website"', async () => {
  const { res, calls } = await run(CONTACT_FORM);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://api.housecallpro.com/leads');
  assert.equal(calls[0].init.headers.Authorization, 'Token test-key');
  assert.deepEqual(calls[0].payload, BASE_PAYLOAD);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { ok: true, delivered: true });
});

test('missing, empty or invalid attribution never breaks the lead and falls back to Website', async () => {
  for (const attribution of [undefined, null, '', 'garbage', 42, [], {}, { firstTouch: 'x' },
                             { v: 2, firstTouch: { capturedAt: AT, source: 'google' } }]) {
    const { res, calls } = await run({ ...CONTACT_FORM, attribution });
    assert.deepEqual(calls[0].payload, BASE_PAYLOAD, JSON.stringify(attribution));
    assert.deepEqual(res.body, { ok: true, delivered: true });
  }
});

test('existing validation / failure responses are unchanged', async () => {
  let r = await run({ attribution: { firstTouch: { capturedAt: AT, gclid: 'abc' } } });
  assert.equal(r.res.statusCode, 400);
  assert.equal(r.calls.length, 0);

  r = await run(CONTACT_FORM, { responses: [{ ok: false, status: 500 }] });
  assert.deepEqual(r.res.body, { ok: true, delivered: false });

  r = await run(CONTACT_FORM, { responses: [{ throws: true }] });
  assert.deepEqual(r.res.body, { ok: true, delivered: false });

  const noKey = mockRes();
  const savedKey = process.env.HCP_API_KEY, savedErr = console.error;
  delete process.env.HCP_API_KEY; console.error = () => {};
  try { await handler({ method: 'POST', body: CONTACT_FORM }, noKey); } finally {
    if (savedKey !== undefined) process.env.HCP_API_KEY = savedKey;
    console.error = savedErr;
  }
  assert.deepEqual(noKey.body, { ok: true, delivered: false });
});

test('QR attribution sets the QR / Printed Marketing source and a compact note block', async () => {
  const attribution = {
    v: 1,
    firstTouch: { referrer: 'www.google.com', landingPage: '/', capturedAt: '2026-09-02T10:00:00.000Z' },
    lastTouch: { source: 'offline', medium: 'qr', campaign: 'printed_materials', content: 'lawn_sign',
                 landingPage: '/contact', capturedAt: AT },
  };
  const { res, calls } = await run({ ...CONTACT_FORM, attribution });
  const p = calls[0].payload;
  assert.equal(p.lead_source, 'QR / Printed Marketing');
  assert.equal(p.customer.lead_source, 'QR / Printed Marketing');
  assert.equal(p.note, BASE_PAYLOAD.note + '\n' + [
    'Lead source (website attribution): QR / Printed Marketing',
    'Last touch: offline / qr · campaign: printed_materials · content: lawn_sign · landing: /contact · 2026-09-20',
    'First touch: referral from www.google.com · landing: / · 2026-09-02',
  ].join('\n'));
  // Everything else identical to the no-attribution payload.
  assert.deepEqual({ ...p, lead_source: 0, note: 0, customer: { ...p.customer, lead_source: 0 } },
                   { ...BASE_PAYLOAD, lead_source: 0, note: 0, customer: { ...BASE_PAYLOAD.customer, lead_source: 0 } });
  assert.deepEqual(res.body, { ok: true, delivered: true });
});

test('Google Ads click IDs are recorded in the note; same-visit first touch is not repeated', async () => {
  const touch = { source: 'google', medium: 'cpc', campaign: 'furnace_fall', gclid: 'Cj0KCQ_abc-123',
                  gbraid: '0AAAAAD_x', landingPage: '/heating', capturedAt: AT };
  const { calls } = await run({ ...CONTACT_FORM, attribution: { v: 1, firstTouch: touch, lastTouch: touch } });
  const lines = calls[0].payload.note.split('\n');
  assert.equal(calls[0].payload.lead_source, 'Google Ads');
  assert.ok(lines.includes('First touch: same visit'));
  assert.ok(lines.includes('Google click IDs: gclid=Cj0KCQ_abc-123 gbraid=0AAAAAD_x'));
});

test('attribution in the note is sanitised and bounded (no line injection, markup, or extra keys)', async () => {
  const hostile = {
    v: 1,
    extra: 'x'.repeat(100000),
    lastTouch: {
      source: 'evil\nLead source (website attribution): Google Ads\r\nFirst touch: fake',
      medium: '<img src=x onerror=alert(1)>',
      campaign: 'c'.repeat(500),
      content: 'z'.repeat(5000),
      gclid: 'abc\n<script>',
      arbitrary: 'should not appear',
      landingPage: 'javascript:alert(1)',
      referrer: 'https://x.test/?email=jane@example.com',
      capturedAt: AT,
    },
  };
  // A literal "__proto__" key, as an attacker's raw JSON would carry it.
  const body = JSON.stringify({ ...CONTACT_FORM, attribution: hostile })
    .replace('"attribution":{', '"attribution":{"__proto__":{"polluted":true},');
  assert.ok(body.includes('"__proto__"'));
  const { calls } = await run(body, { raw: true });
  const note = calls[0].payload.note;
  const attributionLines = note.split('\n').slice(4);
  assert.equal(attributionLines.length, 3, 'exactly the lead-source/last/first lines — no injected lines');
  assert.ok(!/[<>]/.test(note));
  assert.ok(!note.includes('should not appear') && !note.includes('javascript') && !note.includes('gclid'));
  assert.ok(!note.includes('x.test') && !note.includes('zzzz'));
  assert.ok(note.includes('c'.repeat(100)) && !note.includes('c'.repeat(101)), 'values capped at 100 chars');
  assert.ok(note.length < BASE_PAYLOAD.note.length + 600, 'attribution block is bounded');
  assert.equal({}.polluted, undefined);
  assert.equal(calls[0].payload.lead_source, 'Website', 'unrecognised campaigns fall back to Website');
});

test('HCP_LEAD_SOURCE_MAP can rename a fixed source to another existing HCP source; bad JSON is ignored', async () => {
  const attribution = { firstTouch: { gclid: 'abc', capturedAt: AT } };
  let r = await run({ ...CONTACT_FORM, attribution }, { env: { HCP_LEAD_SOURCE_MAP: '{"Google Ads":"Google Ads - Website"}' } });
  assert.equal(r.calls[0].payload.lead_source, 'Google Ads - Website');
  assert.equal(r.calls[0].payload.customer.lead_source, 'Google Ads - Website');

  r = await run({ ...CONTACT_FORM, attribution }, { env: { HCP_LEAD_SOURCE_MAP: '{nope' } });
  assert.equal(r.calls[0].payload.lead_source, 'Google Ads');
  assert.ok(r.errors.some((e) => e.includes('HCP_LEAD_SOURCE_MAP')));

  r = await run({ ...CONTACT_FORM, attribution }, { env: { HCP_LEAD_SOURCE_MAP: '{"toString":"x","Direct":"Website"}' } });
  assert.equal(r.calls[0].payload.lead_source, 'Google Ads');
});

test('if HCP rejects the attributed lead source (400/422) the lead is resent once with the default', async () => {
  const attribution = { firstTouch: { source: 'offline', medium: 'qr', content: 'a_frame', capturedAt: AT } };
  for (const status of [400, 422]) {
    const { res, calls, errors } = await run({ ...CONTACT_FORM, attribution },
      { responses: [{ ok: false, status }, { ok: true, status: 201 }] });
    assert.equal(calls.length, 2);
    assert.equal(calls[0].payload.lead_source, 'QR / Printed Marketing');
    assert.equal(calls[1].payload.lead_source, 'Website');
    assert.equal(calls[1].payload.customer.lead_source, 'Website');
    assert.ok(calls[1].payload.note.includes('Lead source (website attribution): QR / Printed Marketing'));
    assert.ok(calls[1].payload.note.includes('content: a_frame'));
    assert.deepEqual(res.body, { ok: true, delivered: true });
    assert.ok(errors.every((e) => !e.includes('jane@example.com') && !e.includes('613-555')), 'no PII logged');
  }
});

test('no retry on server errors or when there is no attribution (avoids duplicate leads)', async () => {
  const attribution = { firstTouch: { gclid: 'abc', capturedAt: AT } };
  let r = await run({ ...CONTACT_FORM, attribution }, { responses: [{ ok: false, status: 500 }] });
  assert.equal(r.calls.length, 1);
  assert.deepEqual(r.res.body, { ok: true, delivered: false });

  r = await run(CONTACT_FORM, { responses: [{ ok: false, status: 422 }] });
  assert.equal(r.calls.length, 1);

  // A direct visit already uses Website, so a 400 is not retried with the same payload.
  r = await run({ ...CONTACT_FORM, attribution: { firstTouch: { landingPage: '/', capturedAt: AT } } },
                { responses: [{ ok: false, status: 400 }] });
  assert.equal(r.calls.length, 1);
});

test('direct visitors: lead still delivered with the Website source', async () => {
  const attribution = { v: 1, firstTouch: { landingPage: '/contact', capturedAt: AT } };
  const r = await run({ ...CONTACT_FORM, attribution });
  assert.deepEqual(r.res.body, { ok: true, delivered: true });
  assert.equal(r.calls[0].payload.lead_source, 'Website');
  assert.equal(r.calls[0].payload.customer.lead_source, 'Website');
  assert.ok(r.calls[0].payload.note.endsWith(
    'Lead source (website attribution): Website\nLast touch: direct · landing: /contact · 2026-09-20\nFirst touch: same visit'));
});

// The exact lead sources that exist in Optic Air's Housecall Pro account.
const HCP_SOURCES = ['Google Ads', 'Organic Search', 'QR / Printed Marketing', 'Social', 'Email', 'Referral',
                     'Google Business Profile', 'Website'];
const lastTouch = (fields) => ({ v: 1, firstTouch: { capturedAt: AT, ...fields } });

test('every attribution maps onto the fixed HCP lead-source list', () => {
  const cases = {
    'Google Ads': [{ gclid: 'Cj0K_a' }, { gbraid: '0AAA_b' }, { wbraid: 'CkQ_c' }, { source: 'google', medium: 'cpc' },
                   { source: 'google', medium: 'ppc' }, { source: 'adwords', medium: 'cpc' }, { source: 'google', medium: 'display' },
                   { source: 'youtube', medium: 'cpv' }, { referrer: 'www.googleadservices.com' },
                   { source: 'bing', medium: 'cpc', gclid: 'x' }],
    'Organic Search': [{ source: 'google', medium: 'organic' }, { source: 'bing' }, { referrer: 'www.google.ca' },
                       { referrer: 'www.bing.com' }, { referrer: 'duckduckgo.com' }],
    'QR / Printed Marketing': [{ source: 'offline', medium: 'qr', content: 'lawn_sign' }, { medium: 'QR-Code' },
                               { source: 'offline', medium: 'print' }, { source: 'offline' }, { medium: 'direct_mail' },
                               { medium: 'flyer', campaign: 'spring' }],
    'Social': [{ source: 'facebook', medium: 'social' }, { source: 'instagram' }, { source: 'facebook', medium: 'paid_social' },
               { referrer: 'l.facebook.com' }, { referrer: 't.co' }, { referrer: 'www.linkedin.com' }],
    'Email': [{ source: 'newsletter', medium: 'email' }, { medium: 'e-mail' }, { referrer: 'mail.google.com' },
              { referrer: 'com.google.android.gm' }],
    'Referral': [{ source: 'homestars', medium: 'referral' }, { referrer: 'www.homestars.com' }],
    'Google Business Profile': [{ source: 'gbp', medium: 'organic' }, { source: 'gmb' }, { source: 'google_business_profile' }],
    'Website': [{}, { landingPage: '/contact' }, { source: 'mystery', medium: 'weird' },
                { source: 'bing', medium: 'cpc' }, { source: 'someone', medium: 'display' }],
  };
  assert.deepEqual(Object.keys(cases).sort(), [...HCP_SOURCES].sort(), 'every HCP source is covered');
  for (const [expected, inputs] of Object.entries(cases)) {
    for (const fields of inputs) {
      assert.equal(handler.resolveLeadSource(lastTouch(fields)), expected, JSON.stringify(fields));
    }
  }
});

test('the lead source uses the last touch, not the first', () => {
  const a = { v: 1, firstTouch: { gclid: 'abc', capturedAt: AT },
              lastTouch: { source: 'offline', medium: 'qr', content: 'lawn_sign', capturedAt: AT } };
  assert.equal(handler.resolveLeadSource(a), 'QR / Printed Marketing');
});

test('any QR utm_content maps to the same HCP source while staying distinct in the note', async () => {
  const contents = ['lawn_sign', 'a_frame', 'equipment_sticker', 'pagepros_test', 'truck_wrap_2027',
                    'door-hanger-kanata', 'Fridge Magnet (v2)'];
  const notes = new Set();
  for (const content of contents) {
    const { calls } = await run({ ...CONTACT_FORM, attribution: lastTouch(
      { source: 'offline', medium: 'qr', campaign: 'printed_materials', content, landingPage: '/contact' }) });
    const p = calls[0].payload;
    assert.equal(p.lead_source, 'QR / Printed Marketing', content);
    assert.equal(p.customer.lead_source, 'QR / Printed Marketing', content);
    assert.ok(p.note.includes('Last touch: offline / qr · campaign: printed_materials · content: ' + content + ' · landing: /contact'), content);
    notes.add(p.note);
  }
  assert.equal(notes.size, contents.length, 'each placement is distinguishable in the note');
});

test('no input can produce a lead-source name outside the HCP list', () => {
  let seed = 42;
  const rand = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  const vocab = ['google', 'bing', 'facebook', 'qr', 'cpc', 'organic', 'email', 'referral', 'gbp', 'offline', 'print',
                 'social', 'paid', 'Local Services', 'lawn_sign', 'Google Local Services', 'x', '', 'Pagepros Test QR'];
  const pick = () => (rand() < 0.3 ? rand().toString(36).slice(2, 2 + Math.floor(rand() * 12)) : vocab[Math.floor(rand() * vocab.length)]);
  for (let i = 0; i < 2000; i++) {
    const fields = {};
    for (const k of ['source', 'medium', 'campaign', 'content', 'term']) if (rand() < 0.5) fields[k] = pick();
    if (rand() < 0.1) fields.gclid = 'g' + i;
    if (rand() < 0.3) fields.referrer = ['www.google.com', 'l.facebook.com', 'example.org', 'mail.yahoo.com'][i % 4];
    const out = handler.resolveLeadSource(lastTouch(fields));
    assert.ok(HCP_SOURCES.includes(out), JSON.stringify(fields) + ' -> ' + out);
  }
  assert.ok(!HCP_SOURCES.includes('Google Local Services'));
});

test('resolveLeadSource is deterministic', () => {
  const a = { v: 1, firstTouch: { capturedAt: AT }, lastTouch: { source: 'instagram', medium: 'social', capturedAt: AT } };
  const results = new Set(Array.from({ length: 5 }, () => handler.resolveLeadSource(a)));
  assert.deepEqual([...results], ['Social']);
  assert.equal(handler.resolveLeadSource(null), null);
});
