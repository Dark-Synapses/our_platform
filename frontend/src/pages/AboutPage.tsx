import { Link } from 'react-router-dom';
import { HeroSignal } from '../components/HeroSignal';
import '../styles/about-premium.css';

const principles = [
  { title: 'Architecture before acceleration.', body: 'Speed matters, but speed without structure creates complexity that eventually slows everything down. We favor clear system boundaries, deliberate technology choices, maintainable components, and architectures that reflect the real requirements of the problem.' },
  { title: 'Security is a design decision.', body: 'Security should not arrive as a final checklist. It influences how systems authenticate users, manage permissions, process information, communicate between components, and respond to failure. We consider these questions throughout the engineering lifecycle.' },
  { title: 'Intelligence requires evaluation.', body: 'An AI demonstration is not the same as a dependable AI system. Models and agents must be evaluated against their intended use, including accuracy, limitations, latency, failure behavior, and the surrounding software infrastructure.' },
  { title: 'Complexity should become clarity.', body: 'Sophisticated technology does not need to produce complicated experiences. We aim to translate difficult technical requirements into understandable systems, clear decisions, and practical outcomes.' },
];

const approach = [
  { phase: 'Understand', title: 'Define the problem before selecting the technology.', body: 'Clarify objectives, users, operating conditions, constraints, and risks.' },
  { phase: 'Design', title: 'Make architecture and security part of the same decision.', body: 'Establish components, integrations, data flows, interfaces, and validation criteria.' },
  { phase: 'Engineer', title: 'Build deliberately, test continuously, and make progress visible.', body: 'Develop the system through iterative implementation, integration, technical reviews, and feedback.' },
  { phase: 'Validate & evolve', title: 'Treat deployment as a transition into real-world responsibility.', body: 'Assess the solution against agreed requirements, document its operation, and identify opportunities for improvement.' },
];

