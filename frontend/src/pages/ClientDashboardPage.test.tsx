import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  cleanup, fireEvent, render, screen, waitFor,
} from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '../components/auth/AuthProvider';
import type { User } from '../lib/auth';
import ClientDashboardPage from './ClientDashboardPage';

const client: User = {
  id: 'client-1',
  full_name: 'Test Client',
  email: 'client@example.com',
  company_name: 'Test Company',
  role: 'client',
};

function SessionProbe() {
  const { user, status } = useAuth();
  const location = useLocation();

  return (
    <div>
      <span data-testid="location">{location.pathname}</span>
      <span data-testid="status">{status}</span>
      <span data-testid="user">{user?.full_name ?? 'none'}</span>
    </div>
  );
}

function mount() {
  render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <AuthProvider>
        <SessionProbe />
        <Routes>
          <Route path="/dashboard" element={<ClientDashboardPage />} />
          <Route path="/login" element={<p>Login Page</p>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

function response(ok: boolean, status: number, data: unknown) {
  return {
    ok,
    status,
    json: async () => data,
  };
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('ClientDashboardPage logout integration', () => {
  it('clears session and navigates after successful logout', async () => {
    const fetchMock = vi.fn(async (url: string, _options?: RequestInit) => {
      if (url === '/api/v1/auth/me') {
        return response(true, 200, client);
      }
      if (url === '/api/v1/auth/logout') {
        return response(true, 200, { message: 'Logged out' });
      }
      throw new Error(`Unexpected request: ${url}`);
    });

    vi.stubGlobal('fetch', fetchMock);
    mount();

    await screen.findByText('Welcome, Test Client.');
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/login');
    });

    expect(screen.getByTestId('status'))
      .toHaveTextContent('unauthenticated');
    expect(screen.getByTestId('user')).toHaveTextContent('none');

    const logoutCall = fetchMock.mock.calls.find(
      (call) => call[0] === '/api/v1/auth/logout',
    );

    expect(logoutCall).toBeDefined();
    expect(logoutCall?.[1]?.method).toBe('POST');
  });

  it('keeps the session and shows an error when logout fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      if (url === '/api/v1/auth/me') {
        return response(true, 200, client);
      }
      if (url === '/api/v1/auth/logout') {
        return response(false, 500, { detail: 'Server error' });
      }
      throw new Error(`Unexpected request: ${url}`);
    }));

    mount();

    await screen.findByText('Welcome, Test Client.');
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));

    expect(await screen.findByRole('alert'))
      .toHaveTextContent('Could not sign out');

    expect(screen.getByTestId('location')).toHaveTextContent('/dashboard');
    expect(screen.getByTestId('status'))
      .toHaveTextContent('authenticated');
    expect(screen.getByTestId('user'))
      .toHaveTextContent('Test Client');
  });

  it('waits for backend confirmation before clearing the session', async () => {
    let resolveLogout!: (value: ReturnType<typeof response>) => void;

    const pendingLogout = new Promise<ReturnType<typeof response>>(
      (resolve) => {
        resolveLogout = resolve;
      },
    );

    vi.stubGlobal('fetch', vi.fn((url: string) => {
      if (url === '/api/v1/auth/me') {
        return Promise.resolve(response(true, 200, client));
      }
      if (url === '/api/v1/auth/logout') {
        return pendingLogout;
      }
      return Promise.reject(new Error(`Unexpected request: ${url}`));
    }));

    mount();

    await screen.findByText('Welcome, Test Client.');
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));

    expect(screen.getByTestId('status'))
      .toHaveTextContent('authenticated');
    expect(screen.getByTestId('location'))
      .toHaveTextContent('/dashboard');

    resolveLogout(response(true, 200, { message: 'Logged out' }));

    await waitFor(() => {
      expect(screen.getByTestId('status'))
        .toHaveTextContent('unauthenticated');
    });

    expect(screen.getByTestId('location')).toHaveTextContent('/login');
  });
});
