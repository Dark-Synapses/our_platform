export type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  reference_id: string | null;
  is_read: boolean;
  created_at: string;
};

export type UnreadCountResponse = {
  unread_count: number;
};

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`/api/v1/notifications${path}`, {
    ...options,
    credentials: 'same-origin',
    headers: {
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Notification request failed: ${response.status}`,
    );
  }

  return response.json() as Promise<T>;
}

export function getNotifications() {
  return request<Notification[]>('');
}

export function getUnreadCount() {
  return request<UnreadCountResponse>('/unread-count');
}

export function markNotificationRead(id: string) {
  return request<{ status: string }>(
    `/${encodeURIComponent(id)}/read`,
    { method: 'PATCH' },
  );
}
