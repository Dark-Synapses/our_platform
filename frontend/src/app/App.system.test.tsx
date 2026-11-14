import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { AuthProvider } from '../components/auth/AuthProvider';
import { App } from './App';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="current-path">{location.pathname}</output>;
}

describe('System route unauthenticated access', () => {
  it('redirects guests to login without calling readiness API', async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (url === '/api/v1/auth/me') {
        return {
          ok: false,
          status: 401,
          json: async () => ({ detail: 'Not authenticated' }),
        };
      }

      throw new Error(`Unexpected request: ${url}`);
    });

    vi.stubGlobal('fetch', fetchMock);

    render(
      <MemoryRouter initialEntries={['/system']}>
        <AuthProvider>
          <App />
          <LocationProbe />
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', {
      name: /welcome back/i,
    })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('current-path')).toHaveTextContent('/login');
    });

    expect(
      fetchMock.mock.calls.some(
        ([url]) => String(url).includes('/health/ready'),
      ),
    ).toBe(false);

    expect(screen.queryByRole('heading', {
      name: /One foundation/i,
    })).not.toBeInTheDocument();
  });
});

describe('System route client redirect', () => {
  it('redirects client to dashboard without calling readiness API', async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (url === '/api/v1/auth/me') {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            id: 'client-1',
            full_name: 'Test Client',
            email: 'client@example.com',
            company_name: null,
            role: 'client',
          }),
        };
      }

      throw new Error(`Unexpected request: ${url}`);
    });

    vi.stubGlobal('fetch', fetchMock);

    render(
      <MemoryRouter initialEntries={['/system']}>
        <AuthProvider>
          <App />
          <LocationProbe />
        </AuthProvider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(
        screen.queryByRole('heading', { name: /One foundation/i }),
      ).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByTestId('current-path')).toHaveTextContent('/dashboard');
    });

    expect(
      fetchMock.mock.calls.some(
        ([url]) => String(url).includes('/health/ready'),
      ),
    ).toBe(false);
  });
});

describe('System route RBAC', () => {
  it.each([
    ['admin', true],
    ['team', true],
    ['client', false],
  ] as const)(
    'handles /system access for %s',
    async (role, allowed) => {
      const fetchMock = vi.fn(async (url: string) => {
        if (url === '/api/v1/auth/me') {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              id: 'user-1',
              full_name: 'Test User',
              email: 'test@example.com',
              company_name: null,
              role,
            }),
          };
        }

        if (url.includes('/health/ready')) {
          return {
            ok: true,
            status: 200,
            json: async () => ({ status: 'ready' }),
          };
        }

        throw new Error(`Unexpected request: ${url}`);
      });

      vi.stubGlobal('fetch', fetchMock);

      render(
        <MemoryRouter initialEntries={['/system']}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </MemoryRouter>,
      );

      if (allowed) {
        expect(await screen.findByRole('heading', {
          name: /One foundation/i,
        })).toBeInTheDocument();
      } else {
        await waitFor(() => {
          expect(screen.queryByRole('heading', {
            name: /One foundation/i,
          })).not.toBeInTheDocument();
        });
      }
    },
  );
});
