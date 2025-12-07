// Day 49: API Gateway Types

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export type LoadBalancerAlgorithm = 'round-robin' | 'least-connections' | 'random';

export type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface GatewayRoute {
    path: string;
    service: string;
    methods: HttpMethod[];
    loadBalancer?: LoadBalancerConfig;
    circuitBreaker?: CircuitBreakerConfig;
    retry?: RetryConfig;
    transform?: TransformConfig;
    timeout?: number; // Request timeout in ms
}

export interface LoadBalancerConfig {
    algorithm: LoadBalancerAlgorithm;
    healthCheckInterval?: number; // Health check interval in ms
}

export interface CircuitBreakerConfig {
    failureThreshold: number; // Number of failures before opening
    resetTimeout: number; // Time in ms before attempting to close
    halfOpenRequests: number; // Number of test requests in half-open state
    monitoringPeriod?: number; // Time window for failure counting
}

export interface RetryConfig {
    maxAttempts: number;
    initialDelay: number; // Initial delay in ms
    maxDelay: number; // Maximum delay in ms
    backoffMultiplier: number; // Exponential backoff multiplier
    retryableStatusCodes?: number[]; // HTTP status codes to retry
}

export interface TransformConfig {
    requestTransform?: (req: any) => any;
    responseTransform?: (res: any) => any;
    headers?: Record<string, string>; // Additional headers to add
}

export interface CircuitBreakerStats {
    state: CircuitBreakerState;
    failureCount: number;
    successCount: number;
    lastFailureTime?: Date;
    lastStateChange: Date;
    totalRequests: number;
    failureRate: number; // Percentage
}

export interface LoadBalancerStats {
    algorithm: LoadBalancerAlgorithm;
    totalRequests: number;
    serviceInstances: ServiceInstanceStats[];
}

export interface ServiceInstanceStats {
    serviceId: string;
    host: string;
    port: number;
    requestCount: number;
    activeConnections: number;
    averageResponseTime: number;
    lastUsed: Date;
    healthy: boolean;
}

export interface GatewayRequest {
    method: HttpMethod;
    path: string;
    headers: Record<string, string>;
    body?: any;
    query?: Record<string, string>;
}

export interface GatewayResponse {
    statusCode: number;
    headers: Record<string, string>;
    body: any;
    responseTime: number;
}

export interface RouteMatch {
    route: GatewayRoute;
    params: Record<string, string>;
    service: string;
}

export interface GatewayHealth {
    status: 'healthy' | 'degraded' | 'unhealthy';
    services: ServiceHealth[];
    circuitBreakers: Record<string, CircuitBreakerState>;
    loadBalancers: Record<string, LoadBalancerStats>;
    uptime: number;
}

export interface ServiceHealth {
    name: string;
    status: 'up' | 'down' | 'degraded';
    instances: number;
    healthyInstances: number;
    responseTime?: number;
}

export interface RetryAttempt {
    attemptNumber: number;
    delay: number;
    error?: Error;
    timestamp: Date;
}

export interface GatewayMetrics {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    requestsPerSecond: number;
    circuitBreakerTrips: number;
    retryAttempts: number;
}
