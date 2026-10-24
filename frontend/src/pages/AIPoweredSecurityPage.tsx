import { Link } from 'react-router-dom';
import { useState } from 'react';
import './AIPoweredSecurityPage.css';
import './AIPoweredSecurityPolish.css';
const img = '/images/ai-powered/';
const capabilities = [
  { icon: '◎', title: 'Intelligent Threat Detection', detail: 'Analyze security events, activity patterns, and system telemetry to prioritize potential threats.' },
  { icon: '▤', title: 'Automated Security Analysis', detail: 'Automate selected security checks across applications, APIs, configurations, and codebases.' },
  { icon: '▥', title: 'AI-Assisted Monitoring', detail: 'Summarize events, correlate signals, and help analysts investigate incidents more efficiently.' },
  { icon: '⌘', title: 'Security Workflow Automation', detail: 'Connect alert enrichment, evidence collection, reporting, and escalation in controlled workflows.' },
  { icon: '⚙', title: 'Custom Security Intelligence Tools', detail: 'Build specialized AI agents and security tools tailored to organizational requirements.' },
];
const steps = ['Understand', 'Model', 'Hypothesize', 'Experiment', 'Verify', 'Report', 'Remediate'];
export default function AIPoweredSecurityPage() {
  const [preview, setPreview] = useState(false);
  return <main className="dsps">
    <section className="dsps-hero" style={{backgroundImage:`linear-gradient(90deg,#030d1c 0%,rgba(3,13,28,.96) 28%,rgba(3,13,28,.38) 70%),url(${img}security-hero.webp)`}}>
      <div className="dsps-container dsps-hero-inner"><div className="dsps-hero-copy">
        <p className="dsps-eyebrow">Services &nbsp;/&nbsp; AI-Powered Security Systems</p>
        <h1>Security Systems Engineered for <span>Intelligent Defense.</span></h1>
        <p>AI-powered security systems that analyze complex signals, support investigations, and automate controlled security workflows — tailored to your environment.</p>
        <div className="dsps-actions"><Link className="dsps-btn dsps-primary" to="/contact">Request this service →</Link><a className="dsps-btn dsps-outline" href="#capabilities">Explore capabilities ↓</a></div>
        <div className="dsps-hero-meta"><span>◇ AI-Driven Security</span><span>⬡ Tailored Infrastructure</span><span>↗ Evidence-Driven</span></div>
      </div></div>
    </section>
    <section id="capabilities" className="dsps-section dsps-container"><div className="dsps-heading-row"><div><p className="dsps-eyebrow">WHAT WE BUILD</p><h2>Intelligence across your security operations.</h2></div><p>Purpose-built security intelligence combining AI, behavioral analysis, automation, and human oversight.</p></div>
      <div className="dsps-cap-grid">{capabilities.map(c=><article className="dsps-cap" key={c.title}><div className="dsps-cap-icon">{c.icon}</div><h3>{c.title}</h3><p>{c.detail}</p></article>)}</div>
    </section>
    <section className="dsps-container dsps-research" id="research"><div className="dsps-research-copy"><p className="dsps-eyebrow">FEATURED RESEARCH INITIATIVE <span className="dsps-pill">Under development</span></p><h2>Autonomous AI Security Researcher</h2><p>Beyond automated scanning: an AI-assisted research environment focused on system understanding, adaptive investigation, independent validation, and reproducible evidence.</p><p>Built for authorized research with scoped tool access, experiment logs, and human approval for sensitive actions.</p><div className="dsps-actions"><Link className="dsps-btn dsps-primary" to="/security-researcher">Explore researcher →</Link><button className="dsps-btn dsps-outline" onClick={()=>setPreview(true)}>Try UI preview</button></div></div><div className="dsps-research-image" role="img" aria-label="Cybersecurity research workspace" /></section>
    <section className="dsps-section dsps-container"><p className="dsps-eyebrow">RESEARCH WORKFLOW</p><h2>From hypotheses to verified evidence.</h2><div className="dsps-workflow">{steps.map((step,i)=><div className="dsps-step" key={step}><span className="dsps-step-num">{String(i+1).padStart(2,'0')}</span><strong>{step}</strong>{i<steps.length-1&&<span className="dsps-step-arrow">→</span>}</div>)}</div></section>
    <section className="dsps-container dsps-projects"><div className="dsps-heading-row"><div><p className="dsps-eyebrow">PROJECTS & RESEARCH</p><h2>Purpose-built security innovation.</h2></div><p>Our research initiatives are under development; available capabilities will be clearly identified as they are released.</p></div><div className="dsps-project-grid"><article><img src={`${img}threat-defense.webp`} alt="Intelligent security threat defense visualization"/><h3>Intelligent Security Systems</h3><p>AI-assisted detection, monitoring, and security workflow orchestration.</p></article><article><img src={`${img}research-ai.webp`} alt="AI security analysis visualization"/><h3>Security Research OS <span className="dsps-pill">Research concept</span></h3><p>A planned Linux-based environment for controlled experiments, research memory, and evidence management.</p></article></div></section>
    <section className="dsps-container dsps-cta"><div><h2>Deploy intelligent security systems.</h2><p>Tell us about your environment and we'll explore a solution aligned with your security needs.</p></div><Link to="/contact" className="dsps-btn dsps-primary">Get in touch →</Link></section>
    <button className="dsps-chat-fab" onClick={()=>setPreview(!preview)} aria-label="Open Mandark researcher preview"><img src={`${img}mandark-avatar.webp`} alt="Mandark"/><span>Chat with Mandark</span></button>
    {preview&&<aside className="dsps-preview" aria-label="Mandark preview"><header><img src={`${img}mandark-avatar.webp`} alt=""/><div><strong>Mandark</strong><small>AI Security Researcher · UI Preview</small></div><button onClick={()=>setPreview(false)} aria-label="Close preview">×</button></header><p>This preview introduces the research workspace. Tool execution and live AI responses are not connected yet.</p><Link className="dsps-btn dsps-primary" to="/security-researcher">Open researcher workspace →</Link></aside>}
  </main>;
}
