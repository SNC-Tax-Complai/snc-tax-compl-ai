import express from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  res.json({ notifications: [] });
});

router.put('/:id/read', (req, res) => {
  res.json({ message: 'Notification marked as read' });
});

export default router;
