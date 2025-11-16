import * as cron from 'node-cron';
import logger from './logger';

export interface ScheduledJob {
  name: string;
  schedule: string;
  task: () => Promise<void> | void;
  enabled: boolean;
}

export class Scheduler {
  private jobs: Map<string, any> = new Map();

  public schedule(job: ScheduledJob): void {
    if (!job.enabled) {
      logger.info(`⏸️  Job '${job.name}' is disabled, skipping`);
      return;
    }

    if (!cron.validate(job.schedule)) {
      logger.error(`❌ Invalid cron schedule for job '${job.name}': ${job.schedule}`);
      return;
    }

    const scheduledTask = cron.schedule(job.schedule, async () => {
      logger.info(`▶️  Running job: ${job.name}`);
      const startTime = Date.now();

      try {
        await job.task();
        const duration = Date.now() - startTime;
        logger.info(`✅ Job '${job.name}' completed in ${duration}ms`);
      } catch (error) {
        logger.error(`❌ Job '${job.name}' failed:`, error);
      }
    });

    this.jobs.set(job.name, scheduledTask);
    logger.info(`⏰ Job '${job.name}' scheduled: ${job.schedule}`);
  }

  public start(jobName?: string): void {
    if (jobName) {
      const job = this.jobs.get(jobName);
      if (job) {
        job.start();
        logger.info(`▶️  Started job: ${jobName}`);
      }
    } else {
      this.jobs.forEach((job, name) => {
        job.start();
        logger.info(`▶️  Started job: ${name}`);
      });
    }
  }

  public stop(jobName?: string): void {
    if (jobName) {
      const job = this.jobs.get(jobName);
      if (job) {
        job.stop();
        logger.info(`⏸️  Stopped job: ${jobName}`);
      }
    } else {
      this.jobs.forEach((job, name) => {
        job.stop();
        logger.info(`⏸️  Stopped job: ${name}`);
      });
    }
  }

  public getStatus(): { name: string; running: boolean }[] {
    const status: { name: string; running: boolean }[] = [];
    
    this.jobs.forEach((job, name) => {
      status.push({
        name,
        running: job.getStatus() === 'scheduled'
      });
    });

    return status;
  }
}

export const scheduler = new Scheduler();