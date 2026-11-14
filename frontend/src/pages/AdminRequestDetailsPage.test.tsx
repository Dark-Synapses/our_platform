import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  act, cleanup, render, screen, waitFor,
} from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from '../components/auth/AuthProvider';
import AdminRequestDetailsPage from './AdminRequestDetailsPage';

const admin = {
  id: 'admin-1',
  full_name: 'Test Admin',
  email: 'admin@example.com',
  company_name: null,
  role: 'admin',
};

const details = {
  request: {
    id: 'request-1',
    service_type: 'ai_services',
    title: 'AI Automation Project',
    description: 'Build an AI automation workflow.',
    status: 'submitted',
    created_at: '2026-11-13T10:00:00Z',
  },
  client: {
    id: 'client-1',
    full_name: 'Test Client',
    email: 'client@example.com',
    company_name: 'Example Company',
  },
  history: [],
};

function mount() {
  render(
    <MemoryRouter initialEntries={['/admin/requests/request-1']}>
      <AuthProvider>
        <Routes>
          <Route
            path="/admin/requests/:requestId"
            element={<AdminRequestDetailsPage />}
          />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('AdminRequestDetailsPage authorization errors', () => {
  it.each([
    [401, 'unauthenticated', 'none'],
    [403, 'authenticated', 'admin-1'],
  ])(
    'handles GET HTTP %s',
    async (httpStatus, expectedStatus, expectedUser) => {
      const fetchMock = vi.fn(async (url: string) => {
        if (url === '/api/v1/auth/me') {
          return {
            ok: true,
            status: 200,
            json: async () => admin,
          };
        }

        if (url === '/api/v1/admin/service-requests/request-1') {
          return {
            ok: false,
            status: httpStatus,
            json: async () => ({ detail: 'Denied' }),
          };
        }

        throw new Error(`Unexpected request: ${url}`);
      });

      function SessionProbe() {
        const { status, user } = useAuth();
        return (
          <div>
            <span data-testid="auth-status">{status}</span>
            <span data-testid="auth-user">{user?.id ?? 'none'}</span>
          </div>
        );
      }

      vi.stubGlobal('fetch', fetchMock);

      render(
        <MemoryRouter initialEntries={['/admin/requests/request-1']}>
          <AuthProvider>
            <SessionProbe />
            <Routes>
              <Route
                path="/admin/requests/:requestId"
                element={<AdminRequestDetailsPage />}
              />
            </Routes>
          </AuthProvider>
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-status'))
          .toHaveTextContent(expectedStatus);
      });

      expect(screen.getByTestId('auth-user'))
        .toHaveTextContent(expectedUser);

      if (httpStatus === 403) {
        expect(await screen.findByRole('alert'))
          .toHaveTextContent('Access denied.');
      } else {
        expect(screen.queryByText('AI Automation Project'))
          .not.toBeInTheDocument();
      }

      expect(screen.queryByText('Test Client'))
        .not.toBeInTheDocument();
    },
  );
});

describe('AdminRequestDetailsPage history', () => {
  it('renders customer information and status history', async () => {
    const result = {
      ...details,
      request: {
        ...details.request,
        status: 'in_review',
      },
      history: [
        {
          id: 'history-1',
          previous_status: 'submitted',
          new_status: 'in_review',
          admin_id: 'admin-1',
          created_at: '2026-11-13T11:00:00Z',
        },
      ],
    };

    const fetchMock = vi.fn(async (url: string) => {
      if (url === '/api/v1/auth/me') {
        return {
          ok: true,
          status: 200,
          json: async () => admin,
        };
      }

      if (url === '/api/v1/admin/service-requests/request-1') {
        return {
          ok: true,
          status: 200,
          json: async () => result,
        };
      }

      throw new Error(`Unexpected request: ${url}`);
    });

    vi.stubGlobal('fetch', fetchMock);
    mount();

    expect(await screen.findByText('AI Automation Project'))
      .toBeInTheDocument();

    expect(screen.getByText('Test Client'))
      .toBeInTheDocument();

    expect(screen.getByText('client@example.com'))
      .toBeInTheDocument();

    expect(screen.getByText('Example Company'))
      .toBeInTheDocument();

    expect(screen.getByText('Status History'))
      .toBeInTheDocument();

    expect(screen.getByText('submitted → in review'))
      .toBeInTheDocument();

    expect(screen.queryByText('No status changes recorded yet.'))
      .not.toBeInTheDocument();
  });
});

describe('AdminRequestDetailsPage stale response', () => {
  it('ignores details returned after session invalidation', async () => {
    let resolveDetails!: (value: unknown) => void;
    let clearSession!: () => void;

    const pendingDetails = new Promise<unknown>((resolve) => {
      resolveDetails = resolve;
    });

    function SessionController() {
      const auth = useAuth();
      clearSession = auth.clearSession;

      return <span data-testid="auth-status">{auth.status}</span>;
    }

    const fetchMock = vi.fn(async (url: string) => {
      if (url === '/api/v1/auth/me') {
        return {
          ok: true,
          status: 200,
          json: async () => admin,
        };
      }

      if (url === '/api/v1/admin/service-requests/request-1') {
        return pendingDetails;
      }

      throw new Error(`Unexpected request: ${url}`);
    });

    vi.stubGlobal('fetch', fetchMock);

    render(
      <MemoryRouter initialEntries={['/admin/requests/request-1']}>
        <AuthProvider>
          <SessionController />
          <Routes>
            <Route
              path="/admin/requests/:requestId"
              element={<AdminRequestDetailsPage />}
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(
        fetchMock.mock.calls.filter(
          (call) =>
            call[0] === '/api/v1/admin/service-requests/request-1',
        ),
      ).toHaveLength(1);
    });

    await act(async () => {
      clearSession();
    });

    expect(screen.getByTestId('auth-status'))
      .toHaveTextContent('unauthenticated');

    await act(async () => {
      resolveDetails({
        ok: true,
        status: 200,
        json: async () => details,
      });
    });

    expect(screen.queryByText('AI Automation Project'))
      .not.toBeInTheDocument();

    expect(screen.queryByText('Test Client'))
      .not.toBeInTheDocument();

    expect(screen.getByTestId('auth-status'))
      .toHaveTextContent('unauthenticated');
  });
});

