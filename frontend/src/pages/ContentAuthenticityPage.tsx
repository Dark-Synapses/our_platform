import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './ContentAuthenticityV8.css';

type Capability = { title: string; description: string; scope: string };
const groups: { label: string; title: string; intro: string; items: Capability[] }[] = [
  { label: 'CONTENT AUTHENTICITY', title: 'Understand what digital content can—and cannot—prove.', intro: 'Examine provenance, integrity and manipulation indicators while keeping uncertainty visible.', items: [
    { title: 'Image & Video Authenticity', description: 'Inspect editing traces, visual inconsistencies, compression artifacts and temporal anomalies to assess whether media warrants further investigation.', scope: 'Image integrity · Video examination · Manipulation indicators' },
    { title: 'Synthetic Media & Deepfake Analysis', description: 'Evaluate potential AI-generated or altered media using complementary forensic signals. Findings distinguish suspicious indicators from definitive attribution.', scope: 'Synthetic media · Deepfake indicators · Confidence limits' },
    { title: 'Content Provenance & Verification', description: 'Review available origin information, file history, contextual claims and provenance records to identify what can be corroborated.', scope: 'Source validation · Provenance · Cross-checking' },
  ] },
  { label: 'MEDIA FORENSICS', title: 'Examine the signals beneath the surface.', intro: 'Combine file-level and content-level analysis instead of relying on a single detector score.', items: [
    { title: 'Metadata & File Structure', description: 'Inspect timestamps, encoding details, embedded metadata and structural anomalies while accounting for normal export and platform processing.', scope: 'EXIF · Containers · Encoding · Timestamps' },
    { title: 'Audio & Voice Examination', description: 'Review acoustic discontinuities, recording characteristics and potential synthesis indicators, with attention to background noise and transcoding effects.', scope: 'Audio artifacts · Voice synthesis indicators · Signal review' },
    { title: 'Text & Document Examination', description: 'Analyze document properties, revision traces and content inconsistencies to support authenticity and integrity assessments.', scope: 'Document structure · Revision signals · Context' },
  ] },
  { label: 'DIGITAL EVIDENCE', title: 'Preserve the trail from acquisition to findings.', intro: 'Design repeatable, defensible evidence-handling workflows with documented assumptions and limitations.', items: [
    { title: 'Evidence Acquisition & Preservation', description: 'Define handling procedures for original files, cryptographic hashes, working copies and recorded acquisition context.', scope: 'Hashing · Preservation · Chain of custody' },
    { title: 'Timeline & Cross-Source Correlation', description: 'Compare available timestamps, files and contextual records to reconstruct sequences and identify inconsistencies worth validating.', scope: 'Timelines · Correlation · Verification' },
    { title: 'Forensic Reporting & Technical Handover', description: 'Produce structured observations, reproducible methods, confidence statements and explicit limitations that stakeholders can review.', scope: 'Evidence summaries · Methodology · Limitations' },
  ] },
];
const workflow = [
  { title: 'Define the question', description: 'Agree on the material, investigative scope, authority and the claims that need examination.' },
  { title: 'Preserve originals', description: 'Record source context, establish integrity checks and work from controlled copies.' },
  { title: 'Examine & corroborate', description: 'Compare independent technical signals, metadata and contextual evidence; test alternative explanations.' },
  { title: 'Report with precision', description: 'Separate observations from interpretation, explain uncertainty and document reproducible findings.' },
];
export default function ContentAuthenticityPage() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const host = root.current;
    if (!host) return;
    const nodes = host.querySelectorAll<HTMLElement>('.ds-for-reveal');
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      nodes.forEach(node => node.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.06, rootMargin: '0px 0px -24px 0px' });
    nodes.forEach(node => observer.observe(node));
    return () => observer.disconnect();
  }, []);
  return <main className="ds-for" ref={root} id="main-content"><div className="ds-for-wrap">
    <nav className="ds-for-crumb" aria-label="Breadcrumb"><Link to="/#expertise">EXPERTISE</Link><span>/</span><span>DIGITAL FORENSICS</span></nav>
    <header className="ds-for-hero" aria-labelledby="ds-for-title">
      <div className="ds-for-art" role="img" aria-label="Pixel-art digital evidence analysis and forensic investigation" />
      <div className="ds-for-hero-copy"><p className="ds-for-kicker">DARK SYNAPSES / CONTENT AUTHENTICITY</p>
        <h1 id="ds-for-title">DIGITAL<br/>FORENSICS<span>_</span></h1>
        <h2>Question the content.<br/><em>Follow the evidence.</em></h2>
        <p className="ds-for-lead">Digital media can be edited, synthesized, stripped of context or misrepresented. We examine content, metadata and provenance through evidence-led workflows that make findings traceable—and limitations explicit.</p>
        <div className="ds-for-actions"><Link className="ds-for-btn ds-for-primary" to="/contact?service=digital-forensics">Discuss a forensic investigation</Link><a className="ds-for-btn" href="#forensics-capabilities">Explore capabilities</a></div>
      </div>
    </header>
    <div className="ds-for-rule"><span>EXAMINE / CORROBORATE / DOCUMENT</span><span>INTEGRITY BEFORE INFERENCE</span></div>
    <section className="ds-for-intro ds-for-reveal" aria-labelledby="ds-for-approach"><div><p className="ds-for-kicker">// OUR APPROACH</p><h2 id="ds-for-approach">A detector score is not a verdict.</h2></div><div><p>Authenticity investigations need more than a model prediction or a suspicious-looking frame. Compression, editing software, reposting and platform processing can change the same signals analysts rely on.</p><p>We combine technical examination with provenance and contextual checks, documenting what the evidence supports, what remains uncertain and which conclusions would require additional material.</p></div></section>
    <section id="forensics-capabilities" className="ds-for-services" aria-labelledby="ds-for-cap-title"><div className="ds-for-section-head ds-for-reveal"><p className="ds-for-kicker">// FORENSIC CAPABILITIES</p><h2 id="ds-for-cap-title">Investigate with method.<br/>Report with evidence.</h2><p>Scope is defined by the material available, the question being investigated and the handling requirements of the engagement.</p></div>
      {groups.map(group => <section className="ds-for-group ds-for-reveal" key={group.label}><div className="ds-for-group-head"><div><p className="ds-for-kicker">// {group.label}</p><h3>{group.title}</h3></div><p>{group.intro}</p></div><div className="ds-for-items">{group.items.map(item => <article key={item.title}><h4>{item.title}</h4><p>{item.description}</p><span>{item.scope}</span></article>)}</div></section>)}
    </section>
    <section className="ds-for-output ds-for-reveal" aria-labelledby="ds-for-output-title"><div><p className="ds-for-kicker">// DELIVERABLES</p><h2 id="ds-for-output-title">Findings that withstand questions.</h2></div><div className="ds-for-output-items"><article><h3>Traceable examination</h3><p>Source and integrity records, examination steps and relevant observations.</p></article><article><h3>Calibrated conclusions</h3><p>Clear separation of evidence, interpretation, uncertainty and competing explanations.</p></article><article><h3>Practical handover</h3><p>Structured reports, supporting artifacts where appropriate and recommendations for further verification.</p></article></div></section>
    <section className="ds-for-workflow ds-for-reveal" aria-labelledby="ds-for-workflow-title"><div className="ds-for-section-head"><p className="ds-for-kicker">// INVESTIGATION WORKFLOW</p><h2 id="ds-for-workflow-title">From source material to a defensible record.</h2></div><div className="ds-for-steps">{workflow.map(step => <article key={step.title}><h3>{step.title}</h3><p>{step.description}</p></article>)}</div></section>
    <section className="ds-for-cta ds-for-reveal" aria-labelledby="ds-for-cta-title"><div><p className="ds-for-kicker">// START AN INVESTIGATION</p><h2 id="ds-for-cta-title">Need to verify digital evidence?</h2><p>Tell us what material you have, what you need to establish and any handling constraints. We will help define a suitable scope.</p></div><Link className="ds-for-btn ds-for-primary" to="/contact?service=digital-forensics">Discuss your requirements</Link></section>
  </div></main>;
}
