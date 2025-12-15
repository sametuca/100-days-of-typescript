# Day 55: Serverless Architecture & Cloud Functions ☁️⚡

## 🎯 Günün Hedefleri

✅ Serverless function implementation  
✅ AWS Lambda-style handlers  
✅ Azure Functions integration  
✅ Event triggers & scheduling  
✅ Cold start optimization  
✅ Function composition & chaining  
✅ Local serverless development  

## 🚀 Eklenen Özellikler

### 1. Serverless Function Framework
AWS Lambda-compatible function handler sistemi:

```typescript
// src/serverless/types.ts
export interface LambdaContext {
  functionName: string;
  functionVersion: string;
  invokedFunctionArn: string;
  memoryLimitInMB: number;
  awsRequestId: string;
  logGroupName: string;
  logStreamName: string;
  getRemainingTimeInMillis: () => number;
  callbackWaitsForEmptyEventLoop: boolean;
}

export interface LambdaEvent {
  httpMethod?: string;
  path?: string;
  headers?: Record<string, string>;
  queryStringParameters?: Record<string, string>;
  pathParameters?: Record<string, string>;
  body?: string | null;
  isBase64Encoded?: boolean;
  requestContext?: {
    requestId: string;
    stage: string;
    identity?: {
      sourceIp: string;
      userAgent: string;
    };
  };
  // For scheduled events
  source?: string;
  'detail-type'?: string;
  detail?: Record<string, any>;
  // For SQS events
  Records?: Array<{
    messageId: string;
    body: string;
    attributes: Record<string, string>;
  }>;
}

export interface LambdaResponse {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
  isBase64Encoded?: boolean;
}

export type LambdaHandler = (
  event: LambdaEvent,
  context: LambdaContext
) => Promise<LambdaResponse>;
```

### 2. Function Runtime Engine
Local serverless execution environment:

```typescript
// src/serverless/runtime.ts
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
}
```

### 3. HTTP Adapter for Express Integration
Serverless fonksiyonları Express'e bağlama:

```typescript
// src/serverless/adapters/http-adapter.ts
import { Request, Response, Router } from 'express';
import { ServerlessRuntime } from '../runtime';
import { LambdaEvent } from '../types';
import logger from '../../utils/logger';

export class HttpAdapter {
  private runtime: ServerlessRuntime;
  private router: Router;

  constructor(runtime: ServerlessRuntime) {
    this.runtime = runtime;
    this.router = Router();
  }

  /**
   * Create Express route for a function
   */
  createRoute(
    functionName: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    path: string
  ): void {
    const handler = async (req: Request, res: Response) => {
      const event = this.transformRequest(req);
      
      try {
        const result = await this.runtime.invoke(functionName, event);
        
        // Set response headers
        if (result.headers) {
          Object.entries(result.headers).forEach(([key, value]) => {
            res.setHeader(key, value);
          });
        }

        // Parse and send body
        let body: any;
        try {
          body = JSON.parse(result.body);
        } catch {
          body = result.body;
        }

        res.status(result.statusCode).json(body);
      } catch (error: any) {
        logger.error('HTTP adapter error:', error);
        res.status(500).json({
          error: 'Internal Server Error',
          message: error.message
        });
      }
    };

    switch (method) {
      case 'GET':
        this.router.get(path, handler);
        break;
      case 'POST':
        this.router.post(path, handler);
        break;
      case 'PUT':
        this.router.put(path, handler);
        break;
      case 'DELETE':
        this.router.delete(path, handler);
        break;
      case 'PATCH':
        this.router.patch(path, handler);
        break;
    }

    logger.info(`Route registered: ${method} ${path} -> ${functionName}`);
  }

  /**
   * Transform Express request to Lambda event
   */
  private transformRequest(req: Request): LambdaEvent {
    return {
      httpMethod: req.method,
      path: req.path,
      headers: req.headers as Record<string, string>,
      queryStringParameters: req.query as Record<string, string>,
      pathParameters: req.params,
      body: req.body ? JSON.stringify(req.body) : null,
      isBase64Encoded: false,
      requestContext: {
        requestId: req.headers['x-request-id'] as string || '',
        stage: process.env.STAGE || 'dev',
        identity: {
          sourceIp: req.ip || '',
          userAgent: req.get('user-agent') || ''
        }
      }
    };
  }

  getRouter(): Router {
    return this.router;
  }
}
```

