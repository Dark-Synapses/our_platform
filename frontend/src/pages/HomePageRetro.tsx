import { Link } from 'react-router-dom';
import { services, deliverySteps } from '../content/site';

const expertiseIcons = ['◈', '⬡', '▱', '⌕', '✳'];

export function HomePageRetro() {
  return (
    <div className="ds-pixel-home">

      <section className="pixel-hero">
        <div className="pixel-container pixel-hero-grid">

          <div className="pixel-hero-copy">
            <p className="pixel-kicker">
              <span>&gt;</span> INITIALIZING_
            </p>

            <h1 className="pixel-title">
              DARK
              <br />
              SYNAPSES<span>_</span>
            </h1>

            <h2 className="pixel-tagline">
              Where Intelligence
              <br />
              Meets Threats.
            </h2>

            <p className="pixel-description">
              We engineer AI-powered systems and secure
              the technologies that power tomorrow.
            </p>

            <div className="pixel-actions">
              <Link className="pixel-button pixel-button-primary" to="/services">
                [ Explore Our Expertise ]
              </Link>

              <Link className="pixel-button pixel-button-outline" to="/projects">
                [ View Projects ]
              </Link>
            </div>

            <div className="pixel-status" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>

          <div className="pixel-hero-art" aria-hidden="true">
            <span className="pixel-art-corner pixel-art-tl" />
            <span className="pixel-art-corner pixel-art-tr" />
            <span className="pixel-art-corner pixel-art-bl" />
            <span className="pixel-art-corner pixel-art-br" />
            <img
              src="/images/v3/landscape.png"
              alt=""
            />
          </div>
        </div>
      </section>

      <section className="pixel-expertise" id="expertise">
        <div className="pixel-container">

          <div className="pixel-section-bar">
            <span>[ CORE EXPERTISE ]</span>
            <span>// {String(services.length).padStart(2, '0')} AREAS</span>
          </div>

          <div className="pixel-expertise-grid">
            {services.map((service, index) => (
              <Link
                className="pixel-expertise-card"
                to={service.path}
                key={service.id}
              >
                <span className="pixel-service-icon" aria-hidden="true">
                  {expertiseIcons[index % expertiseIcons.length]}
                </span>

                <h3>{service.title}_</h3>
                <p>{service.description}</p>
                <span className="pixel-card-link" aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="pixel-process">
        <div className="pixel-container">
          <div className="pixel-section-bar">
            <span>[ HOW WE WORK ]</span>
            <span>// PROCESS</span>
          </div>

          <div className="pixel-process-grid">
            {deliverySteps.map((step, index) => (
              <article className="pixel-process-item" key={step.title}>
                <span>[ {String(index + 1).padStart(2, '0')} ]</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="pixel-cta">
        <div className="pixel-container pixel-cta-inner">
          <div>
            <p className="pixel-kicker">&gt; READY TO BUILD_</p>
            <h2>Intelligence meets security.</h2>
            <p>Let's build something secure and intelligent together.</p>
          </div>
          <Link to="/contact" className="pixel-button pixel-button-primary">
            [ Get in Touch ]
          </Link>
        </div>
      </section>

    </div>
  );
}
