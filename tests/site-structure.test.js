// Static guards for the no-build site: tags load exactly once, every form uses the shared
// submitLead path, and the Google Ads conversion exists exactly once. Protects against a stale or
// hand-merged index.html/components.jsx (the repo is synced from the live GoDaddy site).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const count = (text, re) => (text.match(new RegExp(re.source, 'g')) || []).length;

const HTML = read('index.html');
const SCRIPTS = [...HTML.matchAll(/<script\b([^>]*)>/g)].map((m) => m[1]);
const srcOf = (attrs) => (attrs.match(/\bsrc=["']([^"']+)["']/) || [])[1] || '';
const FRONTEND = ['components.jsx', 'app.jsx', 'tweaks-panel.jsx',
  ...fs.readdirSync(path.join(ROOT, 'pages')).map((f) => 'pages/' + f)];

test('attribution library loads exactly once, deferred, before the app scripts', () => {
  const idx = SCRIPTS.map(srcOf).map((s, i) => (/^lib\/attribution\.js(\?|$)/.test(s) ? i : -1)).filter((i) => i >= 0);
  assert.equal(idx.length, 1);
  assert.match(SCRIPTS[idx[0]], /\bdefer\b/);
  assert.ok(idx[0] < SCRIPTS.findIndex((a) => /text\/babel/.test(a)), 'must load before the Babel app scripts');
  assert.ok(fs.existsSync(path.join(ROOT, 'lib', 'attribution.js')));
});

test('exactly one Google Ads tag and config; no GA4 or GTM configured yet', () => {
  assert.equal(count(HTML, /googletagmanager\.com\/gtag\/js\?id=AW-16693139414/), 1);
  assert.equal(count(HTML, /gtag\(\s*'config'/), 1);
  assert.equal(count(HTML, /gtag\(\s*'config'\s*,\s*'AW-16693139414'\s*\)/), 1);
  for (const f of ['index.html', ...FRONTEND]) {
    const text = read(f);
    assert.equal(count(text, /\bG-[A-Z0-9]{6,}\b/), 0, 'GA4 measurement ID found in ' + f);
    assert.equal(count(text, /\bGTM-[A-Z0-9]{4,}\b/), 0, 'GTM container found in ' + f);
  }
  assert.match(read('components.jsx'), /const GA4_MEASUREMENT_ID = '';/, 'GA4 hook must stay dormant');
});

test('every local app script is referenced once, versioned, and exists', () => {
  const local = SCRIPTS.map(srcOf).filter((s) => s && !/^https?:/.test(s));
  const paths = local.map((s) => s.split('?')[0]);
  assert.equal(new Set(paths).size, paths.length, 'duplicate script tag');
  for (const s of local) {
    assert.match(s, /\?v=\d+$/, 'missing cache version: ' + s);
    assert.ok(fs.existsSync(path.join(ROOT, s.split('?')[0])), 'missing file: ' + s);
  }
  for (const f of FRONTEND) assert.ok(paths.includes(f), f + ' is not loaded by index.html');
});

test('all four lead forms submit through the shared submitLead()', () => {
  const forms = {
    'components.jsx': 'quote-form',      // LeadForm on the heating & cooling pages
    'pages/home.jsx': 'home-hero',
    'pages/contact.jsx': 'contact-form',
    'pages/plans.jsx': 'plans-form',
  };
  for (const [file, id] of Object.entries(forms)) {
    assert.match(read(file), new RegExp("submitLead\\(\\{[\\s\\S]*?page: '" + id + "'"), file);
  }
  const all = FRONTEND.map(read).join('\n');
  assert.equal(count(all, /\/api\/create-lead/), 1, 'one lead endpoint, called only from submitLead');
  assert.equal(count(all, /'event',\s*'conversion'/), 1, 'exactly one Google Ads conversion call');
  assert.equal(count(all, /send_to'?:\s*'AW-16693139414\/coP1CI_jnc4cENav9Jc-'/), 1);
});
