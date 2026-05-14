import express from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  res.json({ companies: [] });
});

router.post('/', (req, res) => {
  res.json({ message: 'Company created' });
});

router.get('/:id', (req, res) => {
  res.json({ company: {} });
});

router.put('/:id', (req, res) => {
  res.json({ message: 'Company updated' });
});

export default router;
