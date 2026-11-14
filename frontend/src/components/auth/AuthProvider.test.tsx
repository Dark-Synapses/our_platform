import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthProvider';
import type { User } from '../../lib/auth';

const client: User = {
  id: 'user-1',
  full_name: 'Test Client',
  email: 'client@example.com',
  company_name: null,
  role: 'client',
};

let auth: ReturnType<typeof useAuth>;

function Probe() {
  auth = useAuth();
  const { user, status } = auth;

  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="user">{user?.full_name ?? 'none'}</span>
    </div>
  );
}

function mount() {
  return render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  );
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('AuthProvider initial session', () => {
  it('authenticates when /me returns a user', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => client,
    });
    vi.stubGlobal('fetch', fetchMock);

    mount();

    await waitFor(() => {
      expect(screen.getByTestId('status').textContent)
        .toBe('authenticated');
    });

    expect(screen.getByTestId('user').textContent)
      .toBe('Test Client');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe('/api/v1/auth/me');
  });

  it('treats HTTP 401 as unauthenticated', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ detail: 'Not authenticated' }),
    }));

    mount();

    await waitFor(() => {
      expect(screen.getByTestId('status').textContent)
        .toBe('unauthenticated');
    });

    expect(screen.getByTestId('user').textContent).toBe('none');
  });

  it('reports network failures as error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(
      new Error('Network unavailable'),
    ));

    mount();

    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('error');
    });

    expect(screen.getByTestId('user').textContent).toBe('none');
  });
});


describe('AuthProvider session lifecycle', () => {
  it('keeps logout after an older request resolves', async () => {
    let resolveRequest!: (user: User) => void;

    vi.stubGlobal('fetch', vi.fn(() => new Promise((resolve) => {
      resolveRequest = (user: User) => resolve({
        ok: true,
        json: async () => user,
      });
    })));

    mount();

    act(() => auth.clearSession());

    await act(async () => {
      resolveRequest(client);
    });

    expect(screen.getByTestId('status').textContent)
      .toBe('unauthenticated');
    expect(screen.getByTestId('user').textContent)
      .toBe('none');
  });

  it('keeps a new login after an older request resolves', async () => {
    let resolveRequest!: (user: User) => void;

    vi.stubGlobal('fetch', vi.fn(() => new Promise((resolve) => {
      resolveRequest = (user: User) => resolve({
        ok: true,
        json: async () => user,
      });
    })));

    mount();

    const admin: User = {
      ...client,
      id: 'admin-1',
      full_name: 'Test Admin',
      role: 'admin',
    };

    act(() => auth.setAuthenticatedUser(admin));

    await act(async () => {
      resolveRequest(client);
    });

    expect(screen.getByTestId('status').textContent)
      .toBe('authenticated');
    expect(screen.getByTestId('user').textContent)
      .toBe('Test Admin');
  });
});


describe('AuthProvider session invalidation', () => {
  it('invalidates the current session with a valid token', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => client,
    }));

    mount();

    await waitFor(() => {
      expect(screen.getByTestId('status').textContent)
        .toBe('authenticated');
    });

    const token = auth.captureSession();

    act(() => auth.invalidateSession(token));

    expect(screen.getByTestId('status').textContent)
      .toBe('unauthenticated');
    expect(screen.getByTestId('user').textContent)
      .toBe('none');
  });

  it('ignores a stale token after a new login', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => client,
    }));

    mount();

    await waitFor(() => {
      expect(screen.getByTestId('status').textContent)
        .toBe('authenticated');
    });

    const oldToken = auth.captureSession();

    const admin: User = {
      ...client,
      id: 'admin-1',
      full_name: 'Test Admin',
      role: 'admin',
    };

    act(() => auth.setAuthenticatedUser(admin));

    act(() => auth.invalidateSession(oldToken));

    expect(screen.getByTestId('status').textContent)
      .toBe('authenticated');
    expect(screen.getByTestId('user').textContent)
      .toBe('Test Admin');
  });
});


describe('AuthProvider concurrent requests', () => {
  it('deduplicates concurrent refresh requests', async () => {
    let resolveRequest!: (user: User) => void;

    const fetchMock = vi.fn(() => new Promise((resolve) => {
      resolveRequest = (user: User) => resolve({
        ok: true,
        json: async () => user,
      });
    }));

    vi.stubGlobal('fetch', fetchMock);
    mount();

    expect(fetchMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      const first = auth.refresh();
      const second = auth.refresh();

      resolveRequest(client);
      await Promise.all([first, second]);
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('status').textContent)
      .toBe('authenticated');
    expect(screen.getByTestId('user').textContent)
      .toBe('Test Client');
  });
});
