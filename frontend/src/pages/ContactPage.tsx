import { useState, type FormEvent, type ReactNode } from 'react';
import { PixelSocialIcon } from '../components/PixelSocialIcon';
import { brand } from '../content/brand';
import { submitContactInquiry } from '../lib/contactInquiries';

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
  const [submitting, setSubmitting] = useState(false);
  const [website, setWebsite] = useState('');

  const update = (field: keyof Inquiry, value: string) => {
    setForm(previous => ({ ...previous, [field]: value }));
    setNotice('');
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setNotice('');

    try {
      await submitContactInquiry({ ...form, website });
      setForm({ ...initialForm });
      setWebsite('');
      setNotice('Your inquiry has been submitted successfully. We will be in touch.');
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : 'Unable to submit your inquiry. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="ds-contact-page ds-contact-v2 ds-contact-reference-v18">
      <div className="ds-contact-v2-glow" aria-hidden="true" />

      <section className="ds-contact-v2-layout" data-signal-hero="">
        <div className="ds-contact-v2-intro">
          <p className="ds-contact-v2-eyebrow">
            [ DARK SYNAPSES / CONTACT ]
          </p>

          <h1>
            Contact <span>Us_</span>
          </h1>

          <p className="ds-contact-v2-lead">
            Let's build a more secure and intelligent digital world together. Tell us what you're building.
          </p>

          <div className="ds-contact-pixel-art" aria-hidden="true">
            <div className="ds-contact-pixel-monitor"><span>✉</span><small>TRANSMISSION READY_</small></div>
            <div className="ds-contact-pixel-signal">▣ &nbsp; ◇ &nbsp; ▣</div>
          </div>
          <div className="ds-contact-pixel-info">
            <a href={`mailto:${brand.email}`}><span className="ds-contact-icon"><Icon name="mail" /></span><span><strong>EMAIL</strong><small>{brand.email}</small></span></a>
            <a href={brand.whatsappUrl} target="_blank" rel="noopener noreferrer"><span className="ds-contact-icon"><Icon name="whatsapp" /></span><span><strong>WHATSAPP</strong><small>{brand.whatsapp}</small></span></a>
            <div><span className="ds-contact-icon"><Icon name="pin" /></span><span><strong>LOCATION</strong><small>Egypt · Remote worldwide</small></span></div>
          </div>
          <div className="ds-contact-social">
            <p>[ CONNECT ]</p>
            <div>{Object.entries(brand.social).map(([name, url]) => (
              <a key={name} href={url} target="_blank" rel="noopener noreferrer" aria-label={name}>
                <PixelSocialIcon name={name} />
              </a>
            ))}</div>
          </div>
        </div>

        <div className="ds-contact-v2-panel">
          <div className="ds-contact-v2-panel-heading">
            <div>
              <p className="ds-contact-v2-eyebrow">
                [ START A CONVERSATION ]
              </p>
              <h2>Start a conversation.</h2>
              <p>
                Complete the details below or contact us directly.
              </p>
            </div>

          </div>

          <form onSubmit={submit} className="ds-contact-v2-form">
            <div
              aria-hidden="true"
              style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}
            >
              <label htmlFor="contact-website">Leave this field empty</label>
              <input
                id="contact-website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={event => setWebsite(event.target.value)}
              />
            </div>
            <div className="ds-contact-v2-field-row">
              <label className="ds-field-name">
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

              <label className="ds-field-email">
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

            <label className="ds-field-company">
              Company / Organization
              <input
                maxLength={150}
                autoComplete="organization"
                placeholder="Optional"
                value={form.company}
                onChange={e => update('company', e.target.value)}
              />
            </label>

            <label className="ds-field-service">
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

            <label className="ds-field-message">
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

            <button type="submit" className="ds-contact-v2-submit" disabled={submitting}>
              <Icon name="send" /> {submitting ? 'SENDING...' : 'SUBMIT INQUIRY'}
            </button>

            <p className="ds-contact-v2-pending">
              We will review your inquiry and get back to you.
            </p>

            {notice && (
              <p className="ds-contact-v2-notice" role="status">
                {notice}
              </p>
            )}
          </form>


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

function Icon({name}: {name: 'mail'|'whatsapp'|'pin'|'send'}) {
  const paths: Record<typeof name, ReactNode> = {
    mail: <><rect x="3" y="5" width="18" height="14" rx="1"/><path d="m3 7 9 7 9-7"/></>,
    whatsapp: <><path d="M20.5 11.5a8.5 8.5 0 0 1-12.7 7.4L3 20l1.2-4.5A8.5 8.5 0 1 1 20.5 11.5Z"/><path d="M8 9c.5 3 3 5.5 6 6l2-1.5"/></>,
    pin: <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.4"/></>,
    send: <><path d="m21 3-7 18-3.5-7.5L3 10Z"/><path d="M21 3 10.5 13.5"/></>,
  };
  return <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