### 4. Event Scheduler (Cron-like)
Scheduled function execution:

```typescript
// src/serverless/scheduler.ts
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
```

### 5. Function Composition & Middleware
Fonksiyon zincirleme ve middleware:

```typescript
// src/serverless/composition.ts
import { LambdaEvent, LambdaContext, LambdaResponse, LambdaHandler } from './types';
import logger from '../utils/logger';

export type MiddlewareFunction = (
  event: LambdaEvent,
  context: LambdaContext,
  next: () => Promise<LambdaResponse>
) => Promise<LambdaResponse>;

/**
 * Compose multiple handlers into a pipeline
 */
export function compose(...handlers: LambdaHandler[]): LambdaHandler {
  return async (event: LambdaEvent, context: LambdaContext): Promise<LambdaResponse> => {
    let currentEvent = event;
    let lastResponse: LambdaResponse = {
      statusCode: 200,
      body: ''
    };

    for (const handler of handlers) {
      // Check remaining time
      if (context.getRemainingTimeInMillis() < 1000) {
        return {
          statusCode: 504,
          body: JSON.stringify({ error: 'Function timeout approaching' })
        };
      }

      lastResponse = await handler(currentEvent, context);

      // Break on error
      if (lastResponse.statusCode >= 400) {
        break;
      }

      // Pass response body as next event body
      currentEvent = {
        ...currentEvent,
        body: lastResponse.body
      };
    }

    return lastResponse;
  };
}

/**
 * Apply middleware to a handler
 */
export function withMiddleware(
  handler: LambdaHandler,
  ...middlewares: MiddlewareFunction[]
): LambdaHandler {
  return async (event: LambdaEvent, context: LambdaContext): Promise<LambdaResponse> => {
    let index = 0;

    const next = async (): Promise<LambdaResponse> => {
      if (index < middlewares.length) {
        const middleware = middlewares[index++];
        return middleware(event, context, next);
      }
      return handler(event, context);
    };

    return next();
  };
}

// Built-in middlewares
export const loggingMiddleware: MiddlewareFunction = async (event, context, next) => {
  const start = Date.now();
  logger.info(`Function start: ${context.functionName}`, {
    requestId: context.awsRequestId,
    method: event.httpMethod,
    path: event.path
  });

  const response = await next();

  logger.info(`Function end: ${context.functionName}`, {
    requestId: context.awsRequestId,
    duration: Date.now() - start,
    statusCode: response.statusCode
  });

  return response;
};

export const errorHandlerMiddleware: MiddlewareFunction = async (event, context, next) => {
  try {
    return await next();
  } catch (error: any) {
    logger.error(`Unhandled error in ${context.functionName}:`, error);
    
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error.message,
        requestId: context.awsRequestId
      })
    };
  }
};

export const corsMiddleware: MiddlewareFunction = async (event, context, next) => {
  const response = await next();

  return {
    ...response,
    headers: {
      ...response.headers,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
    }
  };
};

export const jsonParserMiddleware: MiddlewareFunction = async (event, context, next) => {
  if (event.body && typeof event.body === 'string') {
    try {
      (event as any).parsedBody = JSON.parse(event.body);
    } catch {
      // Keep original body if not JSON
    }
  }
  return next();
};

export const authMiddleware = (validateToken: (token: string) => Promise<boolean>): MiddlewareFunction => {
  return async (event, context, next) => {
    const authHeader = event.headers?.['authorization'] || event.headers?.['Authorization'];
    
    if (!authHeader) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Missing authorization header' })
      };
    }

    const token = authHeader.replace('Bearer ', '');
    const isValid = await validateToken(token);

    if (!isValid) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid token' })
      };
    }

    return next();
  };
};
```

### 6. Sample Functions
Örnek serverless fonksiyonlar:

