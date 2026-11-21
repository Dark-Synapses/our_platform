import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './ServiceV7Identity.css';

export default function AISecurityServicePage() {
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
    <nav className="ds-v7-crumb" aria-label="Breadcrumb"><Link to="/#expertise">EXPERTISE</Link><span>/</span><span>AI SECURITY</span></nav>
    <header className="ds-v7-hero"><div className="ds-v7-copy"><p className="ds-v7-kicker">DARK SYNAPSES / SECURE THE INTELLIGENCE LAYER</p><h1>AI SECURITY<span>_</span></h1><h2>AI systems need more than model accuracy.</h2><p className="ds-v7-intro">We assess and strengthen the applications built around AI: prompts, retrieval, agents, tools, data access and deployment boundaries. Our work connects adversarial testing with practical engineering controls.</p><div className="ds-v7-actions"><Link className="ds-v7-btn primary" to="/contact?service=ai-security">Discuss your requirements</Link><a className="ds-v7-btn" href="#capabilities">Explore capabilities</a></div></div><div className="ds-v7-art"><img src="/images/services-pixel/ai-security.webp" alt="Pixel-art AI security infrastructure illustration" /></div></header>
    <div className="ds-v7-rule"><span>ENGINEERING / EVIDENCE / CONTROL</span><span>WHERE INTELLIGENCE MEETS THREATS</span></div>
    <div id="capabilities"><section className="ds-v7-section ds-v7-reveal"><div className="ds-v7-section-head"><div><p className="ds-v7-kicker">// AI APPLICATION SECURITY</p><h2>Protect the interfaces where models meet users and systems.</h2></div><p>AI applications introduce new trust boundaries: a model can interpret untrusted instructions, retrieve sensitive context and invoke tools. We examine how those boundaries behave under realistic misuse.</p></div><div className="ds-v7-items"><article className="ds-v7-item"><h4>LLM Application Assessments</h4><p>Evaluate prompt injection, indirect instruction attacks, insecure output handling and misuse of model-connected features.</p><span>Prompt surfaces · Output handling · Abuse cases</span></article>
<article className="ds-v7-item"><h4>Agent & Tool Permission Reviews</h4><p>Review tool scopes, credentials, action authorization, approval checkpoints and the consequences of agent errors.</p><span>Least privilege · Tool calls · Human approval</span></article>
<article className="ds-v7-item"><h4>RAG & Knowledge Access Security</h4><p>Test retrieval authorization, document trust, cross-user leakage and malicious content entering model context.</p><span>Retrieval ACLs · Data boundaries · Source trust</span></article></div></section><section className="ds-v7-section ds-v7-reveal"><div className="ds-v7-section-head"><div><p className="ds-v7-kicker">// ADVERSARIAL EVALUATION</p><h2>Test the failure modes that matter to your business.</h2></div><p>Security testing must reflect the actual workflow, not just generic jailbreak examples. We build threat-driven scenarios and document reproducible evidence.</p></div><div className="ds-v7-items"><article className="ds-v7-item"><h4>AI Red Teaming</h4><p>Design authorized adversarial scenarios across the application, model, orchestration and connected services.</p><span>Threat scenarios · Controlled testing · Evidence</span></article>
<article className="ds-v7-item"><h4>Data & Privacy Exposure</h4><p>Assess sensitive-data disclosure paths in prompts, logs, embeddings, retrieval and third-party integrations.</p><span>Data flows · Secrets · Retention</span></article>
<article className="ds-v7-item"><h4>Threat Modeling for AI Systems</h4><p>Map assets, trust boundaries, misuse cases and attack paths before selecting the right defenses.</p><span>Architecture · Attack paths · Risk</span></article></div></section><section className="ds-v7-section ds-v7-reveal"><div className="ds-v7-section-head"><div><p className="ds-v7-kicker">// SECURE AI ENGINEERING</p><h2>Turn findings into enforceable controls.</h2></div><p>We help teams translate assessments into engineering decisions that can be tested, monitored and maintained after release.</p></div><div className="ds-v7-items"><article className="ds-v7-item"><h4>Guardrails & Policy Enforcement</h4><p>Design input and output checks, deterministic permission gates and safe failure behavior around model interactions.</p><span>Policy checks · Enforcement · Fail-safe</span></article>
<article className="ds-v7-item"><h4>Evaluation & Regression Testing</h4><p>Create repeatable tests for prompt attacks, data exposure and unsafe tool behavior as systems change.</p><span>Test suites · Release gates · Regression</span></article>
<article className="ds-v7-item"><h4>Observability & Incident Readiness</h4><p>Define useful logging, investigation context and escalation paths for AI-specific security events.</p><span>Telemetry · Traceability · Response</span></article></div></section></div>
    <section className="ds-v7-section ds-v7-reveal"><div className="ds-v7-section-head"><div><p className="ds-v7-kicker">// DELIVERY & ACCOUNTABILITY</p><h2>Engineering outcomes, not empty promises.</h2></div><p>A clear threat model, reproducible findings, prioritized remediation and a validation plan for the AI system you actually operate.</p></div><div className="ds-v7-process"><div><span>DISCOVER</span><p>Map systems, assets, constraints and success criteria.</p></div><div><span>DESIGN</span><p>Agree on safeguards, architecture and measurable tests.</p></div><div><span>VALIDATE</span><p>Evaluate evidence, errors, risk and operational impact.</p></div><div><span>HAND OVER</span><p>Document decisions, controls and next engineering steps.</p></div></div></section>
    <section className="ds-v7-cta ds-v7-reveal"><div><p className="ds-v7-kicker">// START AN ENGAGEMENT</p><h2>Build security around the way your systems actually work.</h2><p>Tell us about your environment, constraints and objectives. We'll define a practical scope together.</p></div><Link className="ds-v7-btn primary" to="/contact?service=ai-security">Discuss your requirements</Link></section>
  </div></main>;
}
