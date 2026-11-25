import '../styles/notifications.css';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './auth/AuthProvider';
import { ApiError } from '../lib/apiError';
import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  type Notification,
} from '../lib/notifications';

export function NotificationBell({ userId }: { userId: string }) {
  const { user, status, captureSession, invalidateSession } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const revision = useRef(0);
  const pending = useRef(false);

  useEffect(() => {
    let active = true;
    const token = captureSession();

    setOpen(false);
    setItems([]);
    setUnread(0);
    setError('');
    setBusyId(null);
    setLoading(false);
    pending.current = false;
    revision.current++;

    if (status !== 'authenticated') {
      return () => {
        active = false;
      };
    }

    let refreshing = false;
    function refresh() {
      if (refreshing || pending.current || document.hidden) return;
      refreshing = true;
      const version = revision.current;
      getUnreadCount()
      .then((result) => {
        if (active && token === captureSession() && version === revision.current) {
          setUnread(result.unread_count);
        }
      })
      .catch((error: unknown) => {
        if (!active || token !== captureSession() || version !== revision.current) return;

        if (error instanceof ApiError && error.status === 401) {
          invalidateSession(token);
          return;
        }

        setError(
          error instanceof ApiError && error.status === 403
            ? 'Access denied.'
            : 'Could not load notifications.',
        );
      }).finally(() => { refreshing = false; });
    }
    refresh();
    const timer = window.setInterval(refresh, 30000);
    document.addEventListener('visibilitychange', refresh);

    return () => {
      active = false;
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [userId, status, captureSession, invalidateSession]);

  async function loadNotifications() {
    const token = captureSession();
    if (pending.current) return;
    pending.current = true;
    revision.current++;
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
        pending.current = false;
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
    if (pending.current) return;
    pending.current = true;
    revision.current++;

    const token = captureSession();
    setBusyId(id);
    setError('');

    try {
      if (id === 'all') await markAllNotificationsRead();
      else await markNotificationRead(id);

      if (token !== captureSession()) return;

      setItems((previous) =>
        previous.map((item) =>
          (id === 'all' || item.id === id) ? { ...item, is_read: true } : item,
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
        pending.current = false;
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
          {error && <button type="button" disabled={loading || busyId !== null}
            onClick={() => void loadNotifications()}>Retry</button>}
          {unread > 0 && <button type="button" disabled={loading || busyId !== null}
            onClick={() => void markRead('all')}>Mark all as read</button>}

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
              {user?.role === 'admin' && item.type === 'new_contact_inquiry' && (
                <Link
                  className="ds-notification-inbox-link"
                  to="/admin/contact-inquiries"
                  onClick={() => setOpen(false)}
                >
                  View contact inbox
                </Link>
              )}
              {item.reference_id && user?.role === 'admin' && item.type === 'new_service_request' && (
                <Link to={`/admin/requests/${encodeURIComponent(item.reference_id)}`}
                  onClick={() => setOpen(false)}>View request</Link>
              )}
              {user?.role === 'client' && item.type === 'request_status_changed' && (
                <Link to="/service-requests" onClick={() => setOpen(false)}>View requests</Link>
              )}
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