```typescript
// src/serverless/functions/task-functions.ts
import { LambdaHandler, LambdaResponse } from '../types';
import { TaskRepository } from '../../repositories/task.repository';
import { withMiddleware, loggingMiddleware, errorHandlerMiddleware, corsMiddleware } from '../composition';

const taskRepo = new TaskRepository();

/**
 * Get all tasks for a user
 */
export const getTasksHandler: LambdaHandler = async (event, context) => {
  const userId = event.queryStringParameters?.userId;
  const limit = parseInt(event.queryStringParameters?.limit || '10');
  const offset = parseInt(event.queryStringParameters?.offset || '0');

  if (!userId) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'userId is required' })
    };
  }

  const tasks = await taskRepo.findAll({ userId: parseInt(userId) }, limit, offset);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      success: true,
      data: tasks,
      pagination: { limit, offset }
    })
  };
};

/**
 * Get single task by ID
 */
export const getTaskHandler: LambdaHandler = async (event, context) => {
  const taskId = event.pathParameters?.id;

  if (!taskId) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Task ID is required' })
    };
  }

  const task = await taskRepo.findById(parseInt(taskId));

  if (!task) {
    return {
      statusCode: 404,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Task not found' })
    };
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      success: true,
      data: task
    })
  };
};

/**
 * Create new task
 */
export const createTaskHandler: LambdaHandler = async (event, context) => {
  let body: any;
  
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Invalid JSON body' })
    };
  }

  const { title, description, priority, status, userId, projectId } = body;

  if (!title || !userId) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'title and userId are required' })
    };
  }

  const task = await taskRepo.create({
    title,
    description: description || '',
    priority: priority || 'medium',
    status: status || 'todo',
    userId,
    projectId
  });

  return {
    statusCode: 201,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      success: true,
      data: task
    })
  };
};

/**
 * Update task
 */
export const updateTaskHandler: LambdaHandler = async (event, context) => {
  const taskId = event.pathParameters?.id;
  
  if (!taskId) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Task ID is required' })
    };
  }

  let body: any;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Invalid JSON body' })
    };
  }

  const task = await taskRepo.update(parseInt(taskId), body);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      success: true,
      data: task
    })
  };
};

/**
 * Delete task
 */
export const deleteTaskHandler: LambdaHandler = async (event, context) => {
  const taskId = event.pathParameters?.id;
  
  if (!taskId) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Task ID is required' })
    };
  }

  await taskRepo.delete(parseInt(taskId));

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      success: true,
      message: 'Task deleted successfully'
    })
  };
};

// Export with middlewares
export const getTasks = withMiddleware(
  getTasksHandler,
  loggingMiddleware,
  errorHandlerMiddleware,
  corsMiddleware
);

export const getTask = withMiddleware(
  getTaskHandler,
  loggingMiddleware,
  errorHandlerMiddleware,
  corsMiddleware
);

export const createTask = withMiddleware(
  createTaskHandler,
  loggingMiddleware,
  errorHandlerMiddleware,
  corsMiddleware
);

export const updateTask = withMiddleware(
  updateTaskHandler,
  loggingMiddleware,
  errorHandlerMiddleware,
  corsMiddleware
);

export const deleteTask = withMiddleware(
  deleteTaskHandler,
  loggingMiddleware,
  errorHandlerMiddleware,
  corsMiddleware
);
```

### 7. Scheduled Functions
Zamanlanmış görevler için fonksiyonlar:

