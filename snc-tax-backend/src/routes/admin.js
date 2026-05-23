import express from 'express';
import bcrypt from 'bcryptjs';
import { requireAuth, requireRole } from '../middleware/auth.js';
import db from '../config/database.js';
import auditService from '../services/auditService.js';

const router = express.Router();
router.use(requireAuth);
router.use(requireRole(['admin', 'manager']));

// ─── Users ─────────────────────────────────────────────────────────────────

// GET /api/admin/users — list all users in the company
router.get('/users', async (req, res, next) => {
  try {
    const companyId = req.user.companyId || req.user.company_id;
    const limit  = Math.min(parseInt(req.query.limit) || 50, 200);
    const offset = parseInt(req.query.offset) || 0;
    const search = req.query.search || '';

    const whereExtra = search
      ? `AND (u.first_name ILIKE $3 OR u.last_name ILIKE $3 OR u.email ILIKE $3)`
      : '';
    const params = search
      ? [companyId, true, `%${search}%`, limit, offset]
      : [companyId, true, limit, offset];

    const limitIdx  = search ? 4 : 3;
    const offsetIdx = search ? 5 : 4;

    const users = await db.manyOrNone(`
      SELECT id, email, first_name, last_name, role, is_active,
             created_at, last_login_at
      FROM users u
      WHERE company_id = $1 AND is_active = $2 ${whereExtra}
      ORDER BY created_at DESC
      LIMIT $${limitIdx} OFFSET $${offsetIdx}
    `, params);

    const total = await db.one(
      `SELECT COUNT(*) FROM users WHERE company_id = $1 AND is_active = $2`,
      [companyId, true]
    );

    res.json({ users, total: parseInt(total.count), limit, offset });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/users — invite/create a user in the company
router.post('/users', async (req, res, next) => {
  try {
    const { email, first_name, last_name, role = 'user', password } = req.body;
    const companyId = req.user.companyId || req.user.company_id;

    if (!email || !first_name || !last_name) {
      return res.status(400).json({ message: 'email, first_name and last_name are required' });
    }

    const existing = await db.oneOrNone('SELECT id FROM users WHERE email = $1', [email]);
    if (existing) {
      return res.status(409).json({ message: 'A user with this email already exists' });
    }

    const tempPassword = password || Math.random().toString(36).slice(-10) + 'A1!';
    const hash = await bcrypt.hash(tempPassword, 10);

    const user = await db.one(`
      INSERT INTO users (email, password_hash, first_name, last_name, company_id, role)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email, first_name, last_name, role, is_active, created_at
    `, [email.toLowerCase().trim(), hash, first_name.trim(), last_name.trim(), companyId, role]);

    await auditService.log({
      userId: req.user.userId, companyId,
      action: 'create', entityType: 'user', entityId: user.id,
      newValue: { email, role }, req,
    });

    res.status(201).json({ user, temporaryPassword: password ? undefined : tempPassword });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/users/:id — update role or active status
router.put('/users/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, is_active } = req.body;
    const companyId = req.user.companyId || req.user.company_id;

    const target = await db.oneOrNone(
      'SELECT id, role FROM users WHERE id = $1 AND company_id = $2',
      [id, companyId]
    );
    if (!target) return res.status(404).json({ message: 'User not found' });
    if (id === req.user.userId) return res.status(400).json({ message: 'Cannot modify your own account via admin panel' });

    const updated = await db.one(`
      UPDATE users SET
        role       = COALESCE($2, role),
        is_active  = COALESCE($3, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, email, first_name, last_name, role, is_active, updated_at
    `, [id, role || null, is_active !== undefined ? is_active : null]);

    await auditService.log({
      userId: req.user.userId, companyId,
      action: 'update', entityType: 'user', entityId: id,
      oldValue: { role: target.role }, newValue: { role, is_active }, req,
    });

    res.json({ user: updated });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/users/:id — deactivate user (soft delete)
router.delete('/users/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId || req.user.company_id;
    if (id === req.user.userId) return res.status(400).json({ message: 'Cannot deactivate your own account' });

    const target = await db.oneOrNone(
      'SELECT id FROM users WHERE id = $1 AND company_id = $2',
      [id, companyId]
    );
    if (!target) return res.status(404).json({ message: 'User not found' });

    await db.none(
      'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );

    await auditService.log({
      userId: req.user.userId, companyId,
      action: 'delete', entityType: 'user', entityId: id, req,
    });

    res.json({ message: 'User deactivated' });
  } catch (error) {
    next(error);
  }
});

// ─── Audit Log ─────────────────────────────────────────────────────────────

// GET /api/admin/audit-log
router.get('/audit-log', async (req, res, next) => {
  try {
    const companyId = req.user.companyId || req.user.company_id;
    const limit      = Math.min(parseInt(req.query.limit) || 50, 200);
    const offset     = parseInt(req.query.offset) || 0;
    const action     = req.query.action || null;
    const entityType = req.query.entityType || null;

    const entries = await auditService.getCompanyAuditLog(companyId, { limit, offset, action, entityType });
    const totalRow = await db.one(
      'SELECT COUNT(*) FROM audit_log WHERE company_id = $1',
      [companyId]
    );

    res.json({ entries, total: parseInt(totalRow.count), limit, offset });
  } catch (error) {
    next(error);
  }
});

// ─── Admin Stats ────────────────────────────────────────────────────────────

// GET /api/admin/stats
router.get('/stats', async (req, res, next) => {
  try {
    const companyId = req.user.companyId || req.user.company_id;

    const [userCount, auditCount, docCount] = await Promise.all([
      db.one('SELECT COUNT(*) FROM users WHERE company_id = $1 AND is_active = true', [companyId]),
      db.one('SELECT COUNT(*) FROM audit_log WHERE company_id = $1', [companyId]),
      db.one('SELECT COUNT(*) FROM documents WHERE company_id = $1 AND is_deleted = false', [companyId]),
    ]);

    res.json({
      activeUsers: parseInt(userCount.count),
      auditEntries: parseInt(auditCount.count),
      documents: parseInt(docCount.count),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
