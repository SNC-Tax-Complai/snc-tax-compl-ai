import db from '../config/database.js';

/**
 * Compliance Service
 * Core business logic for compliance tracking and scoring
 */
class ComplianceService {
  /**
   * Get dashboard metrics for a company
   */
  async getDashboardMetrics(companyId) {
    // Get current score
    const currentScore = await db.oneOrNone(`
      SELECT score, calculated_at
      FROM compliance_scores
      WHERE company_id = $1
      ORDER BY calculated_at DESC
      LIMIT 1
    `, [companyId]);

    // Get previous month score for trend
    const previousScore = await db.oneOrNone(`
      SELECT score
      FROM compliance_scores
      WHERE company_id = $1
        AND calculated_at < date_trunc('month', CURRENT_DATE)
      ORDER BY calculated_at DESC
      LIMIT 1
    `, [companyId]);

    // Get status counts
    const statusCounts = await db.one(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'pending') AS pending,
        COUNT(*) FILTER (WHERE status = 'overdue') AS overdue,
        COUNT(*) FILTER (WHERE status = 'completed') AS completed,
        COUNT(*) FILTER (WHERE status = 'in_progress') AS in_progress,
        COUNT(*) FILTER (WHERE status = 'at_risk') AS at_risk,
        COUNT(*) FILTER (WHERE status != 'not_applicable') AS total
      FROM compliance_statuses
      WHERE company_id = $1
    `, [companyId]);

    // Get items due this month
    const dueThisMonth = await db.one(`
      SELECT COUNT(*) AS count
      FROM compliance_statuses
      WHERE company_id = $1
        AND due_date >= date_trunc('month', CURRENT_DATE)
        AND due_date < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'
        AND status NOT IN ('completed', 'not_applicable')
    `, [companyId]);

    const score = currentScore ? parseFloat(currentScore.score) : 0;
    const prevScore = previousScore ? parseFloat(previousScore.score) : 0;
    const trend = prevScore > 0 ? Math.round(score - prevScore) : 0;

    return {
      complianceScore: score,
      complianceTrend: trend,
      previousScore: prevScore,
      pendingFilings: parseInt(statusCounts.pending) + parseInt(statusCounts.in_progress),
      pendingTrend: 0, // TODO: calculate from previous period
      dueThisMonth: parseInt(dueThisMonth.count),
      actionRequired: parseInt(statusCounts.overdue) > 0,
      allUpToDate: parseInt(statusCounts.completed),
      upToDateTrend: 0, // TODO: calculate from previous period
      overdue: parseInt(statusCounts.overdue),
      total: parseInt(statusCounts.total),
    };
  }

  /**
   * Get compliance requirements and statuses for a specific module
   */
  async getModuleRequirements(companyId, module) {
    const requirements = await db.manyOrNone(`
      SELECT
        cr.id,
        cr.name,
        cr.description,
        cr.regulation_code,
        cr.module,
        cr.compliance_type,
        cr.frequency,
        cr.penalty_amount,
        cr.reference_url,
        cs.id AS status_id,
        cs.status,
        cs.due_date,
        cs.completion_date,
        cs.next_due_date,
        cs.notes,
        cs.assigned_to
      FROM compliance_requirements cr
      LEFT JOIN compliance_statuses cs
        ON cs.requirement_id = cr.id AND cs.company_id = $1
      WHERE cr.module = $2 AND cr.is_active = true
      ORDER BY cs.due_date ASC NULLS LAST, cr.name ASC
    `, [companyId, module]);

    const summary = {
      total: requirements.length,
      completed: requirements.filter(r => r.status === 'completed').length,
      pending: requirements.filter(r => r.status === 'pending' || r.status === 'in_progress').length,
      overdue: requirements.filter(r => r.status === 'overdue').length,
      atRisk: requirements.filter(r => r.status === 'at_risk').length,
    };

    return { module, requirements, summary };
  }

  /**
   * Get single requirement details with documents
   */
  async getRequirementDetail(requirementId, companyId) {
    const requirement = await db.oneOrNone(`
      SELECT
        cr.*,
        cs.id AS status_id,
        cs.status,
        cs.due_date,
        cs.completion_date,
        cs.next_due_date,
        cs.notes,
        cs.assigned_to
      FROM compliance_requirements cr
      LEFT JOIN compliance_statuses cs
        ON cs.requirement_id = cr.id AND cs.company_id = $2
      WHERE cr.id = $1
    `, [requirementId, companyId]);

    if (!requirement) return null;

    // Get related documents
    const documents = await db.manyOrNone(`
      SELECT id, filename, original_name, file_size, mime_type, category, created_at
      FROM documents
      WHERE status_id = $1 AND is_deleted = false
      ORDER BY created_at DESC
    `, [requirement.status_id]);

    return { ...requirement, documents };
  }

  /**
   * Update compliance status
   */
  async updateStatus(statusId, data, userId) {
    const { status, notes, completionDate } = data;

    const updated = await db.oneOrNone(`
      UPDATE compliance_statuses
      SET
        status = COALESCE($2, status),
        notes = COALESCE($3, notes),
        completion_date = COALESCE($4, completion_date),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [statusId, status, notes, completionDate]);

    if (updated && status === 'completed' && !updated.next_due_date) {
      // Calculate next due date
      const requirement = await db.oneOrNone(
        'SELECT frequency FROM compliance_requirements WHERE id = $1',
        [updated.requirement_id]
      );
      if (requirement) {
        const nextDue = this.calculateNextDueDate(updated.due_date, requirement.frequency);
        if (nextDue) {
          await db.none(
            'UPDATE compliance_statuses SET next_due_date = $1 WHERE id = $2',
            [nextDue, statusId]
          );
        }
      }
    }

