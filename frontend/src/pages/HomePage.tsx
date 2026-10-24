import { UiIcon } from '../components/UiIcons';

import { Link } from 'react-router-dom';

import { ServicesSection } from '../components/ServicesSection';
import { deliverySteps } from '../content/site';

export function HomePage() {
  return (
    <div className="ds-home-v2">
      {/* HERO SECTION */}
      <section className="ds-hero-v3">
        <div className="ds-hero-v3-inner">
          <div className="ds-hero-v3-copy">
            <p className="ds-eyebrow">
              AI ENGINEERING / CYBERSECURITY / AI SECURITY / AI-Powered Security
            </p>

            <h1>
              Where Intelligence
              <span> Meets Threats</span>
            </h1>

            <p className="ds-hero-description">
              Architecting the future of intelligent defense where artificial intelligence meets next generation cybersecurity to power secure, autonomous ecosystems.
            </p>

            <div className="ds-hero-actions">
              <Link className="ds-button-primary" to="/contact">
                Discuss Your Project <UiIcon name="arrow" />
              </Link>

              <Link className="ds-button-secondary" to="/services">
                Explore Our Services <UiIcon name="arrow" />
              </Link>
            </div>

            <div className="ds-hero-v3-capabilities">
              <span>AI Solutions</span>
              <span>Cybersecurity</span>
              <span>Intelligent Defense</span>
            </div>
          </div>

          <div className="ds-hero-v3-visual" aria-hidden="true">
            <div className="ds-globe-halo" />

            <img
              className="ds-globe"
              src="/images/hero-cyber.png"
              alt=""
            />

            <div className="ds-tech-panel ds-panel-threat">
              <small>THREAT INTELLIGENCE</small>

              <div className="ds-panel-bars">
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
              </div>

              <span>Security insights</span>
            </div>

            <div className="ds-tech-panel ds-panel-security">
              <small>SYSTEM PROTECTION</small>
              <strong>◇ Protected</strong>
              <span>Detect · Analyze · Respond</span>
            </div>

            <div className="ds-tech-panel ds-panel-ai">
              <small>AI ANALYSIS</small>
              <strong>Intelligent Monitoring</strong>
              <span>AI × Cybersecurity</span>
            </div>
          </div>
        </div>
      </section>

      {/* OUR EXPERTISE */}
      <ServicesSection />

      {/* OUR APPROACH — PREMIUM TIMELINE */}
      <section
        className="ds-approach-v2"
        id="approach"
        aria-labelledby="approach-heading"
      >
        <div className="ds-approach-container">
          <div className="ds-approach-heading">
            <p className="ds-eyebrow">OUR APPROACH</p>

            <h2 id="approach-heading">
              From Insight
              <span> to Impact.</span>
            </h2>

            <p>
              A structured, collaborative approach to building
              secure, scalable, and effective solutions.
            </p>

            <Link
              to="/about"
              className="ds-button-secondary"
            >
              About Our Approach <UiIcon name="arrow" />
            </Link>
          </div>

          <div
            className="ds-steps-grid"
            aria-label="Our delivery process"
          >
            {deliverySteps.map((step, index) => (
              <article
                className="ds-step-card"
                key={step.title}
              >
                <div className="ds-step-top">
                  <span className="ds-step-index">
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <span
                    className="ds-step-marker"
                    aria-hidden="true"
                  >
                    <span />
                  </span>
                </div>

                <div className="ds-step-content">
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="ds-final-cta">
        <div>
          <p className="ds-eyebrow">
            LET&apos;S BUILD TOGETHER
          </p>

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

          <Link
            to="/contact"
            className="ds-button-primary"
          >
            Get in Touch <UiIcon name="arrow" />
          </Link>
        </div>
      </section>
    </div>
  );
}
