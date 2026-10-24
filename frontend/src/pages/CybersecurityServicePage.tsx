import { useState } from 'react';
import { Link } from 'react-router-dom';
import './CybersecurityServicePage.css';

type IconName = 'assessment' | 'testing' | 'architecture' | 'monitoring';

function SecurityIcon({ name }: { name: IconName }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" {...common}>
      {name === 'assessment' && <><path d="M10 8h28v32H10zM16 15h16M16 21h16M16 27h10"/><path d="m27 33 3 3 6-7"/></>}
      {name === 'testing' && <><circle cx="24" cy="24" r="15"/><circle cx="24" cy="24" r="8"/><circle cx="24" cy="24" r="2"/><path d="M24 3v8M24 37v8M3 24h8M37 24h8"/></>}
      {name === 'architecture' && <><path d="M24 4 40 11v11c0 10-6 17-16 22C14 39 8 32 8 22V11L24 4Z"/><path d="M19 24v-4a5 5 0 0 1 10 0v4M17 24h14v11H17z"/></>}
      {name === 'monitoring' && <><circle cx="24" cy="24" r="5"/><path d="M24 6v8M24 34v8M6 24h8M34 24h8M11 11l6 6M31 31l6 6M37 11l-6 6M17 31l-6 6"/><circle cx="24" cy="24" r="17" strokeDasharray="3 5"/></>}
    </svg>
  );
}

const services: { title: string; description: string; icon: IconName; detail: string }[] = [
  { title: 'Security Assessments', description: 'Identify vulnerabilities and assess security posture.', icon: 'assessment', detail: 'Review risks, configurations, assets, and controls to prioritize practical security improvements.' },
  { title: 'Penetration Testing', description: 'Simulate real-world attacks to uncover risks.', icon: 'testing', detail: 'Validate potential weaknesses through authorized testing and clear remediation guidance.' },
  { title: 'Security Architecture', description: 'Design secure, scalable infrastructure.', icon: 'architecture', detail: 'Build defense-in-depth into cloud, application, and network architecture from the start.' },
  { title: 'Threat Monitoring', description: 'Continuous monitoring and incident response.', icon: 'monitoring', detail: 'Improve visibility, triage suspicious activity, and support timely incident response.' },
];

const phases = [
  { title: 'Assess', text: 'Understand your risk landscape.' },
  { title: 'Plan', text: 'Define the right security strategy.' },
  { title: 'Implement', text: 'Deploy and harden systems.' },
  { title: 'Monitor', text: 'Continuously detect and respond.' },
];

const projects = [
  { title: 'Security Infrastructure for Enterprise Platform', image: '/images/cybersecurity-service/impact-security-operations.webp', alt: 'Cybersecurity operations center with monitoring displays' },
  { title: 'Threat Detection & Monitoring System', image: '/images/cybersecurity-service/impact-data-center.webp', alt: 'Blue illuminated secure data center corridor' },
  { title: 'Cloud Security Implementation', image: '/images/cybersecurity-service/impact-cloud-security.webp', alt: 'Protected holographic cloud infrastructure' },
];

export default function CybersecurityServicePage() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <main className="ds-cyber" id="top">
      <section className="ds-cyber-hero" aria-labelledby="ds-cyber-heading">
        <div className="ds-cyber-hero-art" aria-hidden="true" />
        <div className="ds-cyber-container ds-cyber-hero-inner">
          <nav className="ds-cyber-crumb" aria-label="Breadcrumb"><Link to="/services">Services</Link><span>/</span><span>Cybersecurity Services</span></nav>
          <div className="ds-cyber-hero-copy">
            <h1 id="ds-cyber-heading">Cybersecurity<br/><span>Services</span></h1>
            <h2>Proactive security for a more resilient tomorrow.</h2>
            <p>Comprehensive cybersecurity services to protect your digital assets, detect threats, and strengthen your security posture.</p>
            <div className="ds-cyber-actions">
              <Link className="ds-cyber-btn ds-cyber-btn-primary" to="/contact">Request this service <span aria-hidden="true">↗</span></Link>
              <a className="ds-cyber-btn ds-cyber-btn-outline" href="#cyber-capabilities">Explore capabilities <span aria-hidden="true">↓</span></a>
            </div>
          </div>
        </div>
      </section>

      <section className="ds-cyber-section ds-cyber-container" id="cyber-capabilities" aria-labelledby="ds-cyber-services-title">
        <div className="ds-cyber-section-head">
          <h2 id="ds-cyber-services-title">Comprehensive security<br/><span>across your organization.</span></h2>
          <p>End-to-end cybersecurity services tailored to your business needs, from risk assessment to continuous monitoring.</p>
        </div>
        <div className="ds-cyber-services-grid">
          {services.map((service) => (
            <button type="button" className={`ds-cyber-service-card ${expanded === service.title ? 'is-open' : ''}`} key={service.title} aria-expanded={expanded === service.title} onClick={() => setExpanded(expanded === service.title ? null : service.title)}>
              <span className="ds-cyber-service-icon"><SecurityIcon name={service.icon} /></span>
              <span className="ds-cyber-service-copy"><strong>{service.title}</strong><span>{service.description}</span>{expanded === service.title && <em>{service.detail}</em>}</span>
              <span className="ds-cyber-service-arrow" aria-hidden="true">↗</span>
            </button>
          ))}
        </div>
      </section>

      <section className="ds-cyber-section ds-cyber-approach" aria-labelledby="ds-cyber-approach-title">
        <div className="ds-cyber-container">
          <h2 id="ds-cyber-approach-title">From assessment to<br/><span>continuous protection.</span></h2>
          <ol className="ds-cyber-timeline">
            {phases.map((phase, index) => <li key={phase.title}><div className="ds-cyber-phase-number">{String(index + 1).padStart(2, '0')}</div><h3>{phase.title}</h3><p>{phase.text}</p></li>)}
          </ol>
        </div>
      </section>

      <section className="ds-cyber-section ds-cyber-container ds-cyber-impact" aria-labelledby="ds-cyber-impact-title">
        <div className="ds-cyber-section-head"><h2 id="ds-cyber-impact-title">Stronger security.<br/><span>Greater confidence.</span></h2><Link className="ds-cyber-all-projects" to="/projects">View all projects <span aria-hidden="true">↗</span></Link></div>
        <div className="ds-cyber-project-grid">{projects.map((project) => <article className="ds-cyber-project" key={project.title}><img src={project.image} alt={project.alt} loading="lazy"/><h3>{project.title}</h3></article>)}</div>
      </section>

      <section className="ds-cyber-container ds-cyber-cta-wrap" aria-labelledby="ds-cyber-cta-title"><div className="ds-cyber-cta"><div className="ds-cyber-cta-content"><h2 id="ds-cyber-cta-title">Let's strengthen<br/><span>your security.</span></h2><p>Tell us about your security challenges, and we'll help you design the right solution.</p><Link className="ds-cyber-btn ds-cyber-btn-primary" to="/contact">Get in touch <span aria-hidden="true">↗</span></Link></div></div></section>
    </main>
  );
}
