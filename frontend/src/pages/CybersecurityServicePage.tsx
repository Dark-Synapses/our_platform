import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './CybersecurityTerminal.css';

type Capability = { title: string; description: string; scope: string };
const groups: { label: string; title: string; intro: string; items: Capability[] }[] = [
  { label: 'OFFENSIVE SECURITY', title: 'Find weaknesses before they become incidents.', intro: 'Authorized, scope-controlled testing that turns technical findings into prioritized remediation.', items: [
    { title: 'Penetration Testing', description: 'Manual and tool-assisted testing of web applications, APIs, networks and infrastructure, with exploitation validation where authorized.', scope: 'Web · API · Network · Infrastructure' },
    { title: 'Vulnerability Assessment', description: 'Identify, validate and prioritize vulnerabilities across exposed assets, configurations and dependencies.', scope: 'Discovery · Validation · Risk prioritization' },
    { title: 'Security Configuration Reviews', description: 'Review hardening, authentication, permissions and exposed services against the operating environment.', scope: 'Hardening · IAM · Misconfiguration' },
  ] },
  { label: 'DEFENSIVE SECURITY', title: 'Improve visibility, detection and resilience.', intro: 'Build practical defenses that make threats easier to detect, investigate and contain.', items: [
    { title: 'Security Monitoring & Detection', description: 'Assess telemetry coverage, refine alert logic and design detection use cases around meaningful attack behaviors.', scope: 'Logging · Detection engineering · Alerting' },
    { title: 'Threat Modeling & Risk Assessment', description: 'Map critical assets, trust boundaries, attack paths and business impact to guide security investment.', scope: 'Threat scenarios · Attack surface · Risk' },
    { title: 'Security Posture Improvement', description: 'Review access controls, endpoint and infrastructure protections, and practical security gaps.', scope: 'Controls · Exposure reduction · Validation' },
  ] },
  { label: 'SECURITY ENGINEERING', title: 'Build security into the systems you ship.', intro: 'Security reviews and engineering guidance integrated into architecture and delivery workflows.', items: [
    { title: 'Application & API Security', description: 'Review authentication, authorization, input handling, secrets management and common application abuse paths.', scope: 'OWASP · AuthN/AuthZ · API boundaries' },
    { title: 'Cloud & Infrastructure Security', description: 'Assess cloud identities, network boundaries, storage exposure and deployment configurations.', scope: 'Cloud IAM · Infrastructure · Access' },
    { title: 'Secure Architecture & DevSecOps', description: 'Evaluate design decisions and integrate security checks into development and deployment pipelines.', scope: 'Architecture review · CI/CD · Secure SDLC' },
  ] },
  { label: 'INCIDENT READINESS', title: 'Prepare to respond with clarity.', intro: 'Improve readiness for investigation, containment and recovery before an incident puts operations under pressure.', items: [
    { title: 'Incident Response Planning', description: 'Define escalation paths, response roles, containment decisions and communication procedures.', scope: 'Playbooks · Escalation · Containment' },
    { title: 'Investigation & Evidence Handling', description: 'Plan defensible collection, preservation and analysis workflows for security-relevant digital evidence.', scope: 'Triage · Evidence integrity · Timeline' },
    { title: 'Recovery & Verification', description: 'Support remediation planning, retesting and documentation of residual risks after security findings or incidents.', scope: 'Remediation · Retesting · Reporting' },
  ] },
];
const phases = [
  { title: 'Discover & scope', description: 'Understand systems, critical assets, authorization, constraints and expected outcomes.' },
  { title: 'Assess & validate', description: 'Perform agreed reviews or tests, verify findings and prioritize by practical impact.' },
  { title: 'Remediate & strengthen', description: 'Provide actionable recommendations and collaborate on improvements.' },
  { title: 'Retest & hand over', description: 'Verify changes, document residual risk and deliver clear technical findings.' },
];
export default function CybersecurityServicePage() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const host = root.current;
    if (!host) return;
    const elements = host.querySelectorAll<HTMLElement>('.ds-cyt-reveal');
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      elements.forEach(el => el.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.06, rootMargin: '0px 0px -20px 0px' });
    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return <main ref={root} className="ds-cyt" id="main-content"><div className="ds-cyt-inner">
    <nav className="ds-cyt-breadcrumb" aria-label="Breadcrumb"><Link to="/#expertise">EXPERTISE</Link><span>/</span><span>CYBERSECURITY</span></nav>
    <header className="ds-cyt-hero" aria-labelledby="ds-cyt-title">
      <div className="ds-cyt-hero-art" role="img" aria-label="Pixel-inspired cybersecurity shield and digital infrastructure" />
      <div className="ds-cyt-hero-copy"><p className="ds-cyt-kicker">DARK SYNAPSES / SECURITY ENGINEERING</p><h1 id="ds-cyt-title">CYBERSECURITY<span>_</span></h1>
      <h2>Understand your exposure.<br/><em>Engineer stronger defenses.</em></h2>
      <p className="ds-cyt-lead">We assess, test and strengthen applications, infrastructure and security operations. From authorized penetration testing to secure architecture and incident readiness, our work focuses on verified findings, clear priorities and practical remediation.</p>
      <div className="ds-cyt-actions"><Link className="ds-cyt-button ds-cyt-button-primary" to="/contact?service=cybersecurity">Discuss your security needs</Link><a className="ds-cyt-button" href="#cyber-capabilities">Explore capabilities</a></div></div>
    </header>
    <div className="ds-cyt-rule"><span>ASSESS / VALIDATE / STRENGTHEN</span><span>SECURITY BUILT ON EVIDENCE</span></div>
    <section className="ds-cyt-intro ds-cyt-reveal" aria-labelledby="ds-cyt-intro"><div><p className="ds-cyt-kicker">// OUR APPROACH</p><h2 id="ds-cyt-intro">Security is not a checklist.<br/><em>It is an engineering discipline.</em></h2></div><div><p>Every environment has different assets, threat models and operational constraints. We start by understanding what matters, then select assessments and engineering activities that address the actual risk.</p><p>Our deliverables emphasize reproducible findings, business-relevant severity, remediation guidance and verification—not reports filled with unexplained scanner output.</p></div></section>
    <section className="ds-cyt-capabilities" id="cyber-capabilities" aria-labelledby="ds-cyt-cap-title"><div className="ds-cyt-section-heading ds-cyt-reveal"><p className="ds-cyt-kicker">// CYBERSECURITY CAPABILITIES</p><h2 id="ds-cyt-cap-title">A complete security practice.<br/>Clearly defined services.</h2><p>Explore the areas we can scope for your organization. Engagements are tailored to your systems, permissions and objectives.</p></div>
      {groups.map(group => <section className="ds-cyt-group ds-cyt-reveal" key={group.label}><div className="ds-cyt-group-heading"><div><p className="ds-cyt-kicker">// {group.label}</p><h3>{group.title}</h3></div><p>{group.intro}</p></div><div className="ds-cyt-list">{group.items.map(item => <article key={item.title}><h4>{item.title}</h4><p>{item.description}</p><span>{item.scope}</span></article>)}</div></section>)}
    </section>
    <section className="ds-cyt-deliverables ds-cyt-reveal" aria-labelledby="ds-cyt-deliverables"><div><p className="ds-cyt-kicker">// WHAT YOU RECEIVE</p><h2 id="ds-cyt-deliverables">Findings your team can act on.</h2></div><div className="ds-cyt-output-grid"><article><h3>Clear technical evidence</h3><p>Documented scope, methods, verified observations and reproducible details where appropriate.</p></article><article><h3>Prioritized remediation</h3><p>Recommendations organized around likelihood, impact, effort and operational constraints.</p></article><article><h3>Validation & handover</h3><p>Retesting options, residual-risk notes and a practical handover for engineering and security teams.</p></article></div></section>
    <section className="ds-cyt-process ds-cyt-reveal" aria-labelledby="ds-cyt-process"><div className="ds-cyt-section-heading"><p className="ds-cyt-kicker">// ENGAGEMENT WORKFLOW</p><h2 id="ds-cyt-process">From scope to verified improvement.</h2><p>Controlled collaboration, explicit authorization and transparent checkpoints throughout.</p></div><div className="ds-cyt-phases">{phases.map((phase, i) => <article key={phase.title}><span>PHASE 0{i + 1}</span><h3>{phase.title}</h3><p>{phase.description}</p></article>)}</div></section>
    <section className="ds-cyt-cta ds-cyt-reveal" aria-labelledby="ds-cyt-cta"><div><p className="ds-cyt-kicker">// START A SECURITY ENGAGEMENT</p><h2 id="ds-cyt-cta">Let's define your security priorities.</h2><p>Share the systems you need to assess or protect. We'll discuss scope, constraints and a suitable technical approach.</p></div><Link className="ds-cyt-button ds-cyt-button-primary" to="/contact?service=cybersecurity">Request a security consultation</Link></section>
  </div></main>;
}
