import './pixel-v8-content.css';
import './ds-hero-signal-v16.css';
import './ds-corporate-v13.css';
import { HomeTechNews } from '../components/HomeTechNews';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
const services = [
  { title: 'Artificial Intelligence', category: 'AI ENGINEERING', image: '/images/services-pixel/ai.webp', path: '/services/ai', description: 'We design and engineer intelligent software around real operational needs—from custom machine learning and real-time computer vision to AI agents, document intelligence, voice interfaces, and production integrations.', capabilities: ['AI agents, LLMs & RAG', 'Computer vision & real-time AI', 'OCR & document intelligence', 'Voice AI & automation'] },
  { title: 'Cybersecurity', category: 'OFFENSIVE & DEFENSIVE SECURITY', image: '/images/services-pixel/cybersecurity.webp', path: '/services/cybersecurity', description: 'We assess applications and infrastructure, identify security weaknesses, and provide actionable findings that help teams reduce exposure. Our offensive work covers web, mobile, API, and network penetration testing; defensive engineering and SOC are areas of planned expansion.', capabilities: ['Web, mobile & API penetration testing', 'Network & infrastructure assessment', 'Vulnerability assessment & hardening', 'Defensive security — expanding'] },
  { title: 'AI Security', category: 'SECURING INTELLIGENT SYSTEMS', image: '/images/services-pixel/ai-security.webp', path: '/services/ai-security', description: 'AI applications introduce new attack surfaces. We evaluate the security of LLM-based systems, agents, retrieval pipelines, model integrations, and their access to sensitive data.', capabilities: ['AI penetration testing', 'LLM & agent security', 'Prompt injection & adversarial testing', 'RAG & data exposure assessment'] },
  { title: 'AI-Powered Security', category: 'INTELLIGENT DEFENSE ENGINEERING', image: '/images/services-pixel/ai-powered-security.webp', path: '/services/ai-powered-security', description: 'We explore and engineer AI-assisted security workflows that help analysts interpret signals, surface anomalies, and automate repetitive analysis while keeping human oversight central.', capabilities: ['Threat detection & analysis', 'Anomaly detection', 'Security workflow automation', 'AI-assisted monitoring'] },
  { title: 'Digital Forensics', category: 'DIGITAL EVIDENCE & AUTHENTICITY', image: '/images/services-pixel/forensics.webp', path: '/services/content-authenticity-digital-forensics', description: 'An independent discipline for examining digital evidence. We analyze images, video, audio, documents, and relevant system artifacts for signs of manipulation, synthetic media, compromise, or potential data exposure—with findings grounded in available evidence.', capabilities: ['AI image & video authenticity', 'Voice cloning & speech manipulation', 'Document, file & metadata analysis', 'Compromise & breach investigation'] },
];

