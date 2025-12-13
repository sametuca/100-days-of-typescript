/**
 * Day 54: Analytics Controller
 * 
 * HTTP endpoints for Advanced Analytics & Business Intelligence features
 */

import { Response } from 'express';
import { AuthRequest } from '../types';
import { analyticsService, TimeRange, ReportConfig } from '../services/analytics.service';
import logger from '../utils/logger';

export class AnalyticsController {
  
  // ==================== KPI METRICS ====================
  
  /**
   * GET /api/v1/analytics/kpi
   * Get comprehensive KPI metrics
   */
  async getKPIMetrics(req: AuthRequest, res: Response): Promise<void> {
    try {
      const timeRange = this.parseTimeRange(req.query);
      const metrics = await analyticsService.getKPIMetrics(timeRange);
      
      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      logger.error('Error getting KPI metrics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve KPI metrics'
      });
    }
  }
  
  // ==================== TREND ANALYSIS ====================
  
  /**
   * GET /api/v1/analytics/trends/:metric
   * Analyze trends for a specific metric
   */
  async analyzeTrend(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { metric } = req.params;
      const validMetrics = ['completions', 'creations', 'velocity', 'productivity'];
      
      if (!validMetrics.includes(metric)) {
        res.status(400).json({
          success: false,
          error: `Invalid metric. Valid options: ${validMetrics.join(', ')}`
        });
        return;
      }
      
      const timeRange = this.parseTimeRange(req.query);
      const trend = await analyticsService.analyzeTrend(
        metric as 'completions' | 'creations' | 'velocity' | 'productivity',
        timeRange
      );
      
      res.json({
        success: true,
        data: trend
      });
    } catch (error) {
      logger.error('Error analyzing trend:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to analyze trend'
      });
    }
  }
  
  /**
   * GET /api/v1/analytics/trends
   * Get multiple trend analyses
   */
  async getMultipleTrends(req: AuthRequest, res: Response): Promise<void> {
    try {
      const metrics = (req.query.metrics as string)?.split(',') || 
        ['completions', 'creations', 'velocity'];
      
      const validMetrics = ['completions', 'creations', 'velocity', 'productivity'];
      const filteredMetrics = metrics.filter(m => validMetrics.includes(m)) as 
        Array<'completions' | 'creations' | 'velocity' | 'productivity'>;
      
      const timeRange = this.parseTimeRange(req.query);
      const trends = await analyticsService.getMultipleTrends(filteredMetrics, timeRange);
      
      res.json({
        success: true,
        data: trends
      });
    } catch (error) {
      logger.error('Error getting multiple trends:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve trends'
      });
    }
  }
  
  // ==================== USER ANALYTICS ====================
  
  /**
   * GET /api/v1/analytics/users/:userId
   * Get detailed analytics for a specific user
   */
  async getUserAnalytics(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const timeRange = this.parseTimeRange(req.query);
      
      const analytics = await analyticsService.getUserAnalytics(userId, timeRange);
      
      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      logger.error('Error getting user analytics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve user analytics'
      });
    }
  }
  
  /**
   * GET /api/v1/analytics/me
   * Get analytics for current user
   */
  async getMyAnalytics(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }
      
      const timeRange = this.parseTimeRange(req.query);
      const analytics = await analyticsService.getUserAnalytics(userId, timeRange);
      
      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      logger.error('Error getting my analytics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve analytics'
      });
    }
  }
  
  /**
   * GET /api/v1/analytics/leaderboard
   * Get user leaderboard
   */
  async getLeaderboard(req: AuthRequest, res: Response): Promise<void> {
    try {
      const metric = (req.query.metric as 'completed' | 'productivity' | 'streak') || 'productivity';
      const limit = parseInt(req.query.limit as string) || 10;
      const timeRange = this.parseTimeRange(req.query);
      
      const leaderboard = await analyticsService.getLeaderboard(metric, limit, timeRange);
      
      res.json({
        success: true,
        data: {
          metric,
          leaderboard
        }
      });
    } catch (error) {
      logger.error('Error getting leaderboard:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve leaderboard'
      });
    }
  }
  
  // ==================== TEAM ANALYTICS ====================
  
  /**
   * GET /api/v1/analytics/team
   * Get team-wide analytics
   */
  async getTeamAnalytics(req: AuthRequest, res: Response): Promise<void> {
    try {
      const teamId = req.query.teamId as string | undefined;
      const timeRange = this.parseTimeRange(req.query);
      
      const analytics = await analyticsService.getTeamAnalytics(teamId, timeRange);
      
      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      logger.error('Error getting team analytics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve team analytics'
      });
    }
  }
  
  // ==================== COHORT ANALYSIS ====================
  
  /**
   * GET /api/v1/analytics/cohorts
   * Perform cohort analysis
   */
  async analyzeCohorts(req: AuthRequest, res: Response): Promise<void> {
    try {
      const cohortType = (req.query.type as 'signup_week' | 'first_task_week' | 'custom') 
        || 'first_task_week';
      const timeRange = this.parseTimeRange(req.query);
      
      const analysis = await analyticsService.analyzeCohorts(cohortType, timeRange);
      
      res.json({
        success: true,
        data: analysis
      });
    } catch (error) {
      logger.error('Error analyzing cohorts:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to analyze cohorts'
      });
    }
  }
  
  // ==================== FUNNEL ANALYSIS ====================
  
  /**
   * GET /api/v1/analytics/funnel
   * Analyze task lifecycle funnel
   */
  async analyzeTaskFunnel(req: AuthRequest, res: Response): Promise<void> {
    try {
      const timeRange = this.parseTimeRange(req.query);
      const analysis = await analyticsService.analyzeTaskFunnel(timeRange);
      
      res.json({
        success: true,
        data: analysis
      });
    } catch (error) {
      logger.error('Error analyzing funnel:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to analyze funnel'
      });
    }
  }
  
  // ==================== REPORTS ====================
  
  /**
   * POST /api/v1/analytics/reports
   * Generate a comprehensive report
   */
  async generateReport(req: AuthRequest, res: Response): Promise<void> {
    try {
      const {
        type = 'summary',
        metrics = ['kpi', 'trends', 'team'],
        startDate,
        endDate,
        groupBy,
        filters,
        format = 'json'
      } = req.body;
      
      const config: ReportConfig = {
        type,
        metrics,
        timeRange: {
          startDate: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          endDate: endDate ? new Date(endDate) : new Date(),
          granularity: 'day'
        },
        groupBy,
        filters,
        format
      };
      
      const report = await analyticsService.generateReport(config);
      
      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      logger.error('Error generating report:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate report'
      });
    }
  }
  
  /**
   * GET /api/v1/analytics/reports/executive
   * Generate executive summary report
   */
  async getExecutiveReport(req: AuthRequest, res: Response): Promise<void> {
    try {
      const timeRange = this.parseTimeRange(req.query);
      
      const config: ReportConfig = {
        type: 'executive',
        metrics: ['kpi', 'trends', 'team', 'funnel'],
        timeRange: {
          startDate: timeRange.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          endDate: timeRange.endDate || new Date(),
          granularity: 'day'
        },
        format: 'json'
      };
      
      const report = await analyticsService.generateReport(config);
      
      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      logger.error('Error generating executive report:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate executive report'
      });
    }
  }
  
  // ==================== CHARTS ====================
  
  /**
   * GET /api/v1/analytics/charts/:chartType
   * Get chart-ready data
   */
  async getChartData(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { chartType } = req.params;
      const validTypes = ['tasksByStatus', 'tasksByPriority', 'completionTrend', 'userActivity', 'workloadHeatmap'];
      
      if (!validTypes.includes(chartType)) {
        res.status(400).json({
          success: false,
          error: `Invalid chart type. Valid options: ${validTypes.join(', ')}`
        });
        return;
      }
      
      const timeRange = this.parseTimeRange(req.query);
      const chartData = await analyticsService.getChartData(
        chartType as 'tasksByStatus' | 'tasksByPriority' | 'completionTrend' | 'userActivity' | 'workloadHeatmap',
        timeRange
      );
      
      res.json({
        success: true,
        data: chartData
      });
    } catch (error) {
      logger.error('Error getting chart data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve chart data'
      });
    }
  }
  
  /**
   * GET /api/v1/analytics/dashboard
   * Get complete dashboard data
   */
  async getDashboard(req: AuthRequest, res: Response): Promise<void> {
    try {
      const timeRange = this.parseTimeRange(req.query);
      
      // Fetch all dashboard data in parallel
      const [kpi, trends, team, funnel, statusChart, priorityChart] = await Promise.all([
        analyticsService.getKPIMetrics(timeRange),
        analyticsService.getMultipleTrends(['completions', 'creations'], timeRange),
        analyticsService.getTeamAnalytics(undefined, timeRange),
        analyticsService.analyzeTaskFunnel(timeRange),
        analyticsService.getChartData('tasksByStatus', timeRange),
        analyticsService.getChartData('tasksByPriority', timeRange)
      ]);
      
      res.json({
        success: true,
        data: {
          kpi,
          trends,
          team,
          funnel,
          charts: {
            status: statusChart,
            priority: priorityChart
          },
          generatedAt: new Date()
        }
      });
    } catch (error) {
      logger.error('Error getting dashboard:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve dashboard data'
      });
    }
  }
  
  // ==================== HELPER METHODS ====================
  
  private parseTimeRange(query: any): Partial<TimeRange> {
    return {
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      granularity: query.granularity || 'day'
    };
  }
}

export const analyticsController = new AnalyticsController();
