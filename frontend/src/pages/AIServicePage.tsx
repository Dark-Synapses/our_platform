import { Link } from 'react-router-dom';
import './AIServicePage.css';

const base = '/images/ai-service-v2/';
const challenges = [
  { title: 'Automate operations', image: 'challenge-automate.webp' },
  { title: 'Unlock insights', image: 'challenge-insights.webp' },
  { title: 'Create new possibilities', image: 'challenge-possibilities.webp' },
];
const capabilities = [
  { title: 'AI Agents & Assistants', icon: 'robot', description: 'Purpose-built AI agents, conversational assistants, and task orchestration.' },
  { title: 'RAG & Knowledge Systems', icon: 'database', description: 'Reliable search and retrieval across your business knowledge.' },
  { title: 'Computer Vision Solutions', icon: 'eye', description: 'Visual understanding, detection, inspection, and image intelligence.' },
  { title: 'Generative AI Applications', icon: 'brain', description: 'Generative experiences and multimodal applications for real workflows.' },
] as const;
const projects = [
  { title: 'Computer Vision Solutions', image: 'project-vision.webp' },
  { title: 'AI-Powered Assistant', image: 'project-assistant.webp' },
  { title: 'Intelligent Automation', image: 'project-automation.webp' },
];
function CapabilityIcon({ name }: { name: typeof capabilities[number]['icon'] }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return <svg viewBox="0 0 48 48" aria-hidden="true" {...common}>
    {name === 'robot' && <><rect x="10" y="13" width="28" height="25" rx="7"/><path d="M24 7v6M20 7h8M10 23H6m36 0h-4M17 32h14"/><circle cx="18" cy="24" r="2"/><circle cx="30" cy="24" r="2"/></>}
    {name === 'database' && <><ellipse cx="24" cy="12" rx="13" ry="6"/><path d="M11 12v23c0 8 26 8 26 0V12M11 23c0 8 26 8 26 0"/><path d="M19 31h10"/></>}
    {name === 'eye' && <><path d="M4 24s8-12 20-12 20 12 20 12-8 12-20 12S4 24 4 24Z"/><circle cx="24" cy="24" r="7"/><circle cx="24" cy="24" r="2"/></>}
    {name === 'brain' && <><path d="M24 10c-6-7-16-2-15 6-7 4-5 13 1 15-1 8 9 12 14 6 5 6 15 2 14-6 6-2 8-11 1-15 1-8-9-13-15-6Z"/><path d="M24 10v27M16 17l4 4-4 5m16-9-4 4 4 5M17 32l7-4 7 4"/></>}
  </svg>;
}
function ImageCard({ title, image, href }: { title: string; image: string; href: string }) {
  return <a className="ds-ai-v2-card" href={href} aria-label={title}>
    <img src={base + image} alt="" loading="lazy" />
    <span className="ds-ai-v2-card-content"><strong>{title}</strong><span aria-hidden="true">↗</span></span>
  </a>;
}
export function AIServicePage() {
  return <main className="ds-ai-v2">
    <section className="ds-ai-v2-hero">
      <div className="ds-ai-v2-hero-art" aria-hidden="true" />
      <div className="ds-ai-v2-container ds-ai-v2-hero-inner">
        <nav className="ds-ai-v2-crumb" aria-label="Breadcrumb"><Link to="/services">Services</Link><span>/</span><span>AI Services</span></nav>
        <div className="ds-ai-v2-hero-copy">
          <h1>AI Services</h1>
          <h2>From complex challenges<br/>to intelligent solutions.</h2>
          <p>We help organizations leverage AI to automate processes, uncover insights, and build innovative products — combining domain expertise with secure, scalable, and production-ready systems.</p>
          <div className="ds-ai-v2-actions"><Link className="ds-ai-v2-btn ds-ai-v2-primary" to="/contact?service=ai">Request this service <span>→</span></Link><a className="ds-ai-v2-btn ds-ai-v2-secondary" href="#ai-capabilities">Explore capabilities ↓</a></div>
        </div>
        <div className="ds-ai-v2-hero-words" aria-hidden="true">Ideas<br/>Intelligence<br/>Impact</div>
      </div>
    </section>
    <section className="ds-ai-v2-section ds-ai-v2-container" aria-labelledby="ai-challenge-title">
      <div className="ds-ai-v2-section-head"><div><p className="ds-ai-v2-kicker">CHALLENGE</p><h2 id="ai-challenge-title">Complex problems.<br/>Greater possibilities.</h2></div><p>From data overload to manual processes, we help you turn challenges into opportunities with intelligent AI solutions.</p></div>
      <div className="ds-ai-v2-three">{challenges.map(c => <ImageCard key={c.title} {...c} href="#ai-capabilities" />)}</div>
    </section>
    <section className="ds-ai-v2-section ds-ai-v2-container ds-ai-v2-solutions" id="ai-capabilities" aria-labelledby="ai-capabilities-title">
      <p className="ds-ai-v2-kicker">OUR SOLUTIONS</p><h2 id="ai-capabilities-title">Powerful AI capabilities.<br/>Real business value.</h2>
      <div className="ds-ai-v2-four">{capabilities.map(c => <details className="ds-ai-v2-capability" key={c.title}><summary><span className="ds-ai-v2-icon"><CapabilityIcon name={c.icon}/></span><span className="ds-ai-v2-cap-title">{c.title}</span><span className="ds-ai-v2-cap-arrow">→</span></summary><p>{c.description}</p></details>)}</div>
    </section>
    <section className="ds-ai-v2-section ds-ai-v2-container" aria-labelledby="ai-impact-title">
      <div className="ds-ai-v2-section-head ds-ai-v2-impact-head"><div><p className="ds-ai-v2-kicker">REAL-WORLD IMPACT</p><h2 id="ai-impact-title">Turning AI into results.</h2></div><Link to="/projects">View all projects →</Link></div>
      <div className="ds-ai-v2-three ds-ai-v2-projects">{projects.map(p => <ImageCard key={p.title} {...p} href="/projects" />)}</div>
    </section>
    <section className="ds-ai-v2-container ds-ai-v2-cta-wrap"><div className="ds-ai-v2-cta"><div><p className="ds-ai-v2-kicker">LET'S BUILD TOGETHER</p><h2>Have a project<br/>in mind?</h2></div><div><p>Tell us about your goals, and we'll help you design the right AI solution.</p><Link className="ds-ai-v2-btn ds-ai-v2-primary" to="/contact?service=ai">Get in touch →</Link></div></div></section>
  </main>;
}
