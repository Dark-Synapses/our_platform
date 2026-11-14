import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  act, cleanup, fireEvent, render, screen, waitFor,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '../components/auth/AuthProvider';
import ServiceRequestsPage from './ServiceRequestsPage';

const client = {
  id: 'client-1',
  full_name: 'Test Client',
  email: 'client@example.com',
  company_name: null,
  role: 'client',
};

const request = {
  id: 'request-1',
  service_type: 'ai_services',
  title: 'AI Automation Project',
  description: 'Build an AI automation workflow.',
  status: 'submitted',
  created_at: '2026-11-13T10:00:00Z',
};

function mount() {
  render(
    <MemoryRouter>
      <AuthProvider>
        <ServiceRequestsPage />
      </AuthProvider>
    </MemoryRouter>,
  );
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('ServiceRequestsPage authorization errors', () => {
  it.each([
    [401, 'unauthenticated', false],
    [403, 'authenticated', true],
  ])(
    'handles GET HTTP %s',
    async (httpStatus, expectedStatus, expectsError) => {
      const fetchMock = vi.fn(async (url: string) => {
        if (url === '/api/v1/auth/me') {
          return {
            ok: true,
            status: 200,
            json: async () => client,
          };
        }

        if (url === '/api/v1/service-requests') {
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
        <MemoryRouter>
          <AuthProvider>
            <SessionProbe />
            <ServiceRequestsPage />
          </AuthProvider>
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-status'))
          .toHaveTextContent(expectedStatus);
      });

      if (expectsError) {
        expect(await screen.findByRole('alert'))
          .toHaveTextContent('Access denied.');
        expect(screen.getByTestId('auth-user'))
          .toHaveTextContent('client-1');
      } else {
        expect(screen.getByTestId('auth-user'))
          .toHaveTextContent('none');
        expect(screen.queryByRole('alert'))
          .not.toBeInTheDocument();
      }
    },
  );
});

describe('ServiceRequestsPage submission', () => {
  it('creates a request and updates the UI after successful POST', async () => {
    const fetchMock = vi.fn(async (url: string, options?: RequestInit) => {
      if (url === '/api/v1/auth/me') {
        return {
          ok: true,
          status: 200,
          json: async () => client,
        };
      }

      if (url === '/api/v1/service-requests' && options?.method === 'POST') {
        return {
          ok: true,
          status: 201,
          json: async () => request,
        };
      }

      if (url === '/api/v1/service-requests') {
        return {
          ok: true,
          status: 200,
          json: async () => [],
        };
      }

      throw new Error(`Unexpected request: ${url}`);
    });

    vi.stubGlobal('fetch', fetchMock);
    mount();

    await screen.findByText(
      'No requests yet. Submit your first request to get started.',
    );

    fireEvent.change(screen.getByLabelText('Project title'), {
      target: { value: 'AI Automation Project' },
    });

    fireEvent.change(screen.getByLabelText('Project description'), {
      target: { value: 'Build an AI automation workflow.' },
    });

    fireEvent.click(screen.getByRole('button', {
      name: 'Submit request',
    }));

    expect(await screen.findByRole('status'))
      .toHaveTextContent('Your request has been submitted successfully.');

    expect(screen.getByText('AI Automation Project'))
      .toBeInTheDocument();

    expect(screen.getByLabelText('Project title'))
      .toHaveValue('');

    expect(screen.getByLabelText('Project description'))
      .toHaveValue('');

    const postCalls = fetchMock.mock.calls.filter(
      (call) =>
        call[0] === '/api/v1/service-requests' &&
        call[1]?.method === 'POST',
    );

    expect(postCalls).toHaveLength(1);
    expect(postCalls[0][1]?.credentials).toBe('same-origin');

    expect(JSON.parse(String(postCalls[0][1]?.body))).toEqual({
      service_type: 'ai_services',
      title: 'AI Automation Project',
      description: 'Build an AI automation workflow.',
    });
  });
});

describe('ServiceRequestsPage POST authorization', () => {
  it.each([
    [401, 'unauthenticated', 'none'],
    [403, 'authenticated', 'client-1'],
  ])(
    'handles POST HTTP %s',
    async (httpStatus, expectedStatus, expectedUser) => {
      const fetchMock = vi.fn(async (url: string, options?: RequestInit) => {
        if (url === '/api/v1/auth/me') {
          return {
            ok: true,
            status: 200,
            json: async () => client,
          };
        }

        if (url === '/api/v1/service-requests' && options?.method === 'POST') {
          return {
            ok: false,
            status: httpStatus,
            json: async () => ({ detail: 'Denied' }),
          };
        }

        if (url === '/api/v1/service-requests') {
          return {
            ok: true,
            status: 200,
            json: async () => [],
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
        <MemoryRouter>
          <AuthProvider>
            <SessionProbe />
            <ServiceRequestsPage />
          </AuthProvider>
        </MemoryRouter>,
      );

      await screen.findByText(
        'No requests yet. Submit your first request to get started.',
      );

      fireEvent.change(screen.getByLabelText('Project title'), {
        target: { value: 'AI Automation Project' },
      });

      fireEvent.change(screen.getByLabelText('Project description'), {
        target: { value: 'Build an AI automation workflow.' },
      });

      fireEvent.click(screen.getByRole('button', {
        name: 'Submit request',
      }));

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
        expect(screen.queryByRole('status'))
          .not.toBeInTheDocument();
      }

      expect(screen.queryByText('AI Automation Project'))
        .not.toBeInTheDocument();
    },
  );
});

describe('ServiceRequestsPage pending submission', () => {
  it('disables submit until the POST completes', async () => {
    let resolvePost!: (value: {
      ok: boolean;
      status: number;
      json: () => Promise<typeof request>;
    }) => void;

    const pendingPost = new Promise<{
      ok: boolean;
      status: number;
      json: () => Promise<typeof request>;
    }>((resolve) => {
      resolvePost = resolve;
    });

    const fetchMock = vi.fn(async (url: string, options?: RequestInit) => {
      if (url === '/api/v1/auth/me') {
        return {
          ok: true,
          status: 200,
          json: async () => client,
        };
      }

      if (url === '/api/v1/service-requests' && options?.method === 'POST') {
        return pendingPost;
      }

      if (url === '/api/v1/service-requests') {
        return {
          ok: true,
          status: 200,
          json: async () => [],
        };
      }

      throw new Error(`Unexpected request: ${url}`);
    });

    vi.stubGlobal('fetch', fetchMock);
    mount();

    await screen.findByText(
      'No requests yet. Submit your first request to get started.',
    );

    fireEvent.change(screen.getByLabelText('Project title'), {
      target: { value: 'AI Automation Project' },
    });

    fireEvent.change(screen.getByLabelText('Project description'), {
      target: { value: 'Build an AI automation workflow.' },
    });

    fireEvent.click(screen.getByRole('button', {
      name: 'Submit request',
    }));

    const button = screen.getByRole('button', {
      name: 'Submitting...',
    });

    expect(button).toBeDisabled();

    fireEvent.click(button);

    expect(
      fetchMock.mock.calls.filter(
        (call) => call[1]?.method === 'POST',
      ),
    ).toHaveLength(1);

    await act(async () => {
      resolvePost({
        ok: true,
        status: 201,
        json: async () => request,
      });
    });

    await waitFor(() => {
      expect(screen.getByRole('button', {
        name: 'Submit request',
      })).not.toBeDisabled();
    });

    expect(screen.getByText('AI Automation Project'))
      .toBeInTheDocument();
  });
});

describe('ServiceRequestsPage stale submission', () => {
  it('ignores a POST response after session invalidation', async () => {
    let resolvePost!: (value: {
      ok: boolean;
      status: number;
      json: () => Promise<typeof request>;
    }) => void;
    let clearSession!: () => void;

    const pendingPost = new Promise<{
      ok: boolean;
      status: number;
      json: () => Promise<typeof request>;
    }>((resolve) => {
      resolvePost = resolve;
    });

    function SessionController() {
      const auth = useAuth();
      clearSession = auth.clearSession;
      return (
        <span data-testid="auth-status">{auth.status}</span>
      );
    }

    const fetchMock = vi.fn(async (url: string, options?: RequestInit) => {
      if (url === '/api/v1/auth/me') {
        return {
          ok: true,
          status: 200,
          json: async () => client,
        };
      }

      if (url === '/api/v1/service-requests' && options?.method === 'POST') {
        return pendingPost;
      }

      if (url === '/api/v1/service-requests') {
        return {
          ok: true,
          status: 200,
          json: async () => [],
        };
      }

      throw new Error(`Unexpected request: ${url}`);
    });

    vi.stubGlobal('fetch', fetchMock);

    render(
      <MemoryRouter>
        <AuthProvider>
          <SessionController />
          <ServiceRequestsPage />
        </AuthProvider>
      </MemoryRouter>,
    );

    await screen.findByText(
      'No requests yet. Submit your first request to get started.',
    );

    fireEvent.change(screen.getByLabelText('Project title'), {
      target: { value: 'AI Automation Project' },
    });

    fireEvent.change(screen.getByLabelText('Project description'), {
      target: { value: 'Build an AI automation workflow.' },
    });

    fireEvent.click(screen.getByRole('button', {
      name: 'Submit request',
    }));

    await waitFor(() => {
      expect(
        fetchMock.mock.calls.filter(
          (call) => call[1]?.method === 'POST',
        ),
      ).toHaveLength(1);
    });

    await act(async () => {
      clearSession();
    });

    expect(screen.getByTestId('auth-status'))
      .toHaveTextContent('unauthenticated');

    await act(async () => {
      resolvePost({
        ok: true,
        status: 201,
        json: async () => request,
      });
    });

    expect(screen.getByTestId('auth-status'))
      .toHaveTextContent('unauthenticated');

    expect(screen.queryByRole('status'))
      .not.toBeInTheDocument();

    expect(screen.queryByText('AI Automation Project'))
      .not.toBeInTheDocument();
  });
});

describe('ServiceRequestsPage authentication', () => {
  it('waits for authentication before loading requests', async () => {
    let resolveAuth!: (value: unknown) => void;

    const pendingAuth = new Promise<unknown>((resolve) => {
      resolveAuth = resolve;
    });

    const fetchMock = vi.fn(async (url: string) => {
      if (url === '/api/v1/auth/me') {
        return pendingAuth;
      }

      if (url === '/api/v1/service-requests') {
        return {
          ok: true,
          status: 200,
          json: async () => [request],
        };
      }

      throw new Error(`Unexpected request: ${url}`);
    });

    vi.stubGlobal('fetch', fetchMock);
    mount();

    expect(screen.getByText('Loading requests...'))
      .toBeInTheDocument();

    expect(
      fetchMock.mock.calls.filter(
        (call) => call[0] === '/api/v1/service-requests',
      ),
    ).toHaveLength(0);

    await act(async () => {
      resolveAuth({
        ok: true,
        status: 200,
        json: async () => client,
      });
    });

    expect(await screen.findByText('AI Automation Project'))
      .toBeInTheDocument();

    await waitFor(() => {
      expect(
        fetchMock.mock.calls.filter(
          (call) => call[0] === '/api/v1/service-requests',
        ),
      ).toHaveLength(1);
    });
  });
});
