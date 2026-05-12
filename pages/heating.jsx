// OpticAir — Heating page

function HeatingPage({ navigate }) {
  return (
    <React.Fragment>
      <section className="page-hero">
        <div className="wrap">
          <div className="crumbs">Home / <span>Heating</span></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 40, alignItems: 'center' }}>
            <div>
              <div className="eyebrow"><Icon.Flame style={{ width: 14, height: 14 }}/> Heating Services</div>
              <h1 style={{ marginTop: 18 }}>
                Reliable heat for an <span className="word-warm">Ottawa winter.</span>
              </h1>
              <p className="lede">
                Furnaces, boilers, heat pumps, tankless water heaters and unit heaters — we maintain, repair, replace and install them. Honest diagnosis, fair pricing, no upsells.
              </p>
              <div style={{ display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
                <a className="btn btn-primary" href="#contact" onClick={(e)=>{e.preventDefault();navigate('contact');}}>Book a tune-up <Icon.Arrow className="arrow"/></a>
                <a className="btn btn-ghost" href={`tel:${BIZ.phoneRaw}`}><Icon.Phone/> {BIZ.phone}</a>
              </div>
            </div>
            <Photo scene="furnace" aspect="4-3" src="assets/technician-furnace.jpg" alt="OpticAir technician servicing a residential furnace in an Ottawa basement"/>
          </div>
        </div>
      </section>

      {/* Services list */}
      <section>
        <div className="wrap">
          <SectionHead
            eyebrow="Heating services"
            title="What we work on."
            sub="From a routine tune-up that keeps your warranty valid, to a same-day no-heat call at 11pm — we've got it."
          />
          <div className="svc-grid">
            {[
              { icon: <Icon.Tool/>, t: 'Furnace Maintenance', d: 'Annual tune-ups, safety checks and combustion analysis. Catches problems before they become emergencies.', list: ['Burner inspection','Heat exchanger check','Thermostat & airflow tuning'] },
              { icon: <Icon.Bolt/>, t: 'Furnace Repair', d: 'Diagnosing and fixing furnaces of every make. Up-front pricing before we start.', list: ['Ignition & gas valve','Inducer & blower motors','Control board diagnostics'] },
              { icon: <Icon.Flame/>, t: 'New Furnace Install', d: 'High-efficiency furnaces sized properly for your home. Multiple quotes, no pressure.', list: ['Free in-home assessment','Quiet ECM systems','Rebate eligible (when available)'] },
              { icon: <Icon.Wind/>, t: 'Heat Pumps', d: 'Cold-climate heat pumps for Ottawa winters. Cuts heating bills, doubles as your AC.', list: ['Air-source heat pumps','Dual-fuel hybrid systems','Ductless mini-split'] },
              { icon: <Icon.Filter/>, t: 'Boilers & Hydronic', d: 'Service, repair and replacement of residential boilers and radiant systems.', list: ['Combi boilers','Hot water tank coil','Zone valve & circulator'] },
              { icon: <Icon.Shield/>, t: '24/7 Emergency No-Heat', d: 'It\'s -25 and the furnace is out. Call us — someone answers, and someone shows up.', list: ['Same-day response','Service-plan priority','Transparent after-hours rates'] },
            ].map((s, i) => (
              <article key={i} className="svc-card">
                <div className="icon">{s.icon}</div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
                <ul>{s.list.map((l,j) => <li key={j}>{l}</li>)}</ul>
                <div className="card-foot"><span className="price">Tune-up from $169</span></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Feature */}
      <section style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="feature-row">
            <div>
              <div className="eyebrow">When to call</div>
              <h2 style={{ marginTop: 16 }}>Signs your heating needs attention.</h2>
              <p style={{ marginTop: 18 }}>Catching trouble early is the difference between a $200 repair and a midwinter replacement. If any of these sound familiar, give us a call.</p>
              <ul className="checklist">
                <li><Icon.Check/> Uneven room temperatures</li>
                <li><Icon.Check/> Furnace short-cycling</li>
                <li><Icon.Check/> Yellow or flickering pilot flame</li>
                <li><Icon.Check/> Rising heating bills with no change in use</li>
                <li><Icon.Check/> Strange smells or banging on startup</li>
                <li><Icon.Check/> System is older than 15 years</li>
              </ul>
            </div>
            <Photo scene="warm" aspect="4-3" src="assets/technician-heatpump.jpg" alt="OpticAir technician checking refrigerant pressures on an outdoor heat pump"/>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="dark-section">
        <div className="wrap">
          <SectionHead align="center" eyebrow="Heating FAQ" title="Common questions, answered." />
          <div className="faq">
            {[
              { q: 'How often should I service my furnace?', a: 'Once a year, ideally before the heating season kicks in. An annual tune-up keeps efficiency up, head off breakdowns, and is required to keep most manufacturer warranties valid.' },
              { q: 'Should I repair or replace my older furnace?', a: 'If your furnace is over 15 years old and the repair cost approaches 50% of replacement, replacement is usually the smarter long-term move. We\'ll quote both options honestly so you can choose.' },
              { q: 'How long does a new furnace install take?', a: 'Most residential furnace replacements take a single day — typically 4–6 hours. We\'ll confirm scope and timing before booking.' },
              { q: 'Do you service heat pumps in cold weather?', a: 'Yes. Modern cold-climate heat pumps are rated to well below -25°C. We size them properly for your home and pair them with backup heat when needed.' },
              { q: 'Are there rebates available?', a: 'Yes — federal and provincial rebate programs change frequently. We\'ll help you understand what\'s currently available for your project.' },
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
        title="Need heat? Book in under a minute."
        body="Pick a time online, or call us and reach a real person. Same-day appointments often available."/>
      <LeadForm
        eyebrow="Heating request"
        title="Tell us about your heating system."
        sub="Quick details below — we'll reply within one business hour with next steps and a clear price range."
        defaultService="Furnace service"/>
      <div style={{ height: 80 }}/>
    </React.Fragment>
  );
}

Object.assign(window, { HeatingPage });
