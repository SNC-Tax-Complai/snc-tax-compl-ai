import fs from 'fs';
import { createRequire } from 'module';
import mammoth from 'mammoth';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

const PDF_MIME = 'application/pdf';
const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const DOC_MIME = 'application/msword';

/**
 * Extract text/image content from an uploaded file for AI analysis.
 * Returns { type: 'text'|'image'|'unsupported', content, mediaType?, pages? }
 */
export async function extractContent(filePath, mimeType) {
  try {
    if (mimeType === PDF_MIME) {
      const buffer = fs.readFileSync(filePath);
      const result = await pdfParse(buffer);
      return {
        type: 'text',
        content: result.text.trim(),
        pages: result.numpages,
      };
    }

    if (mimeType === DOCX_MIME || mimeType === DOC_MIME) {
      const result = await mammoth.extractRawText({ path: filePath });
      return {
        type: 'text',
        content: result.value.trim(),
      };
    }

    if (mimeType.startsWith('image/')) {
      const buffer = fs.readFileSync(filePath);
      return {
        type: 'image',
        content: buffer.toString('base64'),
        mediaType: mimeType,
      };
    }

    return { type: 'unsupported', content: null };
  } catch (err) {
    return { type: 'error', content: null, error: err.message };
  }
}
