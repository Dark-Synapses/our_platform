import { useAuth } from '../components/auth/AuthProvider';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../lib/auth';
import { getServiceRequests, type ServiceRequest } from '../lib/serviceRequests';
import { ApiError } from '../lib/apiError';

export default function ClientDashboardPage() {
  const navigate = useNavigate();
  const { user, clearSession, captureSession, invalidateSession } = useAuth();
  const [error, setError] = useState('');

  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [requestState, setRequestState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!user) return;
    let active = true;
    const token = captureSession();
    setRequests([]);
    setRequestState('loading');
    getServiceRequests().then((data) => {
      if (!active || token !== captureSession()) return;
      setRequests(data);
      setRequestState('ready');
    }).catch((error: unknown) => {
      if (!active || token !== captureSession()) return;
      if (error instanceof ApiError && error.status === 401) {
        invalidateSession(token);
        return;
      }
      setRequestState('error');
    });
    return () => { active = false; };
  }, [user, attempt, captureSession, invalidateSession]);

  async function handleLogout() {
    try {
      await logout();
      clearSession();
      navigate('/login', { replace: true });
    } catch {
      setError('Could not sign out. Please try again.');
    }
  }

  if (!user) {
    return <main className="dashboard-page">Loading your workspace...</main>;
  }

  return (
    <main className="dashboard-page">
      <div className="dashboard-topbar">
        <span className="auth-eyebrow">DARK SYNAPSES / CLIENT PORTAL</span>
        <button type="button" onClick={handleLogout}>
          Sign out
        </button>
      </div>

      <h1>Welcome, {user.full_name}.</h1>
      <p>Your secure workspace is ready.</p>

      {error && <p role="alert" className="auth-error">{error}</p>}

      <Link to="/service-requests" className="portal-action" data-public-cta="primary">New service request</Link>
<div className="dashboard-grid">
        <article className="dashboard-card">
          <span>Account</span>
          <h2>{user.full_name}</h2>
          <p>{user.email}</p>
        </article>

        <article className="dashboard-card">
          <span>Organization</span>
          <h2>{user.company_name || 'Not provided'}</h2>
          <p>Client account</p>
        </article>

        <article className="dashboard-card">
          <span>Service requests</span>
          {requestState === 'loading' && <p role="status">Loading requests...</p>}
          {requestState === 'error' && <><p>Unable to load requests.</p><button type="button" onClick={() => setAttempt((value) => value + 1)}>Retry requests</button></>}
          {requestState === 'ready' && <>
            <h2>{requests.length} requests</h2>
            <p>{requests.filter((item) => item.status === 'in_review').length} in review · {requests.filter((item) => item.status === 'approved').length} approved</p>
          </>}
          <Link to="/service-requests">View my requests</Link>
        </article>
      </div>
    </main>
  );
}
