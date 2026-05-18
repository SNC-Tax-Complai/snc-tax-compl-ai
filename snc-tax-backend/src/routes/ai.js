import express from 'express';
import multer from 'multer';
import path from 'path';
import { requireAuth } from '../middleware/auth.js';
import aiProviderFactory, { chatForUser, analyzeForUser, recommendForUser, classifyForUser, resolveProviderForUser } from '../services/ai/aiProviderFactory.js';
import db from '../config/database.js';

const router = express.Router();
router.use(requireAuth);

const upload = multer({
  dest: path.join(process.cwd(), 'uploads', 'ai-temp'),
  limits: { fileSize: 20 * 1024 * 1024 },
});

// ─── Helper: get company context for a user ───
async function getCompanyContext(userId, companyId) {
  const cid = companyId;
  if (!cid) return { name: 'Your Company', companyType: 'pty_ltd', sector: 'general', employeeCount: 10, annualTurnover: 5000000 };
  const company = await db.oneOrNone('SELECT * FROM companies WHERE id = $1', [cid]);
  if (!company) return { name: 'Your Company', companyType: 'pty_ltd', sector: 'general', employeeCount: 10, annualTurnover: 5000000 };
  return {
    name: company.name,
    companyType: company.company_type || 'pty_ltd',
    sector: company.industry_sector || 'general',
    employeeCount: company.employee_count || 10,
    annualTurnover: company.annual_turnover || 5000000,
    registrationNumber: company.registration_number,
    taxReference: company.tax_reference,
  };
}

async function getComplianceSnapshot(companyId) {
  if (!companyId) return { score: 0, overdue: 0, pending: 0, completed: 0, total: 0 };
  const scores = await db.oneOrNone(
    'SELECT score, total_requirements, completed_requirements, pending_requirements, overdue_requirements, breakdown FROM compliance_scores WHERE company_id = $1 ORDER BY calculated_at DESC LIMIT 1',
    [companyId]
  );
  if (!scores) return { score: 0, overdue: 0, pending: 0, completed: 0, total: 0 };
  return {
    score: scores.score,
    overdue: scores.overdue_requirements,
    pending: scores.pending_requirements,
    completed: scores.completed_requirements,
    total: scores.total_requirements,
    breakdown: scores.breakdown,
  };
}

// ─── Core AI endpoints (now with per-user provider resolution) ───

// POST /api/ai/chat
router.post('/chat', async (req, res, next) => {
  try {
    const { messages, provider } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: 'messages array is required' });
    }
    const result = await chatForUser(req.user.userId, messages, provider);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// POST /api/ai/analyze-document
