// Core attribution model: capture, first/last touch, persistence, sanitising, lead-source mapping.
const test = require('node:test');
const assert = require('node:assert/strict');
const lib = require('../lib/attribution.js');
const { DAY, T0, memoryStorage, throwingStorage, fakeWindow, browser } = require('./helpers.js');

const SITE = 'https://opticair.ca';

test('captures all five UTM parameters', () => {
  const b = browser();
  const s = b.visit(lib, SITE + '/contact?utm_source=offline&utm_medium=qr&utm_campaign=printed_materials&utm_content=lawn_sign&utm_term=furnace+repair', '', T0);
  assert.deepEqual(s.lastTouch, {
    source: 'offline', medium: 'qr', campaign: 'printed_materials', content: 'lawn_sign', term: 'furnace repair',
    landingPage: '/contact', capturedAt: new Date(T0).toISOString(),
  });
  assert.deepEqual(s.firstTouch, s.lastTouch);
});

test('captures gclid', () => {
  const s = browser().visit(lib, SITE + '/?gclid=Cj0KCQjw-abc_123', 'https://www.google.com/', T0);
  assert.equal(s.lastTouch.gclid, 'Cj0KCQjw-abc_123');
  assert.equal(lib.leadSource(s).label, 'Google Ads');
});

test('captures gbraid', () => {
  const s = browser().visit(lib, SITE + '/?gbraid=0AAAAADx_gbraid-1', '', T0);
  assert.equal(s.lastTouch.gbraid, '0AAAAADx_gbraid-1');
  assert.equal(lib.leadSource(s).label, 'Google Ads');
});

test('captures wbraid', () => {
  const s = browser().visit(lib, SITE + '/?wbraid=CkQKCQwbraid.9', '', T0);
  assert.equal(s.lastTouch.wbraid, 'CkQKCQwbraid.9');
  assert.equal(lib.leadSource(s).label, 'Google Ads');
});

test('ignores unknown / arbitrary query params, including PII-looking ones', () => {
  const s = browser().visit(lib,
    SITE + '/contact?utm_source=google&email=jane%40example.com&phone=6135550100&name=Jane&fbclid=xyz&utm_foo=bar&__proto__=x',
    '', T0);
  assert.deepEqual(Object.keys(s.lastTouch).sort(), ['capturedAt', 'landingPage', 'source']);
  assert.equal(s.lastTouch.landingPage, '/contact', 'landing page keeps the path only, never the query');
  assert.ok(!JSON.stringify(s).includes('jane'), 'no PII persisted');
  assert.equal({}.x, undefined);
});

test('first touch is never overwritten by later campaigns', () => {
  const b = browser();
  b.visit(lib, SITE + '/?utm_source=offline&utm_medium=qr&utm_content=lawn_sign', '', T0);
  const s = b.visit(lib, SITE + '/?gclid=abc', 'https://www.google.com/', T0 + 3 * DAY, { newSession: true });
  assert.equal(s.firstTouch.content, 'lawn_sign');
  assert.equal(s.firstTouch.capturedAt, new Date(T0).toISOString());
});

test('last touch updates on a new attributable visit', () => {
  const b = browser();
  b.visit(lib, SITE + '/?utm_source=offline&utm_medium=qr&utm_content=lawn_sign', '', T0);
  let s = b.visit(lib, SITE + '/plans?gclid=abc', 'https://www.google.com/', T0 + DAY, { newSession: true });
  assert.equal(s.lastTouch.gclid, 'abc');
  assert.equal(s.lastTouch.landingPage, '/plans');
  // An organic-search arrival in a new session is also a meaningful (non-direct) touch.
  s = b.visit(lib, SITE + '/', 'https://www.google.ca/', T0 + 2 * DAY, { newSession: true });
  assert.equal(s.lastTouch.referrer, 'www.google.ca');
  assert.equal(lib.leadSource(s).label, 'Organic Search');
  assert.equal(s.firstTouch.content, 'lawn_sign');
});

