import express from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

router.post('/analyze-document', (req, res) => {
  res.json({ analysis: {} });
});

router.post('/generate-recommendations', (req, res) => {
  res.json({ recommendations: [] });
});

router.get('/providers', (req, res) => {
  res.json({
    providers: [
      { id: 'emma-i', name: 'Emma-i™', status: 'active' },
      { id: 'openai', name: 'OpenAI GPT-4', status: 'available' },
      { id: 'claude', name: 'Anthropic Claude', status: 'available' },
      { id: 'gemini', name: 'Google Gemini', status: 'available' },
    ],
  });
});

export default router;
