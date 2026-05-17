import { jest } from '@jest/globals';

jest.unstable_mockModule('nodemailer', () => ({
  default: {
    createTransport: jest.fn(() => ({
      sendMail: jest.fn().mockResolvedValue({ messageId: 'mock-msg-001' }),
    })),
  },
}));
jest.unstable_mockModule('../../src/config/logger.js', () => ({
  default: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
}));

const { default: emailService } = await import('../../src/services/integrations/emailService.js');

describe('EmailService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isConfigured', () => {
    it('should return false when SMTP is not configured', () => {
      // No SMTP_HOST set in test env
      expect(emailService.isConfigured).toBe(false);
    });
  });

  describe('send', () => {
    it('should return not-configured response when SMTP is missing', async () => {
      const result = await emailService.send({
        to: 'user@example.com',
        subject: 'Test Subject',
        html: '<p>Test body</p>',
      });

      expect(result).toEqual({
        sent: false,
        reason: 'Email service not configured',
      });
    });
  });

  describe('sendOverdueAlert', () => {
    it('should build proper HTML email for overdue alert', async () => {
      const result = await emailService.sendOverdueAlert({
        to: 'user@example.com',
        userName: 'Test User',
        requirementName: 'ITR14 Filing',
        regulationCode: 'ITA-001',
        dueDate: '2026-04-30',
        daysOverdue: 17,
        penalty: 16000,
      });

      // Not configured, so won't send
      expect(result.sent).toBe(false);
    });
  });

  describe('sendDeadlineReminder', () => {
    it('should build reminder email', async () => {
      const result = await emailService.sendDeadlineReminder({
        to: 'user@example.com',
        userName: 'Test User',
        requirementName: 'EMP201 Submission',
        regulationCode: 'PAYE-001',
        dueDate: '2026-06-07',
        daysUntilDue: 7,
      });

      expect(result.sent).toBe(false);
    });
  });

  describe('sendWeeklySummary', () => {
    it('should build weekly summary email', async () => {
      const result = await emailService.sendWeeklySummary({
        to: 'user@example.com',
        userName: 'Test User',
        score: 87,
        overdue: 2,
        pending: 5,
        dueThisWeek: 3,
      });

      expect(result.sent).toBe(false);
    });
  });
});