test('direct navigation does not destroy a known campaign attribution', () => {
  const b = browser();
  const ad = b.visit(lib, SITE + '/?gclid=abc&utm_source=google&utm_medium=cpc', 'https://www.google.com/', T0);
  // Typed URL / bookmark days later, a new session.
  const later = b.visit(lib, SITE + '/contact', '', T0 + 5 * DAY, { newSession: true });
  assert.deepEqual(later, ad);
  // Internal referrer (www / apex of the same site) is also direct.
  const internal = b.visit(lib, SITE + '/plans', 'https://www.opticair.ca/', T0 + 6 * DAY, { newSession: true });
  assert.deepEqual(internal, ad);
});

test('a reload in the same session keeps the ad click (referrer alone does not re-attribute)', () => {
  const b = browser();
  b.visit(lib, SITE + '/?gclid=abc', 'https://www.google.com/', T0);
  // SPA navigation drops the query; a reload keeps the original google.com referrer.
  const s = b.visit(lib, SITE + '/contact', 'https://www.google.com/', T0 + 60000);
  assert.equal(s.lastTouch.gclid, 'abc');
  assert.equal(lib.leadSource(s).label, 'Google Ads');
});

test('a first visit with no source is recorded as direct and later campaigns become last touch', () => {
  const b = browser();
  const direct = b.visit(lib, SITE + '/', '', T0);
  assert.equal(lib.leadSource(direct).label, 'Direct');
  const s = b.visit(lib, SITE + '/contact?utm_source=facebook&utm_medium=social', 'https://l.facebook.com/', T0 + DAY, { newSession: true });
  assert.equal(lib.leadSource(s).label, 'Social');
  assert.equal(lib.classifyTouch(s.firstTouch).label, 'Direct');
});

test('persisted attribution can be read back (new page load and getForLead)', () => {
  const b = browser();
  const first = b.visit(lib, SITE + '/?utm_source=newsletter&utm_medium=email&utm_campaign=fall', '', T0);
  assert.deepEqual(b.stored(), first);
  assert.equal(b.stored().v, lib.VERSION);
  const again = b.visit(lib, SITE + '/contact', '', T0 + DAY, { newSession: true });
  assert.deepEqual(again, first);
  assert.deepEqual(lib.getForLead(), first);
});

test('attribution expires 90 days after the last meaningful touch', () => {
  const b = browser();
  b.visit(lib, SITE + '/?utm_source=offline&utm_medium=qr&utm_content=lawn_sign', '', T0);
  const at89 = b.visit(lib, SITE + '/', '', T0 + 89 * DAY, { newSession: true });
  assert.equal(at89.lastTouch.content, 'lawn_sign');
  const at91 = b.visit(lib, SITE + '/', '', T0 + 91 * DAY, { newSession: true });
  assert.equal(lib.leadSource(at91).label, 'Direct');
  assert.equal(at91.firstTouch.capturedAt, new Date(T0 + 91 * DAY).toISOString());
});

test('malformed persisted data fails safely and is replaced', () => {
  const bad = [
    '{not json',
    'null',
    '[]',
    '"string"',
    JSON.stringify({ v: 999, firstTouch: { capturedAt: '2026-09-01T00:00:00.000Z' } }),
    JSON.stringify({ v: 1, firstTouch: { source: 'x' } }),                           // no capturedAt
    JSON.stringify({ v: 1, firstTouch: { capturedAt: 'yesterday', source: 'x' } }),
    JSON.stringify({ v: 1, firstTouch: 'x', lastTouch: 42 }),
    'x'.repeat(20000),
  ];
  for (const raw of bad) {
    const local = memoryStorage({ pp_attribution: raw });
    const s = lib.init(fakeWindow(SITE + '/?utm_source=google&utm_medium=cpc', '', local, memoryStorage()), { now: T0 });
    assert.equal(s.lastTouch.source, 'google', 'bad stored value: ' + raw.slice(0, 40));
    assert.equal(JSON.parse(local.getItem('pp_attribution')).lastTouch.source, 'google');
  }
});

