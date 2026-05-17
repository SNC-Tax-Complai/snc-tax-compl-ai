/**
 * Shared test fixtures for unit and integration tests
 */

export const testUser = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'test@snctax.co.za',
  password: 'SecurePass123!',
  name: 'Test User',
  role: 'admin',
  companyId: '660e8400-e29b-41d4-a716-446655440001',
};

export const testCompany = {
  id: '660e8400-e29b-41d4-a716-446655440001',
  name: 'Test Company (Pty) Ltd',
  registrationNumber: '2024/123456/07',
  taxNumber: '9012345678',
  companyType: 'pty_ltd',
  industrySector: 'technology',
  employeeCount: 25,
  annualTurnover: 12000000,
};

export const testComplianceRequirement = {
  id: '770e8400-e29b-41d4-a716-446655440002',
  regulationCode: 'ITA-001',
  name: 'Annual Income Tax Return (ITR14)',
  module: 'income_tax',
  description: 'File annual company income tax return',
  frequency: 'annual',
  penalty: 16000,
  companyTypes: ['pty_ltd', 'npc', 'public'],
};

export const testNotification = {
  id: '880e8400-e29b-41d4-a716-446655440003',
  userId: testUser.id,
  companyId: testCompany.id,
  type: 'overdue',
  title: 'Overdue: ITR14 Filing',
  message: 'Your income tax return is 5 days overdue.',
  regulationCode: 'ITA-001',
  read: false,
};

export const testToken = {
  valid: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
  expired: 'expired-token',
  invalid: 'not-a-real-token',
};

export const testSARSData = {
  taxRef: '9012345678',
  validationResponse: {
    valid: true,
    taxReference: '9012345678',
    taxpayerName: 'Test Company (Pty) Ltd',
    registeredForVAT: true,
    registeredForPAYE: true,
    status: 'active',
  },
  tcsResponse: {
    status: 'compliant',
    pinNumber: 'TCS-0001',
    issueDate: '2026-01-15',
    expiryDate: '2027-01-15',
    valid: true,
  },
};

export const testAIAnalysis = {
  document: {
    originalname: 'test-document.pdf',
    mimetype: 'application/pdf',
    path: '/tmp/test-upload.pdf',
    size: 1024,
  },
  context: {
    companyType: 'pty_ltd',
    sector: 'technology',
  },
};
