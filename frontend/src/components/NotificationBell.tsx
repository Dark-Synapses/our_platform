import '../styles/notifications.css';
import { useEffect, useState } from 'react';
import { useAuth } from './auth/AuthProvider';
import { ApiError } from '../lib/apiError';
import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  type Notification,
} from '../lib/notifications';

export function NotificationBell({ userId }: { userId: string }) {
  const { status, captureSession, invalidateSession } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const token = captureSession();

    setOpen(false);
    setItems([]);
    setUnread(0);
    setError('');

    if (status !== 'authenticated') {
      return () => {
        active = false;
      };
    }

    getUnreadCount()
      .then((result) => {
        if (active && token === captureSession()) {
          setUnread(result.unread_count);
        }
      })
      .catch((error: unknown) => {
        if (!active || token !== captureSession()) return;

        if (error instanceof ApiError && error.status === 401) {
          invalidateSession(token);
          return;
        }

        setError(
          error instanceof ApiError && error.status === 403
            ? 'Access denied.'
            : 'Could not load notifications.',
        );
      });

    return () => {
      active = false;
    };
  }, [userId, status, captureSession, invalidateSession]);

  async function loadNotifications() {
    const token = captureSession();
    setLoading(true);
    setError('');

    try {
      const [notifications, count] = await Promise.all([
        getNotifications(),
        getUnreadCount(),
      ]);

      if (token !== captureSession()) return;

      setItems(notifications);
      setUnread(count.unread_count);
    } catch (error) {
      if (token !== captureSession()) return;

      if (error instanceof ApiError && error.status === 401) {
        invalidateSession(token);
        return;
      }

      setError(
        error instanceof ApiError && error.status === 403
          ? 'Access denied.'
          : 'Could not load notifications.',
      );
    } finally {
      if (token === captureSession()) {
        setLoading(false);
      }
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

    const token = captureSession();
    setBusyId(id);
    setError('');

    try {
      await markNotificationRead(id);

      if (token !== captureSession()) return;

      setItems((previous) =>
        previous.map((item) =>
          item.id === id ? { ...item, is_read: true } : item,
        ),
      );

      const count = await getUnreadCount();

      if (token !== captureSession()) return;

      setUnread(count.unread_count);
    } catch (error) {
      if (token !== captureSession()) return;

      if (error instanceof ApiError && error.status === 401) {
        invalidateSession(token);
        return;
      }

      setError(
        error instanceof ApiError && error.status === 403
          ? 'Access denied.'
          : 'Could not update notification.',
      );
    } finally {
      if (token === captureSession()) {
        setBusyId(null);
      }
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
