import express from 'express';
import multer from 'multer';
import path from 'path';
import * as complianceController from '../controllers/complianceController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/gif',
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed. Accepted: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF'));
    }
  },
});

// Static routes MUST come before parameterized routes
router.get('/dashboard', complianceController.getDashboard);
router.get('/report/generate', complianceController.generateReport);
router.get('/requirement/:id', complianceController.getRequirement);

// Parameterized routes
router.get('/:module', complianceController.getComplianceByModule);
router.put('/:id', complianceController.updateComplianceStatus);
router.post('/:id/documents', upload.single('file'), complianceController.uploadDocument);

export default router;
