import axios from 'axios';
import logger from '../../config/logger.js';

/**
 * WhatsApp Business API Integration
 * Sends compliance alerts via WhatsApp
 */
class WhatsAppService {
  constructor() {
    this.apiUrl = process.env.WHATSAPP_API_URL || null;
    this.token = process.env.WHATSAPP_TOKEN || null;
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || null;
  }

  get isConfigured() {
    return !!(this.apiUrl && this.token && this.phoneNumberId);
  }

  /**
   * Send a template message via WhatsApp
   */
  async sendMessage({ to, template, parameters }) {
    if (!this.isConfigured) {
      logger.debug('WhatsApp not sent (service not configured)', { to, template });
      return { sent: false, reason: 'WhatsApp service not configured' };
    }

    try {
      const response = await axios.post(
        `${this.apiUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to,
          type: 'template',
          template: {
            name: template,
            language: { code: 'en' },
            components: parameters ? [{
              type: 'body',
              parameters: parameters.map(p => ({ type: 'text', text: p })),
            }] : [],
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      logger.info('WhatsApp message sent', { to, template, messageId: response.data.messages?.[0]?.id });
      return { sent: true, messageId: response.data.messages?.[0]?.id };
    } catch (error) {
      logger.error('WhatsApp send failed', { to, template, error: error.message });
      return { sent: false, reason: error.message };
    }
  }

  /**
   * Send overdue compliance alert via WhatsApp
   */
  async sendOverdueAlert({ to, requirementName, regulationCode, daysOverdue }) {
    return this.sendMessage({
      to,
      template: 'compliance_overdue_alert',
      parameters: [regulationCode, requirementName, `${daysOverdue} days`],
    });
  }

  /**
   * Send upcoming deadline reminder via WhatsApp
   */
  async sendDeadlineReminder({ to, requirementName, regulationCode, daysUntilDue }) {
    return this.sendMessage({
      to,
      template: 'compliance_deadline_reminder',
      parameters: [regulationCode, requirementName, `${daysUntilDue} days`],
    });
  }

  /**
   * Send plain text message (for testing)
   */
  async sendText({ to, message }) {
    if (!this.isConfigured) {
      return { sent: false, reason: 'WhatsApp service not configured' };
    }

    try {
      const response = await axios.post(
        `${this.apiUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to,
          type: 'text',
          text: { body: message },
        },
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return { sent: true, messageId: response.data.messages?.[0]?.id };
    } catch (error) {
      return { sent: false, reason: error.message };
    }
  }
}

export default new WhatsAppService();