    return updated;
  }

  /**
   * Initialize compliance statuses for a new company
   */
  async initializeCompanyCompliance(companyId, companyType, sector) {
    // Get applicable requirements
    const requirements = await db.manyOrNone(`
      SELECT id, frequency
      FROM compliance_requirements
      WHERE is_active = true
        AND ($2 = ANY(applicable_company_types) OR applicable_company_types IS NULL)
        AND ($3 = ANY(applicable_sectors) OR applicable_sectors IS NULL OR applicable_sectors = '{}')
    `, [companyId, companyType, sector || '']);

    // Create initial statuses
    for (const req of requirements) {
      const dueDate = this.calculateInitialDueDate(req.frequency);
      await db.none(`
        INSERT INTO compliance_statuses (company_id, requirement_id, status, due_date)
        VALUES ($1, $2, 'pending', $3)
        ON CONFLICT (company_id, requirement_id, due_date) DO NOTHING
      `, [companyId, req.id, dueDate]);
    }

    // Calculate initial score
    await this.recalculateScore(companyId);
  }

  /**
   * Recalculate compliance score for a company
   */
  async recalculateScore(companyId) {
    const counts = await db.one(`
      SELECT
        COUNT(*) FILTER (WHERE status != 'not_applicable') AS total,
        COUNT(*) FILTER (WHERE status = 'completed') AS completed,
        COUNT(*) FILTER (WHERE status = 'pending' OR status = 'in_progress') AS pending,
        COUNT(*) FILTER (WHERE status = 'overdue') AS overdue
      FROM compliance_statuses
      WHERE company_id = $1
    `, [companyId]);

    const total = parseInt(counts.total);
    const completed = parseInt(counts.completed);
    const pending = parseInt(counts.pending);
    const overdue = parseInt(counts.overdue);
    const score = total > 0 ? Math.round((completed / total) * 100 * 100) / 100 : 0;

    // Calculate per-module breakdown
    const breakdown = await db.manyOrNone(`
      SELECT
        cr.module,
        COUNT(*) FILTER (WHERE cs.status != 'not_applicable') AS total,
        COUNT(*) FILTER (WHERE cs.status = 'completed') AS completed
      FROM compliance_statuses cs
      JOIN compliance_requirements cr ON cr.id = cs.requirement_id
      WHERE cs.company_id = $1
      GROUP BY cr.module
    `, [companyId]);

    const moduleBreakdown = {};
    for (const row of breakdown) {
      const moduleTotal = parseInt(row.total);
      const moduleCompleted = parseInt(row.completed);
      moduleBreakdown[row.module] = moduleTotal > 0
        ? Math.round((moduleCompleted / moduleTotal) * 100)
        : 0;
    }

    // Store score
    await db.none(`
      INSERT INTO compliance_scores (company_id, score, total_requirements, completed_requirements, pending_requirements, overdue_requirements, breakdown)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [companyId, score, total, completed, pending, overdue, JSON.stringify(moduleBreakdown)]);

    return { score, total, completed, pending, overdue, breakdown: moduleBreakdown };
  }

  /**
   * Check for overdue items and update statuses
   */
  async checkOverdueItems(companyId) {
    const overdueItems = await db.manyOrNone(`
      UPDATE compliance_statuses
      SET status = 'overdue', updated_at = CURRENT_TIMESTAMP
      WHERE company_id = $1
        AND due_date < CURRENT_DATE
        AND status IN ('pending', 'in_progress')
      RETURNING id, requirement_id, due_date
    `, [companyId]);

    return overdueItems;
  }

  /**
   * Calculate next due date based on frequency
   */
  calculateNextDueDate(currentDue, frequency) {
    if (!currentDue) return null;
    const date = new Date(currentDue);

    switch (frequency) {
      case 'Monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'Bimonthly':
        date.setMonth(date.getMonth() + 2);
        break;
      case 'Quarterly':
        date.setMonth(date.getMonth() + 3);
        break;
      case 'Biannual':
        date.setMonth(date.getMonth() + 6);
        break;
      case 'Annual':
        date.setFullYear(date.getFullYear() + 1);
        break;
      case 'Once-off':
      case 'Ad-hoc':
        return null;
      default:
        return null;
    }

    return date.toISOString().split('T')[0];
  }

  /**
   * Calculate initial due date for new company
   */
  calculateInitialDueDate(frequency) {
    const now = new Date();

    switch (frequency) {
      case 'Monthly':
        now.setMonth(now.getMonth() + 1);
        now.setDate(25); // Due 25th of next month
        break;
      case 'Bimonthly':
        now.setMonth(now.getMonth() + 2);
        now.setDate(25);
        break;
      case 'Quarterly':
        now.setMonth(now.getMonth() + 3);
        now.setDate(1);
        break;
      case 'Biannual':
        now.setMonth(now.getMonth() + 6);
        now.setDate(1);
        break;
      case 'Annual':
        now.setFullYear(now.getFullYear() + 1);
        now.setMonth(2); // March next year
        now.setDate(31);
        break;
      case 'Once-off':
        now.setMonth(now.getMonth() + 1);
        break;
      case 'Ad-hoc':
        return null;
      default:
        now.setMonth(now.getMonth() + 3);
        break;
    }

    return now.toISOString().split('T')[0];
  }
}

export default new ComplianceService();
