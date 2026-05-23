import { AppError } from '../middleware/errorHandler.js';
import complianceService from '../services/complianceService.js';
import documentService from '../services/documentService.js';
import auditService from '../services/auditService.js';

export const getDashboard = async (req, res, next) => {
  try {
    const companyId = req.user.companyId || req.user.company_id;

    if (!companyId) {
      return res.json({
        complianceScore: 0, complianceTrend: 0, previousScore: 0,
        pendingFilings: 0, pendingTrend: 0, dueThisMonth: 0,
        actionRequired: false, allUpToDate: 0, upToDateTrend: 0,
        overdue: 0, total: 0, scoreTrend: [], moduleHealth: {},
        upcomingDeadlines: [], overdueItems: [], maturityLevel: 1,
      });
    }

    const dashboardData = await complianceService.getDashboardMetrics(companyId);
    res.json(dashboardData);
  } catch (error) {
    next(error);
  }
};

export const getComplianceByModule = async (req, res, next) => {
  try {
    const { module } = req.params;
    const companyId = req.user.companyId || req.user.company_id;

    const validModules = [
      'cipc', 'sars', 'labour', 'ohs', 'popia',
      'bbbee', 'fica', 'municipal', 'industry', 'tax_engine',
    ];

    if (!validModules.includes(module)) {
      throw new AppError(`Invalid compliance module: ${module}`, 400);
    }

    if (!companyId) {
      return res.json({
        module,
        requirements: [],
        summary: { total: 0, completed: 0, pending: 0, overdue: 0, atRisk: 0 },
      });
    }

    const data = await complianceService.getModuleRequirements(companyId, module);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getRequirement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId || req.user.company_id;

    if (!companyId) {
      throw new AppError('No company assigned to user', 400);
    }

    const requirement = await complianceService.getRequirementDetail(id, companyId);

    if (!requirement) {
      throw new AppError('Requirement not found', 404);
    }

    res.json(requirement);
  } catch (error) {
    next(error);
  }
};

export const updateComplianceStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes, completionDate } = req.body;
    const userId = req.user.userId;
    const companyId = req.user.companyId || req.user.company_id;

    if (!status) {
      throw new AppError('Status is required', 400);
    }

    const validStatuses = ['completed', 'pending', 'overdue', 'at_risk', 'not_applicable', 'in_progress'];
    if (!validStatuses.includes(status)) {
      throw new AppError(`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`, 400);
    }

    const updated = await complianceService.updateStatus(id, { status, notes, completionDate }, userId);

    if (!updated) {
      throw new AppError('Compliance status not found', 404);
    }

    // Audit log
    await auditService.log({
      userId,
      companyId,
      action: 'update',
      entityType: 'compliance_status',
      entityId: id,
      newValue: { status, notes },
      req,
    });

    // Recalculate score after status change
    if (companyId) {
      await complianceService.recalculateScore(companyId);
    }

    res.json({ message: 'Status updated successfully', data: updated });
  } catch (error) {
    next(error);
  }
};

export const uploadDocument = async (req, res, next) => {
  try {
    const { id } = req.params; // compliance status ID
    const companyId = req.user.companyId || req.user.company_id;
    const userId = req.user.userId;

    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    if (!companyId) {
      throw new AppError('No company assigned to user', 400);
    }

    const document = await documentService.storeDocument(req.file, {
      companyId,
      statusId: id,
      uploadedBy: userId,
      category: req.body.category || 'evidence',
      description: req.body.description,
    });

    // Audit log
    await auditService.log({
      userId,
      companyId,
      action: 'create',
      entityType: 'document',
      entityId: document.id,
      newValue: { filename: document.original_name, statusId: id },
      req,
    });

    res.status(201).json({ message: 'Document uploaded successfully', document });
  } catch (error) {
    next(error);
  }
};

export const generateReport = async (req, res, next) => {
  try {
    const companyId = req.user.companyId || req.user.company_id;

    if (!companyId) {
      throw new AppError('No company assigned to user', 400);
    }

    // Get full compliance overview for report
    const modules = ['cipc', 'sars', 'labour', 'ohs', 'popia', 'bbbee', 'fica', 'municipal', 'industry', 'tax_engine'];
    const moduleData = {};

    for (const module of modules) {
      moduleData[module] = await complianceService.getModuleRequirements(companyId, module);
    }

    const dashboard = await complianceService.getDashboardMetrics(companyId);

    const report = {
      companyId,
      generatedAt: new Date().toISOString(),
      overallScore: dashboard.complianceScore,
      summary: {
        total: dashboard.total,
        completed: dashboard.allUpToDate,
        pending: dashboard.pendingFilings,
        overdue: dashboard.overdue,
      },
      modules: moduleData,
    };

    // Audit log
    await auditService.log({
      userId: req.user.userId,
      companyId,
      action: 'view',
      entityType: 'report',
      req,
    });

    res.json(report);
  } catch (error) {
    next(error);
  }
};
