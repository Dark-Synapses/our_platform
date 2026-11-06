import '../styles/notifications.css';
import { useEffect, useState } from 'react';
import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  type Notification,
} from '../lib/notifications';

export function NotificationBell({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setOpen(false);
    setItems([]);
    setUnread(0);
    setError('');

    getUnreadCount()
      .then((result) => {
        if (active) setUnread(result.unread_count);
      })
      .catch(() => {
        if (active) setError('Could not load notifications.');
      });

    return () => {
      active = false;
    };
  }, [userId]);

  async function loadNotifications() {
    setLoading(true);
    setError('');
    try {
      const [notifications, count] = await Promise.all([
        getNotifications(),
        getUnreadCount(),
      ]);
      setItems(notifications);
      setUnread(count.unread_count);
    } catch {
      setError('Could not load notifications.');
    } finally {
      setLoading(false);
    }
  }

  async function toggle() {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    await loadNotifications();
  }

  async function markRead(id: string) {
    if (busyId) return;
    setBusyId(id);
    setError('');
    try {
      await markNotificationRead(id);
      setItems((previous) =>
        previous.map((item) =>
          item.id === id ? { ...item, is_read: true } : item,
        ),
      );
      const count = await getUnreadCount();
      setUnread(count.unread_count);
    } catch {
      setError('Could not update notification.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="ds-notifications">
      <button
        type="button"
        className="ds-notifications-trigger"
        onClick={toggle}
        aria-label={`Notifications, ${unread} unread`}
        aria-expanded={open}
        aria-controls="ds-notifications-panel"
      >
        <span aria-hidden="true">🔔</span>
        {unread > 0 && (
          <span className="ds-notifications-count">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          id="ds-notifications-panel"
          className="ds-notifications-panel"
        >
          <div className="ds-notifications-heading">
            <strong>Notifications</strong>
            <button type="button" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>

          {loading && <p>Loading notifications...</p>}
          {error && <p role="alert">{error}</p>}

          {!loading && !error && items.length === 0 && (
            <p>No notifications yet.</p>
          )}

          {!loading && items.map((item) => (
            <div
              key={item.id}
              className={`ds-notification-item ${
                item.is_read ? 'is-read' : 'is-unread'
              }`}
            >
              <strong>{item.title}</strong>
              <p>{item.message}</p>
              <small>
                {new Date(item.created_at).toLocaleString()}
              </small>
              {!item.is_read && (
                <button
                  type="button"
                  disabled={busyId !== null}
                  onClick={() => void markRead(item.id)}
                >
                  Mark as read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
