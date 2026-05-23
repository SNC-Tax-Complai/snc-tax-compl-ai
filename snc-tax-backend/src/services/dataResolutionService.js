import db from '../config/database.js';
import sarsService from './integrations/sarsService.js';
import logger from '../config/logger.js';

/**
 * Maps each compliance module to keywords found in document AI analysis.
 * Used to match a document's relevantModules / documentType to DB requirements.
 */
const MODULE_KEYWORDS = {
  sars: ['income tax', 'vat', 'paye', 'efiling', 'tax return', 'emp201', 'emp501', 'vat201', 'itr14', 'tax clearance', 'sars'],
  cipc: ['cipc', 'registration', 'annual return', 'company registration', 'cor', 'memorandum', 'incorporation'],
  labour: ['uif', 'labour', 'employment equity', 'skills development', 'bcea', 'labour act', 'ufiling'],
  ohs: ['ohs', 'occupational health', 'safety', 'hazard', 'coid'],
  popia: ['popia', 'privacy', 'data protection', 'information officer', 'personal information'],
  bbbee: ['bbbee', 'broad-based', 'bee', 'empowerment', 'scorecard', 'bbbee certificate'],
  fica: ['fica', 'kyc', 'know your customer', 'financial intelligence', 'fic'],
  municipal: ['municipal', 'business licence', 'rates', 'zoning', 'trading licence'],
  tax_engine: ['provisional tax', 'tax estimate', 'ipa1', 'ipa2', 'itr12', 'six months tax'],
  industry: ['fsp', 'fsca', 'nca', 'ncrcp', 'pharmacy', 'mining', 'petroleum'],
};

/**
 * Derive which compliance modules a document's AI analysis is evidence for.
 * Checks both relevantModules[] and a keyword scan of documentType + summary.
 */
function matchModulesFromAnalysis(analysis) {
  if (!analysis) return [];
  const matched = new Set(analysis.relevantModules || []);

  const haystack = [
    analysis.documentType || '',
    analysis.summary || '',
    ...(analysis.recommendations || []),
  ].join(' ').toLowerCase();

  for (const [mod, keywords] of Object.entries(MODULE_KEYWORDS)) {
    if (keywords.some((kw) => haystack.includes(kw))) {
      matched.add(mod);
    }
  }
  return [...matched];
}

/**
 * After a document is analysed, update data_source on matching compliance_statuses.
 * Sets data_source = 'document' and source_document_id for all non-completed statuses
 * in the matched modules.
 */
export async function autoUpdateFromDocument(documentId, companyId) {
  try {
    const doc = await db.oneOrNone(
      `SELECT ai_analysis FROM documents WHERE id = $1 AND company_id = $2 AND is_deleted = false`,
      [documentId, companyId]
    );
    if (!doc?.ai_analysis) return { updated: 0 };

    const analysis = typeof doc.ai_analysis === 'string'
      ? JSON.parse(doc.ai_analysis)
      : doc.ai_analysis;

    const matchedModules = matchModulesFromAnalysis(analysis);
    if (matchedModules.length === 0) return { updated: 0 };

    // Update all non-completed statuses in matched modules that currently have no document source
    const result = await db.result(`
      UPDATE compliance_statuses cs
      SET data_source = 'document',
          source_document_id = $1,
          updated_at = CURRENT_TIMESTAMP
      FROM compliance_requirements cr
      WHERE cs.requirement_id = cr.id
        AND cs.company_id = $2
        AND cr.module = ANY($3::text[])
        AND cs.status NOT IN ('completed', 'not_applicable')
        AND (cs.data_source IS NULL OR cs.data_source = 'non_compliant')
    `, [documentId, companyId, matchedModules]);

    logger.info('dataResolution: document auto-update', {
      documentId, companyId, matchedModules, updated: result.rowCount,
    });

    return { updated: result.rowCount, matchedModules };
  } catch (err) {
    logger.error('dataResolution: autoUpdateFromDocument failed', { err: err.message });
    return { updated: 0, error: err.message };
  }
}

/**
 * For a company, try to confirm statuses via the SARS API.
 * Marks matching statuses as data_source = 'api' when SARS confirms compliance.
 * Only runs when SARS is configured.
 */
export async function resolveViaAPI(companyId) {
  if (!sarsService.isConfigured) return { updated: 0, reason: 'SARS not configured' };

  try {
    const company = await db.oneOrNone(
      `SELECT tax_reference FROM companies WHERE id = $1`, [companyId]
    );
    if (!company?.tax_reference) return { updated: 0, reason: 'No tax reference on company' };

    const tcs = await sarsService.getTaxComplianceStatus(company.tax_reference);
    if (!tcs || tcs.configured === false) return { updated: 0, reason: 'SARS API unavailable' };

    // If TCS is compliant, mark all SARS statuses in good standing as api-sourced
    if (tcs.compliant === true || tcs.status === 'compliant') {
      const result = await db.result(`
        UPDATE compliance_statuses cs
        SET data_source = 'api', updated_at = CURRENT_TIMESTAMP
        FROM compliance_requirements cr
        WHERE cs.requirement_id = cr.id
          AND cs.company_id = $1
          AND cr.module = 'sars'
          AND cs.status NOT IN ('overdue', 'not_applicable')
          AND (cs.data_source IS NULL OR cs.data_source = 'non_compliant')
      `, [companyId]);
      return { updated: result.rowCount, source: 'sars_tcs' };
    }

    return { updated: 0, reason: 'SARS TCS not compliant' };
  } catch (err) {
    logger.error('dataResolution: resolveViaAPI failed', { err: err.message });
    return { updated: 0, error: err.message };
  }
}

/**
 * Full resolution pass for a company:
 * 1. Scan all analysed documents → mark matched statuses as 'document'
 * 2. Try SARS API for remaining → mark as 'api'
 * 3. Everything left stays 'non_compliant'
 *
 * Returns a summary of what changed.
 */
export async function resolveAll(companyId) {
  const summary = { document: 0, api: 0, non_compliant: 0, errors: [] };

  try {
    // Step 1: All analysed documents for this company
    const docs = await db.manyOrNone(`
      SELECT id, ai_analysis FROM documents
      WHERE company_id = $1 AND is_deleted = false AND ai_analysis IS NOT NULL
    `, [companyId]);

    for (const doc of docs) {
      const res = await autoUpdateFromDocument(doc.id, companyId);
      summary.document += res.updated || 0;
    }

    // Step 2: SARS API for remaining
    const apiRes = await resolveViaAPI(companyId);
    summary.api += apiRes.updated || 0;

    // Step 3: Mark all remaining unresolved non_compliant (they already default to it; just ensure it's set)
    await db.none(`
      UPDATE compliance_statuses
      SET data_source = 'non_compliant'
      WHERE company_id = $1
        AND (data_source IS NULL OR data_source NOT IN ('document', 'api', 'manual'))
    `, [companyId]);

    // Count current non-compliant
    const nc = await db.one(
      `SELECT COUNT(*) AS cnt FROM compliance_statuses WHERE company_id = $1 AND data_source = 'non_compliant'`,
      [companyId]
    );
    summary.non_compliant = parseInt(nc.cnt);

  } catch (err) {
    summary.errors.push(err.message);
    logger.error('dataResolution: resolveAll failed', { err: err.message });
  }

  return summary;
}