export function PixelV4Home() {
  // DS_V10_MOTION_FINAL: independently animate inner layers, never section containers.
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('.ds-v10-public .px4-home');
    if (!root) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const targets = Array.from(root.querySelectorAll<HTMLElement>(
      '.px4-hero-copy > *, .ds-content-intro > *, .ds-v9-service .ds-v9-info > *, .ds-content-statement > *, .ds-content-principles article, .ds-content-phases article, .ds-content-links > *'
    ));
    const art = root.querySelector<HTMLElement>('.px4-art img');
    const images = Array.from(root.querySelectorAll<HTMLElement>('.ds-v9-visual img'));
    const layers = [...(art ? [art] : []), ...images];
    let raf = 0;
    const tick = () => {
      raf = 0;
      if (reduced.matches) return;
      const vh = Math.max(1, window.innerHeight);
      for (const image of layers) {
        const host = image.parentElement;
        if (!host) continue;
        const rect = host.getBoundingClientRect();
        if (rect.bottom < -120 || rect.top > vh + 120) continue;
        const progress = (rect.top + rect.height * .5 - vh * .5) / vh;
        const range = image === art ? 24 : 17;
        const offset = Math.max(-range, Math.min(range, -progress * range * 1.5));
        image.style.setProperty('--ds-motion-offset', `${offset.toFixed(2)}px`);
      }
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(tick); };
    let observer: IntersectionObserver | undefined;
    if (!reduced.matches && 'IntersectionObserver' in window) {
      // Mark first, then enable the transition in the next frame: visible motion.
      targets.forEach(el => el.classList.add('ds-final-layer'));
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('ds-final-in');
            observer?.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -35px 0px' });
      requestAnimationFrame(() => {
        root.classList.add('ds-final-ready');
        targets.forEach(el => observer?.observe(el));
      });
    }
    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      observer?.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (raf) cancelAnimationFrame(raf);
      root.classList.remove('ds-final-ready');
      targets.forEach(el => el.classList.remove('ds-final-layer','ds-final-in'));
      layers.forEach(el => el.style.removeProperty('--ds-motion-offset'));
    };
  }, []);

  return <div className="px4-home">
    <section className="px4-hero">
      <div className="px4-hero-copy">
        <p className="px4-kicker">&gt; INITIALIZING_ <span className="ds-v6-kicker-detail">[ AI × CYBERSECURITY ]</span></p>
        <h1>DARK<br/>SYNAPSES<span>_</span></h1>
        <h2>Where Intelligence<br/>Meets Threats.</h2>
        <p className="px4-intro">We engineer AI-powered systems and secure the technologies that power tomorrow.</p>
        <div className="px4-actions"><Link className="px4-btn primary" to="/#expertise">[ Explore Our Expertise ]</Link><Link className="px4-btn" to="/projects">[ View Projects ]</Link></div>
        <div className="px4-status" aria-hidden="true">▪ ▪ ▪ ▪ ▪</div>
      </div>
      <div className="px4-art" aria-hidden="true"><span className="ds-hero-signal"/><span className="px4-corner tl"/><span className="px4-corner tr"/><img src="/images/pixel-v4/landscape-v8.png" alt=""/></div>
    </section>
    <HomeTechNews />
    <section className="ds-content-section ds-services-home ds-v9-expertise" id="expertise" aria-labelledby="ds-expertise-heading">
      <div className="px4-section-bar"><span>EXPERTISE</span><span>AI × CYBERSECURITY</span></div>
      <div className="ds-content-intro"><div><p className="ds-content-kicker">WHAT WE DO</p><h2 id="ds-expertise-heading">Intelligence meets<br/><span>protection.</span></h2></div><p>Five focused disciplines. One engineering mindset. We build intelligent systems, assess digital risk, secure AI applications, and investigate digital evidence—with a clear path from technical scope to practical outcomes.</p></div>
      <div className="ds-v9-services">
        {services.map((service) => <article className="ds-v9-service" key={service.path}>
          <div className="ds-v9-visual"><img src={service.image} alt="" loading="lazy" decoding="async" /></div>
          <div className="ds-v9-info">
            <p className="ds-v9-category">{service.category}</p>
            <h3>{service.title}</h3>
            <p className="ds-v9-description">{service.description}</p>
            <ul className="ds-v13-capabilities">{service.capabilities.map((capability) => <li key={capability}>{capability}</li>)}</ul>
            <Link className="ds-v9-link" to={service.path}>Explore this practice</Link>
          </div>
        </article>)}
      </div>
    </section>
    <section className="ds-content-section" id="about" aria-labelledby="ds-about-heading">
      <div className="px4-section-bar"><span>[ ABOUT DARK SYNAPSES ]</span><span>// OUR PERSPECTIVE</span></div>
      <div className="ds-content-intro">
        <div><p className="ds-content-kicker">WHO WE ARE</p><h2 id="ds-about-heading">Intelligence changes what's possible.<br/><span>Security determines what lasts.</span></h2></div>
        <div><p>Dark Synapses is a technology engineering company working at the intersection of artificial intelligence, cybersecurity, and modern software systems.</p><p>We approach intelligent technology and digital security as connected engineering challenges — designing systems that are not only capable of doing more, but built with the discipline to operate responsibly in the real world.</p></div>
      </div>
      <div className="ds-content-statement"><span>OUR FOUNDATIONAL BELIEF</span><p>The most valuable technology is not simply the most advanced. <strong>It is the technology people can depend on.</strong></p><p>Capability creates opportunity. Architecture creates stability. Security creates confidence.</p></div>
      <div className="ds-content-section-heading"><p className="ds-content-kicker">OUR ENGINEERING PHILOSOPHY</p><h3>How we think about engineering.</h3></div>
      <div className="ds-content-principles">
        <article><span aria-hidden="true">✦</span><h4>Architecture before acceleration.</h4><p>We favor clear system boundaries, deliberate technology choices, maintainable components, and architectures that reflect the real requirements of the problem.</p></article>
        <article><span aria-hidden="true">✦</span><h4>Security is a design decision.</h4><p>Security influences authentication, permissions, data handling, component communication, and failure response throughout the engineering lifecycle.</p></article>
        <article><span aria-hidden="true">✦</span><h4>Intelligence requires evaluation.</h4><p>Models and agents must be evaluated for accuracy, limitations, latency, failure behavior, and the surrounding software infrastructure.</p></article>
        <article><span aria-hidden="true">✦</span><h4>Complexity should become clarity.</h4><p>We aim to translate difficult technical requirements into understandable systems, clear decisions, and practical outcomes.</p></article>
      </div>
      <div className="ds-content-section-heading"><p className="ds-content-kicker">HOW WE APPROACH THE WORK</p><h3>From complex questions to engineered systems.</h3></div>
      <div className="ds-content-phases">
        <article><span>UNDERSTAND</span><h4>Define the problem.</h4><p>Clarify objectives, users, operating conditions, constraints, and risks.</p></article>
        <article><span>DESIGN</span><h4>Design architecture and security together.</h4><p>Establish components, integrations, data flows, interfaces, and validation criteria.</p></article>
        <article><span>ENGINEER</span><h4>Build and test deliberately.</h4><p>Develop through iterative implementation, integration, technical reviews, and feedback.</p></article>
        <article><span>VALIDATE & EVOLVE</span><h4>Evaluate real-world readiness.</h4><p>Assess against agreed requirements, document operation, and identify improvements.</p></article>
      </div>
    </section>
    <section className="ds-content-section ds-content-next" aria-labelledby="ds-next-heading">
      <div className="px4-section-bar"><span>[ EXPLORE FURTHER ]</span><span>// NEXT STEPS</span></div>
      <div className="ds-content-intro"><div><p className="ds-content-kicker">DISCOVER</p><h2 id="ds-next-heading">Explore the work.<br/><span>Start a conversation.</span></h2></div><p>Explore our projects and technical insights, or discuss the engineering and security challenges your organization is facing.</p></div>
      <div className="ds-content-links"><Link to="/projects">[ Projects ] →</Link><Link to="/#tech-news">[ Research & Tech News ] →</Link><Link to="/contact">[ Contact Us ] →</Link></div>
    </section>
  </div>;
}
