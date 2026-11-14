import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from './AuthProvider';
import { ProtectedRoute } from './ProtectedRoute';
import type { User } from '../../lib/auth';

const client: User = {
  id: 'client-1',
  full_name: 'Test Client',
  email: 'client@example.com',
  company_name: null,
  role: 'client',
};

function LocationProbe() {
  const location = useLocation();
  return <span data-testid="location">{location.pathname}</span>;
}

function mount(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <LocationProbe />
        <Routes>
          <Route path="/login" element={<p>Login Page</p>} />
          <Route element={<ProtectedRoute allowedRoles={['client']} />}>
            <Route path="/dashboard" element={<p>Client Dashboard</p>} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['team']} />}>
            <Route path="/team" element={<p>Team Workspace</p>} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<p>Admin Dashboard</p>} />
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

function mockUser(user: User) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: async () => user,
  }));
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('ProtectedRoute', () => {
  it('shows loading while session is pending', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})));
    mount('/dashboard');

    expect(screen.getByRole('status').textContent)
      .toContain('Checking your session');
  });

  it('redirects unauthenticated users to login', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ detail: 'Unauthorized' }),
    }));

    mount('/dashboard');

    await waitFor(() => {
      expect(screen.getByTestId('location').textContent)
        .toBe('/login');
    });
  });

  it('shows retry on session verification error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(
      new Error('Network failure'),
    ));

    mount('/dashboard');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not verify your session',
    );
    expect(screen.getByRole('button', { name: 'Retry' }))
      .toBeTruthy();
  });

  it('allows a client into the client dashboard', async () => {
    mockUser(client);
    mount('/dashboard');

    expect(await screen.findByText('Client Dashboard')).toBeTruthy();
  });

  it('redirects a client away from admin', async () => {
    mockUser(client);
    mount('/admin');

    await waitFor(() => {
      expect(screen.getByTestId('location').textContent)
        .toBe('/dashboard');
    });
  });

  it('redirects an admin away from client routes', async () => {
    mockUser({ ...client, role: 'admin' });
    mount('/dashboard');

    await waitFor(() => {
      expect(screen.getByTestId('location').textContent)
        .toBe('/admin');
    });
  });

  it('restricts team users to their workspace', async () => {
    mockUser({ ...client, role: 'team' });
    mount('/admin');

    await waitFor(() => {
      expect(screen.getByTestId('location').textContent)
        .toBe('/team');
    });

    expect(await screen.findByText('Team Workspace')).toBeTruthy();
  });
});
