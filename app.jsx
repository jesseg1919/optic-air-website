// OpticAir — App shell + router + tweaks

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#F58220",
  "palette": ["#FAF9F6", "#0E1A2B", "#F58220"],
  "dark": false,
  "corners": "round",
  "density": "regular",
  "headerStyle": "default",
  "darkHero": true
}/*EDITMODE-END*/;

// ── Per-page SEO ───────────────────────────────────────────────────────────
const SEO = {
  home:    { title: 'Optic Air — HVAC, Heating & Air Conditioning in Ottawa & Richmond, ON',
             desc: 'Optic Air provides honest heating, air conditioning and HVAC service across Ottawa, Richmond, Kanata and surrounding areas. Fair pricing, fast response. Call (613) 297-5377.' },
  heating: { title: 'Furnace & Heating Services in Ottawa & Richmond | Optic Air',
             desc: 'Furnace and heating repair, installation and maintenance in Ottawa and Richmond, ON. Gas furnaces, heat pumps and boilers serviced by Optic Air. Call (613) 297-5377.' },
  cooling: { title: 'Air Conditioning Installation & Repair in Ottawa | Optic Air',
             desc: "Air conditioning installation, repair and tune-ups across Ottawa and Richmond, ON. Stay cool with Optic Air's licensed HVAC technicians. Call (613) 297-5377." },
  plans:   { title: 'HVAC Maintenance Plans in Ottawa | Optic Air',
             desc: 'Optic Air maintenance plans for Ottawa-area homes — priority service, seasonal tune-ups and savings on repairs. Keep your HVAC running smoothly. Call (613) 297-5377.' },
  contact: { title: 'Contact Optic Air — Free HVAC Quote in Ottawa & Richmond',
             desc: 'Contact Optic Air for heating and cooling service in Ottawa, Richmond and surrounding areas. Request a free quote online or call (613) 297-5377.' },
};

function upsertMeta(attr, key, content) {
  let el = document.head.querySelector('meta[' + attr + '="' + key + '"]');
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
  el.setAttribute('content', content);
}

function applySeo(page) {
  const s = SEO[page] || SEO.home;
  const url = 'https://opticair.ca' + pathForPage(page);
  document.title = s.title;
  upsertMeta('name', 'description', s.desc);
  upsertMeta('property', 'og:title', s.title);
  upsertMeta('property', 'og:description', s.desc);
  upsertMeta('property', 'og:url', url);
  upsertMeta('name', 'twitter:title', s.title);
  upsertMeta('name', 'twitter:description', s.desc);
  let link = document.head.querySelector('link[rel="canonical"]');
  if (!link) { link = document.createElement('link'); link.setAttribute('rel', 'canonical'); document.head.appendChild(link); }
  link.setAttribute('href', url);
}

function App() {
  const [page, setPage] = React.useState(() => pageForPath(location.pathname));
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  React.useEffect(() => {
    const onPop = () => setPage(pageForPath(location.pathname));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Per-page SEO (title, description, canonical, OG/Twitter)
  React.useEffect(() => { applySeo(page); }, [page]);

  const navigate = React.useCallback((id) => {
    setPage(id);
    history.pushState(null, '', pathForPage(id));
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Apply tweaks to <html>
  React.useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--c-orange', t.accent);
    root.style.setProperty('--accent', t.accent);
    // pick contrasting ink for accent btn
    root.style.setProperty('--accent-ink', '#fff');
    root.setAttribute('data-theme', t.dark ? 'dark' : 'light');
    root.setAttribute('data-corners', t.corners);
    root.setAttribute('data-density', t.density);
  }, [t.accent, t.dark, t.corners, t.density]);

  const Page = {
    home: HomePage,
    heating: HeatingPage,
    cooling: CoolingPage,
    plans: PlansPage,
    contact: ContactPage,
  }[page] || HomePage;

  return (
    <React.Fragment>
      <div data-screen-label={`${page}`}>
        <Header page={page} navigate={navigate}/>
        <main>
          <Page navigate={navigate} t={t}/>
        </main>
        <Footer navigate={navigate}/>
      </div>

      <TweaksPanel title="Optic Air — Tweaks">
        <TweakSection label="Theme">
          <TweakColor label="Accent" value={t.accent}
            options={['#F58220', '#1E9CD7', '#0E1A2B', '#5B7A3E', '#B8482E']}
            onChange={(v) => setTweak('accent', v)}/>
          <TweakToggle label="Dark mode" value={t.dark}
            onChange={(v) => setTweak('dark', v)}/>
        </TweakSection>
        <TweakSection label="Hero">
          <TweakToggle label="Dark hero background" value={t.darkHero}
            onChange={(v) => setTweak('darkHero', v)}/>
        </TweakSection>
        <TweakSection label="Layout">
          <TweakRadio label="Corners" value={t.corners}
            options={['sharp', 'round', 'pill']}
            onChange={(v) => setTweak('corners', v)}/>
          <TweakRadio label="Density" value={t.density}
            options={['cozy', 'regular', 'airy']}
            onChange={(v) => setTweak('density', v)}/>
        </TweakSection>
        <TweakSection label="Navigate">
          <TweakSelect label="Page" value={page}
            options={NAV_ITEMS.map(n => ({ value: n.id, label: n.label }))}
            onChange={(v) => navigate(v)}/>
        </TweakSection>
      </TweaksPanel>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
