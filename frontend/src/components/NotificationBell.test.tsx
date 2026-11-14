import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  act, cleanup, render, screen, waitFor,
} from '@testing-library/react';
import { AuthProvider, useAuth } from './auth/AuthProvider';
import { NotificationBell } from './NotificationBell';

const admin = {
  id: 'admin-1',
  full_name: 'Test Admin',
  email: 'admin@example.com',
  company_name: null,
  role: 'admin',
};

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('NotificationBell authorization', () => {
  it.each([401, 403])(
    'handles unread-count HTTP %s',
    async (httpStatus) => {
      function SessionProbe() {
        const { status } = useAuth();
        return <span data-testid="auth-status">{status}</span>;
      }

      const fetchMock = vi.fn(async (url: string) => {
        if (url === '/api/v1/auth/me') {
          return {
            ok: true,
            status: 200,
            json: async () => admin,
          };
        }

        if (url === '/api/v1/notifications/unread-count') {
          return {
            ok: false,
            status: httpStatus,
            json: async () => ({ detail: 'Denied' }),
          };
        }

        if (url === '/api/v1/notifications') {
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
        <AuthProvider>
          <SessionProbe />
          <NotificationBell userId="admin-1" />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(
          fetchMock.mock.calls.filter(
            ([url]) =>
              url === '/api/v1/notifications/unread-count',
          ),
        ).toHaveLength(1);
      });

      if (httpStatus === 401) {
        expect(await screen.findByTestId('auth-status'))
          .toHaveTextContent('unauthenticated');
      } else {
        await waitFor(() => {
          expect(screen.getByTestId('auth-status'))
            .toHaveTextContent('authenticated');
        });
      }
    },
  );
});

describe('NotificationBell mark as read', () => {
  it('opens notifications and marks an item as read', async () => {
    const { fireEvent } = await import('@testing-library/react');

    let unreadCount = 1;
    const fetchMock = vi.fn(async (url: string, options?: RequestInit) => {
      if (url === '/api/v1/auth/me') {
        return {
          ok: true,
          status: 200,
          json: async () => admin,
        };
      }

      if (url === '/api/v1/notifications/unread-count') {
        return {
          ok: true,
          status: 200,
          json: async () => ({ unread_count: unreadCount }),
        };
      }

      if (url === '/api/v1/notifications') {
        return {
          ok: true,
          status: 200,
          json: async () => [{
            id: 'notification-1',
            type: 'service_request',
            title: 'New Service Request',
            message: 'A new request was submitted.',
            reference_id: 'request-1',
            is_read: false,
            created_at: '2026-11-13T10:00:00Z',
          }],
        };
      }

      if (
        url === '/api/v1/notifications/notification-1/read' &&
        options?.method === 'PATCH'
      ) {
        unreadCount = 0;
        return {
          ok: true,
          status: 200,
          json: async () => ({ status: 'ok' }),
        };
      }

      throw new Error(`Unexpected request: ${url}`);
    });

    vi.stubGlobal('fetch', fetchMock);

    render(
      <AuthProvider>
        <NotificationBell userId="admin-1" />
      </AuthProvider>,
    );

    const bell = await screen.findByRole('button', {
      name: 'Notifications, 1 unread',
    });

    fireEvent.click(bell);

    expect(await screen.findByText('New Service Request'))
      .toBeInTheDocument();

    expect(screen.getByText('A new request was submitted.'))
      .toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', {
      name: 'Mark as read',
    }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/v1/notifications/notification-1/read',
        expect.objectContaining({ method: 'PATCH' }),
      );
    });

    await waitFor(() => {
      expect(screen.getByRole('button', {
        name: 'Notifications, 0 unread',
      })).toBeInTheDocument();
    });

    expect(screen.queryByRole('button', {
      name: 'Mark as read',
    })).not.toBeInTheDocument();
  });
});

describe('NotificationBell pending PATCH', () => {
  it('disables mark-as-read while PATCH is pending', async () => {
    const { fireEvent } = await import('@testing-library/react');

    let resolvePatch!: (value: unknown) => void;
    const pendingPatch = new Promise<unknown>((resolve) => {
      resolvePatch = resolve;
    });

    let patchCalls = 0;
    let unreadCount = 1;

    const fetchMock = vi.fn(async (url: string, options?: RequestInit) => {
      if (url === '/api/v1/auth/me') {
        return {
          ok: true,
          status: 200,
          json: async () => admin,
        };
      }

      if (url === '/api/v1/notifications/unread-count') {
        return {
          ok: true,
          status: 200,
          json: async () => ({ unread_count: unreadCount }),
        };
      }

      if (url === '/api/v1/notifications') {
        return {
          ok: true,
          status: 200,
          json: async () => [{
            id: 'notification-1',
            type: 'service_request',
            title: 'New Service Request',
            message: 'A new request was submitted.',
            reference_id: 'request-1',
            is_read: false,
            created_at: '2026-11-13T10:00:00Z',
          }],
        };
      }

      if (
        url === '/api/v1/notifications/notification-1/read' &&
        options?.method === 'PATCH'
      ) {
        patchCalls++;
        return pendingPatch;
      }

      throw new Error(`Unexpected request: ${url}`);
    });

    vi.stubGlobal('fetch', fetchMock);

    render(
      <AuthProvider>
        <NotificationBell userId="admin-1" />
      </AuthProvider>,
    );

    fireEvent.click(await screen.findByRole('button', {
      name: 'Notifications, 1 unread',
    }));

    expect(await screen.findByText('New Service Request'))
      .toBeInTheDocument();

    const markButton = screen.getByRole('button', {
      name: 'Mark as read',
    });

    fireEvent.click(markButton);

    await waitFor(() => {
      expect(markButton).toBeDisabled();
    });

    fireEvent.click(markButton);
    expect(patchCalls).toBe(1);

    unreadCount = 0;

    await act(async () => {
      resolvePatch({
        ok: true,
        status: 200,
        json: async () => ({ status: 'ok' }),
      });
    });

    await waitFor(() => {
      expect(screen.getByRole('button', {
        name: 'Notifications, 0 unread',
      })).toBeInTheDocument();
    });

    expect(screen.queryByRole('button', {
      name: 'Mark as read',
    })).not.toBeInTheDocument();
  });
});

