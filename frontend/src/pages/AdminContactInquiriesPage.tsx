import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../components/auth/AuthProvider';
import { getAdminContactInquiries, type AdminContactInquiry } from '../lib/admin';
import { ApiError } from '../lib/apiError';

type InboxState =
  | { status: 'loading' }
  | { status: 'ready'; inquiries: AdminContactInquiry[] }
  | { status: 'error'; message: string; retryable: boolean };

export default function AdminContactInquiriesPage() {
  const { captureSession, invalidateSession } = useAuth();
  const [inbox, setInbox] = useState<InboxState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const session = captureSession();
    const isCurrent = () =>
      !controller.signal.aborted && session === captureSession();

    getAdminContactInquiries(controller.signal)
      .then((inquiries) => {
        if (isCurrent()) setInbox({ status: 'ready', inquiries });
      })
      .catch((error: unknown) => {
        if (!isCurrent()) return;

        if (error instanceof ApiError && error.status === 401) {
          invalidateSession(session);
          return;
        }

        const denied = error instanceof ApiError && error.status === 403;
        setInbox({
          status: 'error',
          message: denied ? 'Access denied.' : 'Unable to load contact inquiries.',
          retryable: !denied,
        });
      });

    return () => controller.abort();
  }, [attempt, captureSession, invalidateSession]);

  function retry() {
    setInbox({ status: 'loading' });
    setAttempt((previous) => previous + 1);
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-details-container">
        <Link to="/admin" className="admin-back-link">
          ← Back to Dashboard
        </Link>
        <div className="admin-header">
          <div>
            <h1>Contact Inquiries</h1>
            <p>Review the latest 100 submissions from the public contact form.</p>
          </div>
        </div>

        {inbox.status === 'loading' && (
          <p role="status">Loading contact inquiries...</p>
        )}
        {inbox.status === 'error' && (
          <>
            <p className="admin-error" role="alert">{inbox.message}</p>
            {inbox.retryable && (
              <button className="admin-logout" type="button" onClick={retry}>
                Retry
              </button>
            )}
          </>
        )}
        {inbox.status === 'ready' && inbox.inquiries.length === 0 && (
          <p className="admin-empty">No contact inquiries yet.</p>
        )}
        {inbox.status === 'ready' && inbox.inquiries.length > 0 && (
          <div className="admin-inquiries">
            {inbox.inquiries.map((inquiry) => (
              <article className="admin-panel admin-inquiry" key={inquiry.id}>
                <div className="admin-panel-heading">
                  <div>
                    <h2>{inquiry.name}</h2>
                    <p>
                      <a className="admin-request-link" href={`mailto:${encodeURIComponent(inquiry.email).replace('%40', '@')}`}>
                        {inquiry.email}
                      </a>
                      {inquiry.company && <> · {inquiry.company}</>}
                    </p>
                  </div>
                  <time dateTime={inquiry.created_at}>
                    {new Date(inquiry.created_at).toLocaleString()}
                  </time>
                </div>
                <p>{inquiry.service}</p>
                <p className="admin-inquiry-message">{inquiry.message}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
