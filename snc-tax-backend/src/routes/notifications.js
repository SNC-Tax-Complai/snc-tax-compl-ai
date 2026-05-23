import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import db from '../config/database.js';
import notificationService from '../services/notificationService.js';

const router = express.Router();
router.use(requireAuth);

// GET /api/notifications
router.get('/', async (req, res, next) => {
  try {
    const userId    = req.user.userId;
    const companyId = req.user.companyId || req.user.company_id;
    const unreadOnly = req.query.unread === 'true';
    const limit  = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    if (!companyId) return res.json({ notifications: [], unreadCount: 0, total: 0 });

    const result = await notificationService.getUserNotifications(userId, companyId, { limit, offset, unreadOnly });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', async (req, res, next) => {
  try {
    const { id }  = req.params;
    const userId  = req.user.userId;
    const result  = await notificationService.markAsRead(id, userId);
    if (!result) return res.status(404).json({ message: 'Notification not found' });
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    next(error);
  }
});

// PUT /api/notifications/read-all
router.put('/read-all', async (req, res, next) => {
  try {
    const userId    = req.user.userId;
    const companyId = req.user.companyId || req.user.company_id;
    await notificationService.markAllRead(userId, companyId);
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
});

// ─── Notification Preferences ───────────────────────────────────────────────

// GET /api/notifications/preferences
router.get('/preferences', async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user   = await db.oneOrNone('SELECT phone_number, whatsapp_number FROM users WHERE id = $1', [userId]);
    const prefs  = await db.oneOrNone('SELECT * FROM notification_preferences WHERE user_id = $1', [userId]);

    const defaults = {
      email_enabled: true, whatsapp_enabled: false, in_app_enabled: true,
      deadline_3d: true, deadline_7d: true, deadline_overdue: true,
      score_change: true, score_weekly: false, penalty_risk: true,
      regulation_update: true, filing_confirm: true, audit_summary: false,
      quiet_hours_from: '20:00', quiet_hours_to: '07:00',
    };

    res.json({
      preferences: prefs ? { ...defaults, ...prefs } : defaults,
      phoneNumber: user?.phone_number || null,
      whatsappNumber: user?.whatsapp_number || null,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/notifications/preferences
router.put('/preferences', async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const {
      email_enabled, whatsapp_enabled, in_app_enabled,
      deadline_3d, deadline_7d, deadline_overdue,
      score_change, score_weekly, penalty_risk,
      regulation_update, filing_confirm, audit_summary,
      quiet_hours_from, quiet_hours_to,
    } = req.body;

    const prefs = await db.one(`
      INSERT INTO notification_preferences
        (user_id, email_enabled, whatsapp_enabled, in_app_enabled,
         deadline_3d, deadline_7d, deadline_overdue, score_change, score_weekly,
         penalty_risk, regulation_update, filing_confirm, audit_summary,
         quiet_hours_from, quiet_hours_to)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
      ON CONFLICT (user_id) DO UPDATE SET
        email_enabled        = COALESCE($2,  notification_preferences.email_enabled),
        whatsapp_enabled     = COALESCE($3,  notification_preferences.whatsapp_enabled),
        in_app_enabled       = COALESCE($4,  notification_preferences.in_app_enabled),
        deadline_3d          = COALESCE($5,  notification_preferences.deadline_3d),
        deadline_7d          = COALESCE($6,  notification_preferences.deadline_7d),
        deadline_overdue     = COALESCE($7,  notification_preferences.deadline_overdue),
        score_change         = COALESCE($8,  notification_preferences.score_change),
        score_weekly         = COALESCE($9,  notification_preferences.score_weekly),
        penalty_risk         = COALESCE($10, notification_preferences.penalty_risk),
        regulation_update    = COALESCE($11, notification_preferences.regulation_update),
        filing_confirm       = COALESCE($12, notification_preferences.filing_confirm),
        audit_summary        = COALESCE($13, notification_preferences.audit_summary),
        quiet_hours_from     = COALESCE($14, notification_preferences.quiet_hours_from),
        quiet_hours_to       = COALESCE($15, notification_preferences.quiet_hours_to)
      RETURNING *
    `, [userId, email_enabled, whatsapp_enabled, in_app_enabled,
        deadline_3d, deadline_7d, deadline_overdue, score_change, score_weekly,
        penalty_risk, regulation_update, filing_confirm, audit_summary,
        quiet_hours_from || null, quiet_hours_to || null]);

    res.json({ preferences: prefs });
  } catch (error) {
    next(error);
  }
});

// PUT /api/notifications/phone — save phone/WhatsApp number
router.put('/phone', async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { phoneNumber, whatsappNumber } = req.body;

    if (!phoneNumber && !whatsappNumber) {
      return res.status(400).json({ message: 'phoneNumber or whatsappNumber is required' });
    }

    const updated = await db.one(`
      UPDATE users SET
        phone_number     = COALESCE($2, phone_number),
        whatsapp_number  = COALESCE($3, whatsapp_number),
        updated_at       = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING phone_number, whatsapp_number
    `, [userId, phoneNumber || null, whatsappNumber || null]);

    res.json({ phoneNumber: updated.phone_number, whatsappNumber: updated.whatsapp_number });
  } catch (error) {
    next(error);
  }
});

// GET /api/notifications/status — which notification services are configured
router.get('/status', (req, res) => {
  res.json({
    email: {
      configured: !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
      provider: process.env.SMTP_HOST || null,
    },
    whatsapp: {
      configured: !!(process.env.WHATSAPP_API_URL && process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID),
    },
  });
});

export default router;
