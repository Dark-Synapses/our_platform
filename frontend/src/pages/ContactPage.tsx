
export function ContactPage() {
  return (
    <div className="ds-contact-page">
      <section className="ds-contact-hero">
        <div className="ds-contact-intro">
          <p className="ds-eyebrow">
            DARK SYNAPSES / CONTACT
          </p>

          <h1>
            Let's build something
            <span> extraordinary.</span>
          </h1>

          <p className="ds-contact-description">
            Whether you're exploring an AI-powered solution,
            strengthening your cybersecurity, or planning
            an intelligent security system, we'd love to
            hear about your project.
          </p>

          <div className="ds-contact-tags">
            <span>AI Engineering</span>
            <span>Cybersecurity</span>
            <span>Intelligent Defense</span>
          </div>
        </div>

        <div className="ds-contact-options">
          <a
            className="ds-contact-option"
            href="https://wa.me/201014579056"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="ds-contact-option-icon">↗</span>
            <span className="ds-contact-option-label">
              DIRECT CONVERSATION
            </span>
            <h2>WhatsApp</h2>
            <p>
              Start a conversation with our team about
              your ideas and requirements.
            </p>
            <strong>+20 101 457 9056 ↗</strong>
          </a>

          <a
            className="ds-contact-option"
            href="mailto:darksynapses@darksynapses.site?subject=Project%20Inquiry%20-%20Dark%20Synapses"
          >
            <span className="ds-contact-option-icon">✉</span>
            <span className="ds-contact-option-label">
              PROJECT INQUIRIES
            </span>
            <h2>Email Us</h2>
            <p>
              Share your project scope, questions,
              or collaboration opportunities.
            </p>
            <strong>
              darksynapses@darksynapses.site ↗
            </strong>
          </a>
        </div>
      </section>

      <section className="ds-contact-closing">
        <span className="ds-eyebrow">
          WHERE INTELLIGENCE MEETS THREATS
        </span>
        <p>
          Building intelligent solutions with
          security at their core.
        </p>
      </section>
    </div>
  );
}