```typescript
// src/serverless/functions/scheduled-functions.ts
import { LambdaHandler } from '../types';
import { TaskRepository } from '../../repositories/task.repository';
import logger from '../../utils/logger';

const taskRepo = new TaskRepository();

/**
 * Daily task summary report
 */
export const dailySummaryHandler: LambdaHandler = async (event, context) => {
  logger.info('Running daily summary job');

  const allTasks = await taskRepo.findAll({}, 1000, 0);
  
  const summary = {
    total: allTasks.length,
    byStatus: {
      todo: allTasks.filter(t => t.status === 'todo').length,
      'in-progress': allTasks.filter(t => t.status === 'in-progress').length,
      done: allTasks.filter(t => t.status === 'done').length,
      cancelled: allTasks.filter(t => t.status === 'cancelled').length
    },
    byPriority: {
      high: allTasks.filter(t => t.priority === 'high').length,
      medium: allTasks.filter(t => t.priority === 'medium').length,
      low: allTasks.filter(t => t.priority === 'low').length
    },
    generatedAt: new Date().toISOString()
  };

  logger.info('Daily summary generated', summary);

  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      data: summary
    })
  };
};

/**
 * Cleanup old completed tasks
 */
export const cleanupHandler: LambdaHandler = async (event, context) => {
  logger.info('Running cleanup job');

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const allTasks = await taskRepo.findAll({}, 10000, 0);
  const tasksToDelete = allTasks.filter(task => {
    if (task.status !== 'done' && task.status !== 'cancelled') return false;
    const updatedAt = new Date(task.updatedAt);
    return updatedAt < thirtyDaysAgo;
  });

  let deleted = 0;
  for (const task of tasksToDelete) {
    await taskRepo.delete(task.id);
    deleted++;
  }

  logger.info(`Cleanup completed: ${deleted} tasks deleted`);

  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      data: {
        deleted,
        timestamp: new Date().toISOString()
      }
    })
  };
};

/**
 * Send reminders for overdue tasks
 */
export const reminderHandler: LambdaHandler = async (event, context) => {
  logger.info('Running reminder job');

  const allTasks = await taskRepo.findAll({}, 10000, 0);
  const now = new Date();

  const overdueTasks = allTasks.filter(task => {
    if (task.status === 'done' || task.status === 'cancelled') return false;
    if (!task.dueDate) return false;
    return new Date(task.dueDate) < now;
  });

  // Group by user
  const tasksByUser: Record<number, any[]> = {};
  overdueTasks.forEach(task => {
    if (!tasksByUser[task.userId]) {
      tasksByUser[task.userId] = [];
    }
    tasksByUser[task.userId].push(task);
  });

  const reminders = Object.entries(tasksByUser).map(([userId, tasks]) => ({
    userId: parseInt(userId),
    overdueCount: tasks.length,
    tasks: tasks.map(t => ({ id: t.id, title: t.title, dueDate: t.dueDate }))
  }));

  logger.info(`Reminders generated for ${reminders.length} users`);

  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      data: {
        reminders,
        timestamp: new Date().toISOString()
      }
    })
  };
};

/**
 * Health check function
 */
export const healthCheckHandler: LambdaHandler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      status: 'healthy',
      functionName: context.functionName,
      memoryLimit: context.memoryLimitInMB,
      remainingTime: context.getRemainingTimeInMillis(),
      timestamp: new Date().toISOString()
    })
  };
};
```

### 8. Serverless Application Setup
Ana uygulama kurulumu:

```typescript
// src/serverless/app.ts
import { ServerlessRuntime } from './runtime';
import { HttpAdapter } from './adapters/http-adapter';
import { FunctionScheduler } from './scheduler';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask
} from './functions/task-functions';
import {
  dailySummaryHandler,
  cleanupHandler,
  reminderHandler,
  healthCheckHandler
} from './functions/scheduled-functions';
import logger from '../utils/logger';

export function createServerlessApp() {
  // Initialize runtime
  const runtime = new ServerlessRuntime();

  // Register HTTP functions
  runtime.registerFunction({
    name: 'getTasks',
    handler: getTasks,
    timeout: 10000,
    memorySize: 256
  });

  runtime.registerFunction({
    name: 'getTask',
    handler: getTask,
    timeout: 5000,
    memorySize: 128
  });

  runtime.registerFunction({
    name: 'createTask',
    handler: createTask,
    timeout: 10000,
    memorySize: 256
  });

  runtime.registerFunction({
    name: 'updateTask',
    handler: updateTask,
    timeout: 10000,
    memorySize: 256
  });

  runtime.registerFunction({
    name: 'deleteTask',
    handler: deleteTask,
    timeout: 5000,
    memorySize: 128
  });

  // Register scheduled functions
  runtime.registerFunction({
    name: 'dailySummary',
    handler: dailySummaryHandler,
    timeout: 60000,
    memorySize: 512
  });

  runtime.registerFunction({
    name: 'cleanup',
    handler: cleanupHandler,
    timeout: 120000,
    memorySize: 512
  });

  runtime.registerFunction({
    name: 'reminder',
    handler: reminderHandler,
    timeout: 60000,
    memorySize: 256
  });

  runtime.registerFunction({
    name: 'healthCheck',
    handler: healthCheckHandler,
    timeout: 5000,
    memorySize: 128
  });

  // Setup HTTP adapter
  const httpAdapter = new HttpAdapter(runtime);
  httpAdapter.createRoute('getTasks', 'GET', '/tasks');
  httpAdapter.createRoute('getTask', 'GET', '/tasks/:id');
  httpAdapter.createRoute('createTask', 'POST', '/tasks');
  httpAdapter.createRoute('updateTask', 'PUT', '/tasks/:id');
  httpAdapter.createRoute('deleteTask', 'DELETE', '/tasks/:id');

  // Setup scheduler
  const scheduler = new FunctionScheduler(runtime);

  scheduler.addSchedule({
    name: 'daily-summary',
    functionName: 'dailySummary',
    schedule: '0 9 * * *', // Every day at 9 AM
    enabled: true
  });

  scheduler.addSchedule({
    name: 'weekly-cleanup',
    functionName: 'cleanup',
    schedule: '0 2 * * 0', // Every Sunday at 2 AM
    enabled: true
  });

  scheduler.addSchedule({
    name: 'hourly-reminder',
    functionName: 'reminder',
    schedule: '0 * * * *', // Every hour
    enabled: true
  });

  logger.info('Serverless application initialized');

  return {
    runtime,
    httpAdapter,
    scheduler
  };
}
```

