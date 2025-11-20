"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduler = void 0;
exports.initializeJobs = initializeJobs;
exports.stopJobs = stopJobs;
const scheduler_1 = require("../utils/scheduler");
Object.defineProperty(exports, "scheduler", { enumerable: true, get: function () { return scheduler_1.scheduler; } });
const cleanup_job_1 = require("./cleanup.job");
const task_reminder_job_1 = require("./task-reminder.job");
const backup_job_1 = require("./backup.job");
const env_1 = __importDefault(require("../config/env"));
const logger_1 = __importDefault(require("../utils/logger"));
const jobs = [
    {
        name: 'cleanup-expired-tokens',
        schedule: '0 0 * * *',
        task: cleanup_job_1.CleanupJob.cleanupExpiredTokens,
        enabled: true
    },
    {
        name: 'cleanup-old-logs',
        schedule: '0 2 * * *',
        task: cleanup_job_1.CleanupJob.cleanupOldLogs,
        enabled: true
    },
    {
        name: 'task-reminders',
        schedule: '0 9 * * *',
        task: task_reminder_job_1.TaskReminderJob.sendReminders,
        enabled: env_1.default.app.isProduction || env_1.default.app.isDevelopment
    },
    {
        name: 'database-backup',
        schedule: '0 3 * * *',
        task: backup_job_1.BackupJob.backupDatabase,
        enabled: env_1.default.app.isProduction
    },
    {
        name: 'full-cleanup',
        schedule: '0 4 * * 0',
        task: cleanup_job_1.CleanupJob.runAll,
        enabled: true
    }
];
function initializeJobs() {
    logger_1.default.info('Initializing scheduled jobs...');
    jobs.forEach(job => {
        scheduler_1.scheduler.schedule(job);
    });
    scheduler_1.scheduler.start();
    logger_1.default.info(`${jobs.filter(j => j.enabled).length} jobs scheduled`);
}
function stopJobs() {
    logger_1.default.info('Stopping all scheduled jobs...');
    scheduler_1.scheduler.stop();
}
//# sourceMappingURL=index.js.map