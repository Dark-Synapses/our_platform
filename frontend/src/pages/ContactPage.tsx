import { useState, type FormEvent } from 'react';
import { brand } from '../content/brand';

const services = [
  'AI Services',
  'Cybersecurity Services',
  'AI Security',
  'AI-Powered Security Systems',
  'Digital Forensics & Content Authenticity',
  'Other / General Inquiry',
];

type Inquiry = {
  name: string;
  email: string;
  company: string;
  service: string;
  message: string;
};

const initialForm: Inquiry = {
  name: '',
  email: '',
  company: '',
  service: '',
  message: '',
};

export function ContactPage() {
  const [form, setForm] = useState<Inquiry>(initialForm);
  const [notice, setNotice] = useState('');

  const update = (field: keyof Inquiry, value: string) => {
    setForm(previous => ({ ...previous, [field]: value }));
    setNotice('');
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Backend integration pending.
    // Do not report success until the API confirms persistence.
    setNotice(
      'Online submissions are being prepared. ' +
      'Please contact us via WhatsApp or email below.'
    );
  };

  return (
    <main className="ds-contact-page ds-contact-v2">
      <div className="ds-contact-v2-glow" aria-hidden="true" />

      <section className="ds-contact-v2-layout">
        <div className="ds-contact-v2-intro">
          <p className="ds-contact-v2-eyebrow">
            DARK SYNAPSES / CONTACT
          </p>

          <h1>
            Let's build something
            <span> extraordinary.</span>
          </h1>

          <p className="ds-contact-v2-lead">
            Every great solution starts with a conversation.
            Tell us about your goals, challenges, and ideas.
            Our team is here to explore what's possible.
          </p>

          <div className="ds-contact-v2-highlights">
            <div>
              <span className="ds-contact-v2-highlight-icon">01</span>
              <div>
                <strong>Share your vision</strong>
                <p>Tell us what you're looking to build or solve.</p>
              </div>
            </div>

            <div>
              <span className="ds-contact-v2-highlight-icon">02</span>
              <div>
                <strong>Explore the possibilities</strong>
                <p>We'll discuss an approach suited to your needs.</p>
              </div>
            </div>

            <div>
              <span className="ds-contact-v2-highlight-icon">03</span>
              <div>
                <strong>Build with confidence</strong>
                <p>AI engineering with security at its core.</p>
              </div>
            </div>
          </div>

          <div className="ds-contact-v2-visual" aria-hidden="true">
            <div className="ds-contact-v2-orbit orbit-one" />
            <div className="ds-contact-v2-orbit orbit-two" />
            <div className="ds-contact-v2-core">
              <span>DS</span>
            </div>
            <span className="ds-contact-v2-visual-caption">
              WHERE INTELLIGENCE MEETS THREATS
            </span>
          </div>
        </div>

        <div className="ds-contact-v2-panel">
          <div className="ds-contact-v2-panel-heading">
            <div>
              <p className="ds-contact-v2-eyebrow">
                START A CONVERSATION
              </p>
              <h2>Tell us about your project.</h2>
              <p>
                Complete the details below or contact us directly.
              </p>
            </div>
            <span className="ds-contact-v2-panel-symbol"
                  aria-hidden="true">↗</span>
          </div>

          <form onSubmit={submit} className="ds-contact-v2-form">
            <div className="ds-contact-v2-field-row">
              <label>
                <span className="ds-contact-v2-label-text">Full name <em>*</em></span>
                <input
                  required
                  minLength={2}
                  maxLength={120}
                  autoComplete="name"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={e => update('name', e.target.value)}
                />
              </label>

              <label>
                <span className="ds-contact-v2-label-text">Email address <em>*</em></span>
                <input
                  required
                  type="email"
                  maxLength={254}
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => update('email', e.target.value)}
                />
              </label>
            </div>

            <label>
              Company / Organization
              <input
                maxLength={150}
                autoComplete="organization"
                placeholder="Optional"
                value={form.company}
                onChange={e => update('company', e.target.value)}
              />
            </label>

            <label>
              <span className="ds-contact-v2-label-text">Service of interest <em>*</em></span>
              <select
                required
                value={form.service}
                onChange={e => update('service', e.target.value)}
              >
                <option value="" disabled>
                  Select a service
                </option>
                {services.map(service => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="ds-contact-v2-label-text">Project details <em>*</em></span>
              <textarea
                required
                minLength={15}
                maxLength={5000}
                rows={5}
                placeholder="Tell us about your project, goals, or challenges..."
                value={form.message}
                onChange={e => update('message', e.target.value)}
              />
            </label>

            <p className="ds-contact-v2-form-note">
              Fields marked * are required.
            </p>

            <button type="submit" className="ds-contact-v2-submit">
              Submit inquiry
              <span aria-hidden="true">↗</span>
            </button>

            <p className="ds-contact-v2-pending">
              Online submissions are not available yet.
              You can reach us directly below.
            </p>

            {notice && (
              <p className="ds-contact-v2-notice" role="status">
                {notice}
              </p>
            )}
          </form>

          <div className="ds-contact-v2-direct">
            <div className="ds-contact-v2-divider">
              <span>OR REACH US DIRECTLY</span>
            </div>

            <div className="ds-contact-v2-direct-links">
              <a
                href={brand.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ds-contact-v2-direct-link"
              >
                <span className="ds-contact-v2-direct-icon"
                      aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="1.8"
                       strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.5 8.5 0 0 1-12.5 7.5L3 21l2-5.5A8.5 8.5 0 1 1 21 11.5Z"/>
                    <path d="M9 8.5c.3 2.8 2.7 5.2 5.5 5.5l1.4-1.4 1.5 1c-.3 1.7-1.5 2.4-3 2.2-4.5-.5-7.2-3.3-7.7-7.7-.2-1.5.5-2.7 2.2-3l1 1.5Z"/>
                  </svg>
                </span>
                <span>
                  <strong>WhatsApp</strong>
                  <small>{brand.whatsapp}</small>
                </span>
                <span className="ds-contact-v2-link-arrow"
                      aria-hidden="true">↗</span>
              </a>

              <a
                href={`mailto:${brand.email}?subject=${encodeURIComponent('Project Inquiry - Dark Synapses')}`}
                className="ds-contact-v2-direct-link"
              >
                <span className="ds-contact-v2-direct-icon"
                      aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="1.8"
                       strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="5" width="18" height="14" rx="2"/>
                    <path d="m3 7 9 6 9-6"/>
                  </svg>
                </span>
                <span>
                  <strong>Email us</strong>
                  <small>{brand.email}</small>
                </span>
                <span className="ds-contact-v2-link-arrow"
                      aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="ds-contact-v2-footer">
        <p>WHERE INTELLIGENCE MEETS THREATS</p>
        <span>
          Intelligent solutions. Security at every layer.
        </span>
      </section>
    </main>
  );
}
