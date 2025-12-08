import { Request, Response } from 'express';
import { MLService } from '../services/ml.service';
import { TaskService } from '../services/task.service';
import { catchAsync } from '../middleware/error.middleware';
import logger from '../utils/logger';
import { AuthRequest } from '../types';

/**
 * Day 51: ML/AI Controller
 * Endpoints for machine learning features
 */

export class MLController {
  
  /**
   * Predict task completion time
   * POST /api/v1/ml/predict-completion
   */
  public static predictCompletion = catchAsync(async (req: AuthRequest, res: Response): Promise<void> => {
    const { taskId } = req.body;
    const userId = req.user?.userId;

    if (!taskId) {
      res.status(400).json({
        success: false,
        message: 'Task ID is required'
      });
      return;
    }

    // Get the task
    const task = await TaskService.getTaskById(taskId);
    if (!task) {
      res.status(404).json({
        success: false,
        message: 'Task not found'
      });
      return;
    }

    // Get user's task history for better prediction
    const userTasks = await TaskService.getAllTasks({
      userId: userId || task.userId,
      limit: 100
    });

    const prediction = MLService.predictCompletionTime(task, userTasks.data);

    logger.info('Task completion predicted', {
      taskId,
      prediction: prediction.estimatedHours
    });

    res.status(200).json({
      success: true,
      message: 'Task completion time predicted',
      data: {
        taskId,
        taskTitle: task.title,
        ...prediction
      }
    });
  });

