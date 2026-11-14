import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthProvider';
import { logout } from '../lib/auth';

export default function TeamLandingPage() {
  const navigate = useNavigate();
  const { user, clearSession } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState('');

  async function handleLogout() {
    if (signingOut) return;

    setSigningOut(true);
    setError('');

    try {
      await logout();
      clearSession();
      navigate('/login', { replace: true });
    } catch {
      setError('Could not sign out. Please try again.');
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <main className="section">
      <h1>Team Workspace</h1>
      <p>Welcome, {user?.full_name ?? 'Team member'}.</p>
      <p>
        The team workspace is under development.
        Team-specific features are not available yet.
      </p>

      {error && <p role="alert">{error}</p>}

      <button
        type="button"
        onClick={() => void handleLogout()}
        disabled={signingOut}
      >
        {signingOut ? 'Signing out...' : 'Sign Out'}
      </button>
    </main>
  );
}
