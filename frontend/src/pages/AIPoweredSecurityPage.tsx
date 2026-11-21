import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './ServiceV7Identity.css';

export default function AIPoweredSecurityPage() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const host = root.current;
    if (!host) return;
    const targets = host.querySelectorAll<HTMLElement>('.ds-v7-reveal');
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      targets.forEach(el => el.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -24px 0px' });
    targets.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return <main ref={root} className="ds-v7" id="main-content"><div className="ds-v7-wrap">
    <nav className="ds-v7-crumb" aria-label="Breadcrumb"><Link to="/#expertise">EXPERTISE</Link><span>/</span><span>AI-POWERED SECURITY</span></nav>
    <header className="ds-v7-hero"><div className="ds-v7-copy"><p className="ds-v7-kicker">DARK SYNAPSES / INTELLIGENCE FOR SECURITY OPERATIONS</p><h1>AI-POWERED SECURITY<span>_</span></h1><h2>Better security decisions. Less operational noise.</h2><p className="ds-v7-intro">We engineer AI-assisted security workflows that connect signals, evidence and approved actions. Analysts stay accountable for decisions while automation reduces repetitive investigation work.</p><div className="ds-v7-actions"><Link className="ds-v7-btn primary" to="/contact?service=ai-powered-security">Discuss your requirements</Link><a className="ds-v7-btn" href="#capabilities">Explore capabilities</a></div></div><div className="ds-v7-art"><img src="/images/services-pixel/ai-powered-security.webp" alt="Pixel-art security operations and AI automation illustration" /></div></header>
    <div className="ds-v7-rule"><span>ENGINEERING / EVIDENCE / CONTROL</span><span>WHERE INTELLIGENCE MEETS THREATS</span></div>
    <div id="capabilities"><section className="ds-v7-section ds-v7-reveal"><div className="ds-v7-section-head"><div><p className="ds-v7-kicker">// SECURITY INTELLIGENCE</p><h2>Make telemetry useful, not just abundant.</h2></div><p>We connect operational security data with context, detection logic and reviewable outputs so teams can understand why an event matters.</p></div><div className="ds-v7-items"><article className="ds-v7-item"><h4>Security Analytics & Correlation</h4><p>Bring together alerts, logs and contextual signals to surface related activity and investigation priorities.</p><span>Event correlation · Context · Prioritization</span></article>
<article className="ds-v7-item"><h4>Anomaly Detection</h4><p>Develop and evaluate models that flag unusual activity while measuring false positives and operational usefulness.</p><span>Baselines · Model evaluation · Analyst review</span></article>
<article className="ds-v7-item"><h4>Threat Intelligence Enrichment</h4><p>Add relevant indicators and external context to internal events without treating weak signals as confirmed threats.</p><span>Indicators · Enrichment · Confidence</span></article></div></section><section className="ds-v7-section ds-v7-reveal"><div className="ds-v7-section-head"><div><p className="ds-v7-kicker">// AI-ASSISTED OPERATIONS</p><h2>Give analysts more context and control.</h2></div><p>Security automation should be explainable, reversible where possible and bounded by the organization’s response policy.</p></div><div className="ds-v7-items"><article className="ds-v7-item"><h4>Alert Triage Automation</h4><p>Structure alerts, deduplicate recurring cases and assemble evidence for human review.</p><span>Triage · Deduplication · Evidence</span></article>
<article className="ds-v7-item"><h4>Investigation Assistants</h4><p>Use grounded retrieval and tool-connected workflows to summarize activity and propose next investigative steps.</p><span>Grounded summaries · Traceability · Review</span></article>
<article className="ds-v7-item"><h4>Response Orchestration</h4><p>Integrate approved playbooks and tools with scoped permissions, action logging and explicit approvals.</p><span>Playbooks · Approvals · Audit trail</span></article></div></section><section className="ds-v7-section ds-v7-reveal"><div className="ds-v7-section-head"><div><p className="ds-v7-kicker">// MANDARK / CONCEPT IN DEVELOPMENT</p><h2>An agentic penetration-testing workspace.</h2></div><p>Mandark is our planned security agent concept: a controlled workspace for authorized testing, evidence gathering and human-reviewed findings. Its interface and autonomous capabilities are still in development.</p></div><div className="ds-v7-items"><article className="ds-v7-item"><h4>Scoped Engagements</h4><p>Define permitted assets, objectives and test constraints before any assessment activity.</p><span>Authorization · Scope · Rules of engagement</span></article>
<article className="ds-v7-item"><h4>Agent-Assisted Investigation</h4><p>Explore a workflow for proposing tests, organizing observations and linking evidence to findings.</p><span>Planning · Evidence · Analyst oversight</span></article>
<article className="ds-v7-item"><h4>Reviewable Reporting</h4><p>Design a human approval stage for findings, severity and remediation recommendations.</p><span>Validation · Reporting · Accountability</span></article></div></section></div>
    <section className="ds-v7-section ds-v7-reveal"><div className="ds-v7-section-head"><div><p className="ds-v7-kicker">// DELIVERY & ACCOUNTABILITY</p><h2>Engineering outcomes, not empty promises.</h2></div><p>Integration architecture, measurable evaluation criteria, auditable workflows and clear boundaries for automation. Mandark is a development concept, not a currently available autonomous testing product.</p></div><div className="ds-v7-process"><div><span>DISCOVER</span><p>Map systems, assets, constraints and success criteria.</p></div><div><span>DESIGN</span><p>Agree on safeguards, architecture and measurable tests.</p></div><div><span>VALIDATE</span><p>Evaluate evidence, errors, risk and operational impact.</p></div><div><span>HAND OVER</span><p>Document decisions, controls and next engineering steps.</p></div></div></section>
    <section className="ds-v7-cta ds-v7-reveal"><div><p className="ds-v7-kicker">// START AN ENGAGEMENT</p><h2>Build security around the way your systems actually work.</h2><p>Tell us about your environment, constraints and objectives. We'll define a practical scope together.</p></div><Link className="ds-v7-btn primary" to="/contact?service=ai-powered-security">Discuss your requirements</Link></section>
  </div></main>;
}
