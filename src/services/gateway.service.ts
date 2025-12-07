// Day 49: Gateway Service

import {
    GatewayRoute,
    GatewayRequest,
    GatewayResponse,
    RetryConfig,
    GatewayHealth,
    GatewayMetrics,
    HttpMethod
} from '../types/gateway.types';
import { circuitBreakerService } from './circuit-breaker.service';
import { loadBalancerService } from './load-balancer.service';
import { serviceRegistry } from '../microservices/service-registry';
import { serviceClient } from '../microservices/service-client';
import logger from '../utils/logger';

export class GatewayService {
    private routes: GatewayRoute[] = [];
    private metrics: GatewayMetrics = {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        requestsPerSecond: 0,
        circuitBreakerTrips: 0,
        retryAttempts: 0
    };
    private startTime: number = Date.now();

    constructor() {
        this.initializeDefaultRoutes();
    }

    private initializeDefaultRoutes(): void {
        // Default routes with sensible configurations
        this.routes = [
            {
                path: '/users/*',
                service: 'user-service',
                methods: ['GET', 'POST', 'PUT', 'DELETE'],
                loadBalancer: { algorithm: 'round-robin' },
                circuitBreaker: {
                    failureThreshold: 5,
                    resetTimeout: 30000,
                    halfOpenRequests: 3
                },
                retry: {
                    maxAttempts: 3,
                    initialDelay: 100,
                    maxDelay: 2000,
                    backoffMultiplier: 2,
                    retryableStatusCodes: [502, 503, 504]
                },
                timeout: 5000
            },
            {
                path: '/tasks/*',
                service: 'task-service',
                methods: ['GET', 'POST', 'PUT', 'DELETE'],
                loadBalancer: { algorithm: 'least-connections' },
                circuitBreaker: {
                    failureThreshold: 5,
                    resetTimeout: 30000,
                    halfOpenRequests: 3
                },
                retry: {
                    maxAttempts: 3,
                    initialDelay: 100,
                    maxDelay: 2000,
                    backoffMultiplier: 2
                },
                timeout: 5000
            }
        ];
    }

    async routeRequest(request: GatewayRequest): Promise<GatewayResponse> {
        const startTime = Date.now();
        this.metrics.totalRequests++;

        try {
            // Find matching route
            const route = this.findRoute(request.path, request.method);
            if (!route) {
                throw new Error(`No route found for ${request.method} ${request.path}`);
            }

            // Get service instances
            const instances = serviceRegistry.getServicesByName(route.service);
            if (instances.length === 0) {
                throw new Error(`No instances available for service: ${route.service}`);
            }

            // Select instance using load balancer
            const algorithm = route.loadBalancer?.algorithm || 'round-robin';
            const loadBalancer = loadBalancerService.getOrCreate(route.service, algorithm);
            const selectedInstance = loadBalancer.selectInstance(instances);

            if (!selectedInstance) {
                throw new Error(`No healthy instances for service: ${route.service}`);
            }

            // Get or create circuit breaker
            const circuitBreaker = route.circuitBreaker
                ? circuitBreakerService.getOrCreate(route.service, route.circuitBreaker)
                : null;

            // Execute request with circuit breaker and retry
            const response = await this.executeWithRetry(
                async () => {
                    if (circuitBreaker) {
                        return await circuitBreaker.execute(async () => {
                            return await this.makeRequest(selectedInstance.host, selectedInstance.port, request, route.timeout);
                        });
                    } else {
                        return await this.makeRequest(selectedInstance.host, selectedInstance.port, request, route.timeout);
                    }
                },
                route.retry
            );

            // Record metrics
            const responseTime = Date.now() - startTime;
            loadBalancer.recordResponse(selectedInstance.id, responseTime);
            this.updateMetrics(true, responseTime);

            return response;
        } catch (error) {
            const responseTime = Date.now() - startTime;
            this.updateMetrics(false, responseTime);

            logger.error(`Gateway routing error: ${error instanceof Error ? error.message : 'Unknown error'}`);

            throw error;
        }
    }

