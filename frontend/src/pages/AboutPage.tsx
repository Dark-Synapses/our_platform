import { UiIcon } from '../components/UiIcons';
import { Link } from 'react-router-dom';
import '../styles/about-premium.css';

const values = [
  { number: '01', icon: 'engineering', title: 'Engineering Excellence', description: 'We prioritize reliable architectures, maintainable systems, and thoughtful technical execution.' },
  { number: '02', icon: 'security', title: 'Security First', description: 'Security is considered throughout the design, development, and deployment lifecycle.' },
  { number: '03', icon: 'innovation', title: 'Practical Innovation', description: 'We focus on solutions that address real business challenges and create measurable value.' },
];

const team = [
  { name: 'Youanes Zaki', role: 'Cybersecurity', image: '/images/team-youanes.jpg', linkedin: 'https://www.linkedin.com/in/youanesssafwat', description: 'Offensive Security · Bug Bounty · CTF · AI Security' },
  { name: 'Mirna Botros', role: 'AI Software Engineering', image: '/images/team-mirna.jpg', linkedin: 'https://www.linkedin.com/in/mirna-nageh-botros', description: 'Generative AI · Computer Vision · AI Agents · AI Security' },
];

export function AboutPage() {
  return (
    <main className="ds-about-premium">
      <section className="ds-about-intro" aria-labelledby="ds-about-title">
        <div className="ds-about-wrap">
          <p className="ds-about-eyebrow">ABOUT DARK SYNAPSES</p>
          <h1 id="ds-about-title"> Engineered for intelligence.<span>Secured by architecture.</span></h1>
          <p className="ds-about-lead">Dark Synapses specializes in AI software solutions, cybersecurity services, and AI-powered security systems. We combine AI engineering with security-focused development to help businesses automate workflows, protect digital assets, and deliver reliable technology.</p>
          <div className="ds-about-values">
            {values.map(value => (
              <article className="ds-about-value" key={value.number}>
                <div className="ds-about-value-top"><span>{value.number}</span><span className="ds-about-value-icon" aria-hidden="true"><UiIcon name={value.icon as 'engineering' | 'security' | 'innovation'} size={27} /></span></div>
                <h2>{value.title}</h2><p>{value.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ds-about-team" id="team" aria-labelledby="ds-team-heading">
        <div className="ds-about-wrap ds-about-team-layout">
          <div className="ds-about-team-copy">
            <p className="ds-about-eyebrow">OUR TEAM</p>
            <h2 id="ds-team-heading">The minds behind <span>Dark Synapses.</span></h2>
            <p>AI software engineering and cybersecurity expertise, working together to develop practical AI services and security-focused solutions.</p>
            <a className="ds-about-outline-button" href="#team-members">Meet Our Team <span aria-hidden="true"><UiIcon name="arrow" /></span></a>
          </div>
          <div className="ds-about-team-grid" id="team-members">
            {team.map(person => (
              <article className="ds-about-person" key={person.name}>
                <div className="ds-about-person-image"><img src={person.image} alt={person.name} loading="lazy" /></div>
                <div className="ds-about-person-body">
                  <h3>{person.name}</h3><p className="ds-about-person-role">{person.role}</p>
                  <p>{person.description}</p>
                  <a href={person.linkedin} target="_blank" rel="noopener noreferrer"><UiIcon name="linkedin" size={17} /><span>LinkedIn</span><UiIcon name="arrow" size={15} /></a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ds-about-focus" aria-labelledby="ds-focus-heading">
        <div className="ds-about-wrap">
          <p className="ds-about-eyebrow">WHAT DRIVES US</p>
          <h2 id="ds-focus-heading">Turning complex challenges <span>into real-world solutions.</span></h2>
          <div className="ds-about-focus-grid">
            <div><strong>AI Engineering</strong><p>AI software development, AI services, and automation</p></div>
            <div><strong>Cybersecurity</strong><p>Security-focused thinking and implementation</p></div>
            <div><strong>AI Security</strong><p>Secure AI solutions</p></div>
            <div><strong>Collaboration</strong><p>Clear communication and iterative delivery</p></div>
          </div>
        </div>
      </section>

      <section className="ds-about-collaboration" id="collaboration" aria-labelledby="ds-collaboration-title">
        <div className="ds-about-wrap">
          <p className="ds-about-eyebrow">HOW WE COLLABORATE</p>
          <h2 id="ds-collaboration-title">Built together. <span>Delivered with clarity.</span></h2>
          <p className="ds-about-collaboration-lead">We work in clear, iterative stages, combining Agile principles, sprint-based delivery, and regular feedback to keep your project aligned with its goals.</p>
          <div className="ds-about-collaboration-grid">
            {[
              { number: '01', title: 'Discover', description: 'Understand your goals, requirements, constraints, and security needs.' },
              { number: '02', title: 'Plan the Sprints', description: 'Agree on scope, priorities, milestones, and review checkpoints.' },
              { number: '03', title: 'Build & Review', description: 'Develop, test, demonstrate progress, and refine through feedback.' },
              { number: '04', title: 'Deliver & Support', description: 'Handover the agreed solution with documentation and post-launch support.' },
            ].map(step => (
              <article className="ds-about-collaboration-step" key={step.number}>
                <span className="ds-about-collaboration-index">{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ds-about-maintenance" aria-labelledby="ds-maintenance-title">
        <div className="ds-about-wrap">
          <div className="ds-about-maintenance-card">
            <div className="ds-about-maintenance-copy">
              <p className="ds-about-eyebrow">POST-LAUNCH SUPPORT</p>
              <h2 id="ds-maintenance-title">Your launch is <span>just the beginning.</span></h2>
              <p>Eligible software development projects include one month of complimentary maintenance after handover, helping you address issues as your solution moves into real-world use.</p>
              <p className="ds-about-maintenance-note">Includes agreed bug fixes and technical support within the delivered scope. New features, third-party fees, hosting, and work outside the agreed scope are excluded unless specified in your project agreement.</p>
            </div>
            <div className="ds-about-maintenance-highlight" aria-label="30 days complimentary maintenance">
              <strong>30</strong>
              <span>DAYS</span>
              <p>Complimentary<br />Maintenance</p>
            </div>
          </div>
        </div>
      </section>

      <section className="ds-about-cta" aria-labelledby="ds-about-cta-title">
        <div className="ds-about-wrap">
          <p className="ds-about-eyebrow">LET'S BUILD TOGETHER</p>
          <h2 id="ds-about-cta-title">Ready to build <span>AI-powered, secure solutions?</span></h2>
          <p>Let's discuss your project, your challenges, and how we can work together.</p>
          <Link to="/contact" className="ds-about-outline-button">Get in Touch <span aria-hidden="true"><UiIcon name="arrow" /></span></Link>
        </div>
      </section>
    </main>
  );
}
