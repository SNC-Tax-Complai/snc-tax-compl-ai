import express from 'express';
import multer from 'multer';
import path from 'path';
import { requireAuth } from '../middleware/auth.js';
import documentService from '../services/documentService.js';
import { analyzeForUser } from '../services/ai/aiProviderFactory.js';
import db from '../config/database.js';

const router = express.Router();
router.use(requireAuth);

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
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/gif',
    ];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error('File type not allowed. Accepted: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF'));
  },
});

// GET /api/documents — list documents for the authenticated user's active company
router.get('/', async (req, res, next) => {
  try {
    const { category, limit = 50, offset = 0 } = req.query;
    const companyId = await getActiveCompanyId(req.user.id);
    if (!companyId) return res.json({ documents: [], total: 0 });

    const documents = await documentService.getCompanyDocuments(companyId, {
      category: category || undefined,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({ documents, total: documents.length });
  } catch (err) {
    next(err);
  }
});

// POST /api/documents/upload — upload a new document
router.post('/upload', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });

    const companyId = await getActiveCompanyId(req.user.id);
    if (!companyId) return res.status(400).json({ error: 'No active company found' });

    const { category, description } = req.body;

    const doc = await documentService.storeDocument(req.file, {
      companyId,
      statusId: null,
      uploadedBy: req.user.id,
      category: category || 'evidence',
      description: description || null,
    });

    res.status(201).json({ document: doc });
  } catch (err) {
    next(err);
  }
});

// GET /api/documents/:id/download — stream the file to the client
router.get('/:id/download', async (req, res, next) => {
  try {
    const companyId = await getActiveCompanyId(req.user.id);
    if (!companyId) return res.status(403).json({ error: 'No active company' });

    const doc = await documentService.getDocumentFile(req.params.id, companyId);
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    res.setHeader('Content-Disposition', `attachment; filename="${doc.original_name}"`);
    res.setHeader('Content-Type', doc.mime_type || 'application/octet-stream');
    res.sendFile(doc.file_path);
  } catch (err) {
    next(err);
  }
});

// POST /api/documents/:id/analyze — run AI analysis on an existing document
router.post('/:id/analyze', async (req, res, next) => {
  try {
    const companyId = await getActiveCompanyId(req.user.id);
    if (!companyId) return res.status(403).json({ error: 'No active company' });

    const doc = await documentService.getDocumentFile(req.params.id, companyId);
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    const company = await db.oneOrNone(
      'SELECT name, company_type, sector FROM companies WHERE id = $1', [companyId]
    );

    const fileForAnalysis = {
      path: doc.file_path,
      file_path: doc.file_path,
      originalname: doc.original_name,
      filename: doc.original_name,
      mimetype: doc.mime_type,
      mime_type: doc.mime_type,
    };

    const context = {
      companyName: company?.name,
      companyType: company?.company_type,
      sector: company?.sector,
    };

    const result = await analyzeForUser(req.user.id, fileForAnalysis, context);

    if (result.status === 'success') {
      await documentService.saveAnalysis(
        req.params.id,
        companyId,
        result.analysis,
        result.analysis
      );
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/documents/:id — soft delete
router.delete('/:id', async (req, res, next) => {
  try {
    const companyId = await getActiveCompanyId(req.user.id);
    if (!companyId) return res.status(403).json({ error: 'No active company' });

    const deleted = await documentService.deleteDocument(req.params.id, companyId);
    if (!deleted) return res.status(404).json({ error: 'Document not found' });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

async function getActiveCompanyId(userId) {
  const row = await db.oneOrNone(
    'SELECT company_id FROM users WHERE id = $1', [userId]
  );
  return row?.company_id || null;
}

export default router;
