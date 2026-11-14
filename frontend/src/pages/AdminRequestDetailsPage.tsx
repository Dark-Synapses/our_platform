import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthProvider';
import { ApiError } from '../lib/apiError';

import {
  getAdminRequestDetails,
  type AdminRequestDetails,
} from '../lib/admin';

export default function AdminRequestDetailsPage() {
  const { requestId } = useParams();
  const { status, captureSession, invalidateSession } = useAuth();

  const [details, setDetails] =
    useState<AdminRequestDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status !== 'authenticated') return;

    let active = true;
    const token = captureSession();

    async function load() {
      setLoading(true);
      setError('');
      setDetails(null);

      try {
        if (!requestId) {
          throw new Error('Missing request ID');
        }

        const result = await getAdminRequestDetails(requestId);

        if (active && token === captureSession()) {
          setDetails(result);
        }
      } catch (error) {
        if (!active || token !== captureSession()) return;

        if (error instanceof ApiError && error.status === 401) {
          invalidateSession(token);
          return;
        }

        setError(
          error instanceof ApiError && error.status === 403
            ? 'Access denied.'
            : 'Unable to load request details. Check your access or request ID.',
        );
      } finally {
        if (active && token === captureSession()) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [requestId, status, captureSession, invalidateSession]);

  return (
    <main className="admin-dashboard">
      <div className="admin-details-container">
        <Link to="/admin" className="admin-back-link">
          ← Back to Dashboard
        </Link>

        <div className="admin-header">
          <div>
            <span className="admin-eyebrow">
              DARK SYNAPSES / REQUEST DETAILS
            </span>
            <h1>Service Request</h1>
            <p>Client information and request history.</p>
          </div>
        </div>

        {loading && <p>Loading request...</p>}

        {error && (
          <div className="admin-error" role="alert">
            {error}
          </div>
        )}

        {details && (
          <div className="admin-details-grid">
            <section className="admin-panel">
              <h2>{details.request.title}</h2>

              <div className="admin-detail-field">
                <span>Service</span>
                <strong>
                  {details.request.service_type.replaceAll(
                    '_',
                    ' ',
                  )}
                </strong>
              </div>

              <div className="admin-detail-field">
                <span>Status</span>
                <strong>
                  {details.request.status.replaceAll(
                    '_',
                    ' ',
                  )}
                </strong>
              </div>

              <div className="admin-detail-field">
                <span>Submitted</span>
                <strong>
                  {new Date(
                    details.request.created_at,
                  ).toLocaleString()}
                </strong>
              </div>

              <div className="admin-detail-field">
                <span>Description</span>
                <p>{details.request.description}</p>
              </div>
            </section>

            <div className="admin-details-side">
              <section className="admin-panel">
                <h2>Customer Information</h2>

                {details.client ? (
                  <>
                    <div className="admin-detail-field">
                      <span>Full Name</span>
                      <strong>
                        {details.client.full_name || '—'}
                      </strong>
                    </div>
                    <div className="admin-detail-field">
                      <span>Email</span>
                      <strong>
                        {details.client.email || '—'}
                      </strong>
                    </div>
                    <div className="admin-detail-field">
                      <span>Company</span>
                      <strong>
                        {details.client.company_name || '—'}
                      </strong>
                    </div>
                  </>
                ) : (
                  <p className="admin-muted">
                    Customer information unavailable.
                  </p>
                )}
              </section>

              <section className="admin-panel">
                <h2>Status History</h2>

                {details.history.length === 0 ? (
                  <p className="admin-muted">
                    No status changes recorded yet.
                  </p>
                ) : (
                  <ol className="admin-history">
                    {details.history.map((event) => (
                      <li key={event.id}>
                        <strong>
                          {event.previous_status
                            ?.replaceAll('_', ' ') || '—'}
                          {' → '}
                          {event.new_status.replaceAll(
                            '_',
                            ' ',
                          )}
                        </strong>
                        <span>
                          {new Date(
                            event.created_at,
                          ).toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
              </section>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
