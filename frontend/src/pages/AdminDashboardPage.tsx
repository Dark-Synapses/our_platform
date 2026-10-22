import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getCurrentUser, logout } from '../lib/auth';
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

export default function AdminDashboardPage() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState<
    AdminServiceRequest[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState<string | null>(
    null,
  );
  const [filter, setFilter] = useState<
    RequestStatus | 'all'
  >('all');

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const user = await getCurrentUser();

        if (!active) return;

        if (user.role !== 'admin') {
          navigate('/login', { replace: true });
          return;
        }

        const data = await getAdminRequests();

        if (active) setRequests(data);
      } catch {
        if (active) {
          setError('Unable to load admin requests.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [navigate]);

  async function changeStatus(
    id: string,
    status: RequestStatus,
  ) {
    setSavingId(id);
    setError('');

    try {
      const updated = await updateRequestStatus(
        id,
        status,
      );

      setRequests((current) =>
        current.map((item) =>
          item.id === id ? updated : item,
        ),
      );
    } catch {
      setError('Could not update request status.');
    } finally {
      setSavingId(null);
    }
  }

  async function signOut() {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch {
      setError('Could not sign out.');
    }
  }

  const filtered = requests.filter(
    (item) =>
      filter === 'all' || item.status === filter,
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
      </section>

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <h2>Service Requests</h2>
            <p>
              Review and manage client submissions.
            </p>
          </div>

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
                        disabled={savingId === item.id}
                        onChange={(event) =>
                          void changeStatus(
                            item.id,
                            event.target
                              .value as RequestStatus,
                          )
                        }
                      >
                        {statuses.map((status) => (
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
