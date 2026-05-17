import db from '../config/database.js';

/**
 * Audit Service
 * Tracks all data modifications for compliance and security
 */
class AuditService {
  /**
   * Log an action
   */
  async log({ userId, companyId, action, entityType, entityId, oldValue, newValue, req }) {
    try {
      await db.none(`
        INSERT INTO audit_log (user_id, company_id, action, entity_type, entity_id, old_value, new_value, ip_address, user_agent)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        userId || null,
        companyId || null,
        action,
        entityType || null,
        entityId || null,
        oldValue ? JSON.stringify(oldValue) : null,
        newValue ? JSON.stringify(newValue) : null,
        req?.ip || null,
        req?.headers?.['user-agent'] || null,
      ]);
    } catch (error) {
      // Audit logging should never break the main flow
      console.error('Audit log error:', error.message);
    }
  }

  /**
   * Get audit log for a company
   */
  async getCompanyAuditLog(companyId, { limit = 50, offset = 0, action, entityType } = {}) {
    let whereClause = 'WHERE al.company_id = $1';
    const params = [companyId];
    let paramIndex = 2;

    if (action) {
      whereClause += ` AND al.action = $${paramIndex}`;
      params.push(action);
      paramIndex++;
    }

    if (entityType) {
      whereClause += ` AND al.entity_type = $${paramIndex}`;
      params.push(entityType);
      paramIndex++;
    }

    params.push(limit, offset);

    return db.manyOrNone(`
      SELECT
        al.id,
        al.action,
        al.entity_type,
        al.entity_id,
        al.old_value,
        al.new_value,
        al.ip_address,
        al.created_at,
        u.first_name || ' ' || u.last_name AS user_name,
        u.email AS user_email
      FROM audit_log al
      LEFT JOIN users u ON u.id = al.user_id
      ${whereClause}
      ORDER BY al.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, params);
  }
}

export default new AuditService();
