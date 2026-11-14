import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import { AuthProvider } from '../components/auth/AuthProvider';
import { App } from './App';

const inboxPath = '/admin/contact-inquiries';
const inboxApi = '/api/v1/admin/contact-inquiries';

const inquiry = {
  id: 'inquiry-1',
  name: 'Alex Example',
  email: 'alex+test@example.com',
  company: 'Example Company',
  service: 'AI Services',
  message: 'We are interested in AI software engineering.',
  status: 'submitted',
  created_at: '2026-11-14T15:00:00Z',
};

function mockApi(role: 'admin' | 'team' | 'client' | null, statuses = [200]) {
  let inboxCalls = 0;
  const fetchMock = vi.fn(async (url: string, _options?: RequestInit) => {
    if (url === '/api/v1/auth/me') {
      return role
        ? Response.json({
            id: 'user-1',
            full_name: 'Test User',
            email: 'user@example.com',
            company_name: null,
            role,
          })
        : Response.json({ detail: 'Not authenticated' }, { status: 401 });
    }

    if (url === inboxApi) {
      const status = statuses[inboxCalls++];
      return Response.json(status === 200 ? [inquiry] : [], { status });
    }

    if (url === '/api/v1/notifications') {
      return Response.json([{
        id: 'notification-1',
        type: 'new_contact_inquiry',
        title: 'New contact inquiry',
        message: 'A new contact inquiry has been submitted.',
        reference_id: inquiry.id,
        is_read: false,
        created_at: inquiry.created_at,
      }]);
    }

    if (url === '/api/v1/notifications/unread-count') {
      return Response.json({ unread_count: 0 });
    }

    return Response.json([]);
  });

  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function mount(path = inboxPath) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  );
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it('opens the contact inbox from the dashboard and renders inquiry details', async () => {
  const fetchMock = mockApi('admin');
  mount('/admin');

  fireEvent.click(await screen.findByRole('link', { name: 'View contact inquiries' }));
  expect(await screen.findByRole('heading', { name: inquiry.name })).toBeInTheDocument();
  expect(screen.getByText(inquiry.company, { exact: false })).toBeInTheDocument();
  expect(screen.getByText(inquiry.message)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: inquiry.email })).toHaveAttribute(
    'href',
    'mailto:alex%2Btest@example.com',
  );
  expect(fetchMock).toHaveBeenCalledWith(inboxApi, expect.objectContaining({
    credentials: 'same-origin',
    cache: 'no-store',
  }));
});

it.each([
  [null, /welcome back/i],
  ['team', /team workspace/i],
  ['client', /welcome, test user/i],
] as const)('redirects %s before loading inquiries', async (role, heading) => {
  const fetchMock = mockApi(role);
  mount();

  expect(await screen.findByRole('heading', { name: heading })).toBeInTheDocument();
  expect(fetchMock.mock.calls.some(([url]) => url === inboxApi)).toBe(false);
});

it('redirects to login after the inquiry endpoint returns 401', async () => {
  mockApi('admin', [401]);
  mount();

  expect(await screen.findByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
});

it('loads the inbox after retrying a failed request', async () => {
  mockApi('admin', [500, 200]);
  mount();

  expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load contact inquiries.');
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  expect(await screen.findByRole('heading', { name: inquiry.name })).toBeInTheDocument();
});

it('opens the inbox from a new contact inquiry notification', async () => {
  mockApi('admin');
  mount('/admin');

  fireEvent.click(await screen.findByRole('button', { name: /notifications,/i }));
  fireEvent.click(await screen.findByRole('link', { name: 'View contact inbox' }));

  expect(await screen.findByRole('heading', { name: inquiry.name })).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'View contact inbox' })).not.toBeInTheDocument();
});
