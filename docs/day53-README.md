# Day 53: Microservices Communication & Service Mesh 🔗

## 🎯 Günün Hedefleri

✅ Service-to-service communication  
✅ gRPC implementation  
✅ Service discovery  
✅ Circuit breaker pattern  
✅ Distributed tracing  
✅ Service mesh basics  
✅ API gateway integration  

## 🚀 Eklenen Özellikler

### 1. gRPC Service Implementation
High-performance RPC framework for microservices communication:

```typescript
// src/grpc/protos/task.proto
syntax = "proto3";

package taskservice;

service TaskService {
  rpc CreateTask (CreateTaskRequest) returns (TaskResponse);
  rpc GetTask (GetTaskRequest) returns (TaskResponse);
  rpc UpdateTask (UpdateTaskRequest) returns (TaskResponse);
  rpc DeleteTask (DeleteTaskRequest) returns (DeleteResponse);
  rpc ListTasks (ListTasksRequest) returns (stream TaskResponse);
  rpc StreamTaskUpdates (TaskSubscriptionRequest) returns (stream TaskUpdateEvent);
}

message CreateTaskRequest {
  string title = 1;
  string description = 2;
  string priority = 3;
  string status = 4;
  int32 user_id = 5;
  int32 project_id = 6;
}

message TaskResponse {
  int32 id = 1;
  string title = 2;
  string description = 3;
  string priority = 4;
  string status = 5;
  int32 user_id = 6;
  int32 project_id = 7;
  string created_at = 8;
  string updated_at = 9;
}

message GetTaskRequest {
  int32 id = 1;
}

message UpdateTaskRequest {
  int32 id = 1;
  string title = 2;
  string description = 3;
  string priority = 4;
  string status = 5;
}

message DeleteTaskRequest {
  int32 id = 1;
}

message DeleteResponse {
  bool success = 1;
  string message = 2;
}

message ListTasksRequest {
  int32 user_id = 1;
  int32 limit = 2;
  int32 offset = 3;
  string status = 4;
}

message TaskSubscriptionRequest {
  int32 user_id = 1;
  repeated int32 task_ids = 2;
}

message TaskUpdateEvent {
  string event_type = 1;
  TaskResponse task = 2;
  string timestamp = 3;
}
```

