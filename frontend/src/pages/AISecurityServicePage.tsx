import { useState } from 'react';
import { Link } from 'react-router-dom';
import './AISecurityServicePage.css';

type IconName = 'risk' | 'adversarial' | 'privacy' | 'model';
function CapabilityIcon({ name }: { name: IconName }) {
  return <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {name === 'risk' && <><circle cx="24" cy="15" r="7"/><path d="M10 41v-5c0-7 6-12 14-12s14 5 14 12v5M24 31v5M24 39h.01"/><path d="m17 13 5 4 9-9"/></>}
    {name === 'adversarial' && <><path d="M24 4 40 11v12c0 10-7 16-16 21C15 39 8 33 8 23V11L24 4Z"/><circle cx="24" cy="23" r="7"/><path d="M24 12v4M24 30v4M13 23h4M31 23h4"/></>}
    {name === 'privacy' && <><rect x="8" y="8" width="32" height="32" rx="6"/><path d="M18 23v-4a6 6 0 0 1 12 0v4M16 23h16v12H16z"/><circle cx="24" cy="28" r="1"/></>}
    {name === 'model' && <><path d="M24 4 40 11v11c0 11-6 17-16 22C14 39 8 33 8 22V11L24 4Z"/><path d="M17 19a5 5 0 0 1 7-5 5 5 0 0 1 7 5 5 5 0 0 1 0 10 5 5 0 0 1-7 5 5 5 0 0 1-7-5 5 5 0 0 1 0-10ZM24 15v18"/></>}
  </svg>;
}
const capabilities: { title: string; description: string; detail: string; icon: IconName }[] = [
  { title: 'AI Risk Assessments', description: 'Evaluate risks in AI models and data pipelines.', detail: 'Identify exposure across model behavior, data handling, dependencies, and deployment workflows.', icon: 'risk' },
  { title: 'Adversarial Defense', description: 'Protect against model manipulation and attacks.', detail: 'Assess prompt injection, model misuse, evasion, and adversarial testing scenarios.', icon: 'adversarial' },
  { title: 'Data Privacy & Governance', description: 'Ensure secure and compliant AI data handling.', detail: 'Strengthen access controls, data boundaries, privacy safeguards, and governance.', icon: 'privacy' },
  { title: 'Model Security', description: 'Protect model integrity, intellectual property, and usage.', detail: 'Secure inference endpoints, model artifacts, integrations, and monitoring.', icon: 'model' },
];
const phases = [
  { title: 'Analyze', description: 'Identify AI-specific risks and threats.' },
  { title: 'Design', description: 'Define security measures and policies.' },
  { title: 'Implement', description: 'Integrate security into the AI pipeline.' },
  { title: 'Monitor', description: 'Detect, respond, and continuously improve.' },
];
const projects = [
  { title: 'Secure AI Model Deployment', image: '/images/ai-security/secure-model-deployment.webp', alt: 'Secure AI model infrastructure inside a blue-lit data center' },
  { title: 'AI Data Privacy Framework', image: '/images/ai-security/ai-data-privacy.webp', alt: 'Encrypted data and digital shield protecting AI information' },
  { title: 'Adversarial Attack Detection', image: '/images/ai-security/adversarial-detection.webp', alt: 'Neural AI system protected against adversarial cyber threats' },
];
export default function AISecurityServicePage() {
  const [expanded, setExpanded] = useState<string | null>(null);
  return <main className="ds-aisec" id="top">
    <section className="ds-aisec-hero" aria-labelledby="ds-aisec-title">
      <div className="ds-aisec-hero-art" aria-hidden="true" />
      <div className="ds-aisec-container ds-aisec-hero-inner">
        <nav className="ds-aisec-crumb" aria-label="Breadcrumb"><Link to="/services">Services</Link><span>/</span><span>AI Security</span></nav>
        <div className="ds-aisec-hero-copy"><h1 id="ds-aisec-title">Secure AI.<br/><span>Trusted Intelligence.</span></h1><p>Specialized security for AI systems, from model protection to data privacy and adversarial threat defense.</p>
          <div className="ds-aisec-actions"><Link className="ds-aisec-btn ds-aisec-primary" to="/contact?service=ai-security">Request this service <span aria-hidden="true">↗</span></Link><a className="ds-aisec-btn ds-aisec-outline" href="#ai-security-capabilities">Explore capabilities <span aria-hidden="true">↓</span></a></div>
        </div>
      </div>
    </section>
    <section className="ds-aisec-section ds-aisec-container" id="ai-security-capabilities" aria-labelledby="ds-aisec-cap-title"><div className="ds-aisec-heading"><h2 id="ds-aisec-cap-title">Security for every<br/><span>stage of the AI lifecycle.</span></h2><p>We help organizations build, deploy, and maintain secure AI systems with robust defenses against emerging AI-specific threats.</p></div>
      <div className="ds-aisec-cap-grid">{capabilities.map(c => <button type="button" key={c.title} className={'ds-aisec-cap-card'+(expanded===c.title?' is-open':'')} aria-expanded={expanded===c.title} onClick={()=>setExpanded(expanded===c.title?null:c.title)}><span className="ds-aisec-cap-icon"><CapabilityIcon name={c.icon}/></span><span className="ds-aisec-cap-copy"><strong>{c.title}</strong><span>{c.description}</span>{expanded===c.title && <em>{c.detail}</em>}</span><span className="ds-aisec-arrow" aria-hidden="true">↗</span></button>)}</div>
    </section>
    <section className="ds-aisec-section ds-aisec-approach" aria-labelledby="ds-aisec-approach-title"><div className="ds-aisec-container ds-aisec-approach-layout"><h2 id="ds-aisec-approach-title">A secure foundation<br/><span>for AI innovation.</span></h2><ol className="ds-aisec-timeline">{phases.map((p,i)=><li key={p.title}><div className="ds-aisec-step">{String(i+1).padStart(2,'0')}</div><div><h3>{p.title}</h3><p>{p.description}</p></div></li>)}</ol></div></section>
    <section className="ds-aisec-section ds-aisec-container" aria-labelledby="ds-aisec-projects-title"><div className="ds-aisec-heading ds-aisec-project-heading"><h2 id="ds-aisec-projects-title">Built for real-world AI systems.</h2><Link to="/projects">View all projects <span aria-hidden="true">↗</span></Link></div><div className="ds-aisec-project-grid">{projects.map(p=><article className="ds-aisec-project" key={p.title}><img src={p.image} alt={p.alt} loading="lazy"/><h3>{p.title}</h3></article>)}</div></section>
    <section className="ds-aisec-container ds-aisec-cta-wrap" aria-labelledby="ds-aisec-cta-title"><div className="ds-aisec-cta"><div><h2 id="ds-aisec-cta-title">Build AI with confidence.</h2><p>Let's discuss your AI security requirements and a solution tailored to your goals.</p></div><Link className="ds-aisec-btn ds-aisec-primary" to="/contact?service=ai-security">Get in touch <span aria-hidden="true">↗</span></Link></div></section>
  </main>;
}