test('prototype-pollution style stored/submitted data is inert', () => {
  const raw = '{"v":1,"__proto__":{"polluted":true},"firstTouch":{"capturedAt":"2026-09-01T00:00:00.000Z",' +
    '"source":"google","__proto__":{"polluted":true},"constructor":{"prototype":{"polluted":true}},"evil":"x"}}';
  const s = lib.sanitizeState(JSON.parse(raw));
  assert.deepEqual(Object.keys(s.firstTouch).sort(), ['capturedAt', 'source']);
  assert.equal({}.polluted, undefined);
  assert.equal(Object.getPrototypeOf(s.firstTouch), Object.prototype);
});

test('disabled or throwing storage never throws and still attributes the current page', () => {
  const win = fakeWindow(SITE + '/?utm_source=google&utm_medium=cpc', '', throwingStorage(), throwingStorage());
  const s = lib.init(win, { now: T0 });
  assert.equal(lib.leadSource(s).label, 'Google Ads');
  assert.deepEqual(lib.getForLead(), s, 'falls back to the in-memory capture');

  const noStorage = { location: { href: SITE + '/' }, document: { referrer: '' } };
  Object.defineProperty(noStorage, 'localStorage', { get() { throw new Error('SecurityError'); } });
  assert.doesNotThrow(() => lib.init(noStorage, { now: T0 }));
});

test('sanitises values: control chars, markup, bidi, length caps, click-id charset, referrer host only', () => {
  const t = lib.sanitizeTouch({
    capturedAt: '2026-09-01T00:00:00.000Z',
    source: 'goo\ngle\r\nLead source: Fake',
    medium: '<script>alert(1)</script>',
    campaign: 'a'.repeat(150),
    content: '\u202Eevil\u200B',
    term: 'x'.repeat(5000),
    gclid: 'abc"><img src=x>',
    gbraid: 'y'.repeat(300),
    landingPage: '/contact?email=jane@example.com',
    referrer: 'https://evil.example/path?q=1',
  });
  assert.equal(t.source, 'goo gle Lead source: Fake');
  assert.equal(t.medium, 'scriptalert(1)/script');
  assert.equal(t.campaign.length, 100);
  assert.equal(t.content, 'evil');
  assert.equal(t.term, undefined, 'absurdly long values are dropped');
  assert.equal(t.gclid, undefined, 'click IDs must match the URL-safe charset');
  assert.equal(t.gbraid, undefined, 'overlong click IDs are dropped');
  assert.equal(t.landingPage, '/contact', 'landing page is a path only — query/fragment dropped');
  assert.equal(t.referrer, undefined, 'referrer must be a bare hostname');
  const captured = lib.touchFromLocation(SITE + '/', 'https://www.bing.com/search?q=hvac+jane', '2026-09-01T00:00:00.000Z');
  assert.equal(captured.referrer, 'www.bing.com');
});

test('internalHosts option treats e.g. a booking domain as internal', () => {
  const t = lib.touchFromLocation(SITE + '/', 'https://book.housecallpro.com/x', '2026-09-01T00:00:00.000Z',
    { internalHosts: ['book.housecallpro.com'] });
  assert.equal(t.referrer, undefined);
});

