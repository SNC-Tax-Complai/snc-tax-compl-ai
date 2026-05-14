import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);
router.use(requireRole(['admin', 'manager']));

router.get('/users', (req, res) => {
  res.json({ users: [] });
});

router.post('/users', (req, res) => {
  res.json({ message: 'User created' });
});

router.put('/users/:id', (req, res) => {
  res.json({ message: 'User updated' });
});

router.delete('/users/:id', (req, res) => {
  res.json({ message: 'User deleted' });
});

router.get('/settings', (req, res) => {
  res.json({ settings: {} });
});

router.put('/settings', (req, res) => {
  res.json({ message: 'Settings updated' });
});

export default router;
