import { Request, Response } from 'express';
import { metricsCollector } from '../monitoring/metrics';

export class MetricsController {
  static getPrometheusMetrics(_req: Request, res: Response): void {
    const metrics = metricsCollector.exportPrometheusMetrics();
    res.set('Content-Type', 'text/plain');
    res.send(metrics);
  }

  static getMetricsJson(_req: Request, res: Response): void {
    const metrics = metricsCollector.getAllMetrics();
    res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    });
  }

  static getSystemMetrics(_req: Request, res: Response): void {
    const systemMetrics = {
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      cpu: process.cpuUsage(),
      version: process.version,
      platform: process.platform,
      arch: process.arch
    };

    res.json({
      success: true,
      data: systemMetrics,
      timestamp: new Date().toISOString()
    });
  }
}