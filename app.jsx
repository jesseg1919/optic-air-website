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

function App() {
  const [page, setPage] = React.useState(() => {
    const h = (location.hash || '#home').replace('#', '');
    return NAV_ITEMS.find(n => n.id === h) ? h : 'home';
  });
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  React.useEffect(() => {
    const onHash = () => {
      const h = (location.hash || '#home').replace('#', '');
      if (NAV_ITEMS.find(n => n.id === h)) setPage(h);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = React.useCallback((id) => {
    setPage(id);
    history.replaceState(null, '', `#${id}`);
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