export function AboutPage() {
  return (
    <main className="ds-about-v3" id="about-top">
      <section className="ds-a-hero" data-signal-hero="" aria-labelledby="ds-about-title">
        <HeroSignal />
        <div className="ds-a-container ds-a-hero-content">
          <p className="ds-a-kicker">ABOUT DARK SYNAPSES <span aria-hidden="true">/</span> OUR PERSPECTIVE</p>
          <h1 id="ds-about-title">Intelligence changes <em>what's possible.</em><br /><span>Security determines what lasts.</span></h1>
          <div className="ds-a-hero-bottom">
            <div className="ds-a-hero-copy">
              <p>Dark Synapses is a technology engineering company working at the intersection of artificial intelligence, cybersecurity, and modern software systems.</p>
              <p>We approach intelligent technology and digital security as connected engineering challenges — designing systems that are not only capable of doing more, but built with the discipline to operate responsibly in the real world.</p>
            </div>
            <a href="#our-perspective" className="ds-a-button" data-public-cta="secondary">Explore our thinking</a>
          </div>
          <div className="ds-a-scroll-cue" aria-hidden="true"><span /> SCROLL TO DISCOVER</div>
        </div>
      </section>

      <section className="ds-a-section ds-a-perspective" id="our-perspective" aria-labelledby="ds-a-perspective-title">
        <div className="ds-a-container ds-a-split">
          <div className="ds-a-section-aside"><span className="ds-a-label">OUR PERSPECTIVE</span><span className="ds-a-aside-rule" /></div>
          <div className="ds-a-section-body">
            <h2 id="ds-a-perspective-title">Technology is becoming more intelligent. <span>The responsibility to engineer it well is becoming greater.</span></h2>
            <div className="ds-a-reading">
              <p>Artificial intelligence is changing how software understands information, makes decisions, and interacts with the world. At the same time, increasingly connected systems introduce new security challenges, operational dependencies, and forms of risk.</p>
              <p>These developments cannot be addressed independently.</p>
              <p>An intelligent system without security can become a liability. A secure system without thoughtful engineering can become difficult to maintain, adapt, or scale. And technology built without understanding its operational context may never deliver its intended value.</p>
              <p className="ds-a-emphasis">Dark Synapses was formed around a conviction: intelligence, engineering, and security belong in the same conversation from the beginning.</p>
              <p>That conviction shapes how we approach technology, how we evaluate problems, and what we believe responsible innovation should look like.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="ds-a-statement" aria-labelledby="ds-a-statement-title">
        <div className="ds-a-container">
          <p className="ds-a-label">OUR FOUNDATIONAL BELIEF</p>
          <h2 id="ds-a-statement-title">The most valuable technology is not simply the most advanced. <span>It is the technology people can depend on.</span></h2>
          <p>Capability creates opportunity. Architecture creates stability. Security creates confidence. Together, they turn technical potential into systems designed for sustained use.</p>
        </div>
      </section>

      <section className="ds-a-section ds-a-principles" aria-labelledby="ds-a-principles-title">
        <div className="ds-a-container">
          <div className="ds-a-heading-line"><p className="ds-a-label">OUR ENGINEERING PHILOSOPHY</p><h2 id="ds-a-principles-title">How we think <span>about engineering.</span></h2></div>
          <div className="ds-a-principles-list">
            {principles.map((item) => (
              <article className="ds-a-principle" key={item.title}>
                <h3>{item.title}</h3><p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ds-a-section ds-a-approach" aria-labelledby="ds-a-approach-title">
        <div className="ds-a-container ds-a-split">
          <div className="ds-a-section-aside"><span className="ds-a-label">HOW WE APPROACH THE WORK</span><span className="ds-a-aside-rule" /></div>
          <div className="ds-a-section-body">
            <h2 id="ds-a-approach-title">From complex questions <span>to engineered systems.</span></h2>
            <div className="ds-a-reading ds-a-approach-intro">
              <p>Every meaningful technology initiative begins with questions, not tools.</p>
              <p>What problem are we solving? What must the system accomplish? Where could it fail? What constraints will shape its architecture? And how will we know whether the result is ready for real-world use?</p>
              <p>Our approach connects these questions across the project lifecycle.</p>
            </div>
            <div className="ds-a-phases">
              {approach.map((item) => (
                <article className="ds-a-phase" key={item.phase}>
                  <p className="ds-a-phase-name">{item.phase}</p>
                  <div><h3>{item.title}</h3><p>{item.body}</p></div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="ds-a-section ds-a-responsibility" aria-labelledby="ds-a-responsibility-title">
        <div className="ds-a-container ds-a-split">
          <div className="ds-a-section-aside"><span className="ds-a-label">TRUST & RESPONSIBILITY</span><span className="ds-a-aside-rule" /></div>
          <div className="ds-a-section-body">
            <h2 id="ds-a-responsibility-title">Trust is earned through <span>engineering decisions.</span></h2>
            <div className="ds-a-reading">
              <p>As intelligent systems become more capable, the consequences of poor technical decisions become more significant.</p>
              <p>Reliability, access control, data handling, model behavior, observability, and recovery are not isolated concerns. They are interconnected aspects of a system's ability to operate safely and predictably.</p>
              <p>At Dark Synapses, we believe responsible engineering requires acknowledging limitations, communicating trade-offs, validating assumptions, and treating security and quality as ongoing considerations.</p>
              <p className="ds-a-emphasis">We do not view trust as a feature that can simply be added. It is an outcome of how a system is conceived, built, evaluated, and maintained.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="ds-a-future" aria-labelledby="ds-a-future-title">
        <div className="ds-a-container">
          <p className="ds-a-label">OUR DIRECTION</p>
          <h2 id="ds-a-future-title">Building toward a future where <span>intelligence and security advance together.</span></h2>
          <div className="ds-a-future-copy">
            <p>Our ambition is to contribute to a generation of digital systems in which advanced intelligence, sound engineering, and cybersecurity reinforce one another rather than compete for priority.</p>
            <p>We see opportunities to bring this thinking into increasingly autonomous software, AI-driven workflows, security engineering, and the infrastructure that connects them.</p>
            <p>As Dark Synapses grows, our direction remains centered on a simple idea: progress should expand what technology can achieve without compromising the foundations that make it dependable.</p>
          </div>
        </div>
      </section>

      <section className="ds-a-cta" aria-labelledby="ds-a-cta-title">
        <div className="ds-a-container ds-a-cta-layout">
          <div><p className="ds-a-label">START A CONVERSATION</p><h2 id="ds-a-cta-title">Complex challenges deserve <span>thoughtful engineering.</span></h2><p>Whether you're exploring an intelligent software initiative, rethinking an existing system, or addressing a security challenge, meaningful progress begins with understanding the problem.</p></div>
          <Link to="/contact" className="ds-a-button ds-a-button-primary" data-public-cta="primary">Discuss a Project</Link>
        </div>
      </section>
    </main>
  );
}
