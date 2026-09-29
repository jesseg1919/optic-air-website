// Client lead submission (components.jsx) — the Google Ads conversion regression guard.
// The site has no build step, so this runs the real submitLead source block from components.jsx
// (it contains no JSX) in a sandbox with mocked fetch / gtag / PPAttribution.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const lib = require('../lib/attribution.js');
const { T0, memoryStorage, fakeWindow } = require('./helpers.js');

const SOURCE = fs.readFileSync(path.join(__dirname, '..', 'components.jsx'), 'utf8');
const START = SOURCE.indexOf('// ── Lead form (bottom-of-page)');
const END = SOURCE.indexOf('function LeadForm(');
const BLOCK = SOURCE.slice(START, END);
const CONVERSION = ['event', 'conversion', {
  send_to: 'AW-16693139414/coP1CI_jnc4cENav9Jc-', value: 1.0, currency: 'CAD',
}];
const FORM = { name: 'Jane', phone: '613', email: 'j@x.ca', address: '1 Main', service: 'AC repair', notes: '', page: 'contact-form' };

function load({ ga4Id, attributionLib, gtag = true, gtagValue, fetchImpl }) {
  let code = BLOCK;
  if (ga4Id) {
    code = code.replace("const GA4_MEASUREMENT_ID = '';", "const GA4_MEASUREMENT_ID = '" + ga4Id + "';");
    assert.notEqual(code, BLOCK, 'GA4 constant not found in components.jsx');
  }
  const gtagCalls = [];
  const fetchCalls = [];
  const window = {};
  if (gtag) window.gtag = (...args) => { gtagCalls.push(args); };
  else if (gtagValue !== undefined) window.gtag = gtagValue;
  if (attributionLib) window.PPAttribution = attributionLib;
  const fetch = (url, init) => { fetchCalls.push({ url, init }); return fetchImpl(url, init); };
  const ctx = vm.createContext({ window, fetch });
  vm.runInContext(code, ctx);
  return { submitLead: ctx.submitLead, gtagCalls, fetchCalls };
}

const ok = () => Promise.resolve({ ok: true, status: 200 });
const plain = (v) => JSON.parse(JSON.stringify(v));

function withCapturedAttribution() {
  lib.init(fakeWindow('https://opticair.ca/contact?utm_source=offline&utm_medium=qr&utm_content=lawn_sign',
    '', memoryStorage(), memoryStorage()), { now: T0 });
  return lib;
}

test('the lead-submission block is extractable and JSX-free', () => {
  assert.ok(START > 0 && END > START);
  assert.ok(!/<[A-Za-z]/.test(BLOCK.replace(/\/\/.*$/gm, '')), 'block must stay plain JS');
});

test('Google Ads conversion fires exactly once, only after a successful response', async () => {
  let resolveFetch;
  const t = load({ attributionLib: withCapturedAttribution(), fetchImpl: () => new Promise((r) => { resolveFetch = r; }) });
  const pending = t.submitLead(FORM);
  await new Promise((r) => setImmediate(r));
  assert.equal(t.fetchCalls.length, 1);
  assert.equal(t.gtagCalls.length, 0, 'nothing fires on submit/click before the API answers');
  resolveFetch({ ok: true, status: 200 });
  assert.equal(await pending, true);
  assert.deepEqual(plain(t.gtagCalls), [CONVERSION]);
});

test('no conversion on a rejected (4xx/5xx) response or a network error', async () => {
  for (const status of [400, 500]) {
    const t = load({ attributionLib: withCapturedAttribution(), fetchImpl: () => Promise.resolve({ ok: false, status }) });
    assert.equal(await t.submitLead(FORM), false);
    assert.equal(t.gtagCalls.length, 0);
  }
  const t = load({ attributionLib: withCapturedAttribution(), fetchImpl: () => Promise.reject(new Error('offline')) });
  assert.equal(await t.submitLead(FORM), false);
  assert.equal(t.gtagCalls.length, 0);
});