## 🔧 Kurulum

```bash
# Install dependencies
npm install node-cron uuid
npm install --save-dev @types/node-cron @types/uuid
```

## 📊 Kullanım Örnekleri

### Local Development
```typescript
import express from 'express';
import { createServerlessApp } from './serverless/app';

const app = express();
app.use(express.json());

const { httpAdapter, runtime, scheduler } = createServerlessApp();

// Mount serverless routes
app.use('/api/serverless', httpAdapter.getRouter());

// Metrics endpoint
app.get('/api/serverless/metrics', (req, res) => {
  res.json(runtime.getMetrics());
});

// Schedules endpoint
app.get('/api/serverless/schedules', (req, res) => {
  res.json(scheduler.listSchedules());
});

app.listen(3000, () => {
  console.log('Serverless app running on port 3000');
});
```

### Direct Function Invocation
```typescript
const { runtime } = createServerlessApp();

// Invoke function directly
const result = await runtime.invoke('createTask', {
  httpMethod: 'POST',
  body: JSON.stringify({
    title: 'New Task',
    userId: 1,
    priority: 'high'
  })
});

console.log(result);
```

## 🧪 Testing

```typescript
// __tests__/serverless/runtime.test.ts
import { ServerlessRuntime } from '../../src/serverless/runtime';
import { LambdaHandler } from '../../src/serverless/types';

describe('ServerlessRuntime', () => {
  let runtime: ServerlessRuntime;

  beforeEach(() => {
    runtime = new ServerlessRuntime();
  });

  it('should register and invoke function', async () => {
    const handler: LambdaHandler = async (event, context) => ({
      statusCode: 200,
      body: JSON.stringify({ message: 'Hello' })
    });

    runtime.registerFunction({
      name: 'testFunction',
      handler
    });

    const result = await runtime.invoke('testFunction', {});

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({ message: 'Hello' });
  });

  it('should handle function timeout', async () => {
    const slowHandler: LambdaHandler = async () => {
      await new Promise(resolve => setTimeout(resolve, 5000));
      return { statusCode: 200, body: '' };
    };

    runtime.registerFunction({
      name: 'slowFunction',
      handler: slowHandler,
      timeout: 100
    });

    const result = await runtime.invoke('slowFunction', {});

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body).message).toContain('timeout');
  });
});
```

## 🎯 Best Practices

1. **Cold Start Optimization**: Keep functions lightweight
2. **Stateless Design**: Don't rely on local state
3. **Timeout Handling**: Always set appropriate timeouts
4. **Error Handling**: Use middleware for consistent error handling
5. **Logging**: Log all invocations with request IDs
6. **Memory Management**: Monitor memory usage
7. **Idempotency**: Design functions to be idempotent

## 🚀 Sonraki Adımlar

- [ ] Add SQS/SNS event triggers
- [ ] Implement warm-up strategies
- [ ] Add function versioning
- [ ] Implement canary deployments
- [ ] Add distributed tracing
- [ ] Implement cost estimation

## 📚 Öğrenilen Kavramlar

- Serverless architecture patterns
- AWS Lambda event/context model
- Function composition & middleware
- Scheduled function execution
- Cold start optimization
- Local serverless development
- HTTP adapter pattern
- Event-driven triggers

---

**Day 55 Tamamlandı! 🎉**

Serverless architecture ile fonksiyonlarımızı cloud-native bir şekilde çalıştırabilir hale geldik! ☁️⚡
