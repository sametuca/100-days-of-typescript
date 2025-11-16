import { scheduler, ScheduledJob } from '../utils/scheduler';
import { CleanupJob } from './cleanup.job';
import { TaskReminderJob } from './task-reminder.job';
import { BackupJob } from './backup.job';
import config from '../config/env';
import logger from '../utils/logger';

const jobs: ScheduledJob[] = [
  {
    name: 'cleanup-expired-tokens',
    schedule: '0 0 * * *',
    task: CleanupJob.cleanupExpiredTokens,
    enabled: true
  },
  {
    name: 'cleanup-old-logs',
    schedule: '0 2 * * *',
    task: CleanupJob.cleanupOldLogs,
    enabled: true
  },
  {
    name: 'task-reminders',
    schedule: '0 9 * * *',
    task: TaskReminderJob.sendReminders,
    enabled: config.app.isProduction || config.app.isDevelopment
  },
  {
    name: 'database-backup',
    schedule: '0 3 * * *',
    task: BackupJob.backupDatabase,
    enabled: config.app.isProduction
  },
  {
    name: 'full-cleanup',
    schedule: '0 4 * * 0',
    task: CleanupJob.runAll,
    enabled: true
  }
];

export function initializeJobs(): void {
  logger.info('⏰ Initializing scheduled jobs...');

  jobs.forEach(job => {
    scheduler.schedule(job);
  });

  scheduler.start();

  logger.info(`✅ ${jobs.filter(j => j.enabled).length} jobs scheduled`);
}

export function stopJobs(): void {
  logger.info('⏸️  Stopping all scheduled jobs...');
  scheduler.stop();
}

export { scheduler };