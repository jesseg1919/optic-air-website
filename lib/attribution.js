/*
 * Page Pros — website marketing attribution (first touch + last touch).
 *
 * Zero dependencies, no build step. One file, two consumers:
 *   - Browser: loaded as a plain <script>. Captures UTMs / Google click IDs / landing page /
 *     referrer host on page load, keeps them in first-party localStorage (~90 days), and
 *     exposes window.PPAttribution for the lead form.
 *   - Server:  require()d by the lead API to re-validate the (untrusted) attribution a
 *     browser sends and to map it to a human-readable lead source.
 *
 * Privacy: only the allowlisted query params below are read. Form fields / PII are never
 * stored here, and the referrer is reduced to its hostname.
 *
 * Model:
 *   firstTouch — earliest visit we know about in the current attribution window; never overwritten.
 *   lastTouch  — most recent *meaningful* visit: a tagged URL (UTM / click ID) always counts,
 *                an external referrer counts on the first page of a browser session,
 *                a direct visit never replaces a known source.
 *   The window is ttlDays from the last meaningful visit; after that the next visit starts fresh.
 *
 * Site options (all optional) can be set before this script loads:
 *   window.PPAttributionConfig = { storageKey, ttlDays, internalHosts: ['book.example.com'] }
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root && root.document && root.location) {
    root.PPAttribution = api;
    try { api.init(root); } catch (e) { /* attribution must never break the page */ }
  }
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  var VERSION = 1;
  var DEFAULTS = {
    storageKey: 'pp_attribution',
    sessionKey: 'pp_attribution_session',
    ttlDays: 90,
    internalHosts: [],
  };

  // Query param → touch field. Nothing else in the URL is ever read.
  var UTM_PARAMS = {
    utm_source: 'source',
    utm_medium: 'medium',
    utm_campaign: 'campaign',
    utm_content: 'content',
    utm_term: 'term',
  };
  var CLICK_ID_PARAMS = ['gclid', 'gbraid', 'wbraid'];

  var MAX_TEXT = 100;       // GA4's event-parameter value limit
  var MAX_CLICK_ID = 256;
  var MAX_PATH = 200;
  var MAX_HOST = 100;
  var MAX_RAW = 1000;       // anything longer is not a real value — drop it
  var MAX_STORED = 8192;    // stored JSON larger than this is treated as corrupt

  /**
   * @typedef {Object} AttributionTouch
   * @property {string} [source]   utm_source
   * @property {string} [medium]   utm_medium
   * @property {string} [campaign] utm_campaign
   * @property {string} [content]  utm_content
   * @property {string} [term]     utm_term
   * @property {string} [gclid]
   * @property {string} [gbraid]
   * @property {string} [wbraid]
   * @property {string} [landingPage] path only, no query string
   * @property {string} [referrer]    external referrer hostname only
   * @property {string} capturedAt    ISO-8601 UTC timestamp
   */
  /**
   * @typedef {Object} AttributionState
   * @property {number} v
   * @property {AttributionTouch} firstTouch
   * @property {AttributionTouch} lastTouch
   */

  // ── Sanitising (shared by capture, storage reads and the server) ───────────
  // Control chars, line/paragraph separators, zero-width and bidi-override chars.
  var INVISIBLE = /[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u2028-\u202E\u2060-\u2069\uFEFF]/g;
  var MARKUP = /[<>"'`\\]/g;
  var CLICK_ID = /^[A-Za-z0-9._-]+$/;
  var ISO_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/;

  function hasOwn(obj, key) { return Object.prototype.hasOwnProperty.call(obj, key); }
  function isPlainObject(v) { return Object.prototype.toString.call(v) === '[object Object]'; }

  function cleanText(v, max) {
    if (typeof v !== 'string' || v.length > MAX_RAW) return undefined;
    var s = v.replace(INVISIBLE, ' ').replace(MARKUP, '').replace(/\s+/g, ' ').trim();
    if (s.length > max) s = s.slice(0, max).replace(/[\uD800-\uDBFF]$/, '').trim();
    return s || undefined;
  }

  function cleanClickId(v) {
    if (typeof v !== 'string') return undefined;
    var s = v.trim();
    return s && s.length <= MAX_CLICK_ID && CLICK_ID.test(s) ? s : undefined;
  }

  function cleanPath(v) {
    if (typeof v !== 'string' || v.length > MAX_RAW || v.charAt(0) !== '/') return undefined;
    var s = v.split(/[?#]/)[0].replace(/[^A-Za-z0-9\/._~%-]/g, '').slice(0, MAX_PATH);
    return s || undefined;
  }

  function cleanHost(v) {
    if (typeof v !== 'string') return undefined;
    var s = v.trim().toLowerCase();
    return s && s.length <= MAX_HOST && /^[a-z0-9.-]+$/.test(s) ? s : undefined;
  }

  function cleanTime(v) {
    return typeof v === 'string' && ISO_TIME.test(v) && isFinite(Date.parse(v)) ? v : undefined;
  }

  /**
   * Rebuild a touch from untrusted input, keeping only allowlisted, well-formed fields.
   * @returns {AttributionTouch|null}
   */
  function sanitizeTouch(raw) {
    if (!isPlainObject(raw)) return null;
    var capturedAt = cleanTime(hasOwn(raw, 'capturedAt') ? raw.capturedAt : undefined);
    if (!capturedAt) return null;
    var t = {};
    var k;
    for (k in UTM_PARAMS) {
      var field = UTM_PARAMS[k];
      var text = hasOwn(raw, field) ? cleanText(raw[field], MAX_TEXT) : undefined;
      if (text) t[field] = text;
    }
    for (var i = 0; i < CLICK_ID_PARAMS.length; i++) {
      k = CLICK_ID_PARAMS[i];
      var id = hasOwn(raw, k) ? cleanClickId(raw[k]) : undefined;
      if (id) t[k] = id;
    }
    var landingPage = hasOwn(raw, 'landingPage') ? cleanPath(raw.landingPage) : undefined;
    if (landingPage) t.landingPage = landingPage;
    var referrer = hasOwn(raw, 'referrer') ? cleanHost(raw.referrer) : undefined;
    if (referrer) t.referrer = referrer;
    t.capturedAt = capturedAt;
    return t;
  }

  /**
   * Validate a whole attribution state from storage or from a request body.
   * Missing/garbage input → null. A lone valid touch is used as both first and last.
   * @returns {AttributionState|null}
   */
  function sanitizeState(raw) {
    if (!isPlainObject(raw)) return null;
    if (hasOwn(raw, 'v') && raw.v !== VERSION) return null;
    var first = hasOwn(raw, 'firstTouch') ? sanitizeTouch(raw.firstTouch) : null;
    var last = hasOwn(raw, 'lastTouch') ? sanitizeTouch(raw.lastTouch) : null;
    if (!first && !last) return null;
    return { v: VERSION, firstTouch: first || last, lastTouch: last || first };
  }

  // ── Capture ────────────────────────────────────────────────────────────────
  function siteHost(host) { return String(host || '').toLowerCase().replace(/^www\./, ''); }

  function hasCampaign(t) {
    return !!(t && (t.source || t.medium || t.campaign || t.content || t.term ||
                    t.gclid || t.gbraid || t.wbraid));
  }

  /**
   * Build a touch from a page URL and document.referrer.
   * @returns {AttributionTouch|null}
   */
  function touchFromLocation(href, referrer, capturedAt, opts) {
    var url;
    try { url = new URL(href); } catch (e) { return null; }
    var raw = { capturedAt: capturedAt, landingPage: url.pathname };
    var k;
    for (k in UTM_PARAMS) raw[UTM_PARAMS[k]] = url.searchParams.get(k) || undefined;
    for (var i = 0; i < CLICK_ID_PARAMS.length; i++) {
      k = CLICK_ID_PARAMS[i];
      raw[k] = url.searchParams.get(k) || undefined;
    }
    if (referrer) {
      var refHost = '';
      try { refHost = new URL(referrer).hostname; } catch (e) { /* ignore unparseable referrer */ }
      var internal = ((opts && opts.internalHosts) || []).map(siteHost);
      var ref = siteHost(refHost);
      if (ref && ref !== siteHost(url.hostname) && internal.indexOf(ref) === -1) raw.referrer = refHost;
    }
    return sanitizeTouch(raw);
  }

  /**
   * Fold a new page-load touch into the stored state. Returns `state` itself when nothing changes.
   * @param {AttributionState|null} state  current, already-validated, unexpired state
   * @param {AttributionTouch|null} touch
   * @param {boolean} newSession  true on the first page load of a browser session
   */
  function mergeTouch(state, touch, newSession) {
    if (!touch) return state;
    if (!state) return { v: VERSION, firstTouch: touch, lastTouch: touch };
    var meaningful = hasCampaign(touch) || (!!touch.referrer && newSession);
    if (!meaningful) return state;
    return { v: VERSION, firstTouch: state.firstTouch, lastTouch: touch };
  }

  function isExpired(state, nowMs, ttlDays) {
    var last = Date.parse(state.lastTouch.capturedAt);
    return !isFinite(last) || nowMs - last > ttlDays * 86400000;
  }

  // ── Storage (every access guarded: storage can be missing, blocked or full) ─
  function getStorage(win, name) {
    try { return win[name] || null; } catch (e) { return null; }
  }
  function storageGet(storage, key) {
    try { return storage ? storage.getItem(key) : null; } catch (e) { return null; }
  }
  function storageSet(storage, key, value) {
    try { if (storage) storage.setItem(key, value); } catch (e) { /* quota / disabled */ }
  }

  function readState(storage, key, nowMs, ttlDays) {
    var raw = storageGet(storage, key);
    if (typeof raw !== 'string' || !raw || raw.length > MAX_STORED) return null;
    var parsed;
    try { parsed = JSON.parse(raw); } catch (e) { return null; }
    var state = sanitizeState(parsed);
    return state && !isExpired(state, nowMs, ttlDays) ? state : null;
  }

  function writeState(storage, key, state) {
    storageSet(storage, key, JSON.stringify(state));
  }

  // ── Browser runtime ────────────────────────────────────────────────────────
  var runtime = { win: null, opts: DEFAULTS, state: null };

  function resolveOptions(win, options) {
    var opts = {};
    var sources = [DEFAULTS, (win && win.PPAttributionConfig) || {}, options || {}];
    for (var s = 0; s < sources.length; s++) {
      var src = sources[s];
      if (!isPlainObject(src)) continue;
      for (var k in DEFAULTS) if (hasOwn(src, k) && src[k] != null) opts[k] = src[k];
    }
    if (!(opts.ttlDays > 0)) opts.ttlDays = DEFAULTS.ttlDays;
    if (!Array.isArray(opts.internalHosts)) opts.internalHosts = [];
    return opts;
  }

  /**
   * Capture the current page load. Runs automatically when the script loads in a browser.
   * @param {Window} win
   * @param {{now?: number}} [options]  plus any DEFAULTS override
   * @returns {AttributionState|null}
   */
  function init(win, options) {
    var opts = resolveOptions(win, options);
    var nowMs = options && options.now != null ? options.now : Date.now();
    var local = getStorage(win, 'localStorage');
    var session = getStorage(win, 'sessionStorage');

    // Reloads and in-tab navigation keep the original referrer, so only the first page of a
    // session may count a bare referrer (e.g. a reload after an ad click must not become "organic").
    var newSession = !storageGet(session, opts.sessionKey);
    storageSet(session, opts.sessionKey, '1');

    var prev = readState(local, opts.storageKey, nowMs, opts.ttlDays);
    var touch = touchFromLocation(win.location.href, win.document && win.document.referrer,
                                  new Date(nowMs).toISOString(), opts);
    var next = mergeTouch(prev, touch, newSession);
    if (next && next !== prev) writeState(local, opts.storageKey, next);

    runtime = { win: win, opts: opts, state: next };
    return next;
  }

  /**
   * Attribution to attach to a lead submission: the stored state (another tab may have
   * updated it), else what this page load captured, else null. Never throws.
   * @returns {AttributionState|null}
   */
  function getForLead() {
    try {
      if (!runtime.win) return null;
      var stored = readState(getStorage(runtime.win, 'localStorage'), runtime.opts.storageKey,
                             Date.now(), runtime.opts.ttlDays);
      return stored || runtime.state || null;
    } catch (e) {
      return runtime.state || null;
    }
  }

  // ── Channel / lead-source mapping (deterministic, table-driven) ────────────
  function norm(v) { return String(v || '').toLowerCase().replace(/[\s-]+/g, '_'); }
  function setOf(list) { var o = {}; for (var i = 0; i < list.length; i++) o[list[i]] = true; return o; }
  function inSet(set, v) { return hasOwn(set, v); }

  var MEDIUM = {
    qr: setOf(['qr', 'qr_code', 'qrcode']),
    paidSearch: setOf(['cpc', 'ppc', 'paidsearch', 'paid_search', 'sem']),
    paidSocial: setOf(['paid_social', 'paidsocial', 'social_paid', 'social_ad', 'social_ads']),
    paidOther: setOf(['paid', 'cpm', 'cpv', 'cpa', 'display', 'banner', 'retargeting', 'remarketing', 'ads', 'ad']),
    offline: setOf(['offline', 'print', 'direct_mail', 'flyer', 'flyers', 'postcard', 'mailer', 'sign',
                    'signage', 'billboard', 'radio', 'tv', 'vehicle', 'van', 'truck', 'door_hanger', 'brochure',
                    'business_card', 'event']),
    email: setOf(['email', 'e_mail', 'newsletter']),
    social: setOf(['social', 'social_media', 'socialmedia', 'social_network', 'organic_social', 'sm']),
    organic: setOf(['organic', 'seo', 'organic_search']),
    referral: setOf(['referral', 'link', 'partner']),
  };
  var SOURCE = {
    google: setOf(['google', 'adwords', 'google_ads', 'googleads', 'youtube']),
    microsoft: setOf(['bing', 'microsoft', 'microsoft_ads', 'bing_ads']),
    social: setOf(['facebook', 'fb', 'meta', 'instagram', 'ig', 'linkedin', 'twitter', 'x', 'tiktok',
                   'pinterest', 'reddit', 'nextdoor', 'snapchat', 'threads', 'youtube']),
    search: setOf(['google', 'bing', 'yahoo', 'duckduckgo', 'ecosia', 'baidu', 'yandex', 'brave', 'startpage', 'qwant']),
    gbp: setOf(['gbp', 'gmb', 'google_business_profile', 'google_my_business', 'googlemybusiness', 'business_profile']),
    email: setOf(['email', 'newsletter', 'mailchimp', 'klaviyo', 'constant_contact']),
    offline: setOf(['offline', 'print']),
  };
  // Referrer hostnames are matched on any dot-separated label (www.google.ca → "google").
  var HOST_LABEL = {
    paid: setOf(['googleadservices', 'googlesyndication', 'doubleclick']),
    email: setOf(['mail', 'webmail', 'outlook']),
    social: setOf(['facebook', 'instagram', 'linkedin', 'twitter', 'tiktok', 'pinterest', 'reddit',
                   'nextdoor', 'snapchat', 'threads', 'youtube']),
    search: SOURCE.search,
  };
  var HOST_EXACT = {
    social: setOf(['x.com', 't.co', 'lnkd.in', 'youtu.be', 'fb.me', 'm.me']),
    email: setOf(['com.google.android.gm']),
  };

  function hostMatches(host, kind) {
    if (inSet(HOST_EXACT[kind] || {}, siteHost(host))) return true;
    var labels = String(host).split('.');
    for (var i = 0; i < labels.length; i++) if (inSet(HOST_LABEL[kind] || {}, labels[i])) return true;
    return false;
  }

  function titleWords(v) {
    var words = String(v || '').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
    if (words[words.length - 1] === 'code' && words[words.length - 2] === 'qr') words.splice(-2, 2);
    else if (words[words.length - 1] === 'qr') words.pop();
    return words.slice(0, 5).map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1); })
      .join(' ').slice(0, 40).trim();
  }

  function R(channel, label) { return { channel: channel, label: label }; }

  /**
   * Classify one touch into a channel id + concise human label.
   * Labels come from a fixed vocabulary, except QR labels, which are built from the
   * (sanitised) utm_content — or utm_campaign — so each printed placement stays distinct.
   * @param {AttributionTouch|null} t
   * @returns {{channel: string, label: string}}
   */
  function classifyTouch(t) {
    if (!t) return R('direct', 'Direct');
    if (t.gclid || t.gbraid || t.wbraid) return R('paid_search', 'Google Ads');

    var src = norm(t.source), med = norm(t.medium);
    if (t.source || t.medium || t.campaign || t.content || t.term) {
      if (inSet(MEDIUM.qr, med)) {
        var placement = titleWords(t.content) || titleWords(t.campaign);
        return R('qr', placement ? placement + ' QR' : 'QR Code');
      }
      var paidSocial = inSet(MEDIUM.paidSocial, med);
      if (paidSocial || inSet(MEDIUM.paidSearch, med) || inSet(MEDIUM.paidOther, med)) {
        if (paidSocial || (inSet(SOURCE.social, src) && !inSet(SOURCE.google, src))) return R('paid_social', 'Paid Social');
        if (inSet(SOURCE.google, src)) return R('paid_search', 'Google Ads');
        if (inSet(SOURCE.microsoft, src)) return R('paid_search', 'Microsoft Ads');
        return R('paid_other', 'Paid Ads');
      }
      if (inSet(MEDIUM.offline, med) || inSet(SOURCE.offline, src)) return R('offline', 'Offline Marketing');
      if (inSet(SOURCE.gbp, src)) return R('local', 'Google Business Profile');
      if (inSet(MEDIUM.email, med) || inSet(SOURCE.email, src)) return R('email', 'Email');
      if (inSet(MEDIUM.social, med) || inSet(SOURCE.social, src)) return R('social', 'Social');
      if (inSet(MEDIUM.organic, med) || (!med && inSet(SOURCE.search, src))) return R('organic_search', 'Organic Search');
      if (inSet(MEDIUM.referral, med)) return R('referral', 'Referral');
      return R('campaign', 'Other Campaign');
    }

    if (t.referrer) {
      if (hostMatches(t.referrer, 'paid')) return R('paid_search', 'Google Ads');
      if (hostMatches(t.referrer, 'email')) return R('email', 'Email');
      if (hostMatches(t.referrer, 'social')) return R('social', 'Social');
      if (hostMatches(t.referrer, 'search')) return R('organic_search', 'Organic Search');
      return R('referral', 'Referral');
    }
    return R('direct', 'Direct');
  }

  /**
   * The lead's source: the last meaningful touch (last non-direct click — the same model
   * Google Ads and GA4 report on). First touch is kept alongside for "how did they find us".
   */
  function leadSource(state) {
    return classifyTouch(state ? (state.lastTouch || state.firstTouch) : null);
  }

  /** Flat, bounded params for an analytics lead event (e.g. GA4 generate_lead). */
  function toAnalyticsParams(state) {
    state = sanitizeState(state);
    if (!state) return {};
    var ls = leadSource(state);
    var f = state.firstTouch;
    var p = { lead_source: ls.label, lead_channel: ls.channel,
              first_touch_source: f.source || f.referrer || '(direct)' };
    if (f.medium) p.first_touch_medium = f.medium;
    if (f.campaign) p.first_touch_campaign = f.campaign;
    if (f.content) p.first_touch_content = f.content;
    return p;
  }

  return {
    VERSION: VERSION,
    DEFAULTS: DEFAULTS,
    UTM_PARAMS: UTM_PARAMS,
    CLICK_ID_PARAMS: CLICK_ID_PARAMS,
    init: init,
    getForLead: getForLead,
    sanitizeTouch: sanitizeTouch,
    sanitizeState: sanitizeState,
    touchFromLocation: touchFromLocation,
    mergeTouch: mergeTouch,
    hasCampaign: hasCampaign,
    readState: readState,
    writeState: writeState,
    classifyTouch: classifyTouch,
    leadSource: leadSource,
    toAnalyticsParams: toAnalyticsParams,
  };
});
