import { jest } from '@jest/globals';

// Mock axios before importing service
const mockAxios = {
  post: jest.fn(),
  get: jest.fn(),
};
jest.unstable_mockModule('axios', () => ({ default: mockAxios }));
jest.unstable_mockModule('../../src/config/logger.js', () => ({
  default: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
}));

const { default: SARSServiceModule } = await import('../../src/services/integrations/sarsService.js');

describe('SARSService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isConfigured', () => {
    it('should return false when credentials are not set', () => {
      // Default state - no env vars set in test
      expect(SARSServiceModule.isConfigured).toBe(false);
    });
  });

  describe('validateTaxReference', () => {
    it('should return mock data when not configured', async () => {
      const result = await SARSServiceModule.validateTaxReference('9012345678');

      expect(result).toHaveProperty('mock', true);
      expect(result).toHaveProperty('valid', true);
      expect(result).toHaveProperty('taxReference', '9012345678');
      expect(result).toHaveProperty('taxpayerName');
      expect(result).toHaveProperty('registeredForVAT');
      expect(result).toHaveProperty('registeredForPAYE');
      expect(result).toHaveProperty('status', 'active');
    });

    it('should validate tax reference length', async () => {
      const shortRef = await SARSServiceModule.validateTaxReference('123');
      expect(shortRef.valid).toBe(false);

      const validRef = await SARSServiceModule.validateTaxReference('1234567890');
      expect(validRef.valid).toBe(true);
    });

    it('should handle null/empty tax reference', async () => {
      const nullRef = await SARSServiceModule.validateTaxReference(null);
      expect(nullRef.valid).toBe(false);

      const emptyRef = await SARSServiceModule.validateTaxReference('');
      expect(emptyRef.valid).toBe(false);
    });
  });

  describe('getFilingStatus', () => {
    it('should return mock filing status when not configured', async () => {
      const result = await SARSServiceModule.getFilingStatus('9012345678', 'EMP201');

      expect(result).toHaveProperty('mock', true);
      expect(result).toHaveProperty('taxReference', '9012345678');
      expect(result).toHaveProperty('filingType', 'EMP201');
      expect(result.submissions).toBeInstanceOf(Array);
      expect(result.submissions.length).toBeGreaterThan(0);
      expect(result).toHaveProperty('nextDue');
      expect(result.nextDue).toHaveProperty('dueDate');
    });
  });

  describe('getTaxComplianceStatus', () => {
    it('should return mock TCS data when not configured', async () => {
      const result = await SARSServiceModule.getTaxComplianceStatus('9012345678');

      expect(result).toHaveProperty('mock', true);
      expect(result).toHaveProperty('status', 'compliant');
      expect(result).toHaveProperty('pinNumber');
      expect(result).toHaveProperty('issueDate');
      expect(result).toHaveProperty('expiryDate');
      expect(result).toHaveProperty('valid', true);
    });
  });

  describe('getOutstandingReturns', () => {
    it('should return mock outstanding returns when not configured', async () => {
      const result = await SARSServiceModule.getOutstandingReturns('9012345678');

      expect(result).toHaveProperty('mock', true);
      expect(result).toHaveProperty('taxReference', '9012345678');
      expect(result.outstanding).toBeInstanceOf(Array);
      expect(result).toHaveProperty('totalOutstanding');
    });
  });
});
