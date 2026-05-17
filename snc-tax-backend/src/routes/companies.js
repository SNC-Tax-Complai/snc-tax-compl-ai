import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import db from '../config/database.js';
import complianceService from '../services/complianceService.js';
import auditService from '../services/auditService.js';

const router = express.Router();
router.use(requireAuth);

// GET /api/companies - List companies (admin sees all, others see own)
router.get('/', async (req, res, next) => {
  try {
    const companyId = req.user.companyId || req.user.company_id;

    let companies;
    if (req.user.role === 'admin') {
      companies = await db.manyOrNone(`
        SELECT id, name, registration_number, tax_reference, company_type,
               industry_sector, employee_count, is_active, created_at
        FROM companies
        ORDER BY name ASC
      `);
    } else if (companyId) {
      companies = await db.manyOrNone(`
        SELECT id, name, registration_number, tax_reference, company_type,
               industry_sector, employee_count, is_active, created_at
        FROM companies
        WHERE id = $1
      `, [companyId]);
    } else {
      companies = [];
    }

    res.json({ companies });
  } catch (error) {
    next(error);
  }
});

// POST /api/companies - Create company (admin or manager)
router.post('/', requireRole(['admin', 'manager']), async (req, res, next) => {
  try {
    const {
      name, registrationNumber, taxReference, companyType,
      industrySector, employeeCount, annualTurnover,
      physicalAddress, postalAddress, contactEmail, contactPhone,
    } = req.body;

    if (!name) {
      throw new AppError('Company name is required', 400);
    }

    const company = await db.one(`
      INSERT INTO companies (name, registration_number, tax_reference, company_type,
        industry_sector, employee_count, annual_turnover,
        physical_address, postal_address, contact_email, contact_phone)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      name, registrationNumber || null, taxReference || null, companyType || null,
      industrySector || null, employeeCount || 0, annualTurnover || null,
      physicalAddress || null, postalAddress || null, contactEmail || null, contactPhone || null,
    ]);

    // Initialize compliance requirements for this company
    await complianceService.initializeCompanyCompliance(
      company.id,
      companyType || 'pty_ltd',
      industrySector || null,
    );

    // Audit log
    await auditService.log({
      userId: req.user.userId,
      companyId: company.id,
      action: 'create',
      entityType: 'company',
      entityId: company.id,
      newValue: { name, companyType, industrySector },
      req,
    });

    res.status(201).json({ message: 'Company created', company });
  } catch (error) {
    next(error);
  }
});

// GET /api/companies/:id - Get company details
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId || req.user.company_id;

    // Only allow access to own company unless admin
    if (req.user.role !== 'admin' && id !== companyId) {
      throw new AppError('Access denied', 403);
    }

    const company = await db.oneOrNone('SELECT * FROM companies WHERE id = $1', [id]);

    if (!company) {
      throw new AppError('Company not found', 404);
    }

    res.json({ company });
  } catch (error) {
    next(error);
  }
});

// PUT /api/companies/:id - Update company
router.put('/:id', requireRole(['admin', 'manager']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name, registrationNumber, taxReference, companyType,
      industrySector, employeeCount, annualTurnover,
      physicalAddress, postalAddress, contactEmail, contactPhone,
    } = req.body;

    const existing = await db.oneOrNone('SELECT * FROM companies WHERE id = $1', [id]);
    if (!existing) {
      throw new AppError('Company not found', 404);
    }

    const updated = await db.one(`
      UPDATE companies SET
        name = COALESCE($2, name),
        registration_number = COALESCE($3, registration_number),
        tax_reference = COALESCE($4, tax_reference),
        company_type = COALESCE($5, company_type),
        industry_sector = COALESCE($6, industry_sector),
        employee_count = COALESCE($7, employee_count),
        annual_turnover = COALESCE($8, annual_turnover),
        physical_address = COALESCE($9, physical_address),
        postal_address = COALESCE($10, postal_address),
        contact_email = COALESCE($11, contact_email),
        contact_phone = COALESCE($12, contact_phone)
      WHERE id = $1
      RETURNING *
    `, [id, name, registrationNumber, taxReference, companyType,
        industrySector, employeeCount, annualTurnover,
        physicalAddress, postalAddress, contactEmail, contactPhone]);

    // Audit log
    await auditService.log({
      userId: req.user.userId,
      companyId: id,
      action: 'update',
      entityType: 'company',
      entityId: id,
      oldValue: existing,
      newValue: updated,
      req,
    });

    res.json({ message: 'Company updated', company: updated });
  } catch (error) {
    next(error);
  }
});

export default router;
