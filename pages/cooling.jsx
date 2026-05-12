// OpticAir — Air Conditioning page

function CoolingPage({ navigate }) {
  return (
    <React.Fragment>
      <section className="page-hero">
        <div className="wrap">
          <div className="crumbs">Home / <span>Air Conditioning</span></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 40, alignItems: 'center' }}>
            <div>
              <div className="eyebrow" style={{ color: 'var(--cool)' }}>
                <span style={{ width: 24, height: 1.5, background: 'var(--cool)', display: 'inline-block' }}></span>
                <Icon.Snowflake style={{ width: 14, height: 14 }}/> Air Conditioning
              </div>
              <h1 style={{ marginTop: 18 }}>
                Stay cool when <span className="word-cool">Ottawa heats up.</span>
              </h1>
              <p className="lede">
                Central AC and ductless splits — kept quiet, efficient and reliable through every July heatwave. Spring tune-ups, mid-summer repairs, and full system replacements.
              </p>
              <div style={{ display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
                <a className="btn btn-primary" href="#contact" onClick={(e)=>{e.preventDefault();navigate('contact');}}>Book a tune-up <Icon.Arrow className="arrow"/></a>
                <a className="btn btn-ghost" href={`tel:${BIZ.phoneRaw}`}><Icon.Phone/> {BIZ.phone}</a>
              </div>
            </div>
            <Photo scene="ac" aspect="4-3" src="assets/technician-ac.jpg" alt="OpticAir technician servicing an outdoor central AC condenser at an Ottawa home"/>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <SectionHead
            eyebrow="AC services"
            title="Cool, quiet, efficient."
            sub="Most AC failures show up during the first hot week of summer. A spring tune-up costs less than an emergency call — and finds the small stuff before it strands you."
          />
          <div className="svc-grid">
            {[
              { icon: <Icon.Tool/>, t: 'AC Tune-Ups', d: 'Pre-season cleaning, coil inspection, refrigerant check and full performance test.', list: ['Coil & condenser clean','Refrigerant pressure check','Capacitor & contactor test'] },
              { icon: <Icon.Bolt/>, t: 'AC Repair', d: 'From capacitors to compressors — quoted up-front, fixed properly.', list: ['Refrigerant leak repair','Fan motor & blower repair','Thermostat diagnostics'] },
              { icon: <Icon.Snowflake/>, t: 'New AC Install', d: 'Right-sized, properly-matched cooling for your home — not the biggest unit on the truck.', list: ['Manual J load sizing','High-SEER inverter systems','Heat-pump pairing options'] },
              { icon: <Icon.Wind/>, t: 'Ductless Mini-Splits', d: 'Cool (or heat) rooms that ducted systems can\'t reach. Quiet, efficient, zoned.', list: ['Single & multi-zone','Garage / basement / addition','Quiet wall & ceiling cassettes'] },
              { icon: <Icon.Filter/>, t: 'Indoor Air Quality', d: 'Upgrade filtration, dehumidify, and balance airflow for a healthier home.', list: ['MERV upgrades','Dehumidifiers','HEPA filtration'] },
              { icon: <Icon.Shield/>, t: 'Emergency Cooling', d: 'AC out in a heatwave? We prioritize no-cooling calls and aim for same-day response.', list: ['Same-day priority','Plan-member front of line','Honest repair vs. replace'] },
            ].map((s, i) => (
              <article key={i} className="svc-card" data-tone="cool">
                <div className="icon">{s.icon}</div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
                <ul>{s.list.map((l,j) => <li key={j}>{l}</li>)}</ul>
                <div className="card-foot"><span className="price">Tune-up from $149</span></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="feature-row reverse">
            <Photo scene="cool" aspect="4-3" src="assets/heatpump.jpg" alt="Outdoor heat pump condenser installed beside an Ottawa home"/>
            <div>
              <div className="eyebrow" style={{ color: 'var(--cool)' }}>Smart cooling</div>
              <h2 style={{ marginTop: 16 }}>Heat pumps cool too — and they're winning the math.</h2>
              <p style={{ marginTop: 18 }}>
                Modern cold-climate heat pumps work as your AC in summer and your primary heat in winter. Lower bills, lower emissions, and federal rebates often available. We'll run the numbers for your specific home — honestly.
              </p>
              <ul className="checklist">
                <li><Icon.Check/> Quiet inverter operation</li>
                <li><Icon.Check/> Zoned comfort with mini-splits</li>
                <li><Icon.Check/> Rebate-eligible models</li>
                <li><Icon.Check/> Pairs with existing furnace</li>
              </ul>
              <div style={{ marginTop: 28 }}>
                <a className="btn btn-dark" href="#contact" onClick={(e)=>{e.preventDefault();navigate('contact');}}>Get a heat-pump quote <Icon.Arrow className="arrow"/></a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="dark-section">
        <div className="wrap">
          <SectionHead align="center" eyebrow="AC FAQ" title="Common questions about cooling." />
          <div className="faq">
            {[
              { q: 'When should I service my AC?', a: 'Spring — ideally April or May, before the first hot stretch. A tune-up takes about an hour and catches the small issues before they become emergency calls.' },
              { q: 'How long does a new AC last?', a: 'A well-maintained residential AC lasts 12–18 years. Without annual service, that drops considerably.' },
              { q: 'My AC freezes up — what gives?', a: 'Usually airflow (dirty filter, blocked return) or low refrigerant. Either way, turn it off and call us; running it frozen damages the compressor.' },
              { q: 'Are ductless mini-splits worth it?', a: 'For additions, garages, basements or homes without ducts — absolutely. Quiet, efficient, and they heat in winter too.' },
              { q: 'Do you offer financing?', a: 'Yes, for full system replacements. We\'ll walk you through monthly payment options alongside up-front pricing.' },
            ].map((f, i) => (
              <details key={i}>
                <summary>{f.q}<span className="plus">+</span></summary>
                <div className="answer">{f.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <CTABanner navigate={navigate}
        title="Book a spring AC tune-up."
        body="A 60-minute tune-up extends system life, lowers bills, and keeps you off our emergency list in July."/>
      <LeadForm
        eyebrow="Cooling request"
        title="Request an AC quote or service."
        sub="Tell us about your home and we'll reply within one business hour — straight talk, fair pricing."
        defaultService="AC service"/>
      <div style={{ height: 80 }}/>
    </React.Fragment>
  );
}

Object.assign(window, { CoolingPage });