  /**
   * Get smart task prioritization
   * GET /api/v1/ml/prioritize?userId=xxx
   */
  public static prioritizeTasks = catchAsync(async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.query.userId as string || req.user?.userId;

    if (!userId) {
      res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
      return;
    }

    // Get user's active tasks
    const result = await TaskService.getAllTasks({
      userId,
      status: ['TODO', 'IN_PROGRESS'],
      limit: 100
    });

    const prioritized = MLService.prioritizeTasks(result.data);

    logger.info('Tasks prioritized', {
      userId,
      taskCount: prioritized.length
    });

    res.status(200).json({
      success: true,
      message: 'Tasks prioritized successfully',
      data: {
        totalTasks: prioritized.length,
        prioritizedTasks: prioritized.map((p, index) => ({
          rank: index + 1,
          taskId: p.taskId,
          score: p.score,
          reasoning: p.reasoning,
          task: result.data.find(t => t.id === p.taskId)
        }))
      }
    });
  });

  /**
   * Detect anomalies in user's tasks
   * GET /api/v1/ml/detect-anomalies?userId=xxx
   */
  public static detectAnomalies = catchAsync(async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.query.userId as string || req.user?.userId;

    if (!userId) {
      res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
      return;
    }

    // Get all user tasks
    const result = await TaskService.getAllTasks({
      userId,
      limit: 500
    });

    const anomalies: any[] = [];

    for (const task of result.data) {
      const detection = MLService.detectAnomalies(task, result.data);
      
      if (detection.isAnomaly) {
        anomalies.push({
          taskId: task.id,
          taskTitle: task.title,
          ...detection
        });
      }
    }

    logger.info('Anomaly detection completed', {
      userId,
      anomaliesFound: anomalies.length
    });

    res.status(200).json({
      success: true,
      message: 'Anomaly detection completed',
      data: {
        totalTasksAnalyzed: result.data.length,
        anomaliesDetected: anomalies.length,
        anomalies: anomalies.sort((a, b) => b.anomalyScore - a.anomalyScore)
      }
    });
  });

  /**
   * Get task recommendations
   * GET /api/v1/ml/recommend?taskId=xxx
   */
  public static recommendTasks = catchAsync(async (req: AuthRequest, res: Response): Promise<void> => {
    const { taskId } = req.query;
    const userId = req.user?.userId;

    if (!taskId) {
      res.status(400).json({
        success: false,
        message: 'Task ID is required'
      });
      return;
    }

    // Get the current task
    const currentTask = await TaskService.getTaskById(taskId as string);
    if (!currentTask) {
      res.status(404).json({
        success: false,
        message: 'Task not found'
      });
      return;
    }

    // Get all tasks for recommendations
    const allTasks = await TaskService.getAllTasks({
      userId: userId || currentTask.userId,
      limit: 200
    });

    const recommendations = MLService.recommendTasks(currentTask, allTasks.data);

    // Enrich recommendations with task details
    const enrichedRecommendations = recommendations.map(rec => ({
      ...rec,
      task: allTasks.data.find(t => t.id === rec.taskId)
    }));

    logger.info('Task recommendations generated', {
      taskId,
      recommendationCount: recommendations.length
    });

    res.status(200).json({
      success: true,
      message: 'Task recommendations generated',
      data: {
        currentTask: {
          id: currentTask.id,
          title: currentTask.title,
          priority: currentTask.priority
        },
        recommendations: enrichedRecommendations
      }
    });
  });

  /**
   * Analyze sentiment of task description
   * POST /api/v1/ml/sentiment
   */
  public static analyzeSentiment = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { text, taskId } = req.body;

    if (!text && !taskId) {
      res.status(400).json({
        success: false,
        message: 'Text or task ID is required'
      });
      return;
    }

    let analysisText = text;

    // If taskId provided, get task description
    if (taskId) {
      const task = await TaskService.getTaskById(taskId);
      if (!task) {
        res.status(404).json({
          success: false,
          message: 'Task not found'
        });
        return;
      }
      analysisText = `${task.title} ${task.description || ''}`;
    }

    const sentiment = MLService.analyzeSentiment(analysisText);

    logger.info('Sentiment analysis completed', {
      taskId,
      sentiment: sentiment.sentiment
    });

    res.status(200).json({
      success: true,
      message: 'Sentiment analysis completed',
      data: {
        text: analysisText.substring(0, 100) + '...',
        ...sentiment,
        interpretation: {
          positive: 'Task has positive indicators',
          neutral: 'Task has neutral tone',
          negative: 'Task indicates problems or issues'
        }[sentiment.sentiment]
      }
    });
  });

  /**
   * Get ML insights dashboard
   * GET /api/v1/ml/insights?userId=xxx
   */
  public static getMLInsights = catchAsync(async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.query.userId as string || req.user?.userId;

    if (!userId) {
      res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
      return;
    }

    // Get user tasks
    const result = await TaskService.getAllTasks({
      userId,
      limit: 200
    });

    const tasks = result.data;

    // Run multiple ML analyses
    const prioritized = MLService.prioritizeTasks(tasks);
    
    const anomalies = tasks
      .map(task => ({
        taskId: task.id,
        ...MLService.detectAnomalies(task, tasks)
      }))
      .filter(a => a.isAnomaly);

    // Average completion time prediction
    const avgPrediction = tasks.length > 0
      ? tasks.reduce((sum, task) => {
          const pred = MLService.predictCompletionTime(task, tasks);
          return sum + pred.estimatedHours;
        }, 0) / tasks.length
      : 0;

    // Sentiment distribution
    const sentiments = tasks.map(task => 
      MLService.analyzeSentiment(`${task.title} ${task.description || ''}`)
    );

    const sentimentDistribution = {
      positive: sentiments.filter(s => s.sentiment === 'positive').length,
      neutral: sentiments.filter(s => s.sentiment === 'neutral').length,
      negative: sentiments.filter(s => s.sentiment === 'negative').length
    };

    logger.info('ML insights generated', {
      userId,
      tasksAnalyzed: tasks.length
    });

    res.status(200).json({
      success: true,
      message: 'ML insights generated successfully',
      data: {
        overview: {
          totalTasks: tasks.length,
          averageEstimatedCompletionTime: Math.round(avgPrediction * 10) / 10,
          anomaliesDetected: anomalies.length,
          topPriorityTasks: prioritized.slice(0, 5)
        },
        sentimentAnalysis: {
          distribution: sentimentDistribution,
          dominantSentiment: Object.entries(sentimentDistribution)
            .sort((a, b) => b[1] - a[1])[0][0]
        },
        anomalies: anomalies.slice(0, 10),
        recommendations: {
          message: anomalies.length > 5 
            ? 'Multiple anomalies detected - review stale tasks'
            : 'Task portfolio looks healthy',
          actions: [
            anomalies.length > 0 ? 'Review and update stale tasks' : null,
            prioritized[0]?.score > 150 ? 'Focus on high-priority tasks first' : null,
            sentimentDistribution.negative > tasks.length * 0.3 ? 'Many problem-related tasks - consider team support' : null
          ].filter(Boolean)
        }
      }
    });
  });
}
