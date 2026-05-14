import express from 'express';
import * as complianceController from '../controllers/complianceController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/dashboard', complianceController.getDashboard);
router.get('/:module', complianceController.getComplianceByModule);
router.get('/requirement/:id', complianceController.getRequirement);
router.put('/:id', complianceController.updateComplianceStatus);
router.post('/:id/documents', complianceController.uploadDocument);
router.get('/report/generate', complianceController.generateReport);

export default router;
