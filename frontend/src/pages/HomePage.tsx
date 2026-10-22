import { Link } from 'react-router-dom';
import { deliverySteps, services } from '../content/site';

const serviceIcons = ['◈', '⬡', '◇', '✧'];

export function HomePage() {
  return (
    <div className="ds-home-v2">
      <section className="ds-hero-v2">
        <div className="ds-hero-grid" aria-hidden="true" />

        <div className="ds-hero-content">
          <p className="ds-eyebrow">
            AI ENGINEERING / CYBERSECURITY / INTELLIGENT DEFENSE
          </p>

          <h1>
            Intelligent<br />
            Systems.<br />
            <span>Secure by Design.</span>
          </h1>

          <p className="ds-hero-description">
            We design and build AI-powered solutions,
            cybersecurity services, and intelligent security
            systems that help businesses innovate with confidence.
          </p>

          <div className="ds-hero-actions">
            <Link className="ds-button-primary" to="/contact">
              Discuss Your Project <span aria-hidden="true">↗</span>
            </Link>

            <Link className="ds-button-secondary" to="/expertise">
              Explore Our Expertise <span aria-hidden="true">↗</span>
            </Link>
          </div>

          <div className="ds-hero-capabilities">
            <span>AI Solutions</span>
            <span>Cybersecurity</span>
            <span>AI-Powered Security</span>
          </div>
        </div>

        <div className="ds-hero-visual" aria-hidden="true">
          <div className="ds-visual-image" />
          <div className="ds-visual-overlay" />
          <div className="ds-floating-label ds-label-top">
            <span className="ds-status-dot" />
            INTELLIGENT DEFENSE
          </div>
          <div className="ds-floating-label ds-label-bottom">
            AI × SECURITY
          </div>
        </div>
      </section>

      <section className="ds-expertise-v2">
        <div className="ds-section-top">
          <div>
            <p className="ds-eyebrow">OUR EXPERTISE</p>
            <h2>
              Comprehensive Solutions<br />
              for a <span>Safer, Smarter Future.</span>
            </h2>
          </div>

          <p className="ds-section-description">
            We combine artificial intelligence, cybersecurity
            expertise, and engineering knowledge to deliver
            solutions that solve real-world challenges.
          </p>
        </div>

        <div className="ds-service-grid">
          {services.map((service, index) => (
            <Link
              className="ds-service-card"
              key={service.id}
              to={`/expertise#${service.id}`}
            >
              <span className="ds-service-icon" aria-hidden="true">
                {serviceIcons[index % serviceIcons.length]}
              </span>

              <span className="ds-service-number">
                0{index + 1}
              </span>

              <h3>{service.title}</h3>
              <p>{service.description}</p>

              <span className="ds-card-link">
                Learn More <span aria-hidden="true">↗</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="ds-approach-v2" id="approach">
        <div className="ds-approach-heading">
          <p className="ds-eyebrow">OUR APPROACH</p>
          <h2>
            From Insight<br />
            <span>to Impact.</span>
          </h2>
          <p>
            A structured, collaborative approach to building
            secure, scalable, and effective solutions.
          </p>
          <Link to="/about" className="ds-button-secondary">
            About Our Approach ↗
          </Link>
        </div>

        <div className="ds-steps-grid">
          {deliverySteps.map((step, index) => (
            <article className="ds-step-card" key={step.title}>
              <span className="ds-step-index">
                0{index + 1}
              </span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="ds-final-cta">
        <div>
          <p className="ds-eyebrow">LET'S BUILD TOGETHER</p>
          <h2>
            Turn your ideas into secure,
            <span> intelligent solutions.</span>
          </h2>
        </div>

        <div className="ds-final-cta-action">
          <p>
            Whether you're developing an AI-powered solution,
            strengthening your security, or exploring a custom
            project, we're here to help.
          </p>

          <Link to="/contact" className="ds-button-primary">
            Get in Touch ↗
          </Link>
        </div>
      </section>
    </div>
  );
}
