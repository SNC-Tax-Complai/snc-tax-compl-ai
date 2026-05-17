import express from 'express';
import multer from 'multer';
import path from 'path';
import { requireAuth } from '../middleware/auth.js';
import aiProviderFactory from '../services/ai/aiProviderFactory.js';
import db from '../config/database.js';

const router = express.Router();
router.use(requireAuth);

// Multer for document uploads to AI
const upload = multer({
  dest: path.join(process.cwd(), 'uploads', 'ai-temp'),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB for AI analysis
});

// POST /api/ai/analyze-document
router.post('/analyze-document', upload.single('file'), async (req, res, next) => {
  try {
    const providerId = req.body.provider || null;
    const companyId = req.user.companyId || req.user.company_id;

    // Build context from company data
    let context = { companyType: 'pty_ltd', sector: 'general' };
    if (companyId) {
      const company = await db.oneOrNone(
        'SELECT company_type, industry_sector FROM companies WHERE id = $1',
        [companyId]
      );
      if (company) {
        context = {
          companyType: company.company_type || 'pty_ltd',
          sector: company.industry_sector || 'general',
        };
      }
    }

    const file = req.file || { originalname: 'sample.pdf', mimetype: 'application/pdf', path: '' };
    const result = await aiProviderFactory.analyzeDocument(file, context, providerId);

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// POST /api/ai/generate-recommendations
router.post('/generate-recommendations', async (req, res, next) => {
  try {
    const providerId = req.body.provider || null;
    const companyId = req.user.companyId || req.user.company_id;

    // Gather company data for recommendations
    let companyData = {
      name: 'Your Company',
      companyType: 'pty_ltd',
      sector: 'general',
      employeeCount: 10,
      annualTurnover: 5000000,
      complianceScore: 87,
      overdueCount: 0,
      pendingCount: 3,
    };

    if (companyId) {
      const company = await db.oneOrNone('SELECT * FROM companies WHERE id = $1', [companyId]);
      if (company) {
        const scores = await db.oneOrNone(
          'SELECT score, overdue_requirements, pending_requirements FROM compliance_scores WHERE company_id = $1 ORDER BY calculated_at DESC LIMIT 1',
          [companyId]
        );
        companyData = {
          name: company.name,
          companyType: company.company_type,
          sector: company.industry_sector,
          employeeCount: company.employee_count,
          annualTurnover: company.annual_turnover,
          complianceScore: scores?.score || 0,
          overdueCount: scores?.overdue_requirements || 0,
          pendingCount: scores?.pending_requirements || 0,
        };
      }
    }

    const recommendations = await aiProviderFactory.generateRecommendations(companyData, providerId);
    res.json({ recommendations, provider: providerId || aiProviderFactory.defaultProvider });
  } catch (error) {
    next(error);
  }
});

// POST /api/ai/classify
router.post('/classify', async (req, res, next) => {
  try {
    const { text, provider } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }

    const result = await aiProviderFactory.classifyRequirement(text, provider);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/ai/providers
router.get('/providers', (req, res) => {
  res.json({ providers: aiProviderFactory.listProviders() });
});

export default router;
