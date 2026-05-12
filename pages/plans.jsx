// OpticAir — Service Plans page

function PlansPage({ navigate }) {
  return (
    <React.Fragment>
      <section className="page-hero">
        <div className="wrap">
          <div className="crumbs">Home / <span>Service Plans</span></div>
          <div style={{ maxWidth: 820 }}>
            <div className="eyebrow"><Icon.Shield style={{ width: 14, height: 14 }}/> Residential Maintenance</div>
            <h1 style={{ marginTop: 18 }}>Year-round comfort, on a plan.</h1>
            <p className="lede">
              Preventative maintenance, member-only repair discounts, and priority service when something goes wrong. One affordable monthly fee covers your heating and cooling — and pays for itself the first time it saves you a major repair.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <PlansBlock navigate={navigate}/>

          <div style={{ marginTop: 72 }}>
            <SectionHead align="center" eyebrow="Why a plan" title="Three reasons every Optic Air customer adds one."/>
            <div className="svc-grid">
              {[
                { icon: <Icon.Calendar/>, t: 'Convenience', d: 'Regular maintenance means fewer surprises and consistent comfort. We schedule you proactively each season.'},
                { icon: <Icon.Award/>, t: 'Longevity', d: 'Tune-ups extend the life of your equipment — often by years. That defers a $7,000+ replacement.'},
                { icon: <Icon.Bolt/>, t: 'Savings', d: 'Plan-member discounts on repairs, parts and new equipment add up fast — usually paying for the plan within one service call.'},
              ].map((s, i) => (
                <article key={i} className="svc-card">
                  <div className="icon">{s.icon}</div>
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                </article>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 80 }}>
            <SectionHead align="center" eyebrow="The fine print" title="How the plan works." sub="No tricks. Here's exactly what you sign up for."/>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, maxWidth: 960, margin: '0 auto' }}>
              {[
                { t: '12-month plan, billed monthly', d: 'Charged monthly for convenience. Plans auto-renew yearly so coverage never lapses.' },
                { t: 'Maintenance visits scheduled to you', d: 'Visits are scheduled throughout the year based on your plan level. Unused visits expire at end of term.' },
                { t: 'Repairs covered (VIP plan)', d: 'Up to $500/year in covered repairs (combined heating & cooling). Anything beyond is always quoted and approved with you first.' },
                { t: 'Member-only perks', d: 'Priority scheduling, repair discounts, reduced or waived diagnostics, and savings on new equipment.' },
                { t: 'Easy cancellation', d: 'If you cancel early, any used services adjust to regular pricing and the remaining balance may be applied where applicable.' },
                { t: 'Transparent renewal', d: 'Any pricing updates are communicated in advance — well before renewal — so you can decide.' },
              ].map((b, i) => (
                <div key={i} style={{ padding: 24, background: 'var(--c-card)', border: '1px solid var(--c-line)', borderRadius: 'var(--radius)' }}>
                  <h4 style={{ fontSize: 16, margin: 0, marginBottom: 6 }}>{b.t}</h4>
                  <p style={{ fontSize: 14 }}>{b.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CTABanner navigate={navigate}
        title="Not sure which plan fits?"
        body="Tell us a bit about your system and home — we'll recommend honestly, with no pressure to upgrade."
        primary="Get a recommendation"/>
      <LeadForm
        eyebrow="Plan request"
        title="Get a plan recommendation."
        sub="Share your equipment and home details — we'll reply within one business hour with the plan that actually fits."
        defaultService="Service plan signup"/>
      <div style={{ height: 80 }}/>
    </React.Fragment>
  );
}

Object.assign(window, { PlansPage });
