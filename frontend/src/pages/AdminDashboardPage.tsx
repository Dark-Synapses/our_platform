import { useAuth } from '../components/auth/AuthProvider';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { logout } from '../lib/auth';
import { ApiError } from '../lib/apiError';
import {
  getAdminRequests,
  updateRequestStatus,
  type AdminServiceRequest,
  type RequestStatus,
} from '../lib/admin';

const statuses: RequestStatus[] = [
  'submitted',
  'in_review',
  'approved',
  'rejected',
];

const statusLabels: Record<RequestStatus, string> = {
  submitted: 'Submitted',
  in_review: 'In Review',
  approved: 'Approved',
  rejected: 'Rejected',
};

const allowedTransitions: Record<RequestStatus, RequestStatus[]> = {
  submitted: ['in_review'],
  in_review: ['approved', 'rejected'],
  approved: ['in_review'],
  rejected: ['in_review'],
};

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { status, clearSession, captureSession, invalidateSession } = useAuth();

  const [requests, setRequests] = useState<
    AdminServiceRequest[]
  >([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState<string | null>(
    null,
  );
  const [filter, setFilter] = useState<
    RequestStatus | 'all'
  >('all');

  useEffect(() => {
    if (status !== 'authenticated') return;

    let active = true;
    const token = captureSession();

    async function load() {
      try {
        const data = await getAdminRequests();

        if (active && token === captureSession()) {
          setRequests(data);
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
            : 'Unable to load admin requests.',
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
  }, [status, captureSession, invalidateSession]);

  async function changeStatus(
    id: string,
    status: RequestStatus,
  ) {
    const token = captureSession();
    setSavingId(id);
    setError('');

    try {
      const updated = await updateRequestStatus(id, status);

      if (token !== captureSession()) return;

      setRequests((current) =>
        current.map((item) =>
          item.id === id ? updated : item,
        ),
      );
    } catch (error) {
      if (token !== captureSession()) return;

      if (error instanceof ApiError && error.status === 401) {
        invalidateSession(token);
        return;
      }

      setError(
        error instanceof ApiError && error.status === 403
          ? 'Access denied.'
          : 'Could not update request status.',
      );
    } finally {
      if (token === captureSession()) {
        setSavingId(null);
      }
    }
  }

  async function signOut() {
    try {
      await logout();
      clearSession();
      navigate('/login', { replace: true });
    } catch {
      setError('Could not sign out.');
    }
  }

  const filtered = requests.filter(
    (item) =>
      (filter === 'all' || item.status === filter) &&
      `${item.title} ${item.description} ${item.service_type}`
        .toLowerCase().includes(search.trim().toLowerCase()),
  );

  const count = (status: RequestStatus) =>
    requests.filter((item) => item.status === status)
      .length;

  if (loading) {
    return (
      <main className="admin-dashboard">
        <p>Loading admin dashboard...</p>
      </main>
    );
  }

  return (
    <main className="admin-dashboard">
      <div className="admin-header">
        <div>
          <span className="admin-eyebrow">
            DARK SYNAPSES / CONTROL CENTER
          </span>
          <h1>Admin Dashboard</h1>
          <p>
            Manage incoming service requests and
            operational workflows.
          </p>
        </div>

        <button
          className="admin-logout"
          onClick={() => void signOut()}
        >
          Sign Out
        </button>
      </div>

      {error && (
        <div className="admin-error" role="alert">
          {error}
        </div>
      )}

      <nav aria-label="Admin workspace" className="admin-panel">
        <Link to="/admin/projects" className="admin-request-link">Manage projects</Link>
        {' · '}
        <Link to="/admin/contact-inquiries" className="admin-request-link">Contact inquiries</Link>
      </nav>
      <section className="admin-stats">
        <div className="admin-stat">
          <span>Total Requests</span>
          <strong>{requests.length}</strong>
        </div>
        <div className="admin-stat">
          <span>Submitted</span>
          <strong>{count('submitted')}</strong>
        </div>
        <div className="admin-stat">
          <span>In Review</span>
          <strong>{count('in_review')}</strong>
        </div>
        <div className="admin-stat">
          <span>Approved</span>
          <strong>{count('approved')}</strong>
        </div>
        <div className="admin-stat">
          <span>Rejected</span>
          <strong>{count('rejected')}</strong>
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <h2>Service Requests</h2>
            <p>
              Review and manage client submissions.
              {' '}<Link to="/admin/contact-inquiries" className="admin-request-link">View contact inquiries</Link>
            </p>
          </div>

          <input type="search" aria-label="Search requests" placeholder="Search requests" value={search} onChange={(event) => setSearch(event.target.value)} />
          <select
            aria-label="Filter requests by status"
            value={filter}
            onChange={(event) =>
              setFilter(
                event.target.value as
                  | RequestStatus
                  | 'all',
              )
            }
          >
            <option value="all">All Statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
        </div>

        {filtered.length === 0 ? (
          <p className="admin-empty">
            No service requests found.
          </p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Request</th>
                  <th>Service</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <Link to={`/admin/requests/${item.id}`} className="admin-request-link"><strong>{item.title}</strong></Link>
                      <p>{item.description}</p>
                    </td>
                    <td>
                      {item.service_type
                        .replaceAll('_', ' ')}
                    </td>
                    <td>
                      {new Date(
                        item.created_at,
                      ).toLocaleDateString()}
                    </td>
                    <td>
                      <span
                        className={
                          'admin-status admin-status-' +
                          item.status
                        }
                      >
                        {statusLabels[item.status]}
                      </span>
                    </td>
                    <td>
                      <select
                        aria-label={`Update ${item.title} status`}
                        value={item.status}
                        disabled={savingId !== null}
                        onChange={(event) =>
                          void changeStatus(
                            item.id,
                            event.target
                              .value as RequestStatus,
                          )
                        }
                      >
                        {[
                          item.status,
                          ...allowedTransitions[item.status],
                        ].map((status) => (
                          <option
                            key={status}
                            value={status}
                          >
                            {statusLabels[status]}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
