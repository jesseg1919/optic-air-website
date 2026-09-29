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

const LEGACY_PAYLOAD = {
  customer: {
    first_name: 'Jane', last_name: 'Q Doe', notifications_enabled: false, lead_source: 'Website',
    email: 'jane@example.com', mobile_number: '613-555-0100',
    addresses: [{ street: '1 Main St', state: 'ON' }],
  },
  lead_source: 'OpticAir Website',
  note: 'Service requested: AC repair\nService address: 1 Main St\nNotes: Preferred contact: Phone\n' +
        'Submitted via OpticAir website (contact-form)',
  address: { street: '1 Main St', state: 'ON' },
};

test('without attribution the HCP payload and response are exactly as before', async () => {
  const { res, calls } = await run(CONTACT_FORM);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://api.housecallpro.com/leads');
  assert.equal(calls[0].init.headers.Authorization, 'Token test-key');
  assert.deepEqual(calls[0].payload, LEGACY_PAYLOAD);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { ok: true, delivered: true });
});

test('missing, empty or invalid attribution never breaks the lead and falls back to legacy', async () => {
  for (const attribution of [undefined, null, '', 'garbage', 42, [], {}, { firstTouch: 'x' },
                             { v: 2, firstTouch: { capturedAt: AT, source: 'google' } }]) {
    const { res, calls } = await run({ ...CONTACT_FORM, attribution });
    assert.deepEqual(calls[0].payload, LEGACY_PAYLOAD, JSON.stringify(attribution));
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

test('QR attribution sets a friendly lead source and a compact note block', async () => {
  const attribution = {
    v: 1,
    firstTouch: { referrer: 'www.google.com', landingPage: '/', capturedAt: '2026-09-02T10:00:00.000Z' },
    lastTouch: { source: 'offline', medium: 'qr', campaign: 'printed_materials', content: 'lawn_sign',
                 landingPage: '/contact', capturedAt: AT },
  };
  const { res, calls } = await run({ ...CONTACT_FORM, attribution });
  const p = calls[0].payload;
  assert.equal(p.lead_source, 'Lawn Sign QR');
  assert.equal(p.customer.lead_source, 'Lawn Sign QR');
  assert.equal(p.note, LEGACY_PAYLOAD.note + '\n' + [
    'Lead source (website attribution): Lawn Sign QR',
    'Last touch: offline / qr · campaign: printed_materials · content: lawn_sign · landing: /contact · 2026-09-20',
    'First touch: referral from www.google.com · landing: / · 2026-09-02',
  ].join('\n'));
  // Everything else identical to the legacy payload.
  assert.deepEqual({ ...p, lead_source: 0, note: 0, customer: { ...p.customer, lead_source: 0 } },
                   { ...LEGACY_PAYLOAD, lead_source: 0, note: 0, customer: { ...LEGACY_PAYLOAD.customer, lead_source: 0 } });
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
  assert.ok(note.length < LEGACY_PAYLOAD.note.length + 600, 'attribution block is bounded');
  assert.equal({}.polluted, undefined);
  assert.equal(calls[0].payload.lead_source, 'Other Campaign', 'label comes from the fixed vocabulary');
});

test('HCP_LEAD_SOURCE_MAP renames labels to existing HCP lead sources; bad JSON is ignored', async () => {
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
    assert.equal(calls[0].payload.lead_source, 'A Frame QR');
    assert.equal(calls[1].payload.lead_source, 'OpticAir Website');
    assert.equal(calls[1].payload.customer.lead_source, 'Website');
    assert.ok(calls[1].payload.note.includes('Lead source (website attribution): A Frame QR'));
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
});

test('direct visitors: lead still delivered, source "Direct" (mappable back to the old label)', async () => {
  const attribution = { v: 1, firstTouch: { landingPage: '/contact', capturedAt: AT } };
  let r = await run({ ...CONTACT_FORM, attribution });
  assert.deepEqual(r.res.body, { ok: true, delivered: true });
  assert.equal(r.calls[0].payload.lead_source, 'Direct');
  assert.ok(r.calls[0].payload.note.endsWith('Last touch: direct · landing: /contact · 2026-09-20\nFirst touch: same visit'));

  r = await run({ ...CONTACT_FORM, attribution }, { env: { HCP_LEAD_SOURCE_MAP: '{"Direct":"OpticAir Website"}' } });
  assert.equal(r.calls[0].payload.lead_source, 'OpticAir Website');
});

test('resolveLeadSource is deterministic', () => {
  const a = { v: 1, firstTouch: { capturedAt: AT }, lastTouch: { source: 'instagram', medium: 'social', capturedAt: AT } };
  const results = new Set(Array.from({ length: 5 }, () => handler.resolveLeadSource(a)));
  assert.deepEqual([...results], ['Social']);
  assert.equal(handler.resolveLeadSource(null), null);
});