```typescript
// src/grpc/services/task-grpc.service.ts
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { join } from 'path';
import { TaskRepository } from '../../repositories/task.repository';
import logger from '../../utils/logger';

const PROTO_PATH = join(__dirname, '../protos/task.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const taskProto = grpc.loadPackageDefinition(packageDefinition).taskservice as any;

export class TaskGrpcService {
  private server: grpc.Server;
  private taskRepository: TaskRepository;

  constructor() {
    this.server = new grpc.Server();
    this.taskRepository = new TaskRepository();
    this.setupHandlers();
  }

  private setupHandlers(): void {
    this.server.addService(taskProto.TaskService.service, {
      CreateTask: this.createTask.bind(this),
      GetTask: this.getTask.bind(this),
      UpdateTask: this.updateTask.bind(this),
      DeleteTask: this.deleteTask.bind(this),
      ListTasks: this.listTasks.bind(this),
      StreamTaskUpdates: this.streamTaskUpdates.bind(this)
    });
  }

  private async createTask(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const { title, description, priority, status, user_id, project_id } = call.request;

      const task = await this.taskRepository.create({
        title,
        description,
        priority,
        status,
        userId: user_id,
        projectId: project_id
      });

      callback(null, {
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        user_id: task.userId,
        project_id: task.projectId,
        created_at: task.createdAt,
        updated_at: task.updatedAt
      });
    } catch (error) {
      logger.error('gRPC CreateTask error:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: error.message
      }, null);
    }
  }

  private async getTask(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const { id } = call.request;
      const task = await this.taskRepository.findById(id);

      if (!task) {
        callback({
          code: grpc.status.NOT_FOUND,
          message: 'Task not found'
        }, null);
        return;
      }

      callback(null, {
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        user_id: task.userId,
        project_id: task.projectId,
        created_at: task.createdAt,
        updated_at: task.updatedAt
      });
    } catch (error) {
      logger.error('gRPC GetTask error:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: error.message
      }, null);
    }
  }

  private async updateTask(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const { id, title, description, priority, status } = call.request;

      const task = await this.taskRepository.update(id, {
        title,
        description,
        priority,
        status
      });

      callback(null, {
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        user_id: task.userId,
        project_id: task.projectId,
        created_at: task.createdAt,
        updated_at: task.updatedAt
      });
    } catch (error) {
      logger.error('gRPC UpdateTask error:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: error.message
      }, null);
    }
  }

  private async deleteTask(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const { id } = call.request;
      await this.taskRepository.delete(id);

      callback(null, {
        success: true,
        message: 'Task deleted successfully'
      });
    } catch (error) {
      logger.error('gRPC DeleteTask error:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: error.message
      }, null);
    }
  }

  private async listTasks(
    call: grpc.ServerWritableStream<any, any>
  ): Promise<void> {
    try {
      const { user_id, limit = 10, offset = 0, status } = call.request;

      const tasks = await this.taskRepository.findByUser(user_id, {
        limit,
        offset,
        status
      });

      for (const task of tasks) {
        call.write({
          id: task.id,
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: task.status,
          user_id: task.userId,
          project_id: task.projectId,
          created_at: task.createdAt,
          updated_at: task.updatedAt
        });
      }

      call.end();
    } catch (error) {
      logger.error('gRPC ListTasks error:', error);
      call.destroy({
        code: grpc.status.INTERNAL,
        message: error.message
      } as any);
    }
  }

  private async streamTaskUpdates(
    call: grpc.ServerWritableStream<any, any>
  ): Promise<void> {
    const { user_id, task_ids } = call.request;

    // Set up real-time subscription
    const subscription = this.taskRepository.subscribeToUpdates(
      user_id,
      task_ids,
      (event, task) => {
        call.write({
          event_type: event,
          task: {
            id: task.id,
            title: task.title,
            description: task.description,
            priority: task.priority,
            status: task.status,
            user_id: task.userId,
            project_id: task.projectId,
            created_at: task.createdAt,
            updated_at: task.updatedAt
          },
          timestamp: new Date().toISOString()
        });
      }
    );

    call.on('cancelled', () => {
      subscription.unsubscribe();
    });
  }

  start(port: number): void {
    this.server.bindAsync(
      `0.0.0.0:${port}`,
      grpc.ServerCredentials.createInsecure(),
      (error, port) => {
        if (error) {
          logger.error('Failed to start gRPC server:', error);
          return;
        }
        logger.info(`gRPC server running on port ${port}`);
        this.server.start();
      }
    );
  }

  stop(): void {
    this.server.tryShutdown(() => {
      logger.info('gRPC server stopped');
    });
  }
}
```

### 2. gRPC Client Implementation
Client for consuming gRPC services:

```typescript
// src/grpc/clients/task-grpc.client.ts
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { join } from 'path';
import logger from '../../utils/logger';

const PROTO_PATH = join(__dirname, '../protos/task.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const taskProto = grpc.loadPackageDefinition(packageDefinition).taskservice as any;

export class TaskGrpcClient {
  private client: any;

  constructor(serverAddress: string) {
    this.client = new taskProto.TaskService(
      serverAddress,
      grpc.credentials.createInsecure()
    );
  }

  async createTask(data: {
    title: string;
    description: string;
    priority: string;
    status: string;
    user_id: number;
    project_id?: number;
  }): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.CreateTask(data, (error: any, response: any) => {
        if (error) {
          logger.error('gRPC CreateTask client error:', error);
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  async getTask(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.GetTask({ id }, (error: any, response: any) => {
        if (error) {
          logger.error('gRPC GetTask client error:', error);
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  async updateTask(id: number, data: {
    title?: string;
    description?: string;
    priority?: string;
    status?: string;
  }): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.UpdateTask({ id, ...data }, (error: any, response: any) => {
        if (error) {
          logger.error('gRPC UpdateTask client error:', error);
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  async listTasks(userId: number, options?: {
    limit?: number;
    offset?: number;
    status?: string;
  }): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const tasks: any[] = [];
      const call = this.client.ListTasks({
        user_id: userId,
        ...options
      });

      call.on('data', (task: any) => {
        tasks.push(task);
      });

      call.on('end', () => {
        resolve(tasks);
      });

      call.on('error', (error: any) => {
        logger.error('gRPC ListTasks client error:', error);
        reject(error);
      });
    });
  }

  subscribeToTaskUpdates(
    userId: number,
    taskIds: number[],
    onUpdate: (event: any) => void
  ): () => void {
    const call = this.client.StreamTaskUpdates({
      user_id: userId,
      task_ids: taskIds
    });

    call.on('data', (event: any) => {
      onUpdate(event);
    });

    call.on('error', (error: any) => {
      logger.error('gRPC StreamTaskUpdates error:', error);
    });

    call.on('end', () => {
      logger.info('Task updates stream ended');
    });

    return () => {
      call.cancel();
    };
  }

  close(): void {
    grpc.closeClient(this.client);
  }
}
```