describe('NotificationBell stale PATCH', () => {
  it('ignores PATCH response after session invalidation', async () => {
    const { fireEvent } = await import('@testing-library/react');

    let resolvePatch!: (value: unknown) => void;
    let clearSession!: () => void;

    const pendingPatch = new Promise<unknown>((resolve) => {
      resolvePatch = resolve;
    });

    function SessionController() {
      const auth = useAuth();
      clearSession = auth.clearSession;

      return <span data-testid="auth-status">{auth.status}</span>;
    }

    const fetchMock = vi.fn(async (url: string, options?: RequestInit) => {
      if (url === '/api/v1/auth/me') {
        return {
          ok: true,
          status: 200,
          json: async () => admin,
        };
      }

      if (url === '/api/v1/notifications/unread-count') {
        return {
          ok: true,
          status: 200,
          json: async () => ({ unread_count: 1 }),
        };
      }

      if (url === '/api/v1/notifications') {
        return {
          ok: true,
          status: 200,
          json: async () => [{
            id: 'notification-1',
            type: 'service_request',
            title: 'New Service Request',
            message: 'A new request was submitted.',
            reference_id: 'request-1',
            is_read: false,
            created_at: '2026-11-13T10:00:00Z',
          }],
        };
      }

      if (
        url === '/api/v1/notifications/notification-1/read' &&
        options?.method === 'PATCH'
      ) {
        return pendingPatch;
      }

      throw new Error(`Unexpected request: ${url}`);
    });

    vi.stubGlobal('fetch', fetchMock);

    render(
      <AuthProvider>
        <SessionController />
        <NotificationBell userId="admin-1" />
      </AuthProvider>,
    );

    fireEvent.click(await screen.findByRole('button', {
      name: 'Notifications, 1 unread',
    }));

    expect(await screen.findByText('New Service Request'))
      .toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', {
      name: 'Mark as read',
    }));

    await waitFor(() => {
      expect(
        fetchMock.mock.calls.filter(
          ([url]) =>
            url === '/api/v1/notifications/notification-1/read',
        ),
      ).toHaveLength(1);
    });

    await act(async () => {
      clearSession();
    });

    expect(screen.getByTestId('auth-status'))
      .toHaveTextContent('unauthenticated');

    await act(async () => {
      resolvePatch({
        ok: true,
        status: 200,
        json: async () => ({ status: 'ok' }),
      });
    });

    expect(screen.getByTestId('auth-status'))
      .toHaveTextContent('unauthenticated');

    expect(screen.queryByText('New Service Request'))
      .not.toBeInTheDocument();

    expect(screen.getByRole('button', {
      name: 'Notifications, 0 unread',
    })).toBeInTheDocument();
  });
});

describe('NotificationBell authentication', () => {
  it('waits for authentication before loading unread count', async () => {
    let resolveAuth!: (value: unknown) => void;

    const pendingAuth = new Promise<unknown>((resolve) => {
      resolveAuth = resolve;
    });

    const fetchMock = vi.fn(async (url: string) => {
      if (url === '/api/v1/auth/me') {
        return pendingAuth;
      }

      if (url === '/api/v1/notifications/unread-count') {
        return {
          ok: true,
          status: 200,
          json: async () => ({ unread_count: 3 }),
        };
      }

      throw new Error(`Unexpected request: ${url}`);
    });

    vi.stubGlobal('fetch', fetchMock);

    render(
      <AuthProvider>
        <NotificationBell userId="admin-1" />
      </AuthProvider>,
    );

    expect(
      fetchMock.mock.calls.filter(
        ([url]) => url === '/api/v1/notifications/unread-count',
      ),
    ).toHaveLength(0);

    await act(async () => {
      resolveAuth({
        ok: true,
        status: 200,
        json: async () => admin,
      });
    });

    await waitFor(() => {
      expect(
        fetchMock.mock.calls.filter(
          ([url]) => url === '/api/v1/notifications/unread-count',
        ),
      ).toHaveLength(1);
    });

    expect(
      screen.getByRole('button', {
        name: 'Notifications, 3 unread',
      }),
    ).toBeInTheDocument();
  });
});
