// Day 49: Circuit Breaker Service

import { CircuitBreakerConfig, CircuitBreakerState, CircuitBreakerStats } from '../types/gateway.types';
import logger from '../utils/logger';

export class CircuitBreaker {
    private state: CircuitBreakerState = 'CLOSED';
    private failureCount = 0;
    private successCount = 0;
    private lastFailureTime?: Date;
    private lastStateChange: Date = new Date();
    private totalRequests = 0;
    private halfOpenAttempts = 0;
    private resetTimer?: NodeJS.Timeout;

    constructor(
        private serviceName: string,
        private config: CircuitBreakerConfig
    ) { }

    async execute<T>(operation: () => Promise<T>): Promise<T> {
        this.totalRequests++;

        if (this.state === 'OPEN') {
            throw new Error(`Circuit breaker is OPEN for ${this.serviceName}`);
        }

        if (this.state === 'HALF_OPEN') {
            if (this.halfOpenAttempts >= this.config.halfOpenRequests) {
                throw new Error(`Circuit breaker is HALF_OPEN and test limit reached for ${this.serviceName}`);
            }
            this.halfOpenAttempts++;
        }

        try {
            const result = await operation();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }

    private onSuccess(): void {
        this.successCount++;

        if (this.state === 'HALF_OPEN') {
            // If we've had enough successful requests, close the circuit
            if (this.halfOpenAttempts >= this.config.halfOpenRequests) {
                this.close();
            }
        } else if (this.state === 'CLOSED') {
            // Reset failure count on success
            this.failureCount = 0;
        }
    }

    private onFailure(): void {
        this.failureCount++;
        this.lastFailureTime = new Date();

        if (this.state === 'HALF_OPEN') {
            // Any failure in half-open state reopens the circuit
            this.open();
        } else if (this.state === 'CLOSED') {
            // Check if we've exceeded the failure threshold
            if (this.failureCount >= this.config.failureThreshold) {
                this.open();
            }
        }
    }

    private open(): void {
        if (this.state !== 'OPEN') {
            this.state = 'OPEN';
            this.lastStateChange = new Date();
            this.halfOpenAttempts = 0;

            logger.warn(`Circuit breaker OPENED for ${this.serviceName} after ${this.failureCount} failures`);

            // Set timer to transition to half-open
            if (this.resetTimer) {
                clearTimeout(this.resetTimer);
            }

            this.resetTimer = setTimeout(() => {
                this.halfOpen();
            }, this.config.resetTimeout);
        }
    }

    private halfOpen(): void {
        this.state = 'HALF_OPEN';
        this.lastStateChange = new Date();
        this.halfOpenAttempts = 0;

        logger.info(`Circuit breaker HALF_OPEN for ${this.serviceName}, testing service...`);
    }

    private close(): void {
        this.state = 'CLOSED';
        this.lastStateChange = new Date();
        this.failureCount = 0;
        this.halfOpenAttempts = 0;

        logger.info(`Circuit breaker CLOSED for ${this.serviceName}, service recovered`);
    }

    getStats(): CircuitBreakerStats {
        const total = this.failureCount + this.successCount;
        return {
            state: this.state,
            failureCount: this.failureCount,
            successCount: this.successCount,
            lastFailureTime: this.lastFailureTime,
            lastStateChange: this.lastStateChange,
            totalRequests: this.totalRequests,
            failureRate: total > 0 ? (this.failureCount / total) * 100 : 0
        };
    }

    reset(): void {
        this.close();
        this.failureCount = 0;
        this.successCount = 0;
        this.totalRequests = 0;
        this.lastFailureTime = undefined;

        logger.info(`Circuit breaker manually reset for ${this.serviceName}`);
    }

    getState(): CircuitBreakerState {
        return this.state;
    }
}

export class CircuitBreakerService {
    private circuitBreakers = new Map<string, CircuitBreaker>();

    getOrCreate(serviceName: string, config: CircuitBreakerConfig): CircuitBreaker {
        if (!this.circuitBreakers.has(serviceName)) {
            this.circuitBreakers.set(serviceName, new CircuitBreaker(serviceName, config));
        }
        return this.circuitBreakers.get(serviceName)!;
    }

    get(serviceName: string): CircuitBreaker | undefined {
        return this.circuitBreakers.get(serviceName);
    }

    getAllStats(): Record<string, CircuitBreakerStats> {
        const stats: Record<string, CircuitBreakerStats> = {};
        for (const [name, breaker] of this.circuitBreakers.entries()) {
            stats[name] = breaker.getStats();
        }
        return stats;
    }

    reset(serviceName: string): void {
        const breaker = this.circuitBreakers.get(serviceName);
        if (breaker) {
            breaker.reset();
        }
    }

    resetAll(): void {
        for (const breaker of this.circuitBreakers.values()) {
            breaker.reset();
        }
    }
}

export const circuitBreakerService = new CircuitBreakerService();