test('lead-source mapping is deterministic', () => {
  const at = '2026-09-01T00:00:00.000Z';
  const cases = [
    [{ gclid: 'a' }, 'paid_search', 'Google Ads'],
    [{ source: 'google', medium: 'cpc' }, 'paid_search', 'Google Ads'],
    [{ source: 'bing', medium: 'cpc' }, 'paid_search', 'Microsoft Ads'],
    [{ source: 'facebook', medium: 'paid_social' }, 'paid_social', 'Paid Social'],
    [{ source: 'facebook', medium: 'cpc' }, 'paid_social', 'Paid Social'],
    [{ source: 'someone', medium: 'display' }, 'paid_other', 'Paid Ads'],
    [{ source: 'offline', medium: 'qr', content: 'a_frame' }, 'qr', 'A Frame QR'],
    [{ source: 'offline', medium: 'QR-Code', campaign: 'truck_wrap' }, 'qr', 'Truck Wrap QR'],
    [{ source: 'offline', medium: 'qr' }, 'qr', 'QR Code'],
    [{ source: 'offline', medium: 'qr', content: 'lawn_sign_qr' }, 'qr', 'Lawn Sign QR'],
    [{ source: 'offline', medium: 'print' }, 'offline', 'Offline Marketing'],
    [{ source: 'gbp', medium: 'organic' }, 'local', 'Google Business Profile'],
    [{ source: 'newsletter', medium: 'email' }, 'email', 'Email'],
    [{ source: 'instagram', medium: 'social' }, 'social', 'Social'],
    [{ source: 'nextdoor' }, 'social', 'Social'],
    [{ source: 'google', medium: 'organic' }, 'organic_search', 'Organic Search'],
    [{ source: 'homestars', medium: 'referral' }, 'referral', 'Referral'],
    [{ source: 'mystery', medium: 'weird' }, 'campaign', 'Other Campaign'],
    [{ referrer: 'www.google.ca' }, 'organic_search', 'Organic Search'],
    [{ referrer: 'duckduckgo.com' }, 'organic_search', 'Organic Search'],
    [{ referrer: 'www.googleadservices.com' }, 'paid_search', 'Google Ads'],
    [{ referrer: 'l.facebook.com' }, 'social', 'Social'],
    [{ referrer: 't.co' }, 'social', 'Social'],
    [{ referrer: 'com.google.android.gm' }, 'email', 'Email'],
    [{ referrer: 'www.homestars.com' }, 'referral', 'Referral'],
    [{}, 'direct', 'Direct'],
  ];
  for (const [fields, channel, label] of cases) {
    const touch = Object.assign({ capturedAt: at }, fields);
    for (let i = 0; i < 3; i++) {
      assert.deepEqual(lib.classifyTouch(touch), { channel, label }, JSON.stringify(fields));
    }
  }
  assert.deepEqual(lib.leadSource(null), { channel: 'direct', label: 'Direct' });
});

test('QR codes to the same page stay distinct by utm_content', () => {
  const base = SITE + '/contact?utm_source=offline&utm_medium=qr&utm_campaign=printed_materials&utm_content=';
  const labels = ['lawn_sign', 'equipment_sticker', 'a_frame'].map((c) =>
    lib.leadSource(browser().visit(lib, base + c, '', T0)));
  assert.deepEqual(labels.map((l) => l.label), ['Lawn Sign QR', 'Equipment Sticker QR', 'A Frame QR']);
  assert.ok(labels.every((l) => l.channel === 'qr'));
  // Same placement, different destination: same source label, landing page tells them apart.
  const plans = browser().visit(lib, SITE + '/plans?utm_source=offline&utm_medium=qr&utm_campaign=printed_materials&utm_content=a_frame', '', T0);
  assert.equal(lib.leadSource(plans).label, 'A Frame QR');
  assert.equal(plans.lastTouch.landingPage, '/plans');
});

test('analytics params are flat, bounded and PII-free', () => {
  const s = browser().visit(lib, SITE + '/?utm_source=offline&utm_medium=qr&utm_campaign=printed_materials&utm_content=lawn_sign', '', T0);
  assert.deepEqual(lib.toAnalyticsParams(s), {
    lead_source: 'Lawn Sign QR', lead_channel: 'qr',
    first_touch_source: 'offline', first_touch_medium: 'qr',
    first_touch_campaign: 'printed_materials', first_touch_content: 'lawn_sign',
  });
  assert.deepEqual(lib.toAnalyticsParams(null), {});
  for (const v of Object.values(lib.toAnalyticsParams(s))) assert.ok(v.length <= 100);
});