router.post('/analyze-document', upload.single('file'), async (req, res, next) => {
  try {
    const companyId = req.user.companyId || req.user.company_id;
    const ctx = await getCompanyContext(req.user.userId, companyId);
    const file = req.file || { originalname: 'sample.pdf', mimetype: 'application/pdf', path: '' };
    const result = await analyzeForUser(req.user.userId, file, ctx, req.body.provider);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// POST /api/ai/generate-recommendations
router.post('/generate-recommendations', async (req, res, next) => {
  try {
    const companyId = req.user.companyId || req.user.company_id;
    const ctx = await getCompanyContext(req.user.userId, companyId);
    const snap = await getComplianceSnapshot(companyId);
    const companyData = { ...ctx, complianceScore: snap.score, overdueCount: snap.overdue, pendingCount: snap.pending };
    const recommendations = await recommendForUser(req.user.userId, companyData, req.body.provider);
    res.json({ recommendations, provider: req.body.provider || 'default' });
  } catch (error) {
    next(error);
  }
});

// POST /api/ai/classify
router.post('/classify', async (req, res, next) => {
  try {
    const { text, provider } = req.body;
    if (!text) return res.status(400).json({ message: 'Text is required' });
    const result = await classifyForUser(req.user.userId, text, provider);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/ai/providers
router.get('/providers', (req, res) => {
  res.json({ providers: aiProviderFactory.listProviders() });
});

// ─── AI-Powered Intelligence Endpoints ───

// POST /api/ai/insights — Dashboard smart insights
router.post('/insights', async (req, res, next) => {
  try {
    const companyId = req.user.companyId || req.user.company_id;
    const ctx = await getCompanyContext(req.user.userId, companyId);
    const snap = await getComplianceSnapshot(companyId);

    const prompt = `You are Emma-i™, the SA compliance AI. Generate 3-5 smart compliance insights for this company dashboard.

Company: ${ctx.name} (${ctx.companyType}, ${ctx.sector})
Employees: ${ctx.employeeCount} | Turnover: R${ctx.annualTurnover}
Compliance score: ${snap.score}% | Overdue: ${snap.overdue} | Pending: ${snap.pending} | Completed: ${snap.completed}/${snap.total}
${snap.breakdown ? `Module breakdown: ${JSON.stringify(snap.breakdown)}` : ''}

Return JSON array of insights, each with: { "type": "warning|tip|action|success", "title": "short title", "message": "1-2 sentence insight", "module": "cipc|sars|labour|ohs|popia|bbbee|fica|municipal|industry|general", "priority": "high|medium|low" }

Focus on actionable, SA-specific advice. Reference actual legislation where relevant.`;

    const result = await chatForUser(req.user.userId, [{ role: 'user', content: prompt }]);
    let insights = [];
    try {
      const cleaned = (result.message || '').replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      insights = JSON.parse(cleaned);
    } catch { insights = [{ type: 'tip', title: 'AI Available', message: result.message || 'Ask Emma-i for compliance advice.', module: 'general', priority: 'low' }]; }

    res.json({ insights, provider: result.provider, status: result.status });
  } catch (error) {
    next(error);
  }
});

// POST /api/ai/risk-analysis — Risk Analytics AI explanations
router.post('/risk-analysis', async (req, res, next) => {
  try {
    const companyId = req.user.companyId || req.user.company_id;
    const ctx = await getCompanyContext(req.user.userId, companyId);
    const snap = await getComplianceSnapshot(companyId);

    const overdueItems = await db.manyOrNone(
      `SELECT cr.name, cr.module, cr.penalty_amount, cr.penalty_description, cs.due_date
       FROM compliance_statuses cs
       JOIN compliance_requirements cr ON cr.id = cs.requirement_id
       WHERE cs.company_id = $1 AND cs.status IN ('overdue', 'at_risk')
       ORDER BY cr.penalty_amount DESC NULLS LAST LIMIT 10`,
      [companyId]
    );

    const prompt = `You are Emma-i™. Provide a detailed risk analysis for this South African company.

Company: ${ctx.name} (${ctx.companyType}, ${ctx.sector})
Employees: ${ctx.employeeCount} | Turnover: R${ctx.annualTurnover}
Score: ${snap.score}% | Overdue: ${snap.overdue} items

Overdue/At-risk items:
${overdueItems.map(i => `- ${i.name} (${i.module}) — Penalty: R${i.penalty_amount || 'unspecified'} — Due: ${i.due_date || 'unknown'}`).join('\n') || 'None'}

Return JSON: {
  "overallRisk": "low|medium|high|critical",
  "fineExposure": { "total": number, "breakdown": [{"module": "...", "amount": number, "description": "..."}] },
  "topRisks": [{ "title": "...", "module": "...", "severity": "high|medium|low", "explanation": "...", "mitigation": "...", "legislation": "..." }],
  "trends": "1-2 sentence trend analysis",
  "recommendation": "1-2 sentence priority action"
}`;

    const result = await chatForUser(req.user.userId, [{ role: 'user', content: prompt }]);
    let analysis = {};
    try {
      const cleaned = (result.message || '').replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysis = JSON.parse(cleaned);
    } catch { analysis = { overallRisk: 'unknown', recommendation: result.message || 'Unable to analyze.' }; }

    res.json({ analysis, provider: result.provider, status: result.status });
  } catch (error) {
    next(error);
  }
});

// POST /api/ai/audit-narrative — Audit Report AI narrative
router.post('/audit-narrative', async (req, res, next) => {
  try {
    const companyId = req.user.companyId || req.user.company_id;
    const ctx = await getCompanyContext(req.user.userId, companyId);
    const snap = await getComplianceSnapshot(companyId);

    const moduleStats = await db.manyOrNone(
      `SELECT cr.module, COUNT(*) as total,
              COUNT(*) FILTER (WHERE cs.status = 'completed') as completed,
              COUNT(*) FILTER (WHERE cs.status = 'overdue') as overdue,
              COUNT(*) FILTER (WHERE cs.status = 'pending') as pending
       FROM compliance_statuses cs
       JOIN compliance_requirements cr ON cr.id = cs.requirement_id
       WHERE cs.company_id = $1
       GROUP BY cr.module ORDER BY cr.module`,
      [companyId]
    );

    const prompt = `You are Emma-i™. Generate a professional compliance audit narrative report for this SA company.

Company: ${ctx.name} | Registration: ${ctx.registrationNumber || 'N/A'} | Tax Ref: ${ctx.taxReference || 'N/A'}
Type: ${ctx.companyType} | Sector: ${ctx.sector}
Employees: ${ctx.employeeCount} | Turnover: R${ctx.annualTurnover}
Overall Score: ${snap.score}%

Module breakdown:
${moduleStats.map(m => `- ${m.module}: ${m.completed}/${m.total} complete, ${m.overdue} overdue, ${m.pending} pending`).join('\n') || 'No data'}

Return JSON: {
  "executiveSummary": "2-3 paragraph professional summary suitable for board presentation",
  "moduleNarratives": [{ "module": "...", "status": "compliant|partially_compliant|non_compliant", "narrative": "1-2 paragraph analysis", "keyFindings": ["..."], "recommendations": ["..."] }],
  "overallAssessment": "compliant|partially_compliant|non_compliant|critical",
  "priorityActions": ["action 1", "action 2", "..."],
  "legislativeReferences": ["Act/Section referenced..."]
}`;

    const result = await chatForUser(req.user.userId, [{ role: 'user', content: prompt }]);
    let narrative = {};
    try {
      const cleaned = (result.message || '').replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      narrative = JSON.parse(cleaned);
    } catch { narrative = { executiveSummary: result.message || 'Report generation failed.', overallAssessment: 'unknown' }; }

    res.json({ narrative, provider: result.provider, status: result.status });
  } catch (error) {
    next(error);
  }
});

// POST /api/ai/maturity-advice — Maturity Roadmap AI guidance
router.post('/maturity-advice', async (req, res, next) => {
  try {
    const { currentLevel } = req.body;
    const companyId = req.user.companyId || req.user.company_id;
    const ctx = await getCompanyContext(req.user.userId, companyId);
    const snap = await getComplianceSnapshot(companyId);

    const prompt = `You are Emma-i™. Provide maturity roadmap guidance for this SA company.

Company: ${ctx.name} (${ctx.companyType}, ${ctx.sector})
Current Maturity Level: ${currentLevel || 3} out of 6
Compliance Score: ${snap.score}%
Overdue items: ${snap.overdue}

The 6 maturity levels are:
1. Ad-hoc (no formal processes)
2. Reactive (respond to issues as they arise)
3. Defined (documented processes exist)
4. Managed (processes are measured and controlled)
5. Optimized (continuous improvement)
6. Leading (industry benchmark)

Return JSON: {
  "currentAssessment": "1-2 sentence assessment of current level",
  "nextLevel": { "level": number, "name": "...", "description": "...", "estimatedMonths": number },
  "milestones": [{ "title": "...", "description": "...", "module": "...", "effort": "low|medium|high", "impact": "low|medium|high", "order": number }],
  "quickWins": ["action that can be done this week..."],
  "longTermGoals": ["strategic goal..."]
}`;

    const result = await chatForUser(req.user.userId, [{ role: 'user', content: prompt }]);
    let advice = {};
    try {
      const cleaned = (result.message || '').replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      advice = JSON.parse(cleaned);
    } catch { advice = { currentAssessment: result.message || 'Unable to assess.', milestones: [] }; }

    res.json({ advice, provider: result.provider, status: result.status });
  } catch (error) {
    next(error);
  }
});

// POST /api/ai/filing-guidance — Filing Workflows AI step-by-step
router.post('/filing-guidance', async (req, res, next) => {
  try {
    const { filingType } = req.body;
    const companyId = req.user.companyId || req.user.company_id;
    const ctx = await getCompanyContext(req.user.userId, companyId);

    const prompt = `You are Emma-i™. Provide step-by-step filing guidance for a South African company.

Company: ${ctx.name} (${ctx.companyType}, ${ctx.sector})
Employees: ${ctx.employeeCount} | Turnover: R${ctx.annualTurnover}
Registration: ${ctx.registrationNumber || 'N/A'} | Tax Ref: ${ctx.taxReference || 'N/A'}
Filing type requested: ${filingType || 'general'}

Return JSON: {
  "filingType": "${filingType || 'general'}",
  "title": "Filing title",
  "authority": "SARS|CIPC|DoL|...",
  "deadline": "description of when due",
  "steps": [{ "step": 1, "title": "...", "description": "detailed instruction", "url": "relevant portal URL if applicable", "tips": ["..."] }],
  "documentsNeeded": ["document 1", "document 2"],
  "commonMistakes": ["mistake 1", "mistake 2"],
  "penalties": { "lateFiling": "...", "nonCompliance": "..." },
  "estimatedTime": "e.g. 30 minutes"
}`;

    const result = await chatForUser(req.user.userId, [{ role: 'user', content: prompt }]);
    let guidance = {};
    try {
      const cleaned = (result.message || '').replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      guidance = JSON.parse(cleaned);
    } catch { guidance = { title: filingType || 'Filing Guidance', steps: [{ step: 1, title: 'Guidance', description: result.message || 'Ask Emma-i for filing help.' }] }; }

    res.json({ guidance, provider: result.provider, status: result.status });
  } catch (error) {
    next(error);
  }
});

// POST /api/ai/document-categorize — Auto-categorize uploaded document
router.post('/document-categorize', async (req, res, next) => {
  try {
    const { filename, description } = req.body;
    const prompt = `Categorize this South African compliance document.
Filename: ${filename}
Description: ${description || 'none'}

Return JSON: { "category": "tax|registration|labour|safety|data_protection|empowerment|financial|municipal|industry|other", "module": "cipc|sars|labour|ohs|popia|bbbee|fica|municipal|industry", "confidence": 0.0-1.0, "suggestedTags": ["tag1","tag2"], "summary": "one line description" }`;

    const result = await chatForUser(req.user.userId, [{ role: 'user', content: prompt }]);
    let categorization = {};
    try {
      const cleaned = (result.message || '').replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      categorization = JSON.parse(cleaned);
    } catch { categorization = { category: 'other', module: 'general', confidence: 0 }; }

    res.json({ categorization, provider: result.provider });
  } catch (error) {
    next(error);
  }
});

export default router;
