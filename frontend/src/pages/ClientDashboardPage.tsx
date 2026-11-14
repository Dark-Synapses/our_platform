import { useAuth } from '../components/auth/AuthProvider';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../lib/auth';

export default function ClientDashboardPage() {
  const navigate = useNavigate();
  const { user, clearSession } = useAuth();
  const [error, setError] = useState('');

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

      <Link to="/service-requests" className="portal-action">New service request →</Link>
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
          <span>Projects</span>
          <h2>Coming soon</h2>
          <p>Project tracking will appear here.</p>
        </article>
      </div>
    </main>
  );
}
