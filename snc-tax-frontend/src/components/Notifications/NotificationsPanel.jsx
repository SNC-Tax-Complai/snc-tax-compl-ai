import { useEffect } from 'react';
import { useComplianceStore } from '../../stores/complianceStore';
import './NotificationsPanel.css';

export default function NotificationsPanel({ onClose }) {
  const { notifications, unreadCount, fetchNotifications, markNotificationRead } = useComplianceStore();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = (id) => {
    markNotificationRead(id);
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return '\u{1F6A8}';
      case 'high': return '\u{26A0}️';
      case 'medium': return '\u{1F514}';
      case 'low': return '\u{2139}️';
      default: return '\u{1F514}';
    }
  };

  const getTimeAgo = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'Just now';
  };

  return (
    <div className="notifications-overlay" onClick={onClose}>
      <div className="notifications-panel" onClick={(e) => e.stopPropagation()}>
        <div className="panel-header">
          <h2>Notifications</h2>
          <span className="unread-badge">{unreadCount} unread</span>
          <button className="panel-close" onClick={onClose}>&times;</button>
        </div>

        <div className="notifications-list">
          {notifications.length === 0 ? (
            <div className="no-notifications">
              <p>No notifications yet</p>
              <span>You're all caught up!</span>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${notification.is_read ? 'read' : 'unread'} ${notification.severity}`}
              >
                <div className="notification-icon">
                  {getSeverityIcon(notification.severity)}
                </div>
                <div className="notification-content">
                  <h4>{notification.title}</h4>
                  <p>{notification.message}</p>
                  <span className="notification-time">
                    {getTimeAgo(notification.created_at)}
                  </span>
                </div>
                {!notification.is_read && (
                  <button
                    className="mark-read-btn"
                    onClick={() => handleMarkRead(notification.id)}
                    title="Mark as read"
                  >
                    &#10003;
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
