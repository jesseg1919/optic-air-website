// Shared fakes for the attribution tests (Node built-in test runner, no dependencies).
const DAY = 86400000;
// Relative to the real clock: getForLead() checks expiry against Date.now().
const T0 = Math.floor((Date.now() - 10 * DAY) / 1000) * 1000;

function memoryStorage(initial) {
  const m = new Map(Object.entries(initial || {}));
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { m.set(k, String(v)); },
    removeItem: (k) => { m.delete(k); },
    map: m,
  };
}

function throwingStorage() {
  const boom = () => { throw new Error('SecurityError: storage disabled'); };
  return { getItem: boom, setItem: boom, removeItem: boom };
}

function fakeWindow(href, referrer, localStorage, sessionStorage) {
  return {
    location: { href },
    document: { referrer: referrer || '' },
    localStorage,
    sessionStorage,
  };
}

// A browser profile: one persistent localStorage, a fresh sessionStorage per new tab/session.
function browser() {
  const local = memoryStorage();
  let session = memoryStorage();
  return {
    local,
    newSession() { session = memoryStorage(); },
    visit(lib, href, referrer, nowMs, opts) {
      if (opts && opts.newSession) session = memoryStorage();
      return lib.init(fakeWindow(href, referrer, local, session), { now: nowMs });
    },
    stored() {
      const raw = local.getItem('pp_attribution');
      return raw ? JSON.parse(raw) : null;
    },
  };
}

module.exports = { DAY, T0, memoryStorage, throwingStorage, fakeWindow, browser };
