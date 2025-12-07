// Day 49: Load Balancer Service

import { LoadBalancerAlgorithm, LoadBalancerStats, ServiceInstanceStats } from '../types/gateway.types';
import { ServiceInfo } from '../microservices/service-registry';

export class LoadBalancer {
    private currentIndex = 0;
    private instanceStats = new Map<string, ServiceInstanceStats>();
    private totalRequests = 0;

    constructor(
        private serviceName: string,
        private algorithm: LoadBalancerAlgorithm
    ) { }

    selectInstance(instances: ServiceInfo[]): ServiceInfo | null {
        if (instances.length === 0) {
            return null;
        }

        // Filter healthy instances
        const healthyInstances = instances.filter(i => i.health === 'healthy');

        if (healthyInstances.length === 0) {
            return null;
        }

        this.totalRequests++;

        let selected: ServiceInfo;

        switch (this.algorithm) {
            case 'round-robin':
                selected = this.roundRobin(healthyInstances);
                break;
            case 'least-connections':
                selected = this.leastConnections(healthyInstances);
                break;
            case 'random':
                selected = this.random(healthyInstances);
                break;
            default:
                selected = this.roundRobin(healthyInstances);
        }

        this.updateStats(selected);
        return selected;
    }

    private roundRobin(instances: ServiceInfo[]): ServiceInfo {
        const selected = instances[this.currentIndex % instances.length];
        this.currentIndex = (this.currentIndex + 1) % instances.length;
        return selected;
    }

    private leastConnections(instances: ServiceInfo[]): ServiceInfo {
        let minConnections = Infinity;
        let selected = instances[0];

        for (const instance of instances) {
            const stats = this.getInstanceStats(instance.id);
            if (stats.activeConnections < minConnections) {
                minConnections = stats.activeConnections;
                selected = instance;
            }
        }

        return selected;
    }

    private random(instances: ServiceInfo[]): ServiceInfo {
        const randomIndex = Math.floor(Math.random() * instances.length);
        return instances[randomIndex];
    }

    private updateStats(instance: ServiceInfo): void {
        const stats = this.getInstanceStats(instance.id);
        stats.requestCount++;
        stats.activeConnections++;
        stats.lastUsed = new Date();
        stats.host = instance.host;
        stats.port = instance.port;
        stats.healthy = instance.health === 'healthy';
    }

    private getInstanceStats(serviceId: string): ServiceInstanceStats {
        if (!this.instanceStats.has(serviceId)) {
            this.instanceStats.set(serviceId, {
                serviceId,
                host: '',
                port: 0,
                requestCount: 0,
                activeConnections: 0,
                averageResponseTime: 0,
                lastUsed: new Date(),
                healthy: true
            });
        }
        return this.instanceStats.get(serviceId)!;
    }

    recordResponse(serviceId: string, responseTime: number): void {
        const stats = this.getInstanceStats(serviceId);

        // Update average response time (exponential moving average)
        const alpha = 0.3; // Smoothing factor
        stats.averageResponseTime =
            stats.averageResponseTime === 0
                ? responseTime
                : alpha * responseTime + (1 - alpha) * stats.averageResponseTime;

        // Decrement active connections
        stats.activeConnections = Math.max(0, stats.activeConnections - 1);
    }

    getStats(): LoadBalancerStats {
        return {
            algorithm: this.algorithm,
            totalRequests: this.totalRequests,
            serviceInstances: Array.from(this.instanceStats.values())
        };
    }

    reset(): void {
        this.currentIndex = 0;
        this.totalRequests = 0;
        this.instanceStats.clear();
    }
}

export class LoadBalancerService {
    private loadBalancers = new Map<string, LoadBalancer>();

    getOrCreate(serviceName: string, algorithm: LoadBalancerAlgorithm): LoadBalancer {
        const key = `${serviceName}:${algorithm}`;
        if (!this.loadBalancers.has(key)) {
            this.loadBalancers.set(key, new LoadBalancer(serviceName, algorithm));
        }
        return this.loadBalancers.get(key)!;
    }

    get(serviceName: string, algorithm: LoadBalancerAlgorithm): LoadBalancer | undefined {
        const key = `${serviceName}:${algorithm}`;
        return this.loadBalancers.get(key);
    }

    getAllStats(): Record<string, LoadBalancerStats> {
        const stats: Record<string, LoadBalancerStats> = {};
        for (const [key, lb] of this.loadBalancers.entries()) {
            stats[key] = lb.getStats();
        }
        return stats;
    }

    reset(serviceName: string, algorithm: LoadBalancerAlgorithm): void {
        const key = `${serviceName}:${algorithm}`;
        const lb = this.loadBalancers.get(key);
        if (lb) {
            lb.reset();
        }
    }

    resetAll(): void {
        for (const lb of this.loadBalancers.values()) {
            lb.reset();
        }
    }
}

export const loadBalancerService = new LoadBalancerService();
