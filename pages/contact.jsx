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
  const [submitted, setSubmitted] = React.useState(false);
  const [form, setForm] = React.useState({
    name: '', phone: '', email: '', address: '',
    bestContact: 'Phone', bestTime: 'Morning', service: 'Furnace service',
    notes: '',
  });
  const onSubmit = (e) => { e.preventDefault(); setSubmitted(true); };

  return (
    <React.Fragment>
      <section className="page-hero">
        <div className="wrap">
          <div className="crumbs">Home / <span>Contact</span></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 40, alignItems: 'center' }}>
            <div>
              <div className="eyebrow"><Icon.Mail style={{ width: 14, height: 14 }}/> Get in touch</div>
              <h1 style={{ marginTop: 18 }}>Let's get your home <span className="word-warm">comfortable.</span></h1>
              <p className="lede">
                Book online below for instant scheduling — or send a request and we'll be in touch within one business day (usually within the hour during business hours).
              </p>
            </div>
            <img src="assets/van.png" alt="OpticAir service van" style={{ width: '100%', height: 'auto', display: 'block' }}/>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="contact-grid">
            {/* Booking widget */}
            <div>
              <BookingWidget navigate={navigate}/>
            </div>

            {/* Form */}
            <div>
              {submitted ? (
                <div className="contact-side" style={{ background: 'var(--c-card)', border: '1px solid var(--c-line)', textAlign: 'center', padding: '56px 32px' }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'color-mix(in oklab, var(--accent) 14%, var(--c-bg))', color: 'var(--accent)', display: 'grid', placeItems: 'center', margin: '0 auto 20px' }}>
                    <Icon.Check style={{ width: 28, height: 28 }}/>
                  </div>
                  <h2 style={{ fontSize: 28 }}>Request sent.</h2>
                  <p style={{ marginTop: 14 }}>Thanks {form.name || 'there'} — we've got your details. Jared or a team member will be in touch by {form.bestContact.toLowerCase()} during the {form.bestTime.toLowerCase()}.</p>
                  <button className="btn btn-ghost" style={{ marginTop: 24 }} onClick={() => setSubmitted(false)}>Send another request</button>
                </div>
              ) : (
                <form onSubmit={onSubmit} style={{ background: 'var(--c-card)', border: '1px solid var(--c-line)', borderRadius: 'var(--radius-lg)', padding: 32, boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
                    <h3 style={{ fontSize: 22 }}>Or send a request</h3>
                    <span style={{ fontSize: 13, color: 'var(--c-ink-3)', fontWeight: 600 }}>We reply within 1 hour</span>
                  </div>
                  <div className="form-grid">
                    <div className="field">
                      <label htmlFor="f-name">Full name</label>
                      <input id="f-name" type="text" required value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})} placeholder="Jane Doe"/>
                    </div>
                    <div className="field">
                      <label htmlFor="f-phone">Phone</label>
                      <input id="f-phone" type="tel" required value={form.phone} onChange={(e)=>setForm({...form, phone: e.target.value})} placeholder="(613) 555-0123"/>
                    </div>
                    <div className="field full">
                      <label htmlFor="f-email">Email</label>
                      <input id="f-email" type="email" required value={form.email} onChange={(e)=>setForm({...form, email: e.target.value})} placeholder="jane@example.com"/>
                    </div>
                    <div className="field full">
                      <label htmlFor="f-addr">Service address</label>
                      <input id="f-addr" type="text" required value={form.address} onChange={(e)=>setForm({...form, address: e.target.value})} placeholder="123 Main St, Ottawa ON"/>
                    </div>
                    <div className="field">
                      <label htmlFor="f-contact">Best way to contact</label>
                      <select id="f-contact" value={form.bestContact} onChange={(e)=>setForm({...form, bestContact: e.target.value})}>
                        <option>Phone</option><option>Email</option><option>Text</option>
                      </select>
                    </div>
                    <div className="field">
                      <label htmlFor="f-time">Best time</label>
                      <select id="f-time" value={form.bestTime} onChange={(e)=>setForm({...form, bestTime: e.target.value})}>
                        <option>Morning</option><option>Afternoon</option><option>Evening</option><option>Anytime</option>
                      </select>
                    </div>
                    <div className="field full">
                      <label htmlFor="f-svc">What's this regarding?</label>
                      <select id="f-svc" value={form.service} onChange={(e)=>setForm({...form, service: e.target.value})}>
                        <option>Furnace service</option><option>Furnace repair (no heat)</option><option>New furnace quote</option>
                        <option>AC service</option><option>AC repair</option><option>New AC / heat pump quote</option>
                        <option>Service plan signup</option><option>Light commercial inquiry</option><option>Other</option>
                      </select>
                    </div>
                    <div className="field full">
                      <label htmlFor="f-notes">Notes (optional)</label>
                      <textarea id="f-notes" value={form.notes} onChange={(e)=>setForm({...form, notes: e.target.value})} placeholder="Anything we should know — make/model, when it started, urgency..."/>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ marginTop: 22, width: '100%', justifyContent: 'center' }}>
                    Send request <Icon.Arrow className="arrow"/>
                  </button>
                  <p style={{ fontSize: 12, color: 'var(--c-ink-3)', marginTop: 14, textAlign: 'center' }}>Leads go directly to {BIZ.email} · No spam, ever.</p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Quick contact tiles */}
      <section style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }}>
            {[
              { i: <Icon.Phone/>, l: 'Call', v: BIZ.phone, h: `tel:${BIZ.phoneRaw}` },
              { i: <Icon.Mail/>, l: 'Email', v: BIZ.email, h: `mailto:${BIZ.email}` },
              { i: <Icon.Pin/>, l: 'Visit', v: BIZ.address, h: '#' },
              { i: <Icon.Clock/>, l: 'Hours', v: 'Mon–Fri 7am–6pm · 24/7 emergency', h: '#' },
            ].map((c, i) => (
              <a key={i} href={c.h} style={{ padding: 24, background: 'var(--c-bg-2)', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--c-card)', border: '1px solid var(--c-line)', display: 'grid', placeItems: 'center', color: 'var(--accent)' }}>{c.i}</div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--c-ink-3)', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 700 }}>{c.l}</div>
                  <div style={{ fontSize: 15, color: 'var(--c-ink)', fontWeight: 600, marginTop: 4 }}>{c.v}</div>
                </div>
              </a>
            ))}
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

