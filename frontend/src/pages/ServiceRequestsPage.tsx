import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { getCurrentUser } from '../lib/auth';
import {
  createServiceRequest,
  getServiceRequests,
  type ServiceRequest,
  type ServiceType,
} from '../lib/serviceRequests';

const services: { value: ServiceType; label: string }[] = [
  { value: 'ai_services', label: 'AI Services' },
  { value: 'cybersecurity', label: 'Cybersecurity' },
  { value: 'ai_security', label: 'AI Security' },
  { value: 'ai_powered_security', label: 'AI-Powered Security Systems' },
];

export default function ServiceRequestsPage() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [serviceType, setServiceType] = useState<ServiceType>('ai_services');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const user = await getCurrentUser();

        if (user.role !== 'client') {
          navigate('/login', { replace: true });
          return;
        }

        const data = await getServiceRequests();
        if (active) setRequests(data);
      } catch {
        if (active) setError('Unable to load your requests. Please sign in again if your session expired.');
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => { active = false; };
  }, [navigate]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const created = await createServiceRequest({
        service_type: serviceType,
        title,
        description,
      });

      setRequests((previous) => [created, ...previous]);
      setTitle('');
      setDescription('');
      setSuccess('Your request has been submitted successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="dashboard-page">
      <Link to="/dashboard" className="portal-back">← Back to dashboard</Link>

      <span className="auth-eyebrow">DARK SYNAPSES / CLIENT PORTAL</span>
      <h1>Service Requests</h1>
      <p>Tell us what you're building. Our team will review your request.</p>

      <div className="request-layout">
        <section className="dashboard-card">
          <h2>New request</h2>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label htmlFor="service-type">Service</label>
            <select
              id="service-type"
              value={serviceType}
              onChange={(event) =>
                setServiceType(event.target.value as ServiceType)
              }
            >
              {services.map((service) => (
                <option key={service.value} value={service.value}>
                  {service.label}
                </option>
              ))}
            </select>

            <label htmlFor="request-title">Project title</label>
            <input
              id="request-title"
              required
              minLength={5}
              maxLength={150}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />

            <label htmlFor="request-description">Project description</label>
            <textarea
              id="request-description"
              required
              minLength={20}
              maxLength={5000}
              rows={6}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />

            {error && <p role="alert" className="auth-error">{error}</p>}
            {success && <p role="status">{success}</p>}

            <button type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit request'}
            </button>
          </form>
        </section>

        <section className="dashboard-card">
          <h2>My requests</h2>

          {loading ? (
            <p>Loading requests...</p>
          ) : requests.length === 0 ? (
            <p>No requests yet. Submit your first request to get started.</p>
          ) : (
            <div className="request-list">
              {requests.map((item) => (
                <article key={item.id} className="request-item">
                  <span>{item.status.replace('_', ' ')}</span>
                  <h3>{item.title}</h3>
                  <p>{services.find((service) =>
                    service.value === item.service_type)?.label}</p>
                  <small>{new Date(item.created_at).toLocaleDateString()}</small>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
