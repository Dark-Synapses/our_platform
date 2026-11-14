import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import TeamLandingPage from './TeamLandingPage';

const mocks = vi.hoisted(() => ({
  logout: vi.fn(),
  clearSession: vi.fn(),
}));

vi.mock('../lib/auth', () => ({
  logout: mocks.logout,
}));

vi.mock('../components/auth/AuthProvider', () => ({
  useAuth: () => ({
    user: {
      id: 'team-1',
      full_name: 'Test Team Member',
      email: 'team@example.com',
      company_name: null,
      role: 'team',
    },
    clearSession: mocks.clearSession,
  }),
}));

function renderTeamPage() {
  return render(
    <MemoryRouter initialEntries={['/team']}>
      <Routes>
        <Route path="/team" element={<TeamLandingPage />} />
        <Route path="/login" element={<h1>Login Page</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('TeamLandingPage authentication', () => {
  it('renders team workspace and sign out', () => {
    renderTeamPage();

    expect(
      screen.getByRole('heading', { name: 'Team Workspace' }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: 'Sign Out' }),
    ).toBeInTheDocument();
  });

  it('clears session and redirects after successful logout', async () => {
    mocks.logout.mockResolvedValue({ message: 'Logged out' });

    renderTeamPage();

    fireEvent.click(
      screen.getByRole('button', { name: 'Sign Out' }),
    );

    await waitFor(() => {
      expect(mocks.logout).toHaveBeenCalledTimes(1);
      expect(mocks.clearSession).toHaveBeenCalledTimes(1);
      expect(
        screen.getByRole('heading', { name: 'Login Page' }),
      ).toBeInTheDocument();
    });
  });

  it('preserves session and displays error if logout fails', async () => {
    mocks.logout.mockRejectedValue(new Error('Network failure'));

    renderTeamPage();

    fireEvent.click(
      screen.getByRole('button', { name: 'Sign Out' }),
    );

    expect(
      await screen.findByRole('alert'),
    ).toHaveTextContent('Could not sign out');

    expect(mocks.clearSession).not.toHaveBeenCalled();

    expect(
      screen.getByRole('heading', { name: 'Team Workspace' }),
    ).toBeInTheDocument();
  });

  it('prevents duplicate logout submissions', async () => {
    let resolveLogout!: (value: { message: string }) => void;

    mocks.logout.mockImplementation(
      () => new Promise((resolve) => {
        resolveLogout = resolve;
      }),
    );

    renderTeamPage();

    fireEvent.click(
      screen.getByRole('button', { name: 'Sign Out' }),
    );

    expect(
      screen.getByRole('button', { name: 'Signing out...' }),
    ).toBeDisabled();

    expect(mocks.logout).toHaveBeenCalledTimes(1);

    resolveLogout({ message: 'Logged out' });

    await waitFor(() => {
      expect(mocks.clearSession).toHaveBeenCalledTimes(1);
    });
  });
});
