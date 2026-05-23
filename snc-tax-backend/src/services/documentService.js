import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/database.js';
import { extractContent } from './documentParserService.js';

/**
 * Document Service
 * Handles file upload, storage, and retrieval
 */
class DocumentService {
  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
    this.ensureUploadDir();
  }

  ensureUploadDir() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Store uploaded file metadata in database, then kick off async text extraction.
   */
  async storeDocument(file, { companyId, statusId, uploadedBy, category, description }) {
    const filename = `${uuidv4()}${path.extname(file.originalname)}`;
    const filePath = path.join(this.uploadDir, filename);

    fs.renameSync(file.path, filePath);

    const document = await db.one(`
      INSERT INTO documents (company_id, status_id, filename, original_name, file_path, file_size, mime_type, category, uploaded_by, description, extraction_status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending')
      RETURNING id, filename, original_name, file_size, mime_type, category, description, created_at, extraction_status
    `, [
      companyId,
      statusId || null,
      filename,
      file.originalname,
      filePath,
      file.size,
      file.mimetype,
      category || 'evidence',
      uploadedBy,
      description || null,
    ]);

    // Fire-and-forget extraction
    this._runExtraction(document.id, filePath, file.mimetype).catch(() => {});

    return document;
  }

  async _runExtraction(documentId, filePath, mimeType) {
    try {
      await db.none(`UPDATE documents SET extraction_status = 'processing' WHERE id = $1`, [documentId]);
      const extracted = await extractContent(filePath, mimeType);
      if (extracted.type === 'text' && extracted.content) {
        await db.none(`
          UPDATE documents SET extracted_text = $1, extraction_status = 'done' WHERE id = $2
        `, [extracted.content, documentId]);
      } else if (extracted.type === 'image') {
        // Image content stored as base64 reference — AI analysis runs on demand
        await db.none(`UPDATE documents SET extraction_status = 'image_ready' WHERE id = $1`, [documentId]);
      } else {
        await db.none(`UPDATE documents SET extraction_status = 'unsupported' WHERE id = $1`, [documentId]);
      }
    } catch {
      await db.none(`UPDATE documents SET extraction_status = 'failed' WHERE id = $1`, [documentId]).catch(() => {});
    }
  }

  /**
   * Get documents for a company
   */
  async getCompanyDocuments(companyId, { category, statusId, limit = 50, offset = 0 } = {}) {
    let whereClause = 'WHERE d.company_id = $1 AND d.is_deleted = false';
    const params = [companyId];
    let paramIndex = 2;

    if (category) {
      whereClause += ` AND d.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (statusId) {
      whereClause += ` AND d.status_id = $${paramIndex}`;
      params.push(statusId);
      paramIndex++;
    }

    params.push(limit, offset);

    const documents = await db.manyOrNone(`
      SELECT
        d.id,
        d.filename,
        d.original_name,
        d.file_size,
        d.mime_type,
        d.category,
        d.description,
        d.created_at,
        d.extraction_status,
        d.ai_analysis,
        d.extracted_data,
        u.first_name || ' ' || u.last_name AS uploaded_by_name
      FROM documents d
      LEFT JOIN users u ON u.id = d.uploaded_by
      ${whereClause}
      ORDER BY d.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, params);

    return documents;
  }

  /**
   * Get a single document's file path for download
   */
  async getDocumentFile(documentId, companyId) {
    const doc = await db.oneOrNone(`
      SELECT file_path, original_name, mime_type
      FROM documents
      WHERE id = $1 AND company_id = $2 AND is_deleted = false
    `, [documentId, companyId]);

    return doc;
  }

  /**
   * Save AI analysis result for a document
   */
  async saveAnalysis(documentId, companyId, analysis, extractedData) {
    return db.oneOrNone(`
      UPDATE documents
      SET ai_analysis = $3, extracted_data = $4
      WHERE id = $1 AND company_id = $2
      RETURNING id, ai_analysis, extracted_data
    `, [documentId, companyId, JSON.stringify(analysis), JSON.stringify(extractedData || {})]);
  }

  /**
   * Soft delete a document
   */
  async deleteDocument(documentId, companyId) {
    return db.oneOrNone(`
      UPDATE documents
      SET is_deleted = true
      WHERE id = $1 AND company_id = $2
      RETURNING id
    `, [documentId, companyId]);
  }
}

export default new DocumentService();
