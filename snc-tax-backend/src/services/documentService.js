import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/database.js';

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
   * Store uploaded file metadata in database
   */
  async storeDocument(file, { companyId, statusId, uploadedBy, category, description }) {
    const filename = `${uuidv4()}${path.extname(file.originalname)}`;
    const filePath = path.join(this.uploadDir, filename);

    // Move file to storage
    fs.renameSync(file.path, filePath);

    const document = await db.one(`
      INSERT INTO documents (company_id, status_id, filename, original_name, file_path, file_size, mime_type, category, uploaded_by, description)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, filename, original_name, file_size, mime_type, category, created_at
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

    return document;
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
