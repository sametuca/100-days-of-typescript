import { Context } from 'aws-lambda';
import logger from '../../utils/logger';

/**
 * Cold start optimization utilities
 */
export class ColdStartOptimizer {
  private static initialized = false;

  /**
   * Initialize once (called from handler)
   */
  static async initialize(): Promise<void> {
    if (!this.initialized) {
      logger.debug('Initializing cold start optimizations');
      
      // Pre-load critical dependencies
      // Initialize connection pools
      // Warm up caches
      
      this.initialized = true;
    }
  }

  /**
   * Check if this is a cold start
   */
  static isColdStart(context: Context): boolean {
    return !this.initialized;
  }

  /**
   * Get remaining time
   */
  static getRemainingTime(context: Context): number {
    return context.getRemainingTimeInMillis();
  }
}

/**
 * Connection pooling for databases
 */
export class ConnectionPool {
  private static instance: any = null;

  static getInstance(): any {
    if (!this.instance) {
      logger.debug('Initializing connection pool');
      // Initialize actual connection pool here
    }
    return this.instance;
  }

  static async close(): Promise<void> {
    if (this.instance) {
      logger.debug('Closing connection pool');
      // Close actual connection here
      this.instance = null;
    }
  }
}

/**
 * Lazy load dependencies to reduce startup time
 */
export class LazyLoader {
  private static cache = new Map<string, any>();

  static require(modulePath: string): any {
    if (!this.cache.has(modulePath)) {
      logger.debug(`Lazy loading module: ${modulePath}`);
      try {
        this.cache.set(modulePath, require(modulePath));
      } catch (error) {
        logger.error(`Failed to load module: ${modulePath}`, error);
        throw error;
      }
    }
    return this.cache.get(modulePath);
  }
}

/**
 * Optimized handler wrapper
 */
export async function withColdStartOptimizations<T>(
  handler: () => Promise<T>,
  context: Context
): Promise<T> {
  context.callbackWaitsForEmptyEventLoop = false;

  const isColdStart = ColdStartOptimizer.isColdStart(context);

  if (isColdStart) {
    logger.info('Cold start detected', {
      requestId: context.requestId,
      memory: context.memoryLimitInMB
    });
    
    await ColdStartOptimizer.initialize();
  }

  try {
    return await handler();
  } finally {
    // No cleanup needed - will be reused for next invocation
    logger.debug(`Handler completed. Remaining time: ${context.getRemainingTimeInMillis()}ms`);
  }
}
