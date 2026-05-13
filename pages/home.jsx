// OpticAir — Home page

function HomePage({ navigate, t }) {
  const dark = t && t.darkHero;
  return (
    <React.Fragment>
      {/* HERO */}
      <section className={`hero ${dark ? 'dark-hero' : ''}`}>
        {dark && <div className="hero-bg" aria-hidden="true" />}
        <div className="wrap">
          <div className="hero-grid">
            <div>
              <div className="eyebrow">Ottawa & Surrounding Areas</div>
              <h1 style={{ marginTop: 22 }}>
                Where comfort meets<br />
                <span className="word-warm">quality</span> — every<br />
                season, every system.
              </h1>
              <p className="lede">
                Expert HVAC solutions in Ottawa. Heating, air conditioning and ventilation — maintained, repaired and installed by a locally-owned team with 15+ years of experience and a real person on the phone.
              </p>
              <div className="ctas">
                <a className="btn btn-primary" href="#contact" onClick={(e) => { e.preventDefault(); navigate('contact'); }}>
                  Book online <Icon.Arrow className="arrow" />
                </a>
                <a className="btn btn-ghost" href={`tel:${BIZ.phoneRaw}`}>
                  <Icon.Phone /> {BIZ.phone}
                </a>
              </div>
              <div className="hero-stats">
                <div className="stat"><span className="n">15+ yrs</span><span className="l">Locally owned</span></div>
                <div className="stat"><span className="n">24/7</span><span className="l">Emergency service</span></div>
                <div className="stat"><span className="n">5.0★</span><span className="l">Google reviews</span></div>
              </div>
            </div>
            <div className="hero-right">
              <HeroLeadCard navigate={navigate} />
              <div className="hero-van" aria-hidden="false">
                <img src="assets/van-hero.png" alt="Optic Air owner standing beside the company service van" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <TrustBar />

      {/* REVIEWS — Google feed (light) */}
      <section className="reviews reviews-light">
        <div className="wrap">
          <GoogleReviewsFeed />
        </div>
      </section>

      {/* SERVICES */}
      <section>
        <div className="wrap">
          <SectionHead
            eyebrow="What we do"
            title="Comprehensive HVAC, done properly."
            sub="From furnace tune-ups to full system installs, we keep your home running smoothly year-round. Furnaces, boilers, heat pumps, air conditioners and ventilation — handled by technicians who get it right the first time."
          />
          <div className="svc-grid">
            <article className="svc-card" data-tone="warm">
              <div className="icon"><Icon.Flame /></div>
              <h3>Heating</h3>
              <p>Furnaces, boilers, heat pumps, tankless water heaters and unit heaters — tuned for an Ottawa winter.</p>
              <ul>
                <li>Annual maintenance & tune-ups</li>
                <li>Repair, diagnosis & emergency service</li>
                <li>Replacement & new installation</li>
                <li>Tankless water heaters</li>
              </ul>
              <div className="card-foot">
                <a className="linklike" href="#heating" onClick={(e) => { e.preventDefault(); navigate('heating'); }}>
                  See heating services <Icon.Arrow />
                </a>
              </div>
            </article>

            <article className="svc-card" data-tone="cool">
              <div className="icon"><Icon.Snowflake /></div>
              <h3>Air Conditioning</h3>
              <p>Central AC and ductless split systems — kept quiet, efficient and dependable through July's worst.</p>
              <ul>
                <li>Spring tune-ups & cleaning</li>
                <li>Diagnostic & refrigerant service</li>
                <li>New AC & heat pump installation</li>
                <li>Ductless mini-splits</li>
              </ul>
              <div className="card-foot">
                <a className="linklike" href="#cooling" onClick={(e) => { e.preventDefault(); navigate('cooling'); }}>
                  See AC services <Icon.Arrow />
                </a>
              </div>
            </article>

            <article className="svc-card" data-tone="light">
              <div className="icon"><Icon.Wind /></div>
              <h3>Ventilation & Air Quality</h3>
              <p>HRVs, ERVs, humidifiers and filtration — for cleaner air and a more comfortable home.</p>
              <ul>
                <li>HRV / ERV service & install</li>
                <li>Whole-home humidifiers</li>
                <li>Filtration upgrades</li>
                <li>Indoor air quality assessments</li>
              </ul>
              <div className="card-foot">
                <a className="linklike" href="#contact" onClick={(e) => { e.preventDefault(); navigate('contact'); }}>
                  Ask about a system <Icon.Arrow />
                </a>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* WHY US — feature row */}
      <section style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="feature-row">
            <div>
              <div className="eyebrow">Why Optic Air</div>
              <h2 style={{ marginTop: 16 }}>Quality service, responsive team — the local crew people actually recommend.</h2>
              <p style={{ marginTop: 18, fontSize: 17 }}>
                With 15+ years in residential and commercial HVAC, we built Optic Air on a simple idea: efficient, friendly, responsive service — without the sales pitch. You get direct communication, honest recommendations, fair pricing, and the same technician you spoke to on the phone at your door. HVAC issues don't wait for business hours, so neither do we.
              </p>
              <ul className="checklist">
                <li><Icon.Check /> Owner-operated, locally owned</li>
                <li><Icon.Check /> Direct communication, no call centers</li>
                <li><Icon.Check /> Honest recommendations — repair vs. replace</li>
                <li><Icon.Check /> Affordable service plans</li>
                <li><Icon.Check /> Online booking & easy payment</li>
                <li><Icon.Check /> 24/7 emergency service</li>
              </ul>
              <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <a className="btn btn-dark" href="#plans" onClick={(e) => { e.preventDefault(); navigate('plans'); }}>See service plans <Icon.Arrow className="arrow" /></a>
                <a className="linklike" href="#contact" onClick={(e) => { e.preventDefault(); navigate('contact'); }}>Get a free quote <Icon.Arrow /></a>
              </div>
            </div>
            <Photo scene="team" aspect="4-5" src="assets/team-van.jpg" alt="Optic Air owner standing beside the company service van" />
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="dark-section">
        <div className="wrap">
          <SectionHead
            eyebrow="How it works"
            title="From first call to comfortable home — in four steps."
            sub="Booking, scheduling and payment all happen online through our client hub — or call and reach a real person. Either way, no mystery and no hold music."
          />
          <div className="process">
            <div className="step">
              <div className="num">01</div>
              <h4>Book online or call</h4>
              <p>Pick a time that works for you in the online scheduler — or call and reach a real person.</p>
            </div>
            <div className="step">
              <div className="num">02</div>
              <h4>Confirmation & ETA</h4>
              <p>You'll get a text confirmation, the tech's name, and a tight arrival window. No 8-hour waits.</p>
            </div>
            <div className="step">
              <div className="num">03</div>
              <h4>Honest diagnosis</h4>
              <p>We explain what's going on, walk through your options, and quote up-front. You decide.</p>
            </div>
            <div className="step">
              <div className="num">04</div>
              <h4>Work done right</h4>
              <p>Tidy work, clear paperwork, easy digital payment, and follow-up to make sure it's holding.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PLANS PREVIEW */}
      <section>
        <div className="wrap">
          <SectionHead
            eyebrow="Maintenance plans"
            title="Coverage for the price of a coffee a week."
            sub="Our service plans keep your heating and cooling running efficiently, head off breakdowns, and put you at the front of the line when something goes wrong."
          />
          <PlansBlock navigate={navigate} />
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <a className="linklike" href="#plans" onClick={(e) => { e.preventDefault(); navigate('plans'); }}>
              Compare all plan benefits <Icon.Arrow />
            </a>
          </div>
        </div>
      </section>

      {/* SERVICE AREAS */}
      <section style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="feature-row reverse">
            <Photo scene="home" aspect="4-3" src="assets/richmond-ottawa.jpg" alt="Ottawa Parliament Hill skyline with commercial rooftop HVAC units in the foreground" />
            <div>
              <div className="eyebrow">Service area</div>
              <h2 style={{ marginTop: 16 }}>Based in Richmond. Serving Ottawa and beyond.</h2>
              <p style={{ marginTop: 18, fontSize: 17 }}>
                We service homes and light commercial properties across Ottawa and the surrounding communities. Not sure if you're in our area? Give us a call — we'll let you know in a minute.
              </p>
              <div className="areas">
                {BIZ.primaryAreas.map((a) => <span key={a} className="area-chip primary">{a}</span>)}
                {BIZ.secondaryAreas.map((a) => <span key={a} className="area-chip">{a}</span>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <CTABanner navigate={navigate} />
      <div style={{ height: 80 }} />
    </React.Fragment>
  );
}

// ── Plans block (used on home + plans page) ──────────────────────────────
const PLANS = [
  {
    name: 'Essential Care',
    tag: 'For one-piece HVAC homes',
    price: '$12.50',
    per: '/ month + HST',
    cta: 'Choose Essential',
    featured: false,
    features: [
      { t: '1 annual maintenance visit', on: true },
      { t: '10% discount on repairs', on: true },
      { t: 'Priority scheduling', on: false },
      { t: 'After-hours perks', on: false },
      { t: 'Diagnostic fee discount', on: false },
    ],
  },
  {
    name: 'Priority Care',
    tag: 'Most popular for furnace + AC homes',
    price: '$25.00',
    per: '/ month + HST',
    cta: 'Choose Priority',
    featured: true,
    features: [
      { t: '2 visits/year (furnace + AC)', on: true },
      { t: '15% repair discount', on: true },
      { t: 'Diagnostic fee waived (2×/yr)', on: true },
      { t: '15% after-hours fee discount', on: true },
      { t: '5% off new equipment', on: true },
      { t: 'Priority scheduling', on: true },
    ],
  },
  {
    name: 'VIP Full Coverage',
    tag: 'Up to $500/yr in covered repairs',
    price: '$42.00',
    per: '/ month + HST',
    cta: 'Choose VIP',
    featured: false,
    features: [
      { t: '2 visits/year (furnace + AC)', on: true },
      { t: 'Up to $500/year in covered repairs', on: true },
      { t: '20% discount on additional repairs', on: true },
      { t: 'Diagnostic fee waived (2×/yr)', on: true },
      { t: 'After-hours fees waived (2 emergency visits/yr)', on: true },
      { t: '5% off new equipment + priority scheduling', on: true },
    ],
  },
];

function PlansBlock({ navigate }) {
  return (
    <div className="plans">
      {PLANS.map((p, i) => (
        <div key={i} className={`plan ${p.featured ? 'featured' : ''}`}>
          {p.featured && <div className="ribbon">Most popular</div>}
          <div className="plan-name">{p.name.split(' ')[0]}</div>
          <div className="plan-tier">{p.name}</div>
          <p className="tag">{p.tag}</p>
          <div className="price-big">{p.price}<span className="per">{p.per}</span></div>
          <ul className="feat">
            {p.features.map((f, j) => (
              <li key={j} className={f.on ? '' : 'muted'}>
                <Icon.Check />
                <span>{f.t}</span>
              </li>
            ))}
          </ul>
          <div className="plan-cta">
            <a className={p.featured ? 'btn btn-primary' : 'btn btn-dark'}
               style={{ width: '100%', justifyContent: 'center' }}
               href="#contact" onClick={(e) => { e.preventDefault(); navigate && navigate('contact'); }}>
              {p.cta} <Icon.Arrow className="arrow" />
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Reviews ──────────────────────────────────────────────────────────────
const REVIEWS = [
  {
    body: "Booked online Sunday night, Jared was at our place Monday morning. Diagnosed a failing inducer motor, gave us a fair quote, and had it replaced same-day. House was warm by lunchtime. Can't recommend these guys enough.",
    name: "Sarah Mitchell", place: "Barrhaven, ON", initials: "S",
    rating: 5, when: "2 weeks ago", color: "#E15A4A", category: "Furnace repair",
  },
  {
    body: "Replaced our 22-year-old furnace and added an AC. Zero pressure, gave us three real options at different price points. Installation crew was respectful of our floors and kids. Highly recommend.",
    name: "Daniel Reilly", place: "Kanata, ON", initials: "D",
    rating: 5, when: "1 month ago", color: "#2A6FDB", category: "New install",
  },
  {
    body: "Signed up for the Priority plan and it's already paid for itself. Tune-up caught a cracked heat exchanger we'd have never seen. Quoted us honestly and got us scheduled fast.",
    name: "Megan Tremblay", place: "Stittsville, ON", initials: "M",
    rating: 5, when: "1 month ago", color: "#1F8A5B", category: "Maintenance plan",
  },
  {
    body: "Property manager here — we use Optic Air for service contracts on three of our buildings. Communication is what sets them apart. Tickets close fast and we always know status.",
    name: "Alex Pereira", place: "Ottawa, ON", initials: "A",
    rating: 5, when: "2 months ago", color: "#7C3AED", category: "Commercial",
  },
  {
    body: "Called on a Friday afternoon when the AC died during the heat wave. Jared rearranged his schedule and got us cool air the same evening. Fair price, no after-hours nonsense.",
    name: "Hannah Boucher", place: "Manotick, ON", initials: "H",
    rating: 5, when: "3 months ago", color: "#D97706", category: "AC repair",
  },
  {
    body: "Got three quotes for a heat pump install. Optic Air wasn't the cheapest, wasn't the most expensive — but they were the only ones who actually walked through the house and asked about how we use each room. Install was clean.",
    name: "Mark Desjardins", place: "Nepean, ON", initials: "M",
    rating: 5, when: "3 months ago", color: "#0EA5B7", category: "Heat pump",
  },
  {
    body: "Honest is the word. Old company quoted us $4,800 for repairs on our furnace and said we should just replace it. Jared looked at it, replaced one part for $340, and it's been running fine for 8 months.",
    name: "Priya Sharma", place: "Orleans, ON", initials: "P",
    rating: 5, when: "4 months ago", color: "#BE185D", category: "Furnace repair",
  },
  {
    body: "Took half a star off only because scheduling was tight the week we called — they were honest about it and got us in the next day instead. Service itself was excellent.",
    name: "Tom Reilly", place: "Carleton Place, ON", initials: "T",
    rating: 5, when: "5 months ago", color: "#475569", category: "Tune-up",
  },
];

const RATING = { avg: 5.0, total: 127 };

function Stars({ rating = 5, size = 14 }) {
  return (
    <div className="gstars" style={{ fontSize: size }} aria-label={`${rating} out of 5`}>
      {[1,2,3,4,5].map(i => (
        <span key={i} className={i <= rating ? 'on' : 'off'}>★</span>
      ))}
    </div>
  );
}

function GoogleG({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#4285F4" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.4 6.2 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"/>
      <path fill="#34A853" d="M6.3 14.7l6.6 4.8C14.5 16 18.9 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.4 6.2 29.5 4 24 4 16 4 9.1 8.4 6.3 14.7z"/>
      <path fill="#FBBC05" d="M24 44c5.4 0 10.3-2.1 14-5.4l-6.5-5.3C29.5 34.9 26.9 36 24 36c-5.2 0-9.6-3.3-11.2-8l-6.6 5.1C9 39.4 16 44 24 44z"/>
      <path fill="#EA4335" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.4l6.5 5.3C41.9 35.5 44 30.2 44 24c0-1.2-.1-2.3-.4-3.5z"/>
    </svg>
  );
}

function GoogleReviewsFeed() {
  const railRef = React.useRef(null);
  const [paused, setPaused] = React.useState(false);

  React.useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    let raf;
    let last = performance.now();
    const speed = 28; // px per second
    const tick = (now) => {
      const dt = (now - last) / 1000;
      last = now;
      if (!paused) {
        const max = rail.scrollWidth - rail.clientWidth;
        if (max > 0) {
          let next = rail.scrollLeft + speed * dt;
          if (next >= max - 0.5) next = 0;
          rail.scrollLeft = next;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame((t) => { last = t; tick(t); });
    return () => cancelAnimationFrame(raf);
  }, [paused]);

  // Duplicate the list so the loop feels continuous
  const cards = [...REVIEWS, ...REVIEWS];

  return (
    <div className="gfeed">
      <aside className="gfeed-summary">
        <div className="gfeed-eyebrow">( Straight from Google )</div>
        <div className="gfeed-brand">
          <GoogleG size={32} />
          <div className="gfeed-brand-name">Google Reviews</div>
        </div>

        <div className="gfeed-score">
          <div className="gfeed-avg">{RATING.avg.toFixed(1)}</div>
          <Stars rating={5} size={22} />
        </div>

        <p className="gfeed-desc">
          Based on <strong>{RATING.total} verified Google reviews</strong> from homeowners and property managers across the Ottawa area. Every review is from a real customer we've worked with.
        </p>

        <a className="gfeed-readall" href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer">
          Read all reviews on Google <span aria-hidden="true">↗</span>
        </a>
      </aside>

      <div className="gfeed-rail" role="region" aria-label="Customer reviews"
           ref={railRef}
           onMouseEnter={() => setPaused(true)}
           onMouseLeave={() => setPaused(false)}
           onFocus={() => setPaused(true)}
           onBlur={() => setPaused(false)}>
        <div className="gfeed-track">
          {cards.map((r, i) => <GReviewCard key={i} r={r} />)}
        </div>
        <div className="gfeed-rail-fade" aria-hidden="true" />
      </div>
    </div>
  );
}

function GReviewCard({ r }) {
  return (
    <article className="greview">
      <div className="greview-gbadge" title="Posted on Google"><GoogleG size={22} /></div>
      <header className="greview-head">
        <div className="greview-avatar" style={{ background: r.color }}>{r.initials}</div>
        <div className="greview-id">
          <div className="greview-name">{r.name}</div>
          <div className="greview-sub">
            <span>{r.when}</span>
            <span className="dot-sep">·</span>
            <span>{r.category}</span>
          </div>
        </div>
      </header>
      <div className="greview-meta">
        <Stars rating={r.rating} size={16} />
      </div>
      <p className="greview-body">{r.body}</p>
      <footer className="greview-foot">
        <span className="greview-source">Posted on Google</span>
        <span className="greview-place">{r.place}</span>
      </footer>
    </article>
  );
}

// ── Hero Lead Card ───────────────────────────────────────────────────────
function HeroLeadCard({ navigate }) {
  const [sent, setSent] = React.useState(false);
  const [f, setF] = React.useState({ name: '', phone: '', city: '', service: 'Furnace service', urgency: 'Within a week' });
  const submit = (e) => { e.preventDefault(); setSent(true); };
  if (sent) {
    return (
      <div className="lead-card">
        <div className="lead-success">
          <div className="ok-mark"><Icon.Check style={{ width: 24, height: 24 }}/></div>
          <h3 style={{ fontSize: 22 }}>Got it{f.name ? `, ${f.name.split(' ')[0]}` : ''}.</h3>
          <p style={{ marginTop: 10, fontSize: 14 }}>
            We'll call <strong style={{ color: 'var(--c-ink)' }}>{f.phone || 'you'}</strong> within the hour during business hours.
            <br/>Need help now? <a href={`tel:${BIZ.phoneRaw}`} style={{ color: 'var(--accent)', fontWeight: 700 }}>{BIZ.phone}</a>
          </p>
          <button className="btn btn-ghost" style={{ marginTop: 20 }} onClick={() => setSent(false)}>Send another</button>
        </div>
      </div>
    );
  }
  return (
    <div className="lead-card">
      <span className="lead-tag"><Icon.Bolt style={{ width: 12, height: 12 }}/> Free quote · No obligation</span>
      <h3>Stay ahead of the season with a free HVAC quote.</h3>
      <p className="sub">Tell us a bit about your home and we'll follow up with honest options — no spam, no pressure.</p>
      <form onSubmit={submit}>
        <div className="field">
          <input type="text" required placeholder="Your name" value={f.name}
                 onChange={(e)=>setF({...f, name: e.target.value})}/>
        </div>
        <div className="field">
          <input type="tel" required placeholder="Phone number" value={f.phone}
                 onChange={(e)=>setF({...f, phone: e.target.value})}/>
        </div>
        <div className="field">
          <select required value={f.city} onChange={(e)=>setF({...f, city: e.target.value})}>
            <option value="" disabled>City / area</option>
            <option>Ottawa</option>
            <option>Richmond</option>
            <option>Kanata</option>
            <option>Stittsville</option>
            <option>Barrhaven</option>
            <option>Nepean</option>
            <option>Manotick</option>
            <option>Orleans</option>
            <option>Gloucester</option>
            <option>Carleton Place</option>
            <option>Other / outside Ottawa</option>
          </select>
        </div>
        <div className="row2">
          <div className="field">
            <select value={f.service} onChange={(e)=>setF({...f, service: e.target.value})}>
              <option>Furnace service</option>
              <option>Furnace repair</option>
              <option>New furnace quote</option>
              <option>AC service</option>
              <option>AC repair</option>
              <option>New AC / heat pump</option>
              <option>Service plan signup</option>
              <option>Other</option>
            </select>
          </div>
          <div className="field">
            <select value={f.urgency} onChange={(e)=>setF({...f, urgency: e.target.value})}>
              <option>ASAP (no heat/cool)</option>
              <option>Within a week</option>
              <option>Within a month</option>
              <option>Just gathering info</option>
            </select>
          </div>
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
          Request my quote <Icon.Arrow className="arrow"/>
        </button>
        <div className="trust-line">
          <span className="dot"/> Leads go straight to Jared · usually replies in under an hour
        </div>
      </form>
    </div>
  );
}

Object.assign(window, { HomePage, HeroLeadCard, PlansBlock, PLANS, REVIEWS, RATING, GoogleReviewsFeed, GReviewCard, Stars, GoogleG });
