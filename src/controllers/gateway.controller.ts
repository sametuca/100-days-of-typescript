// Day 49: Gateway Controller

import { Request, Response } from 'express';
import { gatewayService } from '../services/gateway.service';
import { circuitBreakerService } from '../services/circuit-breaker.service';
import { loadBalancerService } from '../services/load-balancer.service';

export class GatewayController {
    // Get all configured routes
    static getRoutes = (_req: Request, res: Response): void => {
        const routes = gatewayService.getRoutes();
        res.json({
            success: true,
            data: {
                count: routes.length,
                routes
            }
        });
    };

    // Get gateway health status
    static getHealth = (_req: Request, res: Response): void => {
        const health = gatewayService.getHealth();
        res.json({
            success: true,
            data: health
        });
    };

    // Get gateway metrics
    static getMetrics = (_req: Request, res: Response): void => {
        const metrics = gatewayService.getMetrics();
        res.json({
            success: true,
            data: metrics
        });
    };

    // Get circuit breaker status for all services
    static getCircuitBreakers = (_req: Request, res: Response): void => {
        const stats = circuitBreakerService.getAllStats();
        res.json({
            success: true,
            data: stats
        });
    };

    // Reset circuit breaker for a specific service
    static resetCircuitBreaker = (req: Request, res: Response): void => {
        const { serviceName } = req.params;

        if (!serviceName) {
            res.status(400).json({
                success: false,
                message: 'Service name is required'
            });
            return;
        }

        circuitBreakerService.reset(serviceName);
        res.json({
            success: true,
            message: `Circuit breaker reset for service: ${serviceName}`
        });
    };

    // Reset all circuit breakers
    static resetAllCircuitBreakers = (_req: Request, res: Response): void => {
        circuitBreakerService.resetAll();
        res.json({
            success: true,
            message: 'All circuit breakers reset'
        });
    };

    // Get load balancer statistics
    static getLoadBalancerStats = (_req: Request, res: Response): void => {
        const stats = loadBalancerService.getAllStats();
        res.json({
            success: true,
            data: stats
        });
    };

    // Reset load balancer for a specific service
    static resetLoadBalancer = (req: Request, res: Response): void => {
        const { serviceName, algorithm } = req.params;

        if (!serviceName || !algorithm) {
            res.status(400).json({
                success: false,
                message: 'Service name and algorithm are required'
            });
            return;
        }

        loadBalancerService.reset(serviceName, algorithm as any);
        res.json({
            success: true,
            message: `Load balancer reset for ${serviceName} (${algorithm})`
        });
    };

    // Reset all load balancers
    static resetAllLoadBalancers = (_req: Request, res: Response): void => {
        loadBalancerService.resetAll();
        res.json({
            success: true,
            message: 'All load balancers reset'
        });
    };
}
