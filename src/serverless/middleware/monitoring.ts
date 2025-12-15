import { Context } from 'aws-lambda';
import logger from '../../utils/logger';

/**
 * Serverless monitoring service
 */
export class ServerlessMonitoring {
  /**
   * Record custom metric to CloudWatch
   */
  static async recordMetric(
    metricName: string,
    value: number,
    unit: string = 'Count'
  ): Promise<void> {
    try {
      const metric = {
        MetricName: metricName,
        Value: value,
        Unit: unit,
        Timestamp: new Date()
      };

      logger.info('Metric recorded', metric);
      
      // In production, send to CloudWatch
      // const cloudwatch = new AWS.CloudWatch();
      // await cloudwatch.putMetricData({
      //   Namespace: 'TaskManagementAPI',
      //   MetricData: [metric]
      // }).promise();
    } catch (error: any) {
      logger.error('Failed to record metric:', error);
    }
  }

  /**
   * Track function execution
   */
  static trackExecution(functionName: string, context: Context) {
    const startTime = Date.now();

    return {
      finish: async (success: boolean = true) => {
        const duration = Date.now() - startTime;
        const memoryUsed = context.memoryLimitInMB;
        const remainingTime = context.getRemainingTimeInMillis();

        logger.info(`Function execution completed`, {
          function: functionName,
          duration,
          memory: memoryUsed,
          remainingTime,
          requestId: context.requestId,
          success
        });

        // Record metrics
        await this.recordMetric(`${functionName}Duration`, duration, 'Milliseconds');
        await this.recordMetric(`${functionName}Invocations`, 1, 'Count');

        if (!success) {
          await this.recordMetric(`${functionName}Errors`, 1, 'Count');
        }
      }
    };
  }

  /**
   * Log with structured format
   */
  static logStructured(
    level: string,
    message: string,
    context: Context,
    metadata?: Record<string, any>
  ): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      requestId: context.requestId,
      remainingTime: context.getRemainingTimeInMillis(),
      memoryLimit: context.memoryLimitInMB,
      ...metadata
    };

    console.log(JSON.stringify(logEntry));
  }
}

/**
 * Decorator for monitoring functions
 */
export function monitored(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
): PropertyDescriptor {
  const originalMethod = descriptor.value;

  descriptor.value = async function (event: any, context: Context) {
    const tracker = ServerlessMonitoring.trackExecution(propertyKey, context);

    try {
      const result = await originalMethod.call(this, event, context);
      await tracker.finish(true);
      return result;
    } catch (error) {
      await tracker.finish(false);
      throw error;
    }
  };

  return descriptor;
}
