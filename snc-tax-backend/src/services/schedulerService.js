import cron from 'node-cron';
import db from '../config/database.js';
import complianceService from './complianceService.js';
import notificationService from './notificationService.js';

/**
 * Scheduler Service
 * Manages background cron jobs for compliance monitoring
 */
class SchedulerService {
  constructor() {
    this.jobs = [];
  }

  /**
   * Initialize all cron jobs
   */
  start() {
    console.log('Starting compliance scheduler...');

    // Daily at 2:00 AM - Recalculate scores for all companies
    this.jobs.push(
      cron.schedule('0 2 * * *', () => this.recalculateAllScores(), {
        timezone: 'Africa/Johannesburg',
      })
    );

    // Daily at 6:00 AM - Check for overdue items
    this.jobs.push(
      cron.schedule('0 6 * * *', () => this.checkAllOverdue(), {
        timezone: 'Africa/Johannesburg',
      })
    );

    // Daily at 8:00 AM - Generate reminder notifications
    this.jobs.push(
      cron.schedule('0 8 * * *', () => this.generateAllReminders(), {
        timezone: 'Africa/Johannesburg',
      })
    );

    console.log(`✓ Scheduler started with ${this.jobs.length} jobs (timezone: Africa/Johannesburg)`);
  }

  /**
   * Stop all cron jobs
   */
  stop() {
    this.jobs.forEach(job => job.stop());
    this.jobs = [];
    console.log('Scheduler stopped');
  }

  /**
   * Recalculate compliance scores for all active companies
   */
  async recalculateAllScores() {
    try {
      console.log('[Scheduler] Recalculating compliance scores...');

      const companies = await db.manyOrNone(
        'SELECT id FROM companies WHERE is_active = true'
      );

      let success = 0;
      let failed = 0;

      for (const company of companies) {
        try {
          await complianceService.recalculateScore(company.id);
          success++;
        } catch (error) {
          console.error(`[Scheduler] Score calc failed for company ${company.id}:`, error.message);
          failed++;
        }
      }

      console.log(`[Scheduler] Score recalculation complete: ${success} success, ${failed} failed`);
    } catch (error) {
      console.error('[Scheduler] recalculateAllScores error:', error.message);
    }
  }

  /**
   * Check all companies for overdue items and update statuses
   */
  async checkAllOverdue() {
    try {
      console.log('[Scheduler] Checking for overdue items...');

      const companies = await db.manyOrNone(
        'SELECT id FROM companies WHERE is_active = true'
      );

      let totalOverdue = 0;

      for (const company of companies) {
        try {
          const overdueItems = await complianceService.checkOverdueItems(company.id);
          totalOverdue += overdueItems.length;

          // Generate notifications for newly overdue items
          if (overdueItems.length > 0) {
            await notificationService.generateOverdueNotifications(company.id);
          }
        } catch (error) {
          console.error(`[Scheduler] Overdue check failed for company ${company.id}:`, error.message);
        }
      }

      console.log(`[Scheduler] Overdue check complete: ${totalOverdue} items marked overdue`);
    } catch (error) {
      console.error('[Scheduler] checkAllOverdue error:', error.message);
    }
  }

  /**
   * Generate reminder notifications for upcoming due dates
   */
  async generateAllReminders() {
    try {
      console.log('[Scheduler] Generating reminder notifications...');

      const companies = await db.manyOrNone(
        'SELECT id FROM companies WHERE is_active = true'
      );

      let totalReminders = 0;

      for (const company of companies) {
        try {
          const reminders = await notificationService.generateReminders(company.id, 7);
          totalReminders += reminders.length;
        } catch (error) {
          console.error(`[Scheduler] Reminder gen failed for company ${company.id}:`, error.message);
        }
      }

      console.log(`[Scheduler] Reminders complete: ${totalReminders} notifications created`);
    } catch (error) {
      console.error('[Scheduler] generateAllReminders error:', error.message);
    }
  }
}

export default new SchedulerService();
