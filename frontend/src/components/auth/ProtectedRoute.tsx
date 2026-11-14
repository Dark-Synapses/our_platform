import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import type { User } from '../../lib/auth';

type Role = User['role'];

function homeForRole(role: Role): string {
  if (role === 'admin') return '/admin';
  if (role === 'team') return '/team';
  return '/dashboard';
}

export function ProtectedRoute({
  allowedRoles,
}: {
  allowedRoles: Role[];
}) {
  const { user, status, refresh } = useAuth();

  if (status === 'loading') {
    return <p role="status">Checking your session...</p>;
  }

  if (status === 'error') {
    return (
      <section role="alert">
        <p>Could not verify your session.</p>
        <button type="button" onClick={() => void refresh()}>
          Retry
        </button>
      </section>
    );
  }

  if (status === 'unauthenticated' || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={homeForRole(user.role)} replace />;
  }

  return <Outlet />;
}
