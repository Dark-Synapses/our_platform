import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../components/auth/AuthProvider';
import { getAdminContactInquiries, updateInquiryStatus, type InquiryStatus, type AdminContactInquiry } from '../lib/admin';
import { ApiError } from '../lib/apiError';

type InboxState =
  | { status: 'loading' }
  | { status: 'ready'; inquiries: AdminContactInquiry[] }
  | { status: 'error'; message: string; retryable: boolean };

export default function AdminContactInquiriesPage() {
  const { captureSession, invalidateSession } = useAuth();
  const [inbox, setInbox] = useState<InboxState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');

  async function changeStatus(id: string, status: InquiryStatus) {
    const session = captureSession();
    setBusy(true);
    setActionError('');
    try {
      const result = await updateInquiryStatus(id, status);
      if (session !== captureSession()) return;
      setInbox(previous => previous.status === 'ready' ? {
        status: 'ready',
        inquiries: previous.inquiries.map(item => item.id === id ? { ...item, status: result.status } : item),
      } : previous);
    } catch (error) {
      if (session !== captureSession()) return;
      if (error instanceof ApiError && error.status === 401) invalidateSession(session);
      else setActionError('Unable to update inquiry. Please try again.');
    } finally {
      setBusy(false);
    }
  }

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

  const visible = inbox.status === 'ready' ? inbox.inquiries.filter(item =>
    (filter === 'all' || item.status === filter) &&
    [item.name, item.email, item.company, item.service, item.message].join(' ').toLowerCase().includes(search.toLowerCase())
  ) : [];

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
            <label>Search inquiries <input value={search} onChange={e => setSearch(e.target.value)} /></label>
            <label>Filter status <select value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="all">All</option>
              {['submitted', 'in_review', 'resolved', 'archived'].map(status => <option key={status}>{status}</option>)}
            </select></label>
            {actionError && <p role="alert" className="admin-error">{actionError}</p>}
            {visible.length === 0 && <p>No matching inquiries.</p>}
            {visible.map((inquiry) => (
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
                <label>Status for {inquiry.name} <select disabled={busy} value={inquiry.status} onChange={e => void changeStatus(inquiry.id, e.target.value as InquiryStatus)}>
                  {['submitted', 'in_review', 'resolved', 'archived'].map(status => <option key={status}>{status}</option>)}
                </select></label>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
