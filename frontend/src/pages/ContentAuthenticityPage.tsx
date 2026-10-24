import { Link } from 'react-router-dom';
import './ContentAuthenticityPage.css';

const BASE = '/images/content-authenticity';
const capabilities = [
  { icon: '▧', title: 'Deepfake Detection', description: 'Examine images and videos for signs of synthetic generation or manipulation.' },
  { icon: '◉', title: 'Voice Cloning Analysis', description: 'Investigate synthetic speech, cloned voices, and audio alterations.' },
  { icon: '≡', title: 'AI-Generated Text Analysis', description: 'Assess machine-generation indicators with appropriate uncertainty.' },
  { icon: '◎', title: 'Digital Media Forensics', description: 'Analyze metadata, provenance signals, and digital evidence.' },
];
const steps = [
  ['Analyze', 'Examine submitted content and its available context.'],
  ['Detect', 'Identify possible synthetic or manipulated signals.'],
  ['Verify', 'Corroborate findings with forensic evidence.'],
  ['Report', 'Provide transparent findings and limitations.'],
];
const cases = [
  ['Deepfake Video Analysis', 'deepfake-analysis.webp'],
  ['Synthetic Voice Detection', 'voice-analysis.webp'],
  ['AI-Generated Text Analysis', 'text-analysis.webp'],
  ['Digital Evidence Examination', 'digital-evidence.webp'],
];
export default function ContentAuthenticityPage() {
  return <main className="ca-page">
    <section className="ca-hero" aria-labelledby="ca-heading">
      <div className="ca-shell ca-hero-content">
        <nav className="ca-crumbs" aria-label="Breadcrumb"><Link to="/services">Services</Link><span>/</span><span>Content Authenticity & Digital Forensics</span></nav>
        <div className="ca-hero-copy"><div className="ca-eyebrow">01 / CONTENT AUTHENTICITY & DIGITAL FORENSICS</div>
          <h1 id="ca-heading">Detect. Analyze.<br/><span>Verify.</span></h1>
          <p>AI-assisted detection and forensic analysis to investigate whether images, videos, audio, and text may be synthetic, manipulated, or authentic. Helping people and organizations make evidence-informed decisions.</p>
          <div className="ca-actions"><Link className="ca-button ca-primary" to="/contact">Request this service <span aria-hidden="true">→</span></Link><a className="ca-button ca-secondary" href="#capabilities">Explore capabilities <span aria-hidden="true">↓</span></a></div>
        </div>
      </div>
      <div className="ca-hero-art" role="img" aria-label="Blue digital forensic face visualization with media analysis interfaces" />
    </section>
    <section id="capabilities" className="ca-shell ca-section" aria-labelledby="ca-capabilities-heading">
      <div className="ca-section-head"><div><div className="ca-eyebrow">02 / KEY CAPABILITIES</div><h2 id="ca-capabilities-heading">Multimodal analysis<br/>for a more trustworthy world.</h2></div><p>AI-assisted and forensic techniques to investigate synthetic or manipulated content across multiple media types.</p></div>
      <div className="ca-capability-grid">{capabilities.map(c => <article className="ca-capability" key={c.title}><span className="ca-icon" aria-hidden="true">{c.icon}</span><div><h3>{c.title}</h3><p>{c.description}</p></div><span className="ca-arrow" aria-hidden="true">↗</span></article>)}</div>
    </section>
    <section className="ca-shell ca-process ca-section" aria-labelledby="ca-process-heading"><div><div className="ca-eyebrow">03 / OUR PROCESS</div><h2 id="ca-process-heading">A thorough and reliable<br/>investigation process.</h2></div><div className="ca-steps">{steps.map(([name,desc],i)=><article className="ca-step" key={name}><span className="ca-step-number">{String(i+1).padStart(2,'0')}</span><div><h3>{name}</h3><p>{desc}</p></div></article>)}</div></section>
    <section className="ca-shell ca-section ca-cases" aria-labelledby="ca-cases-heading"><div className="ca-cases-top"><div><div className="ca-eyebrow">04 / REAL-WORLD USE CASES</div><h2 id="ca-cases-heading" className="ca-visually-hidden">Real-world use cases</h2></div><Link to="/projects">View all projects →</Link></div><div className="ca-case-grid">{cases.map(([title,file])=><article className="ca-case" key={title}><div className="ca-case-image" style={{backgroundImage:`url('${BASE}/${file}')`}}/><div className="ca-case-title"><h3>{title}</h3><span aria-hidden="true">↗</span></div></article>)}</div></section>
    <section className="ca-cta"><div className="ca-shell ca-cta-inner"><h2>Verify the truth<br/>in a digital world.</h2><p>Share your requirements, and we'll help you assess the authenticity of your digital content.</p><Link className="ca-button ca-primary" to="/contact">Get in touch →</Link></div></section>
  </main>;
}
