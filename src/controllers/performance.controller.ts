import { Request, Response } from 'express';
import { PerformanceMonitorService } from '../services/performance-monitor.service';
import { BottleneckDetectorService } from '../services/bottleneck-detector.service';
import { OptimizationService } from '../services/optimization.service';
import { logger } from '../utils/logger';

export class PerformanceController {
  static async getMetrics(req: Request, res: Response): Promise<void> {
    try {
      const minutes = req.query.minutes ? parseInt(req.query.minutes as string) : 60;
      const metrics = PerformanceMonitorService.getMetrics(minutes);
      
      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      logger.error('Performance metrics retrieval failed:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve performance metrics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getAPIPerformance(req: Request, res: Response): Promise<void> {
    try {
      const endpoint = req.query.endpoint as string;
      const minutes = req.query.minutes ? parseInt(req.query.minutes as string) : 60;
      
      const performance = PerformanceMonitorService.getAPIPerformance(endpoint, minutes);
      
      res.json({
        success: true,
        data: performance
      });
    } catch (error) {
      logger.error('API performance retrieval failed:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve API performance data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async detectBottlenecks(req: Request, res: Response): Promise<void> {
    try {
      const bottlenecks = BottleneckDetectorService.detectBottlenecks();
      
      logger.info(`Bottleneck detection completed, found ${bottlenecks.length} new issues`);
      
      res.json({
        success: true,
        data: bottlenecks
      });
    } catch (error) {
      logger.error('Bottleneck detection failed:', error);
      res.status(500).json({
        success: false,
        message: 'Bottleneck detection failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getActiveAlerts(req: Request, res: Response): Promise<void> {
    try {
      const alerts = BottleneckDetectorService.getActiveAlerts();
      
      res.json({
        success: true,
        data: alerts
      });
    } catch (error) {
      logger.error('Active alerts retrieval failed:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve active alerts',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async generateOptimizations(req: Request, res: Response): Promise<void> {
    try {
      const suggestions = OptimizationService.generateSuggestions();
      
      logger.info(`Generated ${suggestions.length} optimization suggestions`);
      
      res.json({
        success: true,
        data: suggestions
      });
    } catch (error) {
      logger.error('Optimization generation failed:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate optimizations',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getOptimizations(req: Request, res: Response): Promise<void> {
    try {
      const category = req.query.category as any;
      const suggestions = OptimizationService.getSuggestions(category);
      
      res.json({
        success: true,
        data: suggestions
      });
    } catch (error) {
      logger.error('Optimizations retrieval failed:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve optimizations',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async generateReport(req: Request, res: Response): Promise<void> {
    try {
      const hours = req.query.hours ? parseInt(req.query.hours as string) : 24;
      const report = OptimizationService.generatePerformanceReport(hours);
      
      logger.info(`Performance report generated for ${hours} hours`);
      
      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      logger.error('Performance report generation failed:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate performance report',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}