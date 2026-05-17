import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import sarsService from '../services/integrations/sarsService.js';

const router = express.Router();
router.use(requireAuth);

// GET /api/sars/validate/:taxRef
router.get('/validate/:taxRef', async (req, res, next) => {
  try {
    const { taxRef } = req.params;
    const result = await sarsService.validateTaxReference(taxRef);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/sars/filing-status
router.get('/filing-status', async (req, res, next) => {
  try {
    const { taxRef, filingType } = req.query;
    if (!taxRef) return res.status(400).json({ message: 'taxRef is required' });
    const result = await sarsService.getFilingStatus(taxRef, filingType || 'EMP201');
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/sars/tcs/:taxRef
router.get('/tcs/:taxRef', async (req, res, next) => {
  try {
    const { taxRef } = req.params;
    const result = await sarsService.getTaxComplianceStatus(taxRef);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/sars/outstanding/:taxRef
router.get('/outstanding/:taxRef', async (req, res, next) => {
  try {
    const { taxRef } = req.params;
    const result = await sarsService.getOutstandingReturns(taxRef);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/sars/status
router.get('/status', (req, res) => {
  res.json({
    configured: sarsService.isConfigured,
    message: sarsService.isConfigured
      ? 'SARS eFiling integration active'
      : 'SARS credentials not configured - using mock data',
  });
});

export default router;
