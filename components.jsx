// OpticAir — shared components: Header, Footer, Icons, Photo placeholders

const NAV_ITEMS = [
  { id: 'home', label: 'Home' },
  { id: 'heating', label: 'Heating' },
  { id: 'cooling', label: 'Air Conditioning' },
  { id: 'plans', label: 'Service Plans' },
  { id: 'contact', label: 'Contact' },
];

const BIZ = {
  phone: '(613) 297-5377',
  phoneRaw: '6132975377',
  email: 'jared.kerr@opticair.ca',
  address: '3 Lundy\'s Lane, Richmond, ON, K0A 2Z0',
  primaryAreas: ['Ottawa', 'Richmond'],
  secondaryAreas: ['Kanata', 'Stittsville', 'Nepean', 'Barrhaven', 'Manotick'],
};

// ── Icons ────────────────────────────────────────────────────────────────
const Icon = {
  Phone: (p) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  ),
  Flame: (p) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
    </svg>
  ),
  Snowflake: (p) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/>
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/><line x1="19.07" y1="4.93" x2="4.93" y2="19.07"/>
      <polyline points="9 5 12 2 15 5"/><polyline points="15 19 12 22 9 19"/>
      <polyline points="5 9 2 12 5 15"/><polyline points="19 15 22 12 19 9"/>
    </svg>
  ),
  Wind: (p) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M9.59 4.59A2 2 0 1 1 11 8H2"/><path d="M17.73 2.27A2.5 2.5 0 1 1 19.5 6.5H2"/><path d="M9.59 19.41A2 2 0 1 0 11 16H2"/>
    </svg>
  ),
  Shield: (p) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  Check: (p) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Star: (p) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" {...p}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  Arrow: (p) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
  Clock: (p) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  Mail: (p) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
    </svg>
  ),
  Pin: (p) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  Tool: (p) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
    </svg>
  ),
  Calendar: (p) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  Leaf: (p) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M11 20A7 7 0 0 1 4 13C4 8 9 3 11 3c2 0 5 .5 7 2.5C20 7.5 21 11 21 13a7 7 0 0 1-10 7z"/><path d="M5 21c2-4 5-7 11-9"/>
    </svg>
  ),
  Filter: (p) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
    </svg>
  ),
  Bolt: (p) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  Award: (p) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
    </svg>
  ),
};