describe('AdminRequestDetailsPage authentication', () => {
  it('waits for authentication before fetching details', async () => {
    let resolveAuth!: (value: unknown) => void;

    const pendingAuth = new Promise<unknown>((resolve) => {
      resolveAuth = resolve;
    });

    const fetchMock = vi.fn(async (url: string) => {
      if (url === '/api/v1/auth/me') {
        return pendingAuth;
      }

      if (url === '/api/v1/admin/service-requests/request-1') {
        return {
          ok: true,
          status: 200,
          json: async () => details,
        };
      }

      throw new Error(`Unexpected request: ${url}`);
    });

    vi.stubGlobal('fetch', fetchMock);
    mount();

    expect(screen.getByText('Loading request...'))
      .toBeInTheDocument();

    expect(
      fetchMock.mock.calls.filter(
        (call) =>
          call[0] === '/api/v1/admin/service-requests/request-1',
      ),
    ).toHaveLength(0);

    await act(async () => {
      resolveAuth({
        ok: true,
        status: 200,
        json: async () => admin,
      });
    });

    expect(await screen.findByText('AI Automation Project'))
      .toBeInTheDocument();

    expect(screen.getByText('Test Client'))
      .toBeInTheDocument();

    await waitFor(() => {
      expect(
        fetchMock.mock.calls.filter(
          (call) =>
            call[0] === '/api/v1/admin/service-requests/request-1',
        ),
      ).toHaveLength(1);
    });
  });
});
