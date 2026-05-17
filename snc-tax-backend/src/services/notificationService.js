import db from '../config/database.js';

/**
 * Notification Service
 * Handles creating, querying, and managing notifications
 */
class NotificationService {
  /**
   * Get notifications for a user
   */
  async getUserNotifications(userId, companyId, { limit = 20, offset = 0, unreadOnly = false } = {}) {
    const whereClause = unreadOnly ? 'AND n.is_read = false' : '';

    const notifications = await db.manyOrNone(`
      SELECT
        n.id,
        n.type,
        n.title,
        n.message,
        n.severity,
        n.is_read,
        n.action_url,
        n.created_at,
        cr.regulation_code,
        cr.name AS requirement_name
      FROM notifications n
      LEFT JOIN compliance_requirements cr ON cr.id = n.requirement_id
      WHERE (n.user_id = $1 OR n.company_id = $2)
        AND (n.expires_at IS NULL OR n.expires_at > CURRENT_TIMESTAMP)
        ${whereClause}
      ORDER BY n.created_at DESC
      LIMIT $3 OFFSET $4
    `, [userId, companyId, limit, offset]);

    const unreadCount = await db.one(`
      SELECT COUNT(*) AS count
      FROM notifications
      WHERE (user_id = $1 OR company_id = $2)
        AND is_read = false
        AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
    `, [userId, companyId]);

    return {
      notifications,
      unreadCount: parseInt(unreadCount.count),
      total: notifications.length,
    };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId, userId) {
    return db.oneOrNone(`
      UPDATE notifications
      SET is_read = true
      WHERE id = $1 AND (user_id = $2 OR user_id IS NULL)
      RETURNING id
    `, [notificationId, userId]);
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllRead(userId, companyId) {
    return db.result(`
      UPDATE notifications
      SET is_read = true
      WHERE (user_id = $1 OR company_id = $2)
        AND is_read = false
    `, [userId, companyId]);
  }

  /**
   * Create overdue notifications for a company
   */
  async generateOverdueNotifications(companyId) {
    const overdueItems = await db.manyOrNone(`
      SELECT
        cs.id AS status_id,
        cs.due_date,
        cr.id AS requirement_id,
        cr.name AS requirement_name,
        cr.regulation_code,
        CURRENT_DATE - cs.due_date AS days_overdue
      FROM compliance_statuses cs
      JOIN compliance_requirements cr ON cr.id = cs.requirement_id
      WHERE cs.company_id = $1
        AND cs.status = 'overdue'
        AND cs.due_date < CURRENT_DATE
    `, [companyId]);

    const created = [];
    for (const item of overdueItems) {
      // Check if notification already exists for this requirement today
      const existing = await db.oneOrNone(`
        SELECT id FROM notifications
        WHERE company_id = $1
          AND requirement_id = $2
          AND type = 'overdue'
          AND DATE(created_at) = CURRENT_DATE
      `, [companyId, item.requirement_id]);

      if (!existing) {
        const notification = await db.one(`
          INSERT INTO notifications (company_id, requirement_id, type, title, message, severity)
          VALUES ($1, $2, 'overdue', $3, $4, $5)
          RETURNING id
        `, [
          companyId,
          item.requirement_id,
          `Overdue: ${item.regulation_code}`,
          `${item.requirement_name} is ${item.days_overdue} days overdue (due ${item.due_date})`,
          item.days_overdue > 30 ? 'critical' : item.days_overdue > 7 ? 'high' : 'medium',
        ]);
        created.push(notification);
      }
    }

    return created;
  }

  /**
   * Create a reminder notification for upcoming due dates
   */
  async generateReminders(companyId, daysAhead = 7) {
    const upcomingItems = await db.manyOrNone(`
      SELECT
        cs.id AS status_id,
        cs.due_date,
        cr.id AS requirement_id,
        cr.name AS requirement_name,
        cr.regulation_code,
        cs.due_date - CURRENT_DATE AS days_until_due
      FROM compliance_statuses cs
      JOIN compliance_requirements cr ON cr.id = cs.requirement_id
      WHERE cs.company_id = $1
        AND cs.status IN ('pending', 'in_progress')
        AND cs.due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + $2
    `, [companyId, daysAhead]);

    const created = [];
    for (const item of upcomingItems) {
      const existing = await db.oneOrNone(`
        SELECT id FROM notifications
        WHERE company_id = $1
          AND requirement_id = $2
          AND type = 'reminder'
          AND DATE(created_at) = CURRENT_DATE
      `, [companyId, item.requirement_id]);

      if (!existing) {
        const notification = await db.one(`
          INSERT INTO notifications (company_id, requirement_id, type, title, message, severity)
          VALUES ($1, $2, 'reminder', $3, $4, $5)
          RETURNING id
        `, [
          companyId,
          item.requirement_id,
          `Due soon: ${item.regulation_code}`,
          `${item.requirement_name} is due in ${item.days_until_due} days (${item.due_date})`,
          item.days_until_due <= 3 ? 'high' : 'medium',
        ]);
        created.push(notification);
      }
    }

    return created;
  }
}

export default new NotificationService();