// ── Booking Widget ────────────────────────────────────────────────────────
function BookingWidget({ navigate }) {
  const [step, setStep] = React.useState(1);
  const [svc, setSvc] = React.useState('furnace-service');
  const [day, setDay] = React.useState(null);
  const [time, setTime] = React.useState(null);

  const services = [
    { id: 'furnace-service', t: 'Furnace tune-up', d: '60 min · from $169' },
    { id: 'furnace-repair', t: 'Furnace repair', d: 'Diagnosis + estimate' },
    { id: 'ac-service', t: 'AC tune-up', d: '60 min · from $149' },
    { id: 'ac-repair', t: 'AC repair', d: 'Diagnosis + estimate' },
    { id: 'new-quote', t: 'New system quote', d: 'Free in-home assessment' },
    { id: 'other', t: 'Something else', d: 'Tell us what\'s up' },
  ];

  // Mock calendar — current month, mark today + skip Sundays / past days
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = today.toLocaleString('en', { month: 'long' });

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const times = ['8:00 AM', '10:00 AM', '12:00 PM', '2:00 PM', '4:00 PM', '6:00 PM'];

  return (
    <div className="booking">
      <div className="booking-head">
        <h3>Book online — {step === 1 ? 'choose a service' : step === 2 ? 'pick a time' : 'confirm'}</h3>
        <div className="step">Step {step} of 3</div>
      </div>

      {step === 1 && (
        <React.Fragment>
          <div className="svc-picks">
            {services.map(s => (
              <button key={s.id} type="button" className="svc-pick" aria-pressed={svc === s.id} onClick={() => setSvc(s.id)}>
                <div className="t">{s.t}</div>
                <div className="d">{s.d}</div>
              </button>
            ))}
          </div>
          <button className="btn btn-primary" style={{ marginTop: 22, width: '100%', justifyContent: 'center' }} onClick={() => setStep(2)}>
            Continue <Icon.Arrow className="arrow"/>
          </button>
        </React.Fragment>
      )}

      {step === 2 && (
        <React.Fragment>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <strong style={{ fontSize: 15 }}>{monthName} {year}</strong>
            <div style={{ fontSize: 13, color: 'var(--c-ink-3)' }}>Times in ET</div>
          </div>
          <div className="cal-grid">
            {['S','M','T','W','T','F','S'].map((d, i) => <div key={i} className="cal-dow">{d}</div>)}
            {cells.map((d, i) => {
              if (d === null) return <div key={i} className="cal-cell" disabled/>;
              const date = new Date(year, month, d);
              const isPast = date < new Date(today.toDateString());
              const isSun = date.getDay() === 0;
              const disabled = isPast || isSun;
              const isToday = d === today.getDate();
              return (
                <button key={i} type="button" className={`cal-cell ${isToday ? 'today' : ''}`}
                        disabled={disabled} aria-pressed={day === d}
                        onClick={() => !disabled && setDay(d)}>
                  {d}
                </button>
              );
            })}
          </div>
          {day && (
            <React.Fragment>
              <div style={{ marginTop: 22, fontSize: 14, fontWeight: 600 }}>Available times for {monthName} {day}</div>
              <div className="time-grid">
                {times.map(t => (
                  <button key={t} type="button" className="time-pick" aria-pressed={time === t} onClick={() => setTime(t)}>
                    {t}
                  </button>
                ))}
              </div>
            </React.Fragment>
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: 22 }}>
            <button className="btn btn-ghost" onClick={() => setStep(1)}>Back</button>
            <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', opacity: (day && time) ? 1 : .5, pointerEvents: (day && time) ? 'auto' : 'none' }}
                    onClick={() => setStep(3)}>
              Continue <Icon.Arrow className="arrow"/>
            </button>
          </div>
        </React.Fragment>
      )}

      {step === 3 && (
        <React.Fragment>
          <div style={{ background: 'var(--c-bg-2)', borderRadius: 12, padding: 18, marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--c-ink-3)', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>Your booking</div>
                <div style={{ fontSize: 18, fontWeight: 700, marginTop: 6 }}>{services.find(s => s.id === svc)?.t}</div>
                <div style={{ fontSize: 14, color: 'var(--c-ink-2)', marginTop: 4 }}>{monthName} {day}, {year} · {time}</div>
              </div>
              <button onClick={() => setStep(1)} style={{ fontSize: 12, color: 'var(--accent)', background: 'none', border: 0, fontWeight: 700, cursor: 'pointer' }}>Edit</button>
            </div>
          </div>
          <div className="form-grid">
            <div className="field"><label>First name</label><input type="text" placeholder="Jane"/></div>
            <div className="field"><label>Last name</label><input type="text" placeholder="Doe"/></div>
            <div className="field full"><label>Phone</label><input type="tel" placeholder="(613) 555-0123"/></div>
            <div className="field full"><label>Service address</label><input type="text" placeholder="123 Main St, Ottawa ON"/></div>
          </div>
          <button className="btn btn-primary" style={{ marginTop: 22, width: '100%', justifyContent: 'center' }}
                  onClick={() => alert('Mock booking confirmed — in production this would email leads to ' + BIZ.email)}>
            Confirm booking <Icon.Calendar/>
          </button>
          <p style={{ fontSize: 12, color: 'var(--c-ink-3)', marginTop: 12, textAlign: 'center' }}>
            You'll receive a text confirmation. We'll call if anything changes.
          </p>
        </React.Fragment>
      )}
    </div>
  );
}

Object.assign(window, { ContactPage, BookingWidget });
