import cron from 'node-cron';
import { ServerlessRuntime } from './runtime';
import { LambdaEvent } from './types';
import logger from '../utils/logger';

export interface ScheduleConfig {
  name: string;
  functionName: string;
  schedule: string; // Cron expression
  input?: Record<string, any>;
  enabled?: boolean;
}

export class FunctionScheduler {
  private runtime: ServerlessRuntime;
  private schedules: Map<string, cron.ScheduledTask> = new Map();
  private configs: Map<string, ScheduleConfig> = new Map();

  constructor(runtime: ServerlessRuntime) {
    this.runtime = runtime;
  }

  /**
   * Add a scheduled function
   */
  addSchedule(config: ScheduleConfig): void {
    if (!cron.validate(config.schedule)) {
      throw new Error(`Invalid cron expression: ${config.schedule}`);
    }

    // Stop existing schedule if any
    this.removeSchedule(config.name);

    const task = cron.schedule(config.schedule, async () => {
      await this.executeScheduled(config);
    }, {
      scheduled: config.enabled !== false
    });

    this.schedules.set(config.name, task);
    this.configs.set(config.name, config);

    logger.info(`Schedule added: ${config.name} (${config.schedule}) -> ${config.functionName}`);
  }

  /**
   * Execute scheduled function
   */
  private async executeScheduled(config: ScheduleConfig): Promise<void> {
    const event: LambdaEvent = {
      source: 'aws.events',
      'detail-type': 'Scheduled Event',
      detail: {
        scheduleName: config.name,
        scheduleExpression: config.schedule,
        ...config.input
      }
    };

    logger.info(`Executing scheduled function: ${config.functionName}`, {
      schedule: config.name
    });

    try {
      await this.runtime.invoke(config.functionName, event);
    } catch (error: any) {
      logger.error(`Scheduled execution failed: ${config.name}`, {
        error: error.message
      });
    }
  }

  /**
   * Remove a schedule
   */
  removeSchedule(name: string): void {
    const task = this.schedules.get(name);
    if (task) {
      task.stop();
      this.schedules.delete(name);
      this.configs.delete(name);
      logger.info(`Schedule removed: ${name}`);
    }
  }

  /**
   * Enable/disable a schedule
   */
  setEnabled(name: string, enabled: boolean): void {
    const task = this.schedules.get(name);
    if (task) {
      if (enabled) {
        task.start();
      } else {
        task.stop();
      }
      logger.info(`Schedule ${name} ${enabled ? 'enabled' : 'disabled'}`);
    }
  }

  /**
   * Trigger a scheduled function manually
   */
  async triggerNow(name: string): Promise<void> {
    const config = this.configs.get(name);
    if (!config) {
      throw new Error(`Schedule not found: ${name}`);
    }
    await this.executeScheduled(config);
  }

  /**
   * List all schedules
   */
  listSchedules(): Array<ScheduleConfig & { running: boolean }> {
    const result: Array<ScheduleConfig & { running: boolean }> = [];

    this.configs.forEach((config, name) => {
      const task = this.schedules.get(name);
      result.push({
        ...config,
        running: task?.running || false
      });
    });

    return result;
  }

  /**
   * Stop all schedules
   */
  stopAll(): void {
    this.schedules.forEach((task, name) => {
      task.stop();
      logger.info(`Schedule stopped: ${name}`);
    });
  }
}
