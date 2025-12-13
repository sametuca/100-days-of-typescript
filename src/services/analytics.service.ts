/**
 * Day 54: Advanced Analytics & Business Intelligence Service
 * 
 * Enterprise-grade analytics engine providing:
 * - Real-time KPI tracking
 * - Trend analysis & forecasting
 * - User behavior analytics
 * - Team performance metrics
 * - Custom report generation
 * - Data aggregation & pivoting
 * - Cohort analysis
 * - Funnel analytics
 */

import { taskRepository } from '../repositories/task.repository';
import { Task, TaskStatus, TaskPriority, User } from '../types';
import logger from '../utils/logger';
import db from '../database/connection';

// ==================== TYPES ====================

export interface TimeRange {
  startDate: Date;
  endDate: Date;
  granularity: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
}

export interface KPIMetrics {
  // Core KPIs
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueCount: number;
  completionRate: number;
  
  // Velocity metrics
  averageCompletionTime: number; // hours
  tasksCompletedPerDay: number;
  throughput: number; // tasks per week
  
  // Quality metrics
  onTimeDeliveryRate: number;
  taskReopenRate: number;
  averageTaskAge: number; // days
  
  // Engagement metrics
  activeUsers: number;
  tasksPerUser: number;
  collaborationScore: number;
}

export interface TrendPoint {
  date: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface TrendAnalysis {
  metric: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  trendStrength: number; // 0-100
  data: TrendPoint[];
  forecast: TrendPoint[];
  seasonality?: {
    pattern: 'weekly' | 'monthly' | 'none';
    peakDays?: string[];
    lowDays?: string[];
  };
}

export interface UserAnalytics {
  userId: string;
  username: string;
  
  // Activity metrics
  totalTasks: number;
  completedTasks: number;
  currentStreak: number; // days
  longestStreak: number;
  
  // Performance metrics
  averageCompletionTime: number;
  onTimeRate: number;
  productivityScore: number; // 0-100
  
  // Patterns
  mostProductiveDay: string;
  mostProductiveHour: number;
  preferredPriority: TaskPriority;
  
  // Comparison
  rankInTeam: number;
  percentile: number;
}

export interface TeamAnalytics {
  teamId?: string;
  
  // Team metrics
  totalMembers: number;
  activeMembers: number;
  totalTasks: number;
  completedTasks: number;
  
  // Performance
  teamVelocity: number;
  averageTasksPerMember: number;
  collaborationIndex: number;
  
  // Distribution
  workloadDistribution: {
    userId: string;
    username: string;
    taskCount: number;
    percentage: number;
  }[];
  
  // Bottlenecks
  bottlenecks: {
    type: 'user' | 'status' | 'priority';
    description: string;
    impact: 'low' | 'medium' | 'high';
    taskCount: number;
  }[];
}

export interface CohortAnalysis {
  cohortType: 'signup_week' | 'first_task_week' | 'custom';
  cohorts: {
    cohortId: string;
    cohortLabel: string;
    userCount: number;
    retention: number[]; // Week 0, 1, 2, ... retention rates
    averageTasksCompleted: number;
    churnRate: number;
  }[];
  insights: string[];
}

export interface FunnelStep {
  name: string;
  count: number;
  conversionRate: number;
  dropOffRate: number;
  averageTimeToNext: number; // hours
}

export interface FunnelAnalysis {
  funnelName: string;
  totalEntered: number;
  totalCompleted: number;
  overallConversionRate: number;
  steps: FunnelStep[];
  bottleneckStep: string;
  suggestions: string[];
}

export interface ReportConfig {
  type: 'summary' | 'detailed' | 'executive' | 'custom';
  metrics: string[];
  timeRange: TimeRange;
  groupBy?: 'user' | 'project' | 'status' | 'priority' | 'day' | 'week';
  filters?: {
    userIds?: string[];
    projectIds?: string[];
    statuses?: TaskStatus[];
    priorities?: TaskPriority[];
  };
  format: 'json' | 'csv' | 'pdf';
}

export interface GeneratedReport {
  id: string;
  title: string;
  generatedAt: Date;
  config: ReportConfig;
  data: any;
  summary: {
    highlights: string[];
    alerts: string[];
    recommendations: string[];
  };
}

export interface DataPoint {
  x: string | number | Date;
  y: number;
  label?: string;
  metadata?: Record<string, any>;
}

export interface ChartData {
  chartType: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'heatmap';
  title: string;
  xAxis: { label: string; type: 'category' | 'time' | 'value' };
  yAxis: { label: string; type: 'value' | 'percentage' };
  series: {
    name: string;
    data: DataPoint[];
    color?: string;
  }[];
}

// ==================== SERVICE ====================

export class AnalyticsService {
  
  // ==================== CORE KPIs ====================
  
