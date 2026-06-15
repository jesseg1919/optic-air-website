// OpticAir — Contact page (with booking widget)

function ServiceAreaMap() {
  // Stylized geographic layout of the Ottawa region.
  // Coords are in an 800x600 viewBox; not to scale, but the relative
  // positions reflect where each community sits on a real map.
  const places = [
    { id: 'ottawa',     name: 'Ottawa',     x: 575, y: 195, tier: 'primary' },
    { id: 'kanata',     name: 'Kanata',     x: 215, y: 235, tier: 'secondary' },
    { id: 'stittsville',name: 'Stittsville',x: 245, y: 330, tier: 'secondary' },
    { id: 'nepean',     name: 'Nepean',     x: 455, y: 305, tier: 'secondary' },
    { id: 'barrhaven',  name: 'Barrhaven',  x: 395, y: 410, tier: 'secondary' },
    { id: 'richmond',   name: 'Richmond',   x: 260, y: 485, tier: 'hq' },
    { id: 'manotick',   name: 'Manotick',   x: 540, y: 460, tier: 'secondary' },
  ];
  const hq = places.find((p) => p.tier === 'hq');

  return (
    <div className="service-map" role="img" aria-label="OpticAir service area map covering Ottawa, Richmond, Kanata, Stittsville, Nepean, Barrhaven and Manotick.">
      <svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="map-dots" width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="1.2" cy="1.2" r="1.2" fill="rgba(255,255,255,0.06)" />
          </pattern>
          <radialGradient id="map-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(245,130,32,0.22)"/>
            <stop offset="100%" stopColor="rgba(245,130,32,0)"/>
          </radialGradient>
          <radialGradient id="map-glow-cool" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(30,156,215,0.18)"/>
            <stop offset="100%" stopColor="rgba(30,156,215,0)"/>
          </radialGradient>
          <filter id="pin-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.4"/>
          </filter>
        </defs>

        {/* Background */}
        <rect width="800" height="600" fill="#0b1424"/>
        <rect width="800" height="600" fill="url(#map-dots)"/>

        {/* Glow accents */}
        <circle cx={hq.x} cy={hq.y} r="320" fill="url(#map-glow)"/>
        <circle cx="600" cy="200" r="240" fill="url(#map-glow-cool)"/>

        {/* Ottawa River (top) */}
        <path d="M -20 110 C 140 60, 280 150, 430 95 S 720 60, 840 130 L 840 -20 L -20 -20 Z"
              fill="rgba(30,156,215,0.10)" />
        <path d="M -20 110 C 140 60, 280 150, 430 95 S 720 60, 840 130"
              fill="none" stroke="rgba(30,156,215,0.55)" strokeWidth="2"/>

        {/* Rideau River (diagonal) */}
        <path d="M 610 110 C 580 220, 600 320, 540 410 S 470 540, 430 620"
              fill="none" stroke="rgba(30,156,215,0.35)" strokeWidth="1.5" strokeDasharray="0"/>

        {/* Highway hint — 417 across */}
        <path d="M 40 280 C 220 240, 420 240, 760 220"
              fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="14" strokeLinecap="round"/>
        <path d="M 40 280 C 220 240, 420 240, 760 220"
              fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" strokeDasharray="6 8"/>
        <text x="690" y="208" fill="rgba(255,255,255,0.32)" fontSize="11" fontFamily="ui-monospace, Menlo, monospace" letterSpacing="2">HWY 417</text>

        {/* Service-area coverage circle — encloses every town */}
        <circle cx="385" cy="350" r="295"
                fill="rgba(245,130,32,0.06)"
                stroke="rgba(245,130,32,0.55)"
                strokeWidth="1.6"
                strokeDasharray="6 8"/>
        <circle cx="385" cy="350" r="295"
                fill="none"
                stroke="rgba(245,130,32,0.22)"
                strokeWidth="6"/>
        <text x="385" y="70"
              textAnchor="middle"
              fill="rgba(245,130,32,0.85)"
              fontSize="11"
              fontWeight="700"
              letterSpacing="3"
              fontFamily="ui-monospace, Menlo, monospace">
          ◦  SERVICE ZONE  ◦
        </text>

        {/* Connectors from HQ to each area */}
        {places.filter((p) => p.tier !== 'hq').map((p) => (
          <line key={'l-' + p.id}
                x1={hq.x} y1={hq.y} x2={p.x} y2={p.y}
                stroke="rgba(255,255,255,0.10)" strokeWidth="1" strokeDasharray="3 5"/>
        ))}

        {/* Pins */}
        {places.map((p) => {
          const isHQ = p.tier === 'hq';
          const isPrimary = p.tier === 'primary';
          const fill = isHQ ? '#F58220' : isPrimary ? '#F58220' : '#1E9CD7';
          const ring = isHQ ? '#F58220' : isPrimary ? '#F58220' : '#1E9CD7';
          const r = isHQ ? 11 : isPrimary ? 9 : 7;
          return (
            <g key={p.id} filter="url(#pin-shadow)">
              {(isHQ || isPrimary) && (
                <circle cx={p.x} cy={p.y} r={r + 8} fill="none" stroke={ring} strokeOpacity="0.35" strokeWidth="1.2">
                  <animate attributeName="r" from={r + 4} to={r + 18} dur="2.4s" repeatCount="indefinite"/>
                  <animate attributeName="stroke-opacity" from="0.45" to="0" dur="2.4s" repeatCount="indefinite"/>
                </circle>
              )}
              <circle cx={p.x} cy={p.y} r={r + 3} fill="rgba(11,20,36,0.85)"/>
              <circle cx={p.x} cy={p.y} r={r} fill={fill}/>
              {isHQ && <circle cx={p.x} cy={p.y} r={3} fill="#0b1424"/>}
            </g>
          );
        })}

        {/* Labels */}
        {places.map((p) => {
          const isHQ = p.tier === 'hq';
          const onRight = ['ottawa','nepean','manotick'].includes(p.id);
          const lx = onRight ? p.x + 18 : p.x - 18;
          const anchor = onRight ? 'start' : 'end';
          return (
            <g key={'t-' + p.id}>
              <text x={lx} y={p.y - 4}
                    textAnchor={anchor}
                    fill={isHQ ? '#FFFFFF' : 'rgba(255,255,255,0.92)'}
                    fontSize={isHQ ? 19 : 16}
                    fontWeight={isHQ ? 800 : 600}
                    fontFamily="system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
                    letterSpacing={isHQ ? '0.2' : '0'}>
                {p.name}
              </text>
              {isHQ && (
                <text x={lx} y={p.y + 14}
                      textAnchor={anchor}
                      fill="#F58220"
                      fontSize="10"
                      fontWeight="700"
                      letterSpacing="2"
                      fontFamily="ui-monospace, Menlo, monospace">
                  ★ HQ · 3 LUNDY'S LANE
                </text>
              )}
            </g>
          );
        })}

        {/* Compass */}
        <g transform="translate(740, 60)" opacity="0.55">
          <circle r="22" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1"/>
          <path d="M 0 -16 L 4 0 L 0 16 L -4 0 Z" fill="rgba(255,255,255,0.6)"/>
          <path d="M 0 -16 L 4 0 L 0 0 Z" fill="#F58220"/>
          <text x="0" y="-26" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="10" fontWeight="700" fontFamily="ui-monospace, Menlo, monospace">N</text>
        </g>
      </svg>

      <div className="map-legend">
        <span><i className="dot dot-hq"></i> HQ — Richmond</span>
        <span><i className="dot dot-primary"></i> Primary</span>
        <span><i className="dot dot-secondary"></i> Service area</span>
      </div>
    </div>
  );
}

