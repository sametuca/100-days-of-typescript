import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';
import { LambdaContext, LambdaEvent, LambdaHandler, LambdaResponse } from './types';

export interface FunctionConfig {
  name: string;
  handler: LambdaHandler;
  timeout?: number;
  memorySize?: number;
  environment?: Record<string, string>;
}

export class ServerlessRuntime {
  private functions: Map<string, FunctionConfig> = new Map();
  private executionMetrics: Map<string, {
    invocations: number;
    errors: number;
    totalDuration: number;
    coldStarts: number;
  }> = new Map();

  /**
   * Register a serverless function
   */
  registerFunction(config: FunctionConfig): void {
    this.functions.set(config.name, {
      ...config,
      timeout: config.timeout || 30000,
      memorySize: config.memorySize || 128
    });

    this.executionMetrics.set(config.name, {
      invocations: 0,
      errors: 0,
      totalDuration: 0,
      coldStarts: 0
    });

    logger.info(`Function registered: ${config.name}`);
  }

  /**
   * Invoke a function
   */
  async invoke(
    functionName: string,
    event: LambdaEvent,
    options?: { async?: boolean }
  ): Promise<LambdaResponse> {
    const config = this.functions.get(functionName);
    if (!config) {
      throw new Error(`Function not found: ${functionName}`);
    }

    const requestId = uuidv4();
    const startTime = Date.now();
    const metrics = this.executionMetrics.get(functionName)!;

    // Create execution context
    const context = this.createContext(config, requestId, startTime);

    // Set environment variables
    if (config.environment) {
      Object.entries(config.environment).forEach(([key, value]) => {
        process.env[key] = value;
      });
    }

    metrics.invocations++;

    logger.info(`Invoking function: ${functionName}`, { requestId });

    try {
      // Execute with timeout
      const result = await this.executeWithTimeout(
        config.handler(event, context),
        config.timeout!
      );

      const duration = Date.now() - startTime;
      metrics.totalDuration += duration;

      logger.info(`Function completed: ${functionName}`, {
        requestId,
        duration,
        statusCode: result.statusCode
      });

      return result;
    } catch (error: any) {
      metrics.errors++;
      
      logger.error(`Function error: ${functionName}`, {
        requestId,
        error: error.message
      });

      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'Internal Server Error',
          message: error.message,
          requestId
        })
      };
    }
  }

  /**
   * Create Lambda-compatible context
   */
  private createContext(
    config: FunctionConfig,
    requestId: string,
    startTime: number
  ): LambdaContext {
    return {
      functionName: config.name,
      functionVersion: '$LATEST',
      invokedFunctionArn: `arn:aws:lambda:local:000000000000:function:${config.name}`,
      memoryLimitInMB: config.memorySize!,
      awsRequestId: requestId,
      logGroupName: `/aws/lambda/${config.name}`,
      logStreamName: `${new Date().toISOString().split('T')[0]}/${requestId}`,
      getRemainingTimeInMillis: () => {
        const elapsed = Date.now() - startTime;
        return Math.max(0, config.timeout! - elapsed);
      },
      callbackWaitsForEmptyEventLoop: true
    };
  }

  /**
   * Execute with timeout
   */
  private async executeWithTimeout<T>(
    promise: Promise<T>,
    timeout: number
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Function timeout')), timeout)
      )
    ]);
  }

  /**
   * Get function metrics
   */
  getMetrics(functionName?: string): Record<string, any> {
    if (functionName) {
      const metrics = this.executionMetrics.get(functionName);
      if (!metrics) return {};

      return {
        ...metrics,
        avgDuration: metrics.invocations > 0
          ? metrics.totalDuration / metrics.invocations
          : 0,
        errorRate: metrics.invocations > 0
          ? (metrics.errors / metrics.invocations) * 100
          : 0
      };
    }

    const allMetrics: Record<string, any> = {};
    this.executionMetrics.forEach((metrics, name) => {
      allMetrics[name] = {
        ...metrics,
        avgDuration: metrics.invocations > 0
          ? metrics.totalDuration / metrics.invocations
          : 0,
        errorRate: metrics.invocations > 0
          ? (metrics.errors / metrics.invocations) * 100
          : 0
      };
    });

    return allMetrics;
  }

  /**
   * List registered functions
   */
  listFunctions(): string[] {
    return Array.from(this.functions.keys());
  }

  /**
   * Remove a function
   */
  removeFunction(functionName: string): boolean {
    const removed = this.functions.delete(functionName);
    this.executionMetrics.delete(functionName);
    return removed;
  }
}