  /**
   * Get comprehensive KPI metrics
   */
  async getKPIMetrics(timeRange?: Partial<TimeRange>): Promise<KPIMetrics> {
    const range = this.normalizeTimeRange(timeRange);
    
    try {
      // Get all tasks in range
      const tasks = await this.getTasksInRange(range);
      const completedTasks = tasks.filter(t => t.status === TaskStatus.DONE);
      const inProgressTasks = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS);
      
      // Calculate overdue
      const now = new Date();
      const overdueTasks = tasks.filter(t => 
        t.dueDate && new Date(t.dueDate) < now && t.status !== TaskStatus.DONE
      );
      
      // Calculate completion time (simulated since we don't have completedAt)
      const avgCompletionTime = this.calculateAverageCompletionTime(completedTasks);
      
      // Calculate velocity
      const daysDiff = this.getDaysDifference(range.startDate, range.endDate);
      const tasksPerDay = daysDiff > 0 ? completedTasks.length / daysDiff : 0;
      
      // Get unique users
      const uniqueUsers = new Set(tasks.map(t => t.userId));
      
      // On-time delivery
      const tasksWithDueDate = completedTasks.filter(t => t.dueDate);
      const onTimeTasks = tasksWithDueDate.filter(t => {
        const dueDate = new Date(t.dueDate!);
        const completedDate = new Date(t.updatedAt);
        return completedDate <= dueDate;
      });
      
      const onTimeRate = tasksWithDueDate.length > 0 
        ? (onTimeTasks.length / tasksWithDueDate.length) * 100 
        : 100;
      
      // Task age
      const taskAges = tasks
        .filter(t => t.status !== TaskStatus.DONE)
        .map(t => this.getDaysDifference(new Date(t.createdAt), now));
      const avgTaskAge = taskAges.length > 0 
        ? taskAges.reduce((a, b) => a + b, 0) / taskAges.length 
        : 0;
      
      return {
        totalTasks: tasks.length,
        completedTasks: completedTasks.length,
        inProgressTasks: inProgressTasks.length,
        overdueCount: overdueTasks.length,
        completionRate: tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0,
        
        averageCompletionTime: avgCompletionTime,
        tasksCompletedPerDay: Math.round(tasksPerDay * 100) / 100,
        throughput: Math.round(tasksPerDay * 7 * 100) / 100,
        
        onTimeDeliveryRate: Math.round(onTimeRate * 100) / 100,
        taskReopenRate: 0, // Would need status history
        averageTaskAge: Math.round(avgTaskAge * 100) / 100,
        
        activeUsers: uniqueUsers.size,
        tasksPerUser: uniqueUsers.size > 0 ? Math.round((tasks.length / uniqueUsers.size) * 100) / 100 : 0,
        collaborationScore: this.calculateCollaborationScore(tasks)
      };
    } catch (error) {
      logger.error('Error calculating KPI metrics:', error);
      throw error;
    }
  }
  
  // ==================== TREND ANALYSIS ====================
  
  /**
   * Analyze trends for a specific metric
   */
  async analyzeTrend(
    metric: 'completions' | 'creations' | 'velocity' | 'productivity',
    timeRange?: Partial<TimeRange>
  ): Promise<TrendAnalysis> {
    const range = this.normalizeTimeRange(timeRange, { granularity: 'day' });
    
    try {
      const tasks = await this.getTasksInRange(range);
      const dataPoints = this.aggregateByGranularity(tasks, range, metric);
      
      // Calculate trend
      const trend = this.calculateTrend(dataPoints);
      const trendStrength = this.calculateTrendStrength(dataPoints);
      
      // Generate forecast (simple moving average)
      const forecast = this.generateForecast(dataPoints, 7);
      
      // Detect seasonality
      const seasonality = this.detectSeasonality(dataPoints);
      
      return {
        metric,
        trend,
        trendStrength,
        data: dataPoints,
        forecast,
        seasonality
      };
    } catch (error) {
      logger.error('Error analyzing trend:', error);
      throw error;
    }
  }
  
  /**
   * Get multiple trend analyses
   */
  async getMultipleTrends(
    metrics: Array<'completions' | 'creations' | 'velocity' | 'productivity'>,
    timeRange?: Partial<TimeRange>
  ): Promise<TrendAnalysis[]> {
    return Promise.all(metrics.map(m => this.analyzeTrend(m, timeRange)));
  }
  
  // ==================== USER ANALYTICS ====================
  
  /**
   * Get detailed analytics for a specific user
   */
  async getUserAnalytics(userId: string, timeRange?: Partial<TimeRange>): Promise<UserAnalytics> {
    const range = this.normalizeTimeRange(timeRange);
    
    try {
      const allTasks = await this.getTasksInRange(range);
      const userTasks = allTasks.filter(t => t.userId === userId);
      const completedTasks = userTasks.filter(t => t.status === TaskStatus.DONE);
      
      // Get user info (simplified)
      const username = await this.getUsernameById(userId);
      
      // Calculate streaks
      const { currentStreak, longestStreak } = this.calculateStreaks(completedTasks);
      
      // Calculate productivity patterns
      const patterns = this.analyzeProductivityPatterns(completedTasks);
      
      // Calculate on-time rate
      const tasksWithDueDate = completedTasks.filter(t => t.dueDate);
      const onTimeTasks = tasksWithDueDate.filter(t => {
        return new Date(t.updatedAt) <= new Date(t.dueDate!);
      });
      const onTimeRate = tasksWithDueDate.length > 0 
        ? (onTimeTasks.length / tasksWithDueDate.length) * 100 
        : 100;
      
      // Calculate rank
      const userStats = await this.getAllUserStats(allTasks);
      const sortedByCompleted = [...userStats].sort((a, b) => b.completed - a.completed);
      const rank = sortedByCompleted.findIndex(u => u.userId === userId) + 1;
      const percentile = ((userStats.length - rank) / userStats.length) * 100;
      
      // Productivity score (composite metric)
      const productivityScore = this.calculateProductivityScore({
        completionRate: userTasks.length > 0 ? (completedTasks.length / userTasks.length) * 100 : 0,
        onTimeRate,
        currentStreak,
        tasksCompleted: completedTasks.length
      });
      
      // Preferred priority
      const priorityCounts = this.countByPriority(userTasks);
      const preferredPriority = Object.entries(priorityCounts)
        .sort((a, b) => b[1] - a[1])[0]?.[0] as TaskPriority || TaskPriority.MEDIUM;
      
      return {
        userId,
        username,
        totalTasks: userTasks.length,
        completedTasks: completedTasks.length,
        currentStreak,
        longestStreak,
        averageCompletionTime: this.calculateAverageCompletionTime(completedTasks),
        onTimeRate: Math.round(onTimeRate * 100) / 100,
        productivityScore,
        mostProductiveDay: patterns.mostProductiveDay,
        mostProductiveHour: patterns.mostProductiveHour,
        preferredPriority,
        rankInTeam: rank,
        percentile: Math.round(percentile * 100) / 100
      };
    } catch (error) {
      logger.error('Error getting user analytics:', error);
      throw error;
    }
  }
  