test('attribution is attached to the request body alongside the unchanged form fields', async () => {
  const t = load({ attributionLib: withCapturedAttribution(), fetchImpl: ok });
  await t.submitLead(FORM);
  const { url, init } = t.fetchCalls[0];
  assert.equal(url, 'https://optic-air-website.vercel.app/api/create-lead');
  assert.equal(init.method, 'POST');
  assert.deepEqual(plain(init.headers), { 'Content-Type': 'application/json' });
  const sent = JSON.parse(init.body);
  const { attribution, ...fields } = sent;
  assert.deepEqual(fields, FORM);
  assert.equal(attribution.lastTouch.content, 'lawn_sign');
  assert.ok(!JSON.stringify(attribution).includes('Jane'), 'no form PII inside attribution');
});

test('missing attribution library → exactly the legacy request, conversion still once', async () => {
  const t = load({ fetchImpl: ok });
  assert.equal(await t.submitLead(FORM), true);
  assert.equal(t.fetchCalls[0].init.body, JSON.stringify(FORM));
  assert.deepEqual(plain(t.gtagCalls), [CONVERSION]);
});

test('a throwing attribution library cannot block the lead or the conversion', async () => {
  const broken = { getForLead() { throw new Error('boom'); }, toAnalyticsParams() { throw new Error('boom'); } };
  const t = load({ attributionLib: broken, fetchImpl: ok, ga4Id: 'G-TEST123' });
  assert.equal(await t.submitLead(FORM), true);
  assert.equal(t.fetchCalls[0].init.body, JSON.stringify(FORM));
  assert.equal(t.gtagCalls.filter((c) => c[1] === 'conversion').length, 1);
});

test('GA4 is dormant until configured: no extra gtag events today', async () => {
  const t = load({ attributionLib: withCapturedAttribution(), fetchImpl: ok });
  await t.submitLead(FORM);
  assert.equal(t.gtagCalls.length, 1);
  assert.equal(t.gtagCalls[0][1], 'conversion');
});

test('with GA4 configured: one generate_lead to GA4 only, and still exactly one Ads conversion', async () => {
  const t = load({ attributionLib: withCapturedAttribution(), fetchImpl: ok, ga4Id: 'G-TEST123' });
  await t.submitLead(FORM);
  const conv = t.gtagCalls.filter((c) => c[1] === 'conversion');
  const leads = t.gtagCalls.filter((c) => c[1] === 'generate_lead');
  assert.deepEqual(plain(conv), [CONVERSION]);
  assert.equal(leads.length, 1);
  assert.equal(t.gtagCalls.indexOf(conv[0]) < t.gtagCalls.indexOf(leads[0]), true, 'Ads conversion first');
  assert.deepEqual(plain(leads[0][2]), {
    send_to: 'G-TEST123', form_location: 'contact-form',
    lead_source: 'Lawn Sign QR', lead_channel: 'qr',
    first_touch_source: 'offline', first_touch_medium: 'qr', first_touch_content: 'lawn_sign',
  });

  const failed = load({ attributionLib: withCapturedAttribution(), ga4Id: 'G-TEST123',
                        fetchImpl: () => Promise.resolve({ ok: false, status: 400 }) });
  await failed.submitLead(FORM);
  assert.equal(failed.gtagCalls.length, 0, 'no GA4 lead event on failure either');
});

test('no gtag on the page (blocked by an ad blocker) → lead still submits', async () => {
  const t = load({ attributionLib: withCapturedAttribution(), fetchImpl: ok, gtag: false, ga4Id: 'G-TEST123' });
  assert.equal(await t.submitLead(FORM), true);
});

test('live guard: a non-function window.gtag is skipped instead of throwing', async () => {
  const t = load({ attributionLib: withCapturedAttribution(), fetchImpl: ok, gtag: false, gtagValue: { queued: [] } });
  assert.equal(await t.submitLead(FORM), true, 'lead still reported as submitted');
});
