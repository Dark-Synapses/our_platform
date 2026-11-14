import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  cleanup, fireEvent, render, screen, waitFor,
} from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '../components/auth/AuthProvider';
import type { User } from '../lib/auth';
import LoginPage from './LoginPage';

const client: User = {
  id: 'user-1',
  full_name: 'Test Client',
  email: 'client@example.com',
  company_name: null,
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
    <MemoryRouter initialEntries={['/login']}>
      <AuthProvider>
        <SessionProbe />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<p>Client Dashboard</p>} />
          <Route path="/team" element={<p>Team Workspace</p>} />
          <Route path="/admin" element={<p>Admin Dashboard</p>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

function mockLogin(user: User) {
  const fetchMock = vi.fn(async (url: string, _options?: RequestInit) => {
    if (url === '/api/v1/auth/me') {
      return {
        ok: false,
        status: 401,
        json: async () => ({ detail: 'Not authenticated' }),
      };
    }

    if (url === '/api/v1/auth/login') {
      return {
        ok: true,
        json: async () => user,
      };
    }

    throw new Error(`Unexpected request: ${url}`);
  });

  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

async function submitLogin() {
  fireEvent.change(screen.getByLabelText('Email address'), {
    target: { value: 'client@example.com' },
  });
  fireEvent.change(screen.getByLabelText('Password'), {
    target: { value: 'test-password' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('LoginPage integration', () => {
  const cases = [
    { role: 'client', path: '/dashboard', page: 'Client Dashboard' },
    { role: 'team', path: '/team', page: 'Team Workspace' },
    { role: 'admin', path: '/admin', page: 'Admin Dashboard' },
  ] as const;

  for (const testCase of cases) {
    it(`logs in ${testCase.role} and updates auth state`, async () => {
      const user: User = {
        ...client,
        role: testCase.role,
        full_name: `Test ${testCase.role}`,
      };

      const fetchMock = mockLogin(user);
      mount();
      await submitLogin();

      await waitFor(() => {
        expect(screen.getByTestId('location'))
          .toHaveTextContent(testCase.path);
      });

      expect(screen.getByText(testCase.page)).toBeInTheDocument();
      expect(screen.getByTestId('status'))
        .toHaveTextContent('authenticated');
      expect(screen.getByTestId('user'))
        .toHaveTextContent(user.full_name);

      const loginCall = fetchMock.mock.calls.find(
        (call) => call[0] === '/api/v1/auth/login',
      );
      expect(loginCall).toBeDefined();
      expect(loginCall?.[1]?.method).toBe('POST');
      expect(JSON.parse(loginCall?.[1]?.body as string)).toEqual({
        email: 'client@example.com',
        password: 'test-password',
      });
    });
  }

  it('displays login errors without navigating', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      if (url === '/api/v1/auth/me') {
        return {
          ok: false,
          status: 401,
          json: async () => ({ detail: 'Not authenticated' }),
        };
      }

      if (url === '/api/v1/auth/login') {
        return {
          ok: false,
          status: 401,
          json: async () => ({ detail: 'Invalid credentials' }),
        };
      }

      throw new Error(`Unexpected request: ${url}`);
    }));

    mount();
    await submitLogin();

    expect(await screen.findByRole('alert'))
      .toHaveTextContent('Invalid credentials');
    expect(screen.getByTestId('location'))
      .toHaveTextContent('/login');
    expect(screen.getByTestId('status'))
      .toHaveTextContent('unauthenticated');
  });
});