  /**
   * Get leaderboard
   */
  async getLeaderboard(
    metric: 'completed' | 'productivity' | 'streak',
    limit: number = 10,
    timeRange?: Partial<TimeRange>
  ): Promise<UserAnalytics[]> {
    const range = this.normalizeTimeRange(timeRange);
    const allTasks = await this.getTasksInRange(range);
    
    const userIds = [...new Set(allTasks.map(t => t.userId))];
    const userAnalytics = await Promise.all(
      userIds.map(id => this.getUserAnalytics(id, timeRange))
    );
    
    // Sort by metric
    const sortedUsers = userAnalytics.sort((a, b) => {
      switch (metric) {
        case 'completed':
          return b.completedTasks - a.completedTasks;
        case 'productivity':
          return b.productivityScore - a.productivityScore;
        case 'streak':
          return b.currentStreak - a.currentStreak;
        default:
          return b.completedTasks - a.completedTasks;
      }
    });
    
    return sortedUsers.slice(0, limit);
  }
  
  // ==================== TEAM ANALYTICS ====================
  
  /**
   * Get team-wide analytics
   */
  async getTeamAnalytics(teamId?: string, timeRange?: Partial<TimeRange>): Promise<TeamAnalytics> {
    const range = this.normalizeTimeRange(timeRange);
    
    try {
      const allTasks = await this.getTasksInRange(range);
      const completedTasks = allTasks.filter(t => t.status === TaskStatus.DONE);
      
      // Get unique users
      const userIds = [...new Set(allTasks.map(t => t.userId))];
      const activeUserIds = [...new Set(
        allTasks
          .filter(t => new Date(t.updatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
          .map(t => t.userId)
      )];
      
      // Calculate workload distribution
      const workloadDistribution = await Promise.all(
        userIds.map(async userId => {
          const username = await this.getUsernameById(userId);
          const taskCount = allTasks.filter(t => t.userId === userId).length;
          return {
            userId,
            username,
            taskCount,
            percentage: allTasks.length > 0 ? (taskCount / allTasks.length) * 100 : 0
          };
        })
      );
      
      // Detect bottlenecks
      const bottlenecks = this.detectBottlenecks(allTasks, workloadDistribution);
      
      // Calculate team velocity (tasks completed per week)
      const weeks = this.getDaysDifference(range.startDate, range.endDate) / 7;
      const teamVelocity = weeks > 0 ? completedTasks.length / weeks : 0;
      
      // Collaboration index (simplified)
      const collaborationIndex = this.calculateCollaborationScore(allTasks);
      
      return {
        teamId,
        totalMembers: userIds.length,
        activeMembers: activeUserIds.length,
        totalTasks: allTasks.length,
        completedTasks: completedTasks.length,
        teamVelocity: Math.round(teamVelocity * 100) / 100,
        averageTasksPerMember: userIds.length > 0 
          ? Math.round((allTasks.length / userIds.length) * 100) / 100 
          : 0,
        collaborationIndex,
        workloadDistribution: workloadDistribution.sort((a, b) => b.taskCount - a.taskCount),
        bottlenecks
      };
    } catch (error) {
      logger.error('Error getting team analytics:', error);
      throw error;
    }
  }
  
  // ==================== COHORT ANALYSIS ====================
  
  /**
   * Perform cohort analysis
   */
  async analyzeCohorts(
    cohortType: 'signup_week' | 'first_task_week' | 'custom',
    timeRange?: Partial<TimeRange>
  ): Promise<CohortAnalysis> {
    const range = this.normalizeTimeRange(timeRange);
    
    try {
      const allTasks = await this.getTasksInRange(range);
      
      // Group users by cohort (first task week)
      const userCohorts = new Map<string, string[]>();
      const userFirstTask = new Map<string, Date>();
      
      allTasks.forEach(task => {
        const taskDate = new Date(task.createdAt);
        const existing = userFirstTask.get(task.userId);
        if (!existing || taskDate < existing) {
          userFirstTask.set(task.userId, taskDate);
        }
      });
      
      // Create weekly cohorts
      userFirstTask.forEach((firstTaskDate, userId) => {
        const weekKey = this.getWeekKey(firstTaskDate);
        if (!userCohorts.has(weekKey)) {
          userCohorts.set(weekKey, []);
        }
        userCohorts.get(weekKey)!.push(userId);
      });
      
      // Calculate retention for each cohort
      const cohorts = Array.from(userCohorts.entries()).map(([weekKey, userIds]) => {
        const retention = this.calculateRetention(userIds, allTasks, weekKey);
        const avgTasks = this.calculateAverageTasksForCohort(userIds, allTasks);
        
        return {
          cohortId: weekKey,
          cohortLabel: `Week of ${weekKey}`,
          userCount: userIds.length,
          retention,
          averageTasksCompleted: avgTasks,
          churnRate: 100 - (retention[retention.length - 1] || 0)
        };
      });
      
      // Generate insights
      const insights = this.generateCohortInsights(cohorts);
      
      return {
        cohortType,
        cohorts: cohorts.sort((a, b) => a.cohortId.localeCompare(b.cohortId)),
        insights
      };
    } catch (error) {
      logger.error('Error analyzing cohorts:', error);
      throw error;
    }
  }
  
  // ==================== FUNNEL ANALYSIS ====================
  
  /**
   * Analyze task lifecycle funnel
   */
  async analyzeTaskFunnel(timeRange?: Partial<TimeRange>): Promise<FunnelAnalysis> {
    const range = this.normalizeTimeRange(timeRange);
    
    try {
      const allTasks = await this.getTasksInRange(range);
      
      // Define funnel steps
      const steps: FunnelStep[] = [
        {
          name: 'Created',
          count: allTasks.length,
          conversionRate: 100,
          dropOffRate: 0,
          averageTimeToNext: 0
        },
        {
          name: 'Started (In Progress)',
          count: allTasks.filter(t => 
            t.status === TaskStatus.IN_PROGRESS || t.status === TaskStatus.DONE
          ).length,
          conversionRate: 0,
          dropOffRate: 0,
          averageTimeToNext: 0
        },
        {
          name: 'Completed',
          count: allTasks.filter(t => t.status === TaskStatus.DONE).length,
          conversionRate: 0,
          dropOffRate: 0,
          averageTimeToNext: 0
        }
      ];
      
      // Calculate conversion rates
      for (let i = 1; i < steps.length; i++) {
        const prevCount = steps[i - 1].count;
        const currentCount = steps[i].count;
        steps[i].conversionRate = prevCount > 0 ? (currentCount / prevCount) * 100 : 0;
        steps[i].dropOffRate = 100 - steps[i].conversionRate;
        
        // Estimate time between steps (simplified)
        steps[i].averageTimeToNext = this.estimateStepTime(i);
      }
      
      // Find bottleneck
      const maxDropOff = Math.max(...steps.map(s => s.dropOffRate));
      const bottleneckStep = steps.find(s => s.dropOffRate === maxDropOff)?.name || 'None';
      
      // Generate suggestions
      const suggestions = this.generateFunnelSuggestions(steps);
      
      return {
        funnelName: 'Task Lifecycle',
        totalEntered: steps[0].count,
        totalCompleted: steps[steps.length - 1].count,
        overallConversionRate: steps[0].count > 0 
          ? (steps[steps.length - 1].count / steps[0].count) * 100 
          : 0,
        steps,
        bottleneckStep,
        suggestions
      };
    } catch (error) {
      logger.error('Error analyzing funnel:', error);
      throw error;
    }
  }
  
  // ==================== REPORT GENERATION ====================
  
  /**
   * Generate a comprehensive report
   */
  async generateReport(config: ReportConfig): Promise<GeneratedReport> {
    try {
      const reportId = `report_${Date.now()}`;
      let data: any = {};
      
      // Gather requested metrics
      if (config.metrics.includes('kpi') || config.type === 'summary' || config.type === 'executive') {
        data.kpi = await this.getKPIMetrics(config.timeRange);
      }
      
      if (config.metrics.includes('trends') || config.type === 'detailed') {
        data.trends = await this.getMultipleTrends(
          ['completions', 'creations', 'velocity'],
          config.timeRange
        );
      }
      
      if (config.metrics.includes('team') || config.type === 'executive') {
        data.team = await this.getTeamAnalytics(undefined, config.timeRange);
      }
      
      if (config.metrics.includes('funnel') || config.type === 'detailed') {
        data.funnel = await this.analyzeTaskFunnel(config.timeRange);
      }
      
      if (config.metrics.includes('cohorts') || config.type === 'detailed') {
        data.cohorts = await this.analyzeCohorts('first_task_week', config.timeRange);
      }
      
      if (config.metrics.includes('leaderboard')) {
        data.leaderboard = await this.getLeaderboard('productivity', 10, config.timeRange);
      }
      
      // Generate summary
      const summary = this.generateReportSummary(data, config);
      
      const report: GeneratedReport = {
        id: reportId,
        title: this.generateReportTitle(config),
        generatedAt: new Date(),
        config,
        data,
        summary
      };
      
      logger.info(`Report generated: ${reportId}`, { type: config.type });
      
      return report;
    } catch (error) {
      logger.error('Error generating report:', error);
      throw error;
    }
  }
  
  // ==================== CHART DATA ====================
  
  /**
   * Get chart-ready data
   */
  async getChartData(
    chartType: 'tasksByStatus' | 'tasksByPriority' | 'completionTrend' | 'userActivity' | 'workloadHeatmap',
    timeRange?: Partial<TimeRange>
  ): Promise<ChartData> {
    const range = this.normalizeTimeRange(timeRange);
    const tasks = await this.getTasksInRange(range);
    
    switch (chartType) {
      case 'tasksByStatus':
        return this.createStatusPieChart(tasks);
      
      case 'tasksByPriority':
        return this.createPriorityBarChart(tasks);
      
      case 'completionTrend':
        return this.createCompletionLineChart(tasks, range);
      
      case 'userActivity':
        return this.createUserActivityChart(tasks);
      
      case 'workloadHeatmap':
        return this.createWorkloadHeatmap(tasks);
      
      default:
        throw new Error(`Unknown chart type: ${chartType}`);
    }
  }
  
  // ==================== HELPER METHODS ====================
  
  private normalizeTimeRange(
    partial?: Partial<TimeRange>,
    defaults?: Partial<TimeRange>
  ): TimeRange {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    return {
      startDate: partial?.startDate || thirtyDaysAgo,
      endDate: partial?.endDate || now,
      granularity: partial?.granularity || defaults?.granularity || 'day'
    };
  }
  
  private async getTasksInRange(range: TimeRange): Promise<Task[]> {
    try {
      const stmt = db.prepare(`
        SELECT * FROM tasks 
        WHERE createdAt >= ? AND createdAt <= ?
        ORDER BY createdAt DESC
      `);
      
      return stmt.all(
        range.startDate.toISOString(),
        range.endDate.toISOString()
      ) as Task[];
    } catch (error) {
      logger.error('Error fetching tasks in range:', error);
      return [];
    }
  }
  
  private getDaysDifference(start: Date, end: Date): number {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  
  private calculateAverageCompletionTime(completedTasks: Task[]): number {
    if (completedTasks.length === 0) return 0;
    
    const completionTimes = completedTasks.map(t => {
      const created = new Date(t.createdAt).getTime();
      const updated = new Date(t.updatedAt).getTime();
      return (updated - created) / (1000 * 60 * 60); // hours
    });
    
    return Math.round(
      (completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length) * 100
    ) / 100;
  }
  
  private calculateCollaborationScore(tasks: Task[]): number {
    // Simplified collaboration score based on task distribution
    const userCounts = new Map<string, number>();
    tasks.forEach(t => {
      userCounts.set(t.userId, (userCounts.get(t.userId) || 0) + 1);
    });
    
    if (userCounts.size <= 1) return 0;
    
    const values = Array.from(userCounts.values());
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    // Lower standard deviation = more even distribution = higher collaboration
    const cv = mean > 0 ? stdDev / mean : 0;
    return Math.round(Math.max(0, (1 - cv) * 100));
  }
  
  private aggregateByGranularity(
    tasks: Task[],
    range: TimeRange,
    metric: string
  ): TrendPoint[] {
    const buckets = new Map<string, number>();
    
    tasks.forEach(task => {
      const date = new Date(task.createdAt);
      const key = this.getDateKey(date, range.granularity);
      
      if (metric === 'completions' && task.status === TaskStatus.DONE) {
        buckets.set(key, (buckets.get(key) || 0) + 1);
      } else if (metric === 'creations') {
        buckets.set(key, (buckets.get(key) || 0) + 1);
      }
    });
    
    const sortedKeys = Array.from(buckets.keys()).sort();
    return sortedKeys.map((key, index) => {
      const value = buckets.get(key) || 0;
      const prevValue = index > 0 ? (buckets.get(sortedKeys[index - 1]) || 0) : value;
      const change = value - prevValue;
      const changePercent = prevValue > 0 ? (change / prevValue) * 100 : 0;
      
      return { date: key, value, change, changePercent };
    });
  }
  
  private getDateKey(date: Date, granularity: string): string {
    switch (granularity) {
      case 'hour':
        return date.toISOString().slice(0, 13);
      case 'day':
        return date.toISOString().slice(0, 10);
      case 'week':
        return this.getWeekKey(date);
      case 'month':
        return date.toISOString().slice(0, 7);
      case 'year':
        return date.toISOString().slice(0, 4);
      default:
        return date.toISOString().slice(0, 10);
    }
  }
  
  private getWeekKey(date: Date): string {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay());
    return d.toISOString().slice(0, 10);
  }
  
  private calculateTrend(dataPoints: TrendPoint[]): 'increasing' | 'decreasing' | 'stable' {
    if (dataPoints.length < 2) return 'stable';
    
    const firstHalf = dataPoints.slice(0, Math.floor(dataPoints.length / 2));
    const secondHalf = dataPoints.slice(Math.floor(dataPoints.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b.value, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b.value, 0) / secondHalf.length;
    
    const change = secondAvg - firstAvg;
    const threshold = firstAvg * 0.1; // 10% threshold
    
    if (change > threshold) return 'increasing';
    if (change < -threshold) return 'decreasing';
    return 'stable';
  }
  
  private calculateTrendStrength(dataPoints: TrendPoint[]): number {
    if (dataPoints.length < 2) return 0;
    
    // Simple linear regression R²
    const n = dataPoints.length;
    const sumX = dataPoints.reduce((a, _, i) => a + i, 0);
    const sumY = dataPoints.reduce((a, b) => a + b.value, 0);
    const sumXY = dataPoints.reduce((a, b, i) => a + i * b.value, 0);
    const sumX2 = dataPoints.reduce((a, _, i) => a + i * i, 0);
    const sumY2 = dataPoints.reduce((a, b) => a + b.value * b.value, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    if (denominator === 0) return 0;
    
    const r = numerator / denominator;
    return Math.round(Math.abs(r * r) * 100);
  }
  
  private generateForecast(dataPoints: TrendPoint[], days: number): TrendPoint[] {
    if (dataPoints.length < 3) return [];
    
    // Simple moving average forecast
    const windowSize = Math.min(7, dataPoints.length);
    const lastValues = dataPoints.slice(-windowSize).map(d => d.value);
    const avg = lastValues.reduce((a, b) => a + b, 0) / lastValues.length;
    
    const forecast: TrendPoint[] = [];
    const lastDate = new Date(dataPoints[dataPoints.length - 1].date);
    
    for (let i = 1; i <= days; i++) {
      const forecastDate = new Date(lastDate);
      forecastDate.setDate(forecastDate.getDate() + i);
      
      forecast.push({
        date: forecastDate.toISOString().slice(0, 10),
        value: Math.round(avg),
        change: 0,
        changePercent: 0
      });
    }
    
    return forecast;
  }
  
  private detectSeasonality(dataPoints: TrendPoint[]): TrendAnalysis['seasonality'] {
    if (dataPoints.length < 14) return { pattern: 'none' };
    
    // Simple day-of-week analysis
    const dayTotals = new Map<number, number[]>();
    
    dataPoints.forEach(point => {
      const date = new Date(point.date);
      const day = date.getDay();
      if (!dayTotals.has(day)) {
        dayTotals.set(day, []);
      }
      dayTotals.get(day)!.push(point.value);
    });
    
    const dayAverages = Array.from(dayTotals.entries()).map(([day, values]) => ({
      day,
      avg: values.reduce((a, b) => a + b, 0) / values.length
    }));
    
    const overallAvg = dayAverages.reduce((a, b) => a + b.avg, 0) / dayAverages.length;
    const highDays = dayAverages.filter(d => d.avg > overallAvg * 1.2);
    const lowDays = dayAverages.filter(d => d.avg < overallAvg * 0.8);
    
    if (highDays.length > 0 || lowDays.length > 0) {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return {
        pattern: 'weekly',
        peakDays: highDays.map(d => dayNames[d.day]),
        lowDays: lowDays.map(d => dayNames[d.day])
      };
    }
    
    return { pattern: 'none' };
  }
  
  private async getUsernameById(userId: string): Promise<string> {
    try {
      const stmt = db.prepare('SELECT username FROM users WHERE id = ?');
      const user = stmt.get(userId) as { username: string } | undefined;
      return user?.username || `User ${userId.slice(-4)}`;
    } catch {
      return `User ${userId.slice(-4)}`;
    }
  }
  
  private calculateStreaks(completedTasks: Task[]): { currentStreak: number; longestStreak: number } {
    if (completedTasks.length === 0) return { currentStreak: 0, longestStreak: 0 };
    
    // Sort by completion date
    const sortedDates = completedTasks
      .map(t => new Date(t.updatedAt).toISOString().slice(0, 10))
      .sort()
      .filter((date, index, arr) => arr.indexOf(date) === index); // unique dates
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;
    
    for (let i = 1; i < sortedDates.length; i++) {
      const prev = new Date(sortedDates[i - 1]);
      const curr = new Date(sortedDates[i]);
      const diffDays = Math.floor((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    
    longestStreak = Math.max(longestStreak, tempStreak);
    
    // Check if streak is current
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const lastCompletionDate = sortedDates[sortedDates.length - 1];
    
    if (lastCompletionDate === today || lastCompletionDate === yesterday) {
      currentStreak = tempStreak;
    }
    
    return { currentStreak, longestStreak };
  }
  
  private analyzeProductivityPatterns(tasks: Task[]): { mostProductiveDay: string; mostProductiveHour: number } {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayCounts = new Array(7).fill(0);
    const hourCounts = new Array(24).fill(0);
    
    tasks.forEach(task => {
      const date = new Date(task.updatedAt);
      dayCounts[date.getDay()]++;
      hourCounts[date.getHours()]++;
    });
    
    const maxDayIndex = dayCounts.indexOf(Math.max(...dayCounts));
    const maxHourIndex = hourCounts.indexOf(Math.max(...hourCounts));
    
    return {
      mostProductiveDay: dayNames[maxDayIndex],
      mostProductiveHour: maxHourIndex
    };
  }
  
  private async getAllUserStats(tasks: Task[]): Promise<Array<{ userId: string; completed: number }>> {
    const userStats = new Map<string, number>();
    
    tasks.forEach(task => {
      if (task.status === TaskStatus.DONE) {
        userStats.set(task.userId, (userStats.get(task.userId) || 0) + 1);
      }
    });
    
    return Array.from(userStats.entries()).map(([userId, completed]) => ({
      userId,
      completed
    }));
  }
  
  private calculateProductivityScore(metrics: {
    completionRate: number;
    onTimeRate: number;
    currentStreak: number;
    tasksCompleted: number;
  }): number {
    const weights = {
      completionRate: 0.3,
      onTimeRate: 0.3,
      streak: 0.2,
      volume: 0.2
    };
    
    const streakScore = Math.min(100, metrics.currentStreak * 10);
    const volumeScore = Math.min(100, metrics.tasksCompleted * 5);
    
    return Math.round(
      metrics.completionRate * weights.completionRate +
      metrics.onTimeRate * weights.onTimeRate +
      streakScore * weights.streak +
      volumeScore * weights.volume
    );
  }
  
  private countByPriority(tasks: Task[]): Record<string, number> {
    const counts: Record<string, number> = {};
    tasks.forEach(task => {
      counts[task.priority] = (counts[task.priority] || 0) + 1;
    });
    return counts;
  }
  
  private detectBottlenecks(
    tasks: Task[],
    workloadDistribution: TeamAnalytics['workloadDistribution']
  ): TeamAnalytics['bottlenecks'] {
    const bottlenecks: TeamAnalytics['bottlenecks'] = [];
    
    // Check for overloaded users
    const avgTasks = tasks.length / workloadDistribution.length;
    workloadDistribution.forEach(user => {
      if (user.taskCount > avgTasks * 2) {
        bottlenecks.push({
          type: 'user',
          description: `${user.username} has ${user.taskCount} tasks (${Math.round(user.percentage)}% of total)`,
          impact: user.taskCount > avgTasks * 3 ? 'high' : 'medium',
          taskCount: user.taskCount
        });
      }
    });
    
    // Check for stuck tasks
    const inProgressTasks = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS);
    const stuckTasks = inProgressTasks.filter(t => {
      const daysSinceUpdate = this.getDaysDifference(new Date(t.updatedAt), new Date());
      return daysSinceUpdate > 7;
    });
    
    if (stuckTasks.length > 0) {
      bottlenecks.push({
        type: 'status',
        description: `${stuckTasks.length} tasks stuck in IN_PROGRESS for over a week`,
        impact: stuckTasks.length > 5 ? 'high' : 'medium',
        taskCount: stuckTasks.length
      });
    }
    
    // Check for high priority backlog
    const urgentTodo = tasks.filter(
      t => t.priority === TaskPriority.URGENT && t.status === TaskStatus.TODO
    );
    
    if (urgentTodo.length > 0) {
      bottlenecks.push({
        type: 'priority',
        description: `${urgentTodo.length} URGENT tasks still in TODO status`,
        impact: 'high',
        taskCount: urgentTodo.length
      });
    }
    
    return bottlenecks;
  }
  
  private calculateRetention(userIds: string[], tasks: Task[], cohortWeek: string): number[] {
    const retention: number[] = [100]; // Week 0 is always 100%
    const cohortStartDate = new Date(cohortWeek);
    
    for (let week = 1; week <= 4; week++) {
      const weekStart = new Date(cohortStartDate.getTime() + week * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const activeUsers = userIds.filter(userId => 
        tasks.some(t => 
          t.userId === userId &&
          new Date(t.updatedAt) >= weekStart &&
          new Date(t.updatedAt) < weekEnd
        )
      );
      
      retention.push(Math.round((activeUsers.length / userIds.length) * 100));
    }
    
    return retention;
  }
  
  private calculateAverageTasksForCohort(userIds: string[], tasks: Task[]): number {
    const totalCompleted = tasks.filter(
      t => userIds.includes(t.userId) && t.status === TaskStatus.DONE
    ).length;
    
    return userIds.length > 0 
      ? Math.round((totalCompleted / userIds.length) * 100) / 100 
      : 0;
  }
  
  private generateCohortInsights(cohorts: CohortAnalysis['cohorts']): string[] {
    const insights: string[] = [];
    
    if (cohorts.length === 0) return ['Not enough data for cohort analysis'];
    
    // Best performing cohort
    const bestCohort = cohorts.reduce((a, b) => 
      a.averageTasksCompleted > b.averageTasksCompleted ? a : b
    );
    insights.push(`Best performing cohort: ${bestCohort.cohortLabel} with ${bestCohort.averageTasksCompleted} avg tasks completed`);
    
    // Retention trend
    const avgRetention = cohorts.reduce((a, b) => a + (b.retention[4] || 0), 0) / cohorts.length;
    insights.push(`Average 4-week retention: ${Math.round(avgRetention)}%`);
    
    // Churn analysis
    const highChurnCohorts = cohorts.filter(c => c.churnRate > 50);
    if (highChurnCohorts.length > 0) {
      insights.push(`${highChurnCohorts.length} cohorts have >50% churn rate`);
    }
    
    return insights;
  }
  
  private estimateStepTime(stepIndex: number): number {
    // Simplified estimation
    const avgTimes = [0, 24, 48]; // hours
    return avgTimes[stepIndex] || 0;
  }
  
  private generateFunnelSuggestions(steps: FunnelStep[]): string[] {
    const suggestions: string[] = [];
    
    const startedStep = steps.find(s => s.name === 'Started (In Progress)');
    const completedStep = steps.find(s => s.name === 'Completed');
    
    if (startedStep && startedStep.dropOffRate > 30) {
      suggestions.push('Many tasks are not being started. Consider task prioritization or clearer requirements.');
    }
    
    if (completedStep && completedStep.dropOffRate > 40) {
      suggestions.push('Tasks are getting stuck in progress. Review blockers and consider breaking down large tasks.');
    }
    
    if (steps[steps.length - 1].conversionRate < 50) {
      suggestions.push('Overall completion rate is low. Consider capacity planning and workload management.');
    }
    
    return suggestions.length > 0 ? suggestions : ['Funnel performance is healthy'];
  }
  
  private generateReportSummary(
    data: any,
    config: ReportConfig
  ): GeneratedReport['summary'] {
    const highlights: string[] = [];
    const alerts: string[] = [];
    const recommendations: string[] = [];
    
    if (data.kpi) {
      highlights.push(`Completion rate: ${Math.round(data.kpi.completionRate)}%`);
      highlights.push(`Tasks completed per day: ${data.kpi.tasksCompletedPerDay}`);
      
      if (data.kpi.overdueCount > 0) {
        alerts.push(`${data.kpi.overdueCount} overdue tasks require attention`);
      }
      
      if (data.kpi.completionRate < 50) {
        recommendations.push('Focus on completing existing tasks before creating new ones');
      }
    }
    
    if (data.team) {
      highlights.push(`Team velocity: ${data.team.teamVelocity} tasks/week`);
      
      if (data.team.bottlenecks.length > 0) {
        alerts.push(`${data.team.bottlenecks.length} bottlenecks identified`);
      }
    }
    
    return { highlights, alerts, recommendations };
  }
  
  private generateReportTitle(config: ReportConfig): string {
    const typeNames = {
      summary: 'Summary Report',
      detailed: 'Detailed Analytics Report',
      executive: 'Executive Dashboard',
      custom: 'Custom Report'
    };
    
    const start = config.timeRange.startDate.toISOString().slice(0, 10);
    const end = config.timeRange.endDate.toISOString().slice(0, 10);
    
    return `${typeNames[config.type]} (${start} to ${end})`;
  }
  
  private createStatusPieChart(tasks: Task[]): ChartData {
    const statusCounts = {
      [TaskStatus.TODO]: 0,
      [TaskStatus.IN_PROGRESS]: 0,
      [TaskStatus.DONE]: 0,
      [TaskStatus.CANCELLED]: 0
    };
    
    tasks.forEach(t => {
      statusCounts[t.status]++;
    });
    
    return {
      chartType: 'pie',
      title: 'Tasks by Status',
      xAxis: { label: 'Status', type: 'category' },
      yAxis: { label: 'Count', type: 'value' },
      series: [{
        name: 'Tasks',
        data: Object.entries(statusCounts).map(([status, count]) => ({
          x: status,
          y: count,
          label: status
        }))
      }]
    };
  }
  
  private createPriorityBarChart(tasks: Task[]): ChartData {
    const priorityCounts = {
      [TaskPriority.LOW]: 0,
      [TaskPriority.MEDIUM]: 0,
      [TaskPriority.HIGH]: 0,
      [TaskPriority.URGENT]: 0
    };
    
    tasks.forEach(t => {
      priorityCounts[t.priority]++;
    });
    
    return {
      chartType: 'bar',
      title: 'Tasks by Priority',
      xAxis: { label: 'Priority', type: 'category' },
      yAxis: { label: 'Count', type: 'value' },
      series: [{
        name: 'Tasks',
        data: Object.entries(priorityCounts).map(([priority, count]) => ({
          x: priority,
          y: count,
          label: priority
        }))
      }]
    };
  }
  
  private createCompletionLineChart(tasks: Task[], range: TimeRange): ChartData {
    const completedTasks = tasks.filter(t => t.status === TaskStatus.DONE);
    const dataPoints = this.aggregateByGranularity(completedTasks, range, 'completions');
    
    return {
      chartType: 'line',
      title: 'Task Completions Over Time',
      xAxis: { label: 'Date', type: 'time' },
      yAxis: { label: 'Completions', type: 'value' },
      series: [{
        name: 'Completed Tasks',
        data: dataPoints.map(p => ({
          x: p.date,
          y: p.value
        }))
      }]
    };
  }
  
  private async createUserActivityChart(tasks: Task[]): Promise<ChartData> {
    const userCounts = new Map<string, number>();
    
    tasks.forEach(t => {
      userCounts.set(t.userId, (userCounts.get(t.userId) || 0) + 1);
    });
    
    const topUsers = Array.from(userCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    const userData = await Promise.all(
      topUsers.map(async ([userId, count]) => ({
        x: await this.getUsernameById(userId),
        y: count
      }))
    );
    
    return {
      chartType: 'bar',
      title: 'Top Users by Activity',
      xAxis: { label: 'User', type: 'category' },
      yAxis: { label: 'Tasks', type: 'value' },
      series: [{
        name: 'Tasks',
        data: userData
      }]
    };
  }
  
  private createWorkloadHeatmap(tasks: Task[]): ChartData {
    const heatmapData: DataPoint[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const count = tasks.filter(t => {
          const date = new Date(t.createdAt);
          return date.getDay() === day && date.getHours() === hour;
        }).length;
        
        heatmapData.push({
          x: dayNames[day],
          y: count,
          label: `${hour}:00`,
          metadata: { day, hour }
        });
      }
    }
    
    return {
      chartType: 'heatmap',
      title: 'Task Creation Heatmap',
      xAxis: { label: 'Day', type: 'category' },
      yAxis: { label: 'Hour', type: 'value' },
      series: [{
        name: 'Tasks',
        data: heatmapData
      }]
    };
  }
}

export const analyticsService = new AnalyticsService();
