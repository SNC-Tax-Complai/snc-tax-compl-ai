import nodemailer from 'nodemailer';
import logger from '../../config/logger.js';

/**
 * Email Notification Service
 * Sends compliance alerts via SMTP
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.from = process.env.EMAIL_FROM || 'noreply@compl-ai.co.za';
    this.initialized = false;
  }

  /**
   * Initialize the SMTP transporter
   */
  initialize() {
    if (this.initialized) return;

    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
      logger.warn('Email service not configured (missing SMTP_HOST/USER/PASS)');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port: parseInt(port),
      secure: parseInt(port) === 465,
      auth: { user, pass },
    });

    this.initialized = true;
    logger.info('Email service initialized', { host, port });
  }

  get isConfigured() {
    return !!this.transporter;
  }

  /**
   * Send a single email
   */
  async send({ to, subject, html, text }) {
    this.initialize();

    if (!this.isConfigured) {
      logger.debug('Email not sent (service not configured)', { to, subject });
      return { sent: false, reason: 'Email service not configured' };
    }

    try {
      const info = await this.transporter.sendMail({
        from: `"Compl-Ai™ SA" <${this.from}>`,
        to,
        subject,
        html,
        text: text || subject,
      });

      logger.info('Email sent', { to, subject, messageId: info.messageId });
      return { sent: true, messageId: info.messageId };
    } catch (error) {
      logger.error('Email send failed', { to, subject, error: error.message });
      return { sent: false, reason: error.message };
    }
  }

  /**
   * Send overdue compliance alert
   */
  async sendOverdueAlert({ to, userName, requirementName, regulationCode, dueDate, daysOverdue, penalty }) {
    const subject = `[URGENT] Overdue: ${regulationCode} - ${requirementName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">Compliance Alert - Overdue Item</h2>
        </div>
        <div style="padding: 24px; background: #fff; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
          <p>Hi ${userName},</p>
          <p>The following compliance requirement is <strong>${daysOverdue} days overdue</strong>:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #f3f4f6; color: #6b7280;">Requirement</td><td style="padding: 8px; border-bottom: 1px solid #f3f4f6; font-weight: 600;">${requirementName}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #f3f4f6; color: #6b7280;">Code</td><td style="padding: 8px; border-bottom: 1px solid #f3f4f6;">${regulationCode}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #f3f4f6; color: #6b7280;">Due Date</td><td style="padding: 8px; border-bottom: 1px solid #f3f4f6;">${dueDate}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #f3f4f6; color: #6b7280;">Days Overdue</td><td style="padding: 8px; border-bottom: 1px solid #f3f4f6; color: #dc2626; font-weight: 600;">${daysOverdue} days</td></tr>
            ${penalty ? `<tr><td style="padding: 8px; color: #6b7280;">Potential Penalty</td><td style="padding: 8px; color: #dc2626; font-weight: 600;">R${Number(penalty).toLocaleString()}</td></tr>` : ''}
          </table>
          <p>Please take immediate action to avoid penalties.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost'}/compliance" style="display: inline-block; background: #0066cc; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 12px;">View in Compl-Ai™</a>
          <p style="margin-top: 24px; font-size: 12px; color: #9ca3af;">This is an automated alert from Compl-Ai™ SA. If you believe this is in error, please update the compliance status in your dashboard.</p>
        </div>
      </div>
    `;

    return this.send({ to, subject, html });
  }

  /**
   * Send upcoming deadline reminder
   */
  async sendDeadlineReminder({ to, userName, requirementName, regulationCode, dueDate, daysUntilDue }) {
    const subject = `Reminder: ${regulationCode} due in ${daysUntilDue} days`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f59e0b; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">Compliance Reminder</h2>
        </div>
        <div style="padding: 24px; background: #fff; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
          <p>Hi ${userName},</p>
          <p>A compliance deadline is approaching in <strong>${daysUntilDue} days</strong>:</p>
          <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0 0 4px 0; font-weight: 600;">${requirementName}</p>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">Code: ${regulationCode} | Due: ${dueDate}</p>
          </div>
          <p>Please ensure all necessary documentation and submissions are prepared.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost'}/compliance" style="display: inline-block; background: #0066cc; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">View Details</a>
        </div>
      </div>
    `;

    return this.send({ to, subject, html });
  }

  /**
   * Send weekly compliance summary
   */
  async sendWeeklySummary({ to, userName, score, overdue, pending, dueThisWeek }) {
    const subject = `Weekly Compliance Summary - Score: ${score}%`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #0066cc; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">Weekly Compliance Summary</h2>
        </div>
        <div style="padding: 24px; background: #fff; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
          <p>Hi ${userName},</p>
          <p>Here's your compliance overview for this week:</p>
          <div style="display: flex; gap: 16px; margin: 20px 0; text-align: center;">
            <div style="flex: 1; background: #f0f9ff; padding: 16px; border-radius: 8px;">
              <div style="font-size: 28px; font-weight: 700; color: #0066cc;">${score}%</div>
              <div style="font-size: 12px; color: #6b7280;">Score</div>
            </div>
            <div style="flex: 1; background: ${overdue > 0 ? '#fee2e2' : '#dcfce7'}; padding: 16px; border-radius: 8px;">
              <div style="font-size: 28px; font-weight: 700; color: ${overdue > 0 ? '#dc2626' : '#16a34a'};">${overdue}</div>
              <div style="font-size: 12px; color: #6b7280;">Overdue</div>
            </div>
            <div style="flex: 1; background: #fef3c7; padding: 16px; border-radius: 8px;">
              <div style="font-size: 28px; font-weight: 700; color: #92400e;">${pending}</div>
              <div style="font-size: 12px; color: #6b7280;">Pending</div>
            </div>
          </div>
          ${dueThisWeek > 0 ? `<p style="color: #f59e0b; font-weight: 600;">You have ${dueThisWeek} item(s) due this week.</p>` : ''}
          <a href="${process.env.FRONTEND_URL || 'http://localhost'}" style="display: inline-block; background: #0066cc; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">Open Dashboard</a>
        </div>
      </div>
    `;

    return this.send({ to, subject, html });
  }
}

export default new EmailService();