### 3. Service Discovery with Consul
Dynamic service registration and discovery:

```typescript
// src/services/service-discovery.service.ts
import Consul from 'consul';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';

export interface ServiceConfig {
  name: string;
  host: string;
  port: number;
  tags?: string[];
  meta?: Record<string, string>;
}

export class ServiceDiscoveryService {
  private consul: Consul.Consul;
  private serviceId: string;
  private checkInterval: NodeJS.Timeout | null = null;

  constructor(consulHost: string = 'localhost', consulPort: number = 8500) {
    this.consul = new Consul({
      host: consulHost,
      port: consulPort,
      promisify: true
    });
    this.serviceId = uuidv4();
  }

  /**
   * Register service with Consul
   */
  async register(config: ServiceConfig): Promise<void> {
    try {
      const registration = {
        id: this.serviceId,
        name: config.name,
        address: config.host,
        port: config.port,
        tags: config.tags || [],
        meta: config.meta || {},
        check: {
          http: `http://${config.host}:${config.port}/health`,
          interval: '10s',
          timeout: '5s',
          deregisterCriticalServiceAfter: '30s'
        }
      };

      await this.consul.agent.service.register(registration);
      logger.info(`Service registered: ${config.name} (${this.serviceId})`);

      // Start health check heartbeat
      this.startHealthCheck(config);
    } catch (error) {
      logger.error('Service registration failed:', error);
      throw error;
    }
  }

  /**
   * Deregister service from Consul
   */
  async deregister(): Promise<void> {
    try {
      if (this.checkInterval) {
        clearInterval(this.checkInterval);
        this.checkInterval = null;
      }

      await this.consul.agent.service.deregister(this.serviceId);
      logger.info(`Service deregistered: ${this.serviceId}`);
    } catch (error) {
      logger.error('Service deregistration failed:', error);
      throw error;
    }
  }

  /**
   * Discover services by name
   */
  async discover(serviceName: string): Promise<ServiceConfig[]> {
    try {
      const result = await this.consul.health.service({
        service: serviceName,
        passing: true
      }) as any;

      return result.map((entry: any) => ({
        name: entry.Service.Service,
        host: entry.Service.Address,
        port: entry.Service.Port,
        tags: entry.Service.Tags,
        meta: entry.Service.Meta
      }));
    } catch (error) {
      logger.error(`Service discovery failed for ${serviceName}:`, error);
      throw error;
    }
  }

  /**
   * Get random healthy service instance
   */
  async getServiceInstance(serviceName: string): Promise<ServiceConfig | null> {
    const services = await this.discover(serviceName);
    
    if (services.length === 0) {
      return null;
    }

    // Simple random selection (can be enhanced with load balancing)
    const randomIndex = Math.floor(Math.random() * services.length);
    return services[randomIndex];
  }

  /**
   * Watch for service changes
   */
  async watchService(
    serviceName: string,
    callback: (services: ServiceConfig[]) => void
  ): Promise<Consul.Watch> {
    const watch = this.consul.watch({
      method: this.consul.health.service,
      options: {
        service: serviceName,
        passing: true
      }
    });

    watch.on('change', (data: any) => {
      const services = data.map((entry: any) => ({
        name: entry.Service.Service,
        host: entry.Service.Address,
        port: entry.Service.Port,
        tags: entry.Service.Tags,
        meta: entry.Service.Meta
      }));
      callback(services);
    });

    watch.on('error', (error: any) => {
      logger.error('Service watch error:', error);
    });

    return watch;
  }

  private startHealthCheck(config: ServiceConfig): void {
    this.checkInterval = setInterval(async () => {
      try {
        await this.consul.agent.check.pass(`service:${this.serviceId}`);
      } catch (error) {
        logger.error('Health check failed:', error);
      }
    }, 5000);
  }
}
```

### 4. Circuit Breaker Pattern
Prevent cascading failures in microservices:

```typescript
// src/patterns/circuit-breaker.ts
import logger from '../utils/logger';

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

