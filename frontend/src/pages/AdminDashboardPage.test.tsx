import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  act, cleanup, fireEvent, render, screen, waitFor,
} from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '../components/auth/AuthProvider';
import type { User } from '../lib/auth';
import AdminDashboardPage from './AdminDashboardPage';

const admin: User = {
  id: 'admin-1',
  full_name: 'Test Admin',
  email: 'admin@example.com',
  company_name: null,
  role: 'admin',
};

const request = {
  id: 'request-1',
  service_type: 'ai_security',
  title: 'Security Assessment',
  description: 'Review security controls',
  status: 'submitted',
  created_at: '2026-11-13T10:00:00Z',
};

function Probe() {
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
    <MemoryRouter initialEntries={['/admin']}>
      <AuthProvider>
        <Probe />
        <Routes>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/login" element={<p>Login Page</p>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

function response(ok: boolean, status: number, data: unknown) {
  return { ok, status, json: async () => data };
}

function mockApi(adminStatus = 200, logoutStatus = 200) {
  const fetchMock = vi.fn(async (url: string, _options?: RequestInit) => {
    if (url === '/api/v1/auth/me') {
      return response(true, 200, admin);
    }
    if (url === '/api/v1/admin/service-requests') {
      return response(
        adminStatus === 200,
        adminStatus,
        adminStatus === 200 ? [request] : { detail: 'Denied' },
      );
    }
    if (url === '/api/v1/auth/logout') {
      return response(
        logoutStatus === 200,
        logoutStatus,
        { message: 'Logged out' },
      );
    }
    throw new Error(`Unexpected request: ${url}`);
  });

  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('AdminDashboardPage status update', () => {
  it('updates a request status after a successful PATCH', async () => {
    const fetchMock = vi.fn(async (url: string, options?: RequestInit) => {
      if (url === '/api/v1/auth/me') {
        return response(true, 200, admin);
      }

      if (url === '/api/v1/admin/service-requests') {
        return response(true, 200, [request]);
      }

      if (
        url === '/api/v1/admin/service-requests/request-1/status' &&
        options?.method === 'PATCH'
      ) {
        return response(true, 200, {
          ...request,
          status: 'in_review',
        });
      }

      throw new Error(`Unexpected request: ${url}`);
    });

    vi.stubGlobal('fetch', fetchMock);
    mount();

    await screen.findByText('Security Assessment');

    fireEvent.change(
      screen.getByRole('combobox', {
        name: 'Update Security Assessment status',
      }),
      { target: { value: 'in_review' } },
    );

    await waitFor(() => {
      expect(
        screen.getByRole('combobox', {
          name: 'Update Security Assessment status',
        }),
      ).toHaveValue('in_review');
    });

    const patchCall = fetchMock.mock.calls.find(
      (call) =>
        call[0] ===
        '/api/v1/admin/service-requests/request-1/status',
    );

    expect(patchCall?.[1]?.method).toBe('PATCH');
    expect(JSON.parse(String(patchCall?.[1]?.body)))
      .toEqual({ status: 'in_review' });
  });
});

describe('AdminDashboardPage conflict handling', () => {
  it('preserves the current status when PATCH returns 409', async () => {
    const fetchMock = vi.fn(async (url: string, options?: RequestInit) => {
      if (url === '/api/v1/auth/me') {
        return response(true, 200, admin);
      }

      if (url === '/api/v1/admin/service-requests') {
        return response(true, 200, [request]);
      }

      if (
        url === '/api/v1/admin/service-requests/request-1/status' &&
        options?.method === 'PATCH'
      ) {
        return response(false, 409, {
          detail: 'Invalid status transition',
        });
      }

      throw new Error(`Unexpected request: ${url}`);
    });

    vi.stubGlobal('fetch', fetchMock);
    mount();

    await screen.findByText('Security Assessment');

    const select = screen.getByRole('combobox', {
      name: 'Update Security Assessment status',
    });

    expect(select).toHaveValue('submitted');

    fireEvent.change(select, {
      target: { value: 'in_review' },
    });

    expect(await screen.findByRole('alert'))
      .toHaveTextContent('Could not update request status.');

    expect(select).toHaveValue('submitted');
    expect(select).not.toBeDisabled();

    expect(
      fetchMock.mock.calls.filter(
        (call) =>
          call[0] ===
          '/api/v1/admin/service-requests/request-1/status',
      ),
    ).toHaveLength(1);
  });
});

describe('AdminDashboardPage pending update', () => {
  it('disables status selection until PATCH completes', async () => {
    let resolvePatch!: (value: ReturnType<typeof response>) => void;

    const pendingPatch = new Promise<ReturnType<typeof response>>(
      (resolve) => { resolvePatch = resolve; },
    );

    const fetchMock = vi.fn(async (url: string, options?: RequestInit) => {
      if (url === '/api/v1/auth/me') {
        return response(true, 200, admin);
      }
      if (url === '/api/v1/admin/service-requests') {
        return response(true, 200, [request]);
      }
      if (
        url === '/api/v1/admin/service-requests/request-1/status' &&
        options?.method === 'PATCH'
      ) {
        return pendingPatch;
      }
      throw new Error(`Unexpected request: ${url}`);
    });

    vi.stubGlobal('fetch', fetchMock);
    mount();

    await screen.findByText('Security Assessment');

    const select = screen.getByRole('combobox', {
      name: 'Update Security Assessment status',
    });

    fireEvent.change(select, {
      target: { value: 'in_review' },
    });

    await waitFor(() => {
      expect(select).toBeDisabled();
    });

    expect(
      fetchMock.mock.calls.filter(
        (call) => call[1]?.method === 'PATCH',
      ),
    ).toHaveLength(1);

    resolvePatch(response(true, 200, {
      ...request,
      status: 'in_review',
    }));

    await waitFor(() => {
      expect(select).not.toBeDisabled();
      expect(select).toHaveValue('in_review');
    });
  });
});

describe('AdminDashboardPage stale PATCH', () => {
  it('ignores a PATCH response after session invalidation', async () => {
    let resolvePatch!: (value: ReturnType<typeof response>) => void;
    let clearSession!: () => void;

    const pendingPatch = new Promise<ReturnType<typeof response>>(
      (resolve) => { resolvePatch = resolve; },
    );

    function SessionController() {
      const auth = useAuth();
      clearSession = auth.clearSession;
      return null;
    }

    const fetchMock = vi.fn(async (url: string, options?: RequestInit) => {
      if (url === '/api/v1/auth/me') {
        return response(true, 200, admin);
      }
      if (url === '/api/v1/admin/service-requests') {
        return response(true, 200, [request]);
      }
      if (
        url === '/api/v1/admin/service-requests/request-1/status' &&
        options?.method === 'PATCH'
      ) {
        return pendingPatch;
      }
      throw new Error(`Unexpected request: ${url}`);
    });

    vi.stubGlobal('fetch', fetchMock);

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AuthProvider>
          <SessionController />
          <Probe />
          <Routes>
            <Route path="/admin" element={<AdminDashboardPage />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    await screen.findByText('Security Assessment');

    fireEvent.change(
      screen.getByRole('combobox', {
        name: 'Update Security Assessment status',
      }),
      { target: { value: 'in_review' } },
    );

    await waitFor(() => {
      expect(
        fetchMock.mock.calls.filter(
          (call) => call[1]?.method === 'PATCH',
        ),
      ).toHaveLength(1);
    });

    await act(async () => {
      clearSession();
    });

    expect(screen.getByTestId('status'))
      .toHaveTextContent('unauthenticated');

    await act(async () => {
      resolvePatch(response(true, 200, {
        ...request,
        status: 'in_review',
      }));
    });

    expect(screen.getByTestId('status'))
      .toHaveTextContent('unauthenticated');

    expect(screen.getByTestId('user'))
      .toHaveTextContent('none');

    expect(
      screen.getByRole('combobox', {
        name: 'Update Security Assessment status',
      }),
    ).toHaveValue('submitted');
  });
});

describe('AdminDashboardPage allowed transitions', () => {
  it.each([
    ['submitted', ['submitted', 'in_review']],
    ['in_review', ['in_review', 'approved', 'rejected']],
    ['approved', ['approved', 'in_review']],
    ['rejected', ['rejected', 'in_review']],
  ])('shows allowed options for %s', async (currentStatus, expected) => {
    const fetchMock = vi.fn(async (url: string) => {
      if (url === '/api/v1/auth/me') {
        return response(true, 200, admin);
      }
      if (url === '/api/v1/admin/service-requests') {
        return response(true, 200, [{
          ...request,
          status: currentStatus,
        }]);
      }
      throw new Error(`Unexpected request: ${url}`);
    });

    vi.stubGlobal('fetch', fetchMock);
    mount();

    await screen.findByText('Security Assessment');

    const select = screen.getByRole('combobox', {
      name: 'Update Security Assessment status',
    });

    const options = Array.from(
      select.querySelectorAll('option'),
      (option) => option.value,
    );

    expect(options).toEqual(expected);
    expect(select).toHaveValue(currentStatus);

    const filter = screen.getByRole('combobox', {
      name: 'Filter requests by status',
    });

    expect(
      Array.from(filter.querySelectorAll('option'), (option) => option.value),
    ).toEqual([
      'all', 'submitted', 'in_review', 'approved', 'rejected',
    ]);
  });
});

describe('AdminDashboardPage integration', () => {
  it('loads admin service requests', async () => {
    mockApi();
    mount();

    expect(await screen.findByText('Security Assessment'))
      .toBeInTheDocument();
    expect(screen.getByTestId('status'))
      .toHaveTextContent('authenticated');
  });

  it('invalidates the session on HTTP 401', async () => {
    mockApi(401);
    mount();

    await waitFor(() => {
      expect(screen.getByTestId('status'))
        .toHaveTextContent('unauthenticated');
    });

    expect(screen.getByTestId('user')).toHaveTextContent('none');
  });

  it('shows access denied on HTTP 403', async () => {
    mockApi(403);
    mount();

    expect(await screen.findByRole('alert'))
      .toHaveTextContent('Access denied.');

    expect(screen.getByTestId('status'))
      .toHaveTextContent('authenticated');
  });

  it('clears the session after successful logout', async () => {
    const fetchMock = mockApi();
    mount();

    await screen.findByText('Security Assessment');
    fireEvent.click(screen.getByRole('button', { name: 'Sign Out' }));

    await waitFor(() => {
      expect(screen.getByTestId('location'))
        .toHaveTextContent('/login');
    });

    expect(screen.getByTestId('status'))
      .toHaveTextContent('unauthenticated');

    const logoutCall = fetchMock.mock.calls.find(
      (call) => call[0] === '/api/v1/auth/logout',
    );
    expect(logoutCall?.[1]?.method).toBe('POST');
  });

  it('keeps the session when logout fails', async () => {
    mockApi(200, 500);
    mount();

    await screen.findByText('Security Assessment');
    fireEvent.click(screen.getByRole('button', { name: 'Sign Out' }));

    expect(await screen.findByRole('alert'))
      .toHaveTextContent('Could not sign out.');

    expect(screen.getByTestId('status'))
      .toHaveTextContent('authenticated');
    expect(screen.getByTestId('location'))
      .toHaveTextContent('/admin');
  });
});