function ContactPage({ navigate }) {
  const SERVICES = [
    'Furnace service','Furnace repair (no heat)','New furnace quote',
    'AC service','AC repair','New AC / heat pump quote',
    'Service plan signup','Light commercial inquiry','Other'
  ];
  const [submitted, setSubmitted] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const [form, setForm] = React.useState({
    name: '', phone: '', email: '', address: '',
    bestContact: 'Phone', bestTime: 'Anytime', service: 'Furnace service', notes: '',
  });

  const set = (k) => (e) => {
    const val = e.target.value;
    setForm((f) => ({ ...f, [k]: val }));
    setErrors((er) => { if (!er[k]) return er; const n = { ...er }; delete n[k]; return n; });
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Please add your name.';
    if (!form.phone.trim()) e.phone = 'A phone number helps us reach you fast.';
    if (!form.email.trim()) e.email = 'Add an email so we can follow up.';
    else if (form.email.indexOf('@') < 1 || form.email.indexOf('.') < 0) e.email = 'That email looks off — mind checking it?';
    if (!form.address.trim()) e.address = 'Let us know where the work is needed.';
    return e;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSending(true);
    const notes = [
      'Preferred contact: ' + form.bestContact,
      'Preferred time: ' + form.bestTime,
      form.notes.trim() ? 'Notes: ' + form.notes.trim() : null,
    ].filter(Boolean).join(' · ');
    try {
      await submitLead({
        name: form.name, phone: form.phone, email: form.email,
        address: form.address, service: form.service, notes: notes, page: 'contact-form',
      });
    } catch (err) {}
    setSending(false);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const firstName = form.name.trim() ? form.name.trim().split(' ')[0] : '';

  return (
    <React.Fragment>
      <section className="page-hero">
        <div className="wrap">
          <div className="crumbs">Home / <span>Contact</span></div>
          <div className="contact-hero-grid" style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 40, alignItems: 'center' }}>
            <div>
              <div className="eyebrow"><Icon.Mail style={{ width: 14, height: 14 }}/> Get in touch</div>
              <h1 style={{ marginTop: 18 }}>Let's get your home <span className="word-warm">comfortable.</span></h1>
              <p className="lede">Send us a request below and we'll be in touch within one business day — usually within the hour during business hours. Tell us what's going on and we'll take it from there.</p>
            </div>
            <img src="assets/van.png" alt="OpticAir service van" style={{ width: '100%', height: 'auto', display: 'block' }}/>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="contact-grid">
            <div>
              {submitted ? (
                <div className="request-confirm">
                  <div className="confirm-head">
                    <div className="confirm-check"><Icon.Check style={{ width: 26, height: 26 }}/></div>
                    <div>
                      <h2 style={{ fontSize: 28 }}>Request received{firstName ? ', ' + firstName : ''}.</h2>
                      <p style={{ marginTop: 8 }}>We've got your details for <strong>{form.service.toLowerCase()}</strong>. Here's exactly what happens next.</p>
                    </div>
                  </div>
                  <ol className="next-steps">
                    <li><span className="ns-num">1</span><div><h4>Request received</h4><p>Your request just landed with our team — nothing more you need to do.</p></div></li>
                    <li><span className="ns-num">2</span><div><h4>We reach out</h4><p>Jared or a team member contacts you by {form.bestContact.toLowerCase()} within one business day — usually within the hour during business hours{form.bestTime !== 'Anytime' ? ', aiming for the ' + form.bestTime.toLowerCase() : ''}.</p></div></li>
                    <li><span className="ns-num">3</span><div><h4>We get you booked</h4><p>We confirm pricing, answer your questions, and schedule your visit or send your quote.</p></div></li>
                  </ol>
                  <div className="confirm-emergency"><strong>No heat or cooling right now?</strong> Don't wait on the form — our 24/7 line is at <a href={'tel:' + BIZ.phoneRaw}>{BIZ.phone}</a>.</div>
                  <button type="button" className="btn btn-ghost" style={{ marginTop: 4 }} onClick={() => { setSubmitted(false); setErrors({}); setForm({ name: '', phone: '', email: '', address: '', bestContact: 'Phone', bestTime: 'Anytime', service: 'Furnace service', notes: '' }); }}>Send another request</button>
                </div>
              ) : (
                <form onSubmit={onSubmit} noValidate className="request-form">
                  <div className="request-form-head">
                    <h3 style={{ fontSize: 22 }}>Send us a request</h3>
                    <span className="reply-badge"><span className="dot"/> Replies within 1 business hour</span>
                  </div>
                  <div className="form-grid">
                    <div className={'field' + (errors.name ? ' has-error' : '')}>
                      <label htmlFor="f-name">Full name <span className="req">*</span></label>
                      <input id="f-name" type="text" value={form.name} onChange={set('name')} placeholder="Jane Doe" autoComplete="name"/>
                      {errors.name ? <span className="err">{errors.name}</span> : <span className="hint">So we know who we're talking to.</span>}
                    </div>
                    <div className={'field' + (errors.phone ? ' has-error' : '')}>
                      <label htmlFor="f-phone">Phone <span className="req">*</span></label>
                      <input id="f-phone" type="tel" value={form.phone} onChange={set('phone')} placeholder="(613) 555-0123" autoComplete="tel"/>
                      {errors.phone ? <span className="err">{errors.phone}</span> : <span className="hint">Best number to reach you.</span>}
                    </div>
                    <div className={'field full' + (errors.email ? ' has-error' : '')}>
                      <label htmlFor="f-email">Email <span className="req">*</span></label>
                      <input id="f-email" type="email" value={form.email} onChange={set('email')} placeholder="jane@example.com" autoComplete="email"/>
                      {errors.email ? <span className="err">{errors.email}</span> : <span className="hint">We'll send confirmation and any quote here.</span>}
                    </div>
                    <div className={'field full' + (errors.address ? ' has-error' : '')}>
                      <label htmlFor="f-addr">Service address <span className="req">*</span></label>
                      <input id="f-addr" type="text" value={form.address} onChange={set('address')} placeholder="123 Main St, Ottawa ON" autoComplete="street-address"/>
                      {errors.address ? <span className="err">{errors.address}</span> : <span className="hint">Where the work is needed — confirms we cover your area.</span>}
                    </div>
                    <div className="field">
                      <label htmlFor="f-contact">Best way to reach you</label>
                      <select id="f-contact" value={form.bestContact} onChange={set('bestContact')}>
                        <option>Phone</option><option>Email</option><option>Text</option>
                      </select>
                    </div>
                    <div className="field">
                      <label htmlFor="f-time">Best time of day</label>
                      <select id="f-time" value={form.bestTime} onChange={set('bestTime')}>
                        <option>Anytime</option><option>Morning</option><option>Afternoon</option><option>Evening</option>
                      </select>
                    </div>
                    <div className="field full">
                      <label htmlFor="f-svc">What can we help with?</label>
                      <select id="f-svc" value={form.service} onChange={set('service')}>
                        {SERVICES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                      <span className="hint">Not sure? Pick the closest — we'll sort out the details.</span>
                    </div>
                    <div className="field full">
                      <label htmlFor="f-notes">Anything else? <span className="opt">(optional)</span></label>
                      <textarea id="f-notes" value={form.notes} onChange={set('notes')} placeholder="Make / model, when it started, urgency, error codes — anything that helps."/>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={sending} style={{ marginTop: 22, width: '100%', justifyContent: 'center', opacity: sending ? 0.7 : 1 }}>
                    {sending ? 'Sending…' : <React.Fragment>Send request <Icon.Arrow className="arrow"/></React.Fragment>}
                  </button>
                  <p className="request-fineprint">Goes straight to our team in Housecall Pro — no call centers, no spam, ever.</p>
                </form>
              )}
            </div>

            <aside className="contact-side">
              <div>
                <div className="eyebrow" style={{ color: 'var(--accent)' }}>Prefer to talk now?</div>
                <div className="side-info">
                  <a className="info-row" href={'tel:' + BIZ.phoneRaw}>
                    <span className="icon-bubble"><Icon.Phone/></span>
                    <span><span className="l">Call</span><span className="v">{BIZ.phone}</span></span>
                  </a>
                  <a className="info-row" href={'mailto:' + BIZ.email}>
                    <span className="icon-bubble"><Icon.Mail/></span>
                    <span><span className="l">Email</span><span className="v">{BIZ.email}</span></span>
                  </a>
                  <div className="info-row">
                    <span className="icon-bubble"><Icon.Clock/></span>
                    <span><span className="l">Hours</span><span className="v">Mon–Sun 8am–5pm · 24/7 emergency</span></span>
                  </div>
                  <div className="info-row">
                    <span className="icon-bubble"><Icon.Pin/></span>
                    <span><span className="l">Based in</span><span className="v">{BIZ.address}</span></span>
                  </div>
                </div>
              </div>
              <div className="side-trust">
                <div className="side-trust-title">Why homeowners call us</div>
                <ul>
                  <li><Icon.Check/> Licensed &amp; insured · TSSA registered</li>
                  <li><Icon.Check/> Locally owned in Richmond, ON</li>
                  <li><Icon.Check/> Up-front pricing — no surprises</li>
                  <li><Icon.Check/> Reply within 1 business hour</li>
                </ul>
              </div>
              <div className="side-emergency">
                <Icon.Bolt/>
                <div><strong>No heat or AC?</strong> Our 24/7 emergency line is always answered — <a href={'tel:' + BIZ.phoneRaw}>call {BIZ.phone}</a>.</div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="dark-section">
        <div className="wrap">
          <div className="feature-row reverse">
            <ServiceAreaMap />
            <div>
              <div className="eyebrow">Service area</div>
              <h2 style={{ marginTop: 16 }}>Where we work.</h2>
              <p style={{ marginTop: 18 }}>Based in Richmond, ON — serving Ottawa and the surrounding communities daily.</p>
              <div className="areas">
                {BIZ.primaryAreas.map((a) => <span key={a} className="area-chip primary">{a}</span>)}
                {BIZ.secondaryAreas.map((a) => <span key={a} className="area-chip">{a}</span>)}
              </div>
              <p style={{ marginTop: 24, fontSize: 14, color: 'var(--c-ink-3)' }}>Outside this list? Give us a call — we'll let you know if we can help.</p>
            </div>
          </div>
        </div>
      </section>

      <div style={{ height: 80 }}/>
    </React.Fragment>
  );
}

Object.assign(window, { ContactPage });