// ── Header ────────────────────────────────────────────────────────────────
function Header({ page, navigate }) {
  return (
    <header className="site-header">
      <div className="wrap">
        <a href="#home" className="logo" onClick={(e) => { e.preventDefault(); navigate('home'); }}>
          <img src="assets/logo.png" alt="Optic Air" />
        </a>
        <nav className="nav">
          {NAV_ITEMS.map((it) => (
            <a key={it.id} href={`#${it.id}`}
               className={page === it.id ? 'active' : ''}
               onClick={(e) => { e.preventDefault(); navigate(it.id); }}>
              {it.label}
            </a>
          ))}
        </nav>
        <div className="header-cta">
          <a className="header-phone" href={`tel:${BIZ.phoneRaw}`}>
            <Icon.Phone /> {BIZ.phone}
          </a>
          <a className="btn btn-primary" href="#contact"
             onClick={(e) => { e.preventDefault(); navigate('contact'); }}>
            Book online <Icon.Arrow className="arrow" />
          </a>
        </div>
      </div>
    </header>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────
function Footer({ navigate }) {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="brand-block">
            <img src="assets/logo.png" alt="Optic Air" />
            <p>Honest, local heating & cooling for Ottawa-area homes and light commercial. Direct communication, responsive service, fair pricing.</p>
          </div>
          <div>
            <h5>Pages</h5>
            <ul>
              {NAV_ITEMS.map((it) => (
                <li key={it.id}><a href={`#${it.id}`} onClick={(e) => { e.preventDefault(); navigate(it.id); }}>{it.label}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h5>Service Area</h5>
            <ul>
              {[...BIZ.primaryAreas, ...BIZ.secondaryAreas].map((a) => <li key={a}>{a}, ON</li>)}
            </ul>
          </div>
          <div>
            <h5>Contact</h5>
            <ul>
              <li><a href={`tel:${BIZ.phoneRaw}`}>{BIZ.phone}</a></li>
              <li><a href={`mailto:${BIZ.email}`}>{BIZ.email}</a></li>
              <li>{BIZ.address}</li>
              <li style={{ marginTop: 8, display: 'flex', gap: 12 }}>
                <a href="https://www.instagram.com/opticairhvac/" aria-label="Instagram">Instagram</a>
                <a href="https://www.facebook.com/profile.php?id=61564559587629" aria-label="Facebook">Facebook</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div>© {new Date().getFullYear()} Optic Air. All rights reserved.</div>
          <div>Licensed & insured · TSSA registered · Locally owned in Richmond, ON</div>
        </div>
      </div>
    </footer>
  );
}

// ── Photo placeholders (Unsplash stock + gradient/SVG fallback) ──────────
// Curated Unsplash photo IDs by scene. <img> sits above the gradient/SVG —
// if it 404s we hide it and the underlying scene stays as fallback.
const STOCK = {
  tech:    'photo-1581094794329-c8112a89af12', // HVAC/thermostat hand
  furnace: 'photo-1635424828876-9c5d6ce6e8a5', // mechanical / piping
  ac:      'photo-1631545806609-be65fdcde1c4', // condenser unit outside
  home:    'photo-1600585154340-be6161a56a0c', // modern home exterior
  tools:   'photo-1530124566582-a618bc2615dc', // hand tools
  team:    'photo-1581092160562-40aa08e78837', // technicians at work
  warm:    'photo-1556909114-f6e7ad7d3136',    // warm cozy interior
  cool:    'photo-1581093588401-fbb62a02f120', // ductless mini-split / vent
};
const STOCK_URL = (id) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=80`;

function Photo({ scene = 'tech', aspect = '4-3', caption, showCaption = false, src, alt = '', children }) {
  const imgSrc = src || (STOCK[scene] ? STOCK_URL(STOCK[scene]) : null);
  return (
    <div className={`photo aspect-${aspect} ph-${scene}`}>
      <div className="photo-pattern" />
      <PhotoScene scene={scene} />
      {imgSrc && (
        <img className="photo-img" src={imgSrc} alt={alt}
             loading="lazy"
             onError={(e) => { e.currentTarget.style.display = 'none'; }} />
      )}
      <div className="photo-vignette" />
      {caption && showCaption && <div className="caption">{caption}</div>}
      {children}
    </div>
  );
}

function PhotoScene({ scene }) {
  // Minimal abstract "scene" SVGs that suggest the subject without faking specific imagery
  switch (scene) {
    case 'furnace':
      return (
        <svg className="scene-svg" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
          <rect x="120" y="60" width="160" height="200" rx="8" fill="rgba(255,255,255,.08)" />
          <rect x="120" y="60" width="160" height="46" rx="8" fill="rgba(255,255,255,.04)" />
          <circle cx="160" cy="83" r="6" fill="#1E9CD7" opacity=".9" />
          <circle cx="180" cy="83" r="4" fill="#F58220" opacity=".9" />
          <rect x="140" y="140" width="120" height="80" rx="4" fill="rgba(0,0,0,.25)" />
          <rect x="148" y="148" width="104" height="64" fill="url(#flameG)" opacity=".75" />
          <defs>
            <linearGradient id="flameG" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0" stopColor="#F58220"/><stop offset="1" stopColor="#FFD27A"/>
            </linearGradient>
          </defs>
          <rect x="135" y="232" width="130" height="18" rx="2" fill="rgba(255,255,255,.05)" />
        </svg>
      );
    case 'ac':
      return (
        <svg className="scene-svg" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
          <rect x="80" y="80" width="240" height="160" rx="10" fill="rgba(255,255,255,.07)" />
          <circle cx="200" cy="160" r="56" fill="rgba(0,0,0,.3)" />
          <g stroke="rgba(255,255,255,.5)" strokeWidth="2" fill="none">
            {[0,45,90,135].map(a => (
              <line key={a} x1="200" y1="160"
                x2={200 + 50 * Math.cos(a*Math.PI/180)}
                y2={160 + 50 * Math.sin(a*Math.PI/180)} />
            ))}
            {[180,225,270,315].map(a => (
              <line key={a} x1="200" y1="160"
                x2={200 + 50 * Math.cos(a*Math.PI/180)}
                y2={160 + 50 * Math.sin(a*Math.PI/180)} />
            ))}
          </g>
          <circle cx="200" cy="160" r="10" fill="rgba(255,255,255,.7)" />
          <rect x="92" y="92" width="216" height="14" rx="3" fill="rgba(255,255,255,.06)" />
        </svg>
      );
    case 'home':
      return (
        <svg className="scene-svg" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
          <polygon points="80,150 200,70 320,150 320,260 80,260" fill="rgba(255,255,255,.08)" />
          <polygon points="80,150 200,70 320,150" fill="rgba(0,0,0,.2)" />
          <rect x="180" y="180" width="40" height="80" fill="rgba(245,130,32,.5)" />
          <rect x="110" y="170" width="40" height="40" fill="rgba(30,156,215,.4)" />
          <rect x="250" y="170" width="40" height="40" fill="rgba(30,156,215,.4)" />
          <rect x="160" y="100" width="14" height="40" fill="rgba(0,0,0,.3)" />
        </svg>
      );
    case 'tools':
      return (
        <svg className="scene-svg" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
          <rect x="60" y="120" width="280" height="20" rx="4" fill="rgba(255,255,255,.1)" transform="rotate(-12 200 130)" />
          <rect x="80" y="160" width="240" height="14" rx="3" fill="rgba(245,130,32,.55)" transform="rotate(8 200 167)" />
          <circle cx="120" cy="100" r="22" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="6" />
          <circle cx="280" cy="200" r="16" fill="rgba(30,156,215,.4)" />
        </svg>
      );
    case 'tech':
      return (
        <svg className="scene-svg" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
          <circle cx="200" cy="120" r="42" fill="rgba(255,255,255,.12)" />
          <rect x="150" y="160" width="100" height="140" rx="12" fill="rgba(255,255,255,.1)" />
          <rect x="158" y="190" width="84" height="12" rx="2" fill="rgba(245,130,32,.7)" />
          <circle cx="200" cy="240" r="14" fill="rgba(30,156,215,.6)" />
          <rect x="40" y="220" width="80" height="80" rx="8" fill="rgba(255,255,255,.06)" />
          <rect x="280" y="220" width="80" height="80" rx="8" fill="rgba(255,255,255,.06)" />
        </svg>
      );
    case 'warm':
      return (
        <svg className="scene-svg" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
          <circle cx="200" cy="180" r="120" fill="rgba(255,210,122,.3)" />
          <circle cx="200" cy="180" r="80" fill="rgba(255,160,80,.5)" />
          <circle cx="200" cy="180" r="44" fill="rgba(245,130,32,.9)" />
        </svg>
      );
    case 'cool':
      return (
        <svg className="scene-svg" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
          <g stroke="rgba(255,255,255,.6)" strokeWidth="3" strokeLinecap="round" fill="none">
            <line x1="200" y1="60" x2="200" y2="240"/>
            <line x1="110" y1="150" x2="290" y2="150"/>
            <line x1="135" y1="85" x2="265" y2="215"/>
            <line x1="265" y1="85" x2="135" y2="215"/>
          </g>
          <circle cx="200" cy="150" r="14" fill="white" opacity=".7" />
        </svg>
      );
    case 'team':
      return (
        <svg className="scene-svg" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
          {[100, 200, 300].map((x, i) => (
            <g key={i}>
              <circle cx={x} cy={130 + i*5} r="34" fill="rgba(255,255,255,.12)" />
              <rect x={x-44} y={170 + i*5} width="88" height="120" rx="14" fill="rgba(245,130,32,.4)" />
            </g>
          ))}
        </svg>
      );
    default:
      return null;
  }
}

// ── Section head ─────────────────────────────────────────────────────────
function SectionHead({ eyebrow, title, sub, align = 'split' }) {
  if (align === 'center') {
    return (
      <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 56px' }}>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h2 style={{ marginTop: 16 }}>{title}</h2>
        {sub && <p style={{ marginTop: 18, fontSize: 18 }}>{sub}</p>}
      </div>
    );
  }
  return (
    <div className="section-head">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h2 style={{ marginTop: 16 }}>{title}</h2>
      </div>
      {sub && <p className="sub">{sub}</p>}
    </div>
  );
}

// ── Trust bar ────────────────────────────────────────────────────────────
function TrustBar() {
  return (
    <div className="trust-bar">
      <div className="wrap row">
        <div className="label">Proudly servicing</div>
        <div className="brands">
          <div className="brand" data-b="lennox">Lennox</div>
          <div className="brand" data-b="bosch">BOSCH</div>
          <div className="brand">Carrier</div>
          <div className="brand" data-b="trane">Trane</div>
          <div className="brand" data-b="napoleon">Napoleon</div>
          <div className="brand">Mitsubishi</div>
        </div>
      </div>
    </div>
  );
}

// ── CTA banner ───────────────────────────────────────────────────────────
function CTABanner({ navigate, title = "Comfort that's one call away.", body = "Whether it's a tune-up or a full installation, we'll show up when we say, explain what's needed, and stand behind the work.", primary = "Book online", secondary = "Call (613) 297-5377" }) {
  return (
    <section style={{ paddingTop: 'clamp(64px, 8vw, 112px)' }}>
      <div className="wrap">
        <div className="cta-banner">
          <div className="glow" />
          <div className="glow b" />
          <div style={{ position: 'relative' }}>
            <div className="eyebrow" style={{ color: 'var(--accent)' }}>Ready when you are</div>
            <h2 style={{ marginTop: 16, maxWidth: '14ch' }}>{title}</h2>
            <p style={{ marginTop: 18 }}>{body}</p>
          </div>
          <div className="ctas" style={{ position: 'relative' }}>
            <a className="btn btn-primary" href="#contact" onClick={(e) => { e.preventDefault(); navigate('contact'); }}>{primary} <Icon.Arrow className="arrow"/></a>
            <a className="btn btn-ghost" href={`tel:${BIZ.phoneRaw}`} style={{ borderColor: 'rgba(255,255,255,.25)', color: '#fff' }}><Icon.Phone /> {BIZ.phone.replace('(613) ', '')}</a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Lead form (bottom-of-page) ───────────────────────────────────────────
function LeadForm({ eyebrow = "Quick request", title = "Get a fast, honest quote.", sub = "Tell us what's going on — we'll reply within one business hour. No call centers, no pressure.", defaultService = "Furnace service" }) {
  const [submitted, setSubmitted] = React.useState(false);
  const [form, setForm] = React.useState({
    name: '', phone: '', email: '', address: '',
    service: defaultService, notes: '',
  });
  const onSubmit = (e) => { e.preventDefault(); setSubmitted(true); };

  return (
    <section className="lead-section">
      <div className="wrap">
        <div className="lead-card">
          <div className="lead-intro">
            <div className="eyebrow" style={{ color: 'var(--accent)' }}>
              <span style={{ width: 24, height: 1.5, background: 'var(--accent)', display: 'inline-block' }}></span>
              {eyebrow}
            </div>
            <h2 style={{ marginTop: 16 }}>{title}</h2>
            <p style={{ marginTop: 16 }}>{sub}</p>
            <ul className="lead-bullets">
              <li><Icon.Check/> Reply within 1 business hour</li>
              <li><Icon.Check/> Up-front pricing, no surprises</li>
              <li><Icon.Check/> Locally-owned, Ottawa &amp; area</li>
            </ul>
            <div className="lead-contact">
              <a className="btn btn-ghost" href={`tel:${BIZ.phoneRaw}`}><Icon.Phone/> {BIZ.phone}</a>
              <a href={`mailto:${BIZ.email}`} className="lead-mail"><Icon.Mail/> {BIZ.email}</a>
            </div>
          </div>

          <div className="lead-form-wrap">
            {submitted ? (
              <div className="lead-success">
                <div className="lead-check"><Icon.Check style={{ width: 28, height: 28 }}/></div>
                <h3>Thanks {form.name || 'there'} — got it.</h3>
                <p>We'll be in touch shortly at {form.phone || form.email || 'the contact details you provided'}.</p>
                <button type="button" className="btn btn-ghost" onClick={() => setSubmitted(false)}>Send another</button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="lead-form">
                <div className="form-grid">
                  <div className="field">
                    <label htmlFor="lf-name">Full name</label>
                    <input id="lf-name" type="text" required value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})} placeholder="Jane Doe"/>
                  </div>
                  <div className="field">
                    <label htmlFor="lf-phone">Phone</label>
                    <input id="lf-phone" type="tel" required value={form.phone} onChange={(e)=>setForm({...form, phone: e.target.value})} placeholder="(613) 555-0123"/>
                  </div>
                  <div className="field full">
                    <label htmlFor="lf-email">Email</label>
                    <input id="lf-email" type="email" required value={form.email} onChange={(e)=>setForm({...form, email: e.target.value})} placeholder="jane@example.com"/>
                  </div>
                  <div className="field full">
                    <label htmlFor="lf-addr">Service address</label>
                    <input id="lf-addr" type="text" value={form.address} onChange={(e)=>setForm({...form, address: e.target.value})} placeholder="123 Main St, Ottawa ON"/>
                  </div>
                  <div className="field full">
                    <label htmlFor="lf-svc">What's this regarding?</label>
                    <select id="lf-svc" value={form.service} onChange={(e)=>setForm({...form, service: e.target.value})}>
                      <option>Furnace service</option><option>Furnace repair (no heat)</option><option>New furnace quote</option>
                      <option>AC service</option><option>AC repair</option><option>New AC / heat pump quote</option>
                      <option>Service plan signup</option><option>Light commercial inquiry</option><option>Other</option>
                    </select>
                  </div>
                  <div className="field full">
                    <label htmlFor="lf-notes">Notes (optional)</label>
                    <textarea id="lf-notes" rows="3" value={form.notes} onChange={(e)=>setForm({...form, notes: e.target.value})} placeholder="Make / model, urgency, anything else..."/>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{ marginTop: 18, width: '100%', justifyContent: 'center' }}>
                  Send request <Icon.Arrow className="arrow"/>
                </button>
                <p className="lead-fineprint">Leads go directly to {BIZ.email} · No spam, ever.</p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { NAV_ITEMS, BIZ, Icon, Header, Footer, Photo, PhotoScene, SectionHead, TrustBar, CTABanner, LeadForm });