export interface CircuitBreakerOptions {
  failureThreshold: number;
  successThreshold: number;
  timeout: number;
  resetTimeout: number;
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private successCount: number = 0;
  private nextAttempt: number = Date.now();
  private options: CircuitBreakerOptions;

  constructor(options: Partial<CircuitBreakerOptions> = {}) {
    this.options = {
      failureThreshold: options.failureThreshold || 5,
      successThreshold: options.successThreshold || 2,
      timeout: options.timeout || 60000, // 1 minute
      resetTimeout: options.resetTimeout || 30000 // 30 seconds
    };
  }

  /**
   * Execute function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = CircuitState.HALF_OPEN;
      this.successCount = 0;
      logger.info('Circuit breaker entering HALF_OPEN state');
    }

    try {
      const result = await this.executeWithTimeout(fn);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private async executeWithTimeout<T>(fn: () => Promise<T>): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Operation timeout')), this.options.timeout)
      )
    ]);
  }

  private onSuccess(): void {
    this.failureCount = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;

      if (this.successCount >= this.options.successThreshold) {
        this.state = CircuitState.CLOSED;
        this.successCount = 0;
        logger.info('Circuit breaker is now CLOSED');
      }
    }
  }

  private onFailure(): void {
    this.failureCount++;

    if (this.failureCount >= this.options.failureThreshold) {
      this.state = CircuitState.OPEN;
      this.nextAttempt = Date.now() + this.options.resetTimeout;
      logger.warn(`Circuit breaker is now OPEN. Next attempt at ${new Date(this.nextAttempt)}`);
    }
  }

  getState(): CircuitState {
    return this.state;
  }

  getMetrics(): {
    state: CircuitState;
    failureCount: number;
    successCount: number;
    nextAttempt: number;
  } {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      nextAttempt: this.nextAttempt
    };
  }

  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttempt = Date.now();
    logger.info('Circuit breaker manually reset to CLOSED');
  }
}

// Usage example
export class ResilientServiceClient {
  private circuitBreaker: CircuitBreaker;
  private serviceUrl: string;

  constructor(serviceUrl: string) {
    this.serviceUrl = serviceUrl;
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 5,
      successThreshold: 2,
      timeout: 10000,
      resetTimeout: 30000
    });
  }

  async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.circuitBreaker.execute(async () => {
      const response = await fetch(`${this.serviceUrl}${endpoint}`, options);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    });
  }

  getCircuitState(): CircuitState {
    return this.circuitBreaker.getState();
  }
}
```

### 5. Distributed Tracing with OpenTelemetry
Track requests across microservices:

```typescript
// src/config/tracing.config.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';

export function initTracing(serviceName: string): NodeSDK {
  const jaegerExporter = new JaegerExporter({
    endpoint: process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces',
  });

  const sdk = new NodeSDK({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
      [SemanticResourceAttributes.SERVICE_VERSION]: process.env.npm_package_version || '1.0.0',
    }),
    spanProcessor: new BatchSpanProcessor(jaegerExporter),
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-fs': {
          enabled: false, // Disable FS instrumentation for performance
        },
      }),
    ],
  });

  sdk.start();

  process.on('SIGTERM', () => {
    sdk.shutdown()
      .then(() => console.log('Tracing terminated'))
      .catch((error) => console.log('Error terminating tracing', error))
      .finally(() => process.exit(0));
  });

  return sdk;
}

// src/middleware/tracing.middleware.ts
import { trace, context, SpanStatusCode } from '@opentelemetry/api';
import { Request, Response, NextFunction } from 'express';

const tracer = trace.getTracer('task-service');

export function tracingMiddleware(req: Request, res: Response, next: NextFunction): void {
  const span = tracer.startSpan(`${req.method} ${req.path}`, {
    attributes: {
      'http.method': req.method,
      'http.url': req.url,
      'http.target': req.path,
      'http.host': req.hostname,
      'http.user_agent': req.get('user-agent'),
    },
  });

  // Attach span to request context
  const ctx = trace.setSpan(context.active(), span);

  // Run the rest of the middleware chain in this context
  context.with(ctx, () => {
    res.on('finish', () => {
      span.setAttributes({
        'http.status_code': res.statusCode,
      });

      if (res.statusCode >= 400) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: `HTTP ${res.statusCode}`,
        });
      }

      span.end();
    });

    next();
  });
}

// Custom span creation
export function createSpan(name: string, callback: () => Promise<any>): Promise<any> {
  const span = tracer.startSpan(name);
  
  return context.with(trace.setSpan(context.active(), span), async () => {
    try {
      const result = await callback();
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: (error as Error).message,
      });
      throw error;
    } finally {
      span.end();
    }
  });
}
```

### 6. API Gateway Integration
Centralized entry point for microservices:

```typescript
// src/gateway/api-gateway.ts
import express, { Request, Response, NextFunction } from 'express';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import { ServiceDiscoveryService } from '../services/service-discovery.service';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import logger from '../utils/logger';

export class APIGateway {
  private app: express.Application;
  private serviceDiscovery: ServiceDiscoveryService;
  private rateLimiter: RateLimiterMemory;

  constructor() {
    this.app = express();
    this.serviceDiscovery = new ServiceDiscoveryService();
    this.rateLimiter = new RateLimiterMemory({
      points: 100, // Number of requests
      duration: 60, // Per 60 seconds
    });

    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(express.json());
    this.app.use(this.rateLimitMiddleware.bind(this));
    this.app.use(this.loggingMiddleware);
  }

  private async rateLimitMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const key = req.ip || 'unknown';
      await this.rateLimiter.consume(key);
      next();
    } catch (error) {
      res.status(429).json({
        error: 'Too many requests',
        retryAfter: Math.ceil(error.msBeforeNext / 1000),
      });
    }
  }

  private loggingMiddleware(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
    });

    next();
  }

  private setupRoutes(): void {
    // Task service routes
    this.app.use('/api/tasks', this.createServiceProxy('task-service', '/api/tasks'));
    
    // User service routes
    this.app.use('/api/users', this.createServiceProxy('user-service', '/api/users'));
    
    // Project service routes
    this.app.use('/api/projects', this.createServiceProxy('project-service', '/api/projects'));

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    });

    // Gateway metrics
    this.app.get('/metrics', async (req, res) => {
      const services = await this.getServiceStatus();
      res.json({
        gateway: 'healthy',
        services,
        timestamp: new Date().toISOString(),
      });
    });
  }

  private createServiceProxy(serviceName: string, pathPrefix: string): express.RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const service = await this.serviceDiscovery.getServiceInstance(serviceName);
        
        if (!service) {
          res.status(503).json({ error: `Service ${serviceName} unavailable` });
          return;
        }

        const proxyOptions: Options = {
          target: `http://${service.host}:${service.port}`,
          changeOrigin: true,
          pathRewrite: {
            [`^${pathPrefix}`]: '',
          },
          onProxyReq: (proxyReq, req) => {
            // Add correlation ID
            proxyReq.setHeader('X-Correlation-ID', req.headers['x-correlation-id'] || `${Date.now()}`);
          },
          onError: (err, req, res) => {
            logger.error(`Proxy error for ${serviceName}:`, err);
            (res as Response).status(502).json({ error: 'Bad gateway' });
          },
        };

        const proxy = createProxyMiddleware(proxyOptions);
        proxy(req, res, next);
      } catch (error) {
        logger.error(`Failed to proxy request to ${serviceName}:`, error);
        res.status(503).json({ error: 'Service discovery failed' });
      }
    };
  }

  private async getServiceStatus(): Promise<Record<string, any>> {
    const serviceNames = ['task-service', 'user-service', 'project-service'];
    const status: Record<string, any> = {};

    await Promise.all(
      serviceNames.map(async (name) => {
        try {
          const instances = await this.serviceDiscovery.discover(name);
          status[name] = {
            healthy: instances.length > 0,
            instances: instances.length,
          };
        } catch (error) {
          status[name] = {
            healthy: false,
            error: error.message,
          };
        }
      })
    );

    return status;
  }

  start(port: number): void {
    this.app.listen(port, () => {
      logger.info(`API Gateway listening on port ${port}`);
    });
  }
}
```

## 🔧 Kurulum

```bash
# Install gRPC dependencies
npm install @grpc/grpc-js @grpc/proto-loader

# Install service discovery
npm install consul

# Install circuit breaker (if using external library)
npm install opossum

# Install tracing
npm install @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node
npm install @opentelemetry/exporter-jaeger @opentelemetry/resources
npm install @opentelemetry/semantic-conventions

# Install API Gateway dependencies
npm install http-proxy-middleware rate-limiter-flexible

# Install dev dependencies
npm install --save-dev @types/consul
```

## 📊 Kullanım Örnekleri

### Starting gRPC Server
```typescript
// src/server-grpc.ts
import { TaskGrpcService } from './grpc/services/task-grpc.service';
import { ServiceDiscoveryService } from './services/service-discovery.service';
import { initTracing } from './config/tracing.config';

// Initialize tracing
const sdk = initTracing('task-service');

// Start gRPC server
const grpcService = new TaskGrpcService();
grpcService.start(50051);

// Register with service discovery
const serviceDiscovery = new ServiceDiscoveryService();
serviceDiscovery.register({
  name: 'task-service',
  host: 'localhost',
  port: 50051,
  tags: ['grpc', 'tasks'],
  meta: { version: '1.0.0' }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await serviceDiscovery.deregister();
  grpcService.stop();
  await sdk.shutdown();
});
```

### Using gRPC Client
```typescript
import { TaskGrpcClient } from './grpc/clients/task-grpc.client';

const client = new TaskGrpcClient('localhost:50051');

// Create task
const task = await client.createTask({
  title: 'Implement feature',
  description: 'Add new functionality',
  priority: 'high',
  status: 'todo',
  user_id: 1
});

// Subscribe to updates
const unsubscribe = client.subscribeToTaskUpdates(
  1,
  [task.id],
  (event) => {
    console.log('Task update:', event);
  }
);
```

## 🎯 Best Practices

1. **Service Isolation**: Each service should be independently deployable
2. **API Versioning**: Version your gRPC services properly
3. **Error Handling**: Implement proper error codes and messages
4. **Monitoring**: Always monitor service health and performance
5. **Circuit Breakers**: Protect against cascading failures
6. **Distributed Tracing**: Track requests across services
7. **Service Discovery**: Use dynamic service discovery for scalability
8. **Load Balancing**: Implement client-side or server-side load balancing

## 🚀 Sonraki Adımlar

- [ ] Add service mesh (Istio/Linkerd)
- [ ] Implement saga pattern for distributed transactions
- [ ] Add CQRS (Command Query Responsibility Segregation)
- [ ] Implement event sourcing
- [ ] Add service versioning and blue-green deployment
- [ ] Implement API rate limiting per service
- [ ] Add distributed caching layer

## 📚 Öğrenilen Kavramlar

- gRPC and Protocol Buffers
- Service discovery with Consul
- Circuit breaker pattern
- Distributed tracing with OpenTelemetry
- API Gateway pattern
- Microservices communication patterns
- Service mesh basics
- Load balancing strategies
- Health checks and monitoring

---

**Day 53 Tamamlandı! 🎉**

Microservices communication altyapısı ile servislerimiz artık birbirleriyle güvenli ve verimli bir şekilde iletişim kurabiliyor!