    private async executeWithRetry<T>(
        operation: () => Promise<T>,
        retryConfig?: RetryConfig
    ): Promise<T> {
        if (!retryConfig) {
            return await operation();
        }

        let lastError: Error | undefined;
        let delay = retryConfig.initialDelay;

        for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error instanceof Error ? error : new Error('Unknown error');

                if (attempt === retryConfig.maxAttempts) {
                    break;
                }

                // Check if error is retryable
                if (retryConfig.retryableStatusCodes && error instanceof Error) {
                    const statusMatch = /status.*?(\d{3})/i.exec(error.message);
                    if (statusMatch) {
                        const statusCode = parseInt(statusMatch[1]);
                        if (!retryConfig.retryableStatusCodes.includes(statusCode)) {
                            break;
                        }
                    }
                }

                this.metrics.retryAttempts++;
                logger.warn(`Retry attempt ${attempt}/${retryConfig.maxAttempts} after ${delay}ms`);

                // Wait before retry
                await this.sleep(delay);

                // Calculate next delay with exponential backoff
                delay = Math.min(delay * retryConfig.backoffMultiplier, retryConfig.maxDelay);
            }
        }

        throw lastError || new Error('Operation failed after retries');
    }

    private async makeRequest(
        host: string,
        port: number,
        request: GatewayRequest,
        timeout?: number
    ): Promise<GatewayResponse> {
        const startTime = Date.now();

        // Simulate HTTP request (in real implementation, use axios or fetch)
        // For now, we'll use the existing serviceClient
        try {
            const endpoint = request.path;
            let result: any;

            // Route to appropriate service method
            if (host.includes('user') || port === 3001) {
                result = await serviceClient.getUserService(endpoint, request.body, request.method);
            } else if (host.includes('task') || port === 3002) {
                result = await serviceClient.getTaskService(endpoint, request.body, request.method);
            } else {
                result = await serviceClient.getNotificationService(endpoint, request.body, request.method);
            }

            const responseTime = Date.now() - startTime;

            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: result,
                responseTime
            };
        } catch (error) {
            throw new Error(`Service request failed: ${error instanceof Error ? error.message : 'Unknown'}`);
        }
    }

    private findRoute(path: string, method: HttpMethod): GatewayRoute | null {
        for (const route of this.routes) {
            if (this.matchPath(route.path, path) && route.methods.includes(method)) {
                return route;
            }
        }
        return null;
    }

    private matchPath(routePath: string, requestPath: string): boolean {
        // Simple wildcard matching
        const routePattern = routePath.replace(/\*/g, '.*');
        const regex = new RegExp(`^${routePattern}$`);
        return regex.test(requestPath);
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private updateMetrics(success: boolean, responseTime: number): void {
        if (success) {
            this.metrics.successfulRequests++;
        } else {
            this.metrics.failedRequests++;
        }

        // Update average response time (exponential moving average)
        const alpha = 0.3;
        this.metrics.averageResponseTime =
            this.metrics.averageResponseTime === 0
                ? responseTime
                : alpha * responseTime + (1 - alpha) * this.metrics.averageResponseTime;

        // Update requests per second
        const uptime = (Date.now() - this.startTime) / 1000;
        this.metrics.requestsPerSecond = this.metrics.totalRequests / uptime;
    }

    getHealth(): GatewayHealth {
        const allServices = serviceRegistry.getAllServices();
        const serviceGroups = new Map<string, typeof allServices>();

        // Group services by name
        for (const service of allServices) {
            if (!serviceGroups.has(service.name)) {
                serviceGroups.set(service.name, []);
            }
            serviceGroups.get(service.name)!.push(service);
        }

        const serviceHealth = Array.from(serviceGroups.entries()).map(([name, instances]) => {
            const healthyCount = instances.filter(i => i.health === 'healthy').length;
            return {
                name,
                status: healthyCount > 0 ? 'up' : 'down' as 'up' | 'down',
                instances: instances.length,
                healthyInstances: healthyCount
            };
        });

        const circuitBreakers = circuitBreakerService.getAllStats();
        const circuitBreakerStates: Record<string, any> = {};
        for (const [name, stats] of Object.entries(circuitBreakers)) {
            circuitBreakerStates[name] = stats.state;
        }

        const loadBalancers = loadBalancerService.getAllStats();

        const overallHealthy = serviceHealth.every(s => s.status === 'up');
        const status = overallHealthy ? 'healthy' : 'degraded';

        return {
            status,
            services: serviceHealth,
            circuitBreakers: circuitBreakerStates,
            loadBalancers,
            uptime: Math.floor((Date.now() - this.startTime) / 1000)
        };
    }

    getMetrics(): GatewayMetrics {
        return { ...this.metrics };
    }

    getRoutes(): GatewayRoute[] {
        return [...this.routes];
    }

    addRoute(route: GatewayRoute): void {
        this.routes.push(route);
        logger.info(`Route added: ${route.method} ${route.path} -> ${route.service}`);
    }

    removeRoute(path: string): void {
        const initialLength = this.routes.length;
        this.routes = this.routes.filter(r => r.path !== path);
        if (this.routes.length < initialLength) {
            logger.info(`Route removed: ${path}`);
        }
    }
}

export const gatewayService = new GatewayService();
