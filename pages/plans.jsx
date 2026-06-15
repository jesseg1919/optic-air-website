// OpticAir — Service Plans page

function PlanForm({ presetPlan, onPresetConsumed }) {
  const PLAN_NAMES = ['Essential Care', 'Priority Care', 'VIP Full Coverage', 'Not sure — help me choose'];
  const PLAN_PRICES = { 'Essential Care': '$12.50/mo', 'Priority Care': '$25/mo', 'VIP Full Coverage': '$42/mo' };
  const [submitted, setSubmitted] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const [form, setForm] = React.useState({ plan: 'Priority Care', name: '', phone: '', email: '', address: '' });

  React.useEffect(function () {
    if (presetPlan && PLAN_NAMES.indexOf(presetPlan) > -1) {
      setForm(function (f) { return Object.assign({}, f, { plan: presetPlan }); });
    }
    if (presetPlan && onPresetConsumed) onPresetConsumed();
  }, [presetPlan]);

  const set = (k) => (e) => {
    const v = e.target.value;
    setForm(function (f) { var n = Object.assign({}, f); n[k] = v; return n; });
    setErrors(function (er) { if (!er[k]) return er; var n = Object.assign({}, er); delete n[k]; return n; });
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
    const price = PLAN_PRICES[form.plan] ? ' (' + PLAN_PRICES[form.plan] + ')' : '';
    try {
      await submitLead({
        name: form.name, phone: form.phone, email: form.email, address: form.address,
        service: 'SERVICE PLAN SIGNUP — ' + form.plan + price,
        notes: 'Service plan signup request from the Service Plans page. Plan of interest: ' + form.plan + price,
        page: 'plans-form',
      });
    } catch (err) {}
    setSending(false);
    setSubmitted(true);
    var el = document.getElementById('plan-form');
    if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
  };
  const firstName = form.name.trim() ? form.name.trim().split(' ')[0] : '';

  return (
    <div className="request-form" style={{ maxWidth: 640, margin: '0 auto' }}>
      {submitted ? (
        <React.Fragment>
          <div className="confirm-head">
            <div className="confirm-check"><Icon.Check style={{ width: 26, height: 26 }}/></div>
            <div>
              <h2 style={{ fontSize: 26 }}>Plan request received{firstName ? ', ' + firstName : ''}.</h2>
              <p style={{ marginTop: 8 }}>We've got your interest in the <strong>{form.plan}</strong> plan. Here's what happens next.</p>
            </div>
          </div>
          <ol className="next-steps" style={{ marginTop: 24 }}>
            <li><span className="ns-num">1</span><div><h4>Request received</h4><p>Your plan request just landed with our team.</p></div></li>
            <li><span className="ns-num">2</span><div><h4>We reach out</h4><p>Jared will confirm the right plan for your equipment and answer any questions — usually within one business day.</p></div></li>
            <li><span className="ns-num">3</span><div><h4>You're enrolled</h4><p>We send your plan to accept and pay securely, then schedule your first maintenance visit.</p></div></li>
          </ol>
          <button type="button" className="btn btn-ghost" onClick={() => { setSubmitted(false); setErrors({}); setForm({ plan: 'Priority Care', name: '', phone: '', email: '', address: '' }); }}>Submit another</button>
        </React.Fragment>
      ) : (
        <form onSubmit={onSubmit} noValidate>
          <div className="request-form-head">
            <h3 style={{ fontSize: 22 }}>Start your service plan</h3>
            <span className="reply-badge"><span className="dot"/> Replies within 1 business hour</span>
          </div>
          <div className="form-grid">
            <div className="field full">
              <label htmlFor="pf-plan">Which plan?</label>
              <select id="pf-plan" value={form.plan} onChange={set('plan')}>
                {PLAN_NAMES.map(function (n) { return <option key={n}>{n}</option>; })}
              </select>
              <span className="hint">Not sure? Pick "help me choose" and we'll recommend the right fit.</span>
            </div>
            <div className={'field' + (errors.name ? ' has-error' : '')}>
              <label htmlFor="pf-name">Full name <span className="req">*</span></label>
              <input id="pf-name" type="text" value={form.name} onChange={set('name')} placeholder="Jane Doe" autoComplete="name"/>
              {errors.name ? <span className="err">{errors.name}</span> : null}
            </div>
            <div className={'field' + (errors.phone ? ' has-error' : '')}>
              <label htmlFor="pf-phone">Phone <span className="req">*</span></label>
              <input id="pf-phone" type="tel" value={form.phone} onChange={set('phone')} placeholder="(613) 555-0123" autoComplete="tel"/>
              {errors.phone ? <span className="err">{errors.phone}</span> : null}
            </div>
            <div className={'field full' + (errors.email ? ' has-error' : '')}>
              <label htmlFor="pf-email">Email <span className="req">*</span></label>
              <input id="pf-email" type="email" value={form.email} onChange={set('email')} placeholder="jane@example.com" autoComplete="email"/>
              {errors.email ? <span className="err">{errors.email}</span> : null}
            </div>
            <div className={'field full' + (errors.address ? ' has-error' : '')}>
              <label htmlFor="pf-addr">Service address <span className="req">*</span></label>
              <input id="pf-addr" type="text" value={form.address} onChange={set('address')} placeholder="123 Main St, Ottawa ON" autoComplete="street-address"/>
              {errors.address ? <span className="err">{errors.address}</span> : <span className="hint">Where your equipment is — confirms we cover your area.</span>}
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={sending} style={{ marginTop: 22, width: '100%', justifyContent: 'center', opacity: sending ? 0.7 : 1 }}>
            {sending ? 'Sending…' : <React.Fragment>Sign me up <Icon.Arrow className="arrow"/></React.Fragment>}
          </button>
          <p className="request-fineprint">Goes straight to our team in Housecall Pro — no call centers, no spam, ever.</p>
        </form>
      )}
    </div>
  );
}

function PlansPage({ navigate }) {
  const [presetPlan, setPresetPlan] = React.useState(null);
  const choosePlan = (name) => {
    setPresetPlan(name);
    var el = document.getElementById('plan-form');
    if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
  };
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
          <PlansBlock navigate={navigate} onChoosePlan={choosePlan}/>

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

      <section id="plan-form">
        <div className="wrap">
          <SectionHead align="center" eyebrow="Start your plan" title="Sign up for a service plan." sub="Pick a plan (or let us recommend one) and we'll get you enrolled. Your request goes straight to our team."/>
          <PlanForm presetPlan={presetPlan} onPresetConsumed={() => setPresetPlan(null)}/>
        </div>
      </section>

      <div style={{ height: 80 }}/>
    </React.Fragment>
  );
}

Object.assign(window, { PlansPage, PlanForm });
