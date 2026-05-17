import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import notificationService from '../services/notificationService.js';

const router = express.Router();
router.use(requireAuth);

// GET /api/notifications
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const companyId = req.user.companyId || req.user.company_id;
    const unreadOnly = req.query.unread === 'true';
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    if (!companyId) {
      return res.json({ notifications: [], unreadCount: 0, total: 0 });
    }

    const result = await notificationService.getUserNotifications(userId, companyId, {
      limit,
      offset,
      unreadOnly,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const result = await notificationService.markAsRead(id, userId);

    if (!result) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    next(error);
  }
});

// PUT /api/notifications/read-all
router.put('/read-all', async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const companyId = req.user.companyId || req.user.company_id;

    await notificationService.markAllRead(userId, companyId);
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
});

export default router;
