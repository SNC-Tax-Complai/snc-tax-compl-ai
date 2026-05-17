import { jest } from '@jest/globals';

const mockAxios = {
  post: jest.fn(),
};
jest.unstable_mockModule('axios', () => ({ default: mockAxios }));
jest.unstable_mockModule('../../src/config/logger.js', () => ({
  default: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
}));

const { default: whatsappService } = await import('../../src/services/integrations/whatsappService.js');

describe('WhatsAppService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isConfigured', () => {
    it('should return false when env vars are not set', () => {
      expect(whatsappService.isConfigured).toBe(false);
    });
  });

  describe('sendMessage', () => {
    it('should return not-configured response when service is not set up', async () => {
      const result = await whatsappService.sendMessage({
        to: '+27821234567',
        template: 'compliance_overdue_alert',
        parameters: ['ITA-001', 'ITR14 Filing', '5 days'],
      });

      expect(result).toEqual({
        sent: false,
        reason: 'WhatsApp service not configured',
      });
    });
  });

  describe('sendOverdueAlert', () => {
    it('should format and send overdue alert', async () => {
      const result = await whatsappService.sendOverdueAlert({
        to: '+27821234567',
        requirementName: 'ITR14 Filing',
        regulationCode: 'ITA-001',
        daysOverdue: 5,
      });

      expect(result.sent).toBe(false);
      expect(result.reason).toContain('not configured');
    });
  });

  describe('sendDeadlineReminder', () => {
    it('should format and send deadline reminder', async () => {
      const result = await whatsappService.sendDeadlineReminder({
        to: '+27821234567',
        requirementName: 'EMP201 Submission',
        regulationCode: 'PAYE-001',
        daysUntilDue: 7,
      });

      expect(result.sent).toBe(false);
      expect(result.reason).toContain('not configured');
    });
  });

  describe('sendText', () => {
    it('should return not-configured response for text messages', async () => {
      const result = await whatsappService.sendText({
        to: '+27821234567',
        message: 'Test message',
      });

      expect(result).toEqual({
        sent: false,
        reason: 'WhatsApp service not configured',
      });
    });
  });
});
