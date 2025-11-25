// Day 26: Metrics Controller

import { Request, Response } from 'express';
import { metricsService } from '../services/metrics.service';

export class MetricsController {
  // Get all metrics
  getMetrics = (req: Request, res: Response): void => {
    const metrics = metricsService.getMetrics();
    res.json({ success: true, data: metrics });
  };

  // Get specific metric summary
  getMetricSummary = (req: Request, res: Response): void => {
    const { name } = req.params;
    const summary = metricsService.getMetricSummary(name);
    
    if (!summary) {
      res.status(404).json({ success: false, message: 'Metric not found' });
      return;
    }

    res.json({ success: true, data: summary });
  };

  // Health check with basic metrics
  getHealthMetrics = (req: Request, res: Response): void => {
    const memUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    res.json({
      success: true,
      data: {
        uptime: Math.floor(uptime),
        memory: {
          heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
          heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
          rss: Math.round(memUsage.rss / 1024 / 1024)
        },
        timestamp: Date.now()
      }
    });
  };
}

export const metricsController = new MetricsController();