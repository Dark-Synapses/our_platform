import { Link } from 'react-router-dom';
import './AIServicePage.css';

const challengeCards = [
  { title: 'Automate operations', image: '/images/ai-service/challenge-automate.jpg' },
  { title: 'Unlock insights', image: '/images/ai-service/challenge-insights.jpg' },
  { title: 'Create new possibilities', image: '/images/ai-service/challenge-possibilities.jpg' },
];

const projectCards = [
  { title: 'Virtual Try-On Platform', image: '/images/ai-service/project-vto.jpg' },
  { title: 'AI-Powered Assistant', image: '/images/ai-service/project-assistant.jpg' },
  { title: 'Intelligent Automation', image: '/images/ai-service/project-automation.jpg' },
];

const solutions = [
  {
    title: 'Custom AI Systems & Agents',
    detail: 'Custom AI applications, agents, orchestration, and integrations built around your requirements.',
    symbol: 'nodes',
  },
  {
    title: 'Intelligent Data Solutions',
    detail: 'Knowledge systems, information extraction, retrieval, and intelligent data processing.',
    symbol: 'data',
  },
  {
    title: 'Vision, Voice & Multimodal AI',
    detail: 'Visual, conversational, speech, document, and multimodal AI systems.',
    symbol: 'vision',
  },
  {
    title: 'AI Automation & Integration',
    detail: 'Purpose-built automation, intelligent workflows, and AI-powered software integration.',
    symbol: 'brain',
  },
] as const;

function SolutionIcon({ type }: { type: typeof solutions[number]['symbol'] }) {
  if (type === 'nodes') return <svg viewBox="0 0 48 48" aria-hidden="true"><rect x="8" y="9" width="11" height="11" rx="3"/><rect x="29" y="9" width="11" height="11" rx="3"/><rect x="19" y="29" width="11" height="11" rx="3"/><path d="M19 14h10M13 20v8l11 1M35 20v8l-6 1"/></svg>;
  if (type === 'data') return <svg viewBox="0 0 48 48" aria-hidden="true"><ellipse cx="24" cy="12" rx="14" ry="6"/><path d="M10 12v12c0 3 6 6 14 6s14-3 14-6V12M10 24v11c0 3 6 6 14 6s14-3 14-6V24M10 19c0 3 6 6 14 6s14-3 14-6"/></svg>;
  if (type === 'vision') return <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M4 24S12 12 24 12s20 12 20 12-8 12-20 12S4 24 4 24Z"/><circle cx="24" cy="24" r="7"/><circle cx="24" cy="24" r="2"/></svg>;
  return <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 7c-4-5-13-2-13 5-7 1-8 11-2 14-3 8 4 14 11 11l4 4 4-4c7 3 14-3 11-11 6-3 5-13-2-14 0-7-9-10-13-5Z"/><path d="M24 8v32M16 14l4 5-5 5 5 5-4 5M32 14l-4 5 5 5-5 5 4 5"/></svg>;
}

export function AIServicePage() {
  return (
    <main className="ds-ai-ref">
      <section className="ds-ai-ref-hero">
        <div className="ds-ai-ref-portal" aria-hidden="true" />
        <div className="ds-ai-ref-container ds-ai-ref-hero-inner">
          <div className="ds-ai-ref-crumb"><Link to="/services">Services</Link><span>/</span><span>AI Services</span></div>
          <div className="ds-ai-ref-hero-copy">
            <h1>AI <span>Services</span></h1>
            <h2>From complex challenges<br/>to intelligent solutions.</h2>
            <p>We design and develop custom AI-powered systems that solve real business problems — across text, voice, vision, and multimodal applications. From intelligent automation to advanced AI software, we turn your ideas into secure, scalable, and production-ready solutions.</p>
            <div className="ds-ai-ref-actions">
              <Link className="ds-ai-ref-button ds-ai-ref-primary" to="/contact?service=ai">Request this service <span aria-hidden="true">→</span></Link>
              <a className="ds-ai-ref-button ds-ai-ref-secondary" href="#ai-capabilities">Explore capabilities ↓</a>
            </div>
          </div>
          <div className="ds-ai-ref-portal-words" aria-hidden="true">Ideas<br/>Intelligence<br/>Impact</div>
        </div>
      </section>

      <section className="ds-ai-ref-section ds-ai-ref-container" aria-labelledby="ds-ai-challenge">
        <div className="ds-ai-ref-challenge-head">
          <div>
            <p className="ds-ai-ref-eyebrow">CHALLENGE</p>
            <h2 id="ds-ai-challenge">Complex problems.<br/>Greater possibilities.</h2>
          </div>
          <p>From data overload to manual processes,<br/>we help you turn challenges into opportunities<br/>with intelligent AI solutions.</p>
        </div>
        <div className="ds-ai-ref-three">
          {challengeCards.map(card => (
            <a className="ds-ai-ref-image-card" key={card.title} href="#ai-capabilities" aria-label={card.title}>
              <img src={card.image} alt={`${card.title} — original approved design artwork`} loading="lazy" />
            </a>
          ))}
        </div>
      </section>

      <section className="ds-ai-ref-section ds-ai-ref-solutions ds-ai-ref-container" id="ai-capabilities" aria-labelledby="ds-ai-solutions">
        <p className="ds-ai-ref-eyebrow">OUR SOLUTIONS</p>
        <h2 id="ds-ai-solutions">Powerful AI capabilities.<br/>Real business value.</h2>
        <div className="ds-ai-ref-four">
          {solutions.map(solution => (
            <details className="ds-ai-ref-solution" key={solution.title}>
              <summary>
                <span className="ds-ai-ref-icon"><SolutionIcon type={solution.symbol} /></span>
                <span className="ds-ai-ref-solution-name">{solution.title}</span>
                <span className="ds-ai-ref-solution-arrow" aria-hidden="true">→</span>
              </summary>
              <p>{solution.detail}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="ds-ai-ref-section ds-ai-ref-impact ds-ai-ref-container" aria-labelledby="ds-ai-impact">
        <div className="ds-ai-ref-impact-head">
          <div>
            <p className="ds-ai-ref-eyebrow">REAL-WORLD IMPACT</p>
            <h2 id="ds-ai-impact">Turning AI into results.</h2>
          </div>
          <Link to="/projects">View all projects →</Link>
        </div>
        <div className="ds-ai-ref-three ds-ai-ref-project-grid">
          {projectCards.map(card => (
            <Link className="ds-ai-ref-image-card" key={card.title} to="/projects" aria-label={card.title}>
              <img src={card.image} alt={`${card.title} — approved design illustration`} loading="lazy"/>
            </Link>
          ))}
        </div>
      </section>

      <section className="ds-ai-ref-container ds-ai-ref-cta-wrap">
        <div className="ds-ai-ref-cta">
          <div>
            <p className="ds-ai-ref-eyebrow">LET'S BUILD TOGETHER</p>
            <h2>Have a project<br/>in mind?</h2>
          </div>
          <div>
            <p>Tell us about your goals, and we'll help you design the right AI solution.</p>
            <Link className="ds-ai-ref-button ds-ai-ref-primary" to="/contact?service=ai">Get in touch <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
