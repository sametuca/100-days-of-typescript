import logger from '../utils/logger';
import { Task, TaskStatus, TaskPriority } from '../types';

/**
 * Day 51: Machine Learning Service
 * 
 * AI-powered features:
 * - Task completion time prediction
 * - Smart task prioritization
 * - Anomaly detection
 * - Recommendation system
 */

interface PredictionResult {
  estimatedHours: number;
  confidence: number;
  factors: string[];
}

interface PriorityScore {
  taskId: string;
  score: number;
  reasoning: string[];
}

interface AnomalyDetection {
  isAnomaly: boolean;
  anomalyScore: number;
  reasons: string[];
}

interface TaskRecommendation {
  taskId: string;
  reason: string;
  relevanceScore: number;
}

export class MLService {
  
  /**
   * Predict task completion time using simple heuristics
   * In production, this would use a trained ML model (TensorFlow.js, ONNX, etc.)
   */
  public static predictCompletionTime(task: Task, userHistory: Task[]): PredictionResult {
    let estimatedHours = 4; // Default estimate
    const factors: string[] = [];
    let confidence = 0.5;

    // Factor 1: Task priority
    switch (task.priority) {
      case TaskPriority.URGENT:
        estimatedHours *= 0.8; // Urgent tasks get done faster
        factors.push('High priority - faster completion expected');
        confidence += 0.1;
        break;
      case TaskPriority.LOW:
        estimatedHours *= 1.3;
        factors.push('Low priority - longer completion time');
        break;
    }

    // Factor 2: Title/description complexity
    const titleLength = task.title.length;
    const descriptionLength = task.description?.length || 0;
    
    if (titleLength > 50 || descriptionLength > 200) {
      estimatedHours *= 1.4;
      factors.push('Complex task based on description length');
      confidence += 0.05;
    }

    // Factor 3: User's historical performance
    if (userHistory.length > 0) {
      const completedTasks = userHistory.filter(t => t.status === TaskStatus.DONE);
      
      if (completedTasks.length >= 5) {
        // Calculate average completion time from history
        const avgTime = this.calculateAverageCompletionTime(completedTasks);
        estimatedHours = (estimatedHours + avgTime) / 2;
        factors.push(`Adjusted based on ${completedTasks.length} historical tasks`);
        confidence += 0.2;
      }
    }

    // Factor 4: Keywords indicating complexity
    const complexKeywords = ['integration', 'refactor', 'migrate', 'architecture', 'api'];
    const simpleKeywords = ['fix', 'update', 'change', 'add button'];
    
    const text = `${task.title} ${task.description || ''}`.toLowerCase();
    
    if (complexKeywords.some(keyword => text.includes(keyword))) {
      estimatedHours *= 1.5;
      factors.push('Complex keywords detected in task');
      confidence += 0.1;
    } else if (simpleKeywords.some(keyword => text.includes(keyword))) {
      estimatedHours *= 0.7;
      factors.push('Simple task indicators found');
      confidence += 0.1;
    }

    // Cap confidence at 0.95
    confidence = Math.min(confidence, 0.95);

    logger.info('Task completion time predicted', {
      taskId: task.id,
      estimatedHours: Math.round(estimatedHours * 10) / 10,
      confidence
    });

    return {
      estimatedHours: Math.round(estimatedHours * 10) / 10,
      confidence: Math.round(confidence * 100) / 100,
      factors
    };
  }

  /**
   * Smart task prioritization using scoring algorithm
   */
  public static prioritizeTasks(tasks: Task[]): PriorityScore[] {
    return tasks.map(task => {
      let score = 0;
      const reasoning: string[] = [];

      // Base score from priority
      switch (task.priority) {
        case TaskPriority.URGENT:
          score += 100;
          reasoning.push('Urgent priority (+100)');
          break;
        case TaskPriority.HIGH:
          score += 75;
          reasoning.push('High priority (+75)');
          break;
        case TaskPriority.MEDIUM:
          score += 50;
          reasoning.push('Medium priority (+50)');
          break;
        case TaskPriority.LOW:
          score += 25;
          reasoning.push('Low priority (+25)');
          break;
      }

      // Age factor (older tasks get higher priority)
      const ageInDays = Math.floor(
        (Date.now() - new Date(task.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (ageInDays > 7) {
        score += 30;
        reasoning.push(`Task age: ${ageInDays} days (+30)`);
      } else if (ageInDays > 3) {
        score += 15;
        reasoning.push(`Task age: ${ageInDays} days (+15)`);
      }

      // Blocked tasks lose priority
      if (task.status === TaskStatus.CANCELLED) {
        score -= 50;
        reasoning.push('Cancelled status (-50)');
      }

      // Keywords that indicate urgency
      const urgentKeywords = ['bug', 'critical', 'urgent', 'asap', 'blocker'];
      const text = `${task.title} ${task.description || ''}`.toLowerCase();
      
      if (urgentKeywords.some(keyword => text.includes(keyword))) {
        score += 40;
        reasoning.push('Urgent keywords detected (+40)');
      }

      return {
        taskId: task.id,
        score: Math.max(0, score),
        reasoning
      };
    }).sort((a, b) => b.score - a.score);
  }

  /**
   * Detect anomalies in task patterns
   */
  public static detectAnomalies(task: Task, userTasks: Task[]): AnomalyDetection {
    let anomalyScore = 0;
    const reasons: string[] = [];

    // Anomaly 1: Task created but never updated
    const daysSinceCreation = (Date.now() - new Date(task.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    const daysSinceUpdate = (Date.now() - new Date(task.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceCreation > 14 && daysSinceUpdate > 14 && task.status === TaskStatus.TODO) {
      anomalyScore += 0.4;
      reasons.push('Task inactive for 14+ days');
    }

    // Anomaly 2: Too many tasks in progress
    const inProgressCount = userTasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
    if (inProgressCount > 10) {
      anomalyScore += 0.3;
      reasons.push(`Unusual number of tasks in progress: ${inProgressCount}`);
    }

    // Anomaly 3: High priority but old
    if (task.priority === TaskPriority.URGENT && daysSinceCreation > 7) {
      anomalyScore += 0.5;
      reasons.push('Urgent task pending for 7+ days');
    }

    // Anomaly 4: Very short or very long titles
    if (task.title.length < 5) {
      anomalyScore += 0.2;
      reasons.push('Unusually short task title');
    } else if (task.title.length > 200) {
      anomalyScore += 0.2;
      reasons.push('Unusually long task title');
    }

    // Anomaly 5: Too many cancelled tasks
    const cancelledRatio = userTasks.filter(t => t.status === TaskStatus.CANCELLED).length / userTasks.length;
    if (cancelledRatio > 0.3) {
      anomalyScore += 0.3;
      reasons.push(`High cancellation rate: ${Math.round(cancelledRatio * 100)}%`);
    }

    const isAnomaly = anomalyScore >= 0.5;

    logger.info('Anomaly detection completed', {
      taskId: task.id,
      isAnomaly,
      anomalyScore
    });

    return {
      isAnomaly,
      anomalyScore: Math.round(anomalyScore * 100) / 100,
      reasons
    };
  }

  /**
   * Recommend similar or related tasks
   */
  public static recommendTasks(currentTask: Task, allTasks: Task[]): TaskRecommendation[] {
    const recommendations: TaskRecommendation[] = [];

    // Filter out current task and completed tasks
    const candidateTasks = allTasks.filter(
      t => t.id !== currentTask.id && t.status !== TaskStatus.DONE
    );

    for (const task of candidateTasks) {
      let relevanceScore = 0;
      let reason = '';

      // Same priority
      if (task.priority === currentTask.priority) {
        relevanceScore += 0.3;
        reason = 'Similar priority level';
      }

      // Keyword similarity
      const currentWords = this.extractKeywords(currentTask.title);
      const taskWords = this.extractKeywords(task.title);
      const commonWords = currentWords.filter(w => taskWords.includes(w));
      
      if (commonWords.length > 0) {
        relevanceScore += 0.4 * (commonWords.length / Math.max(currentWords.length, taskWords.length));
        reason = `Related keywords: ${commonWords.join(', ')}`;
      }

      // Same user
      if (task.userId === currentTask.userId) {
        relevanceScore += 0.2;
      }

      if (relevanceScore > 0.3) {
        recommendations.push({
          taskId: task.id,
          reason,
          relevanceScore: Math.round(relevanceScore * 100) / 100
        });
      }
    }

    // Sort by relevance score
    return recommendations
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 5); // Top 5 recommendations
  }

  /**
   * Sentiment analysis on task descriptions
   */
  public static analyzeSentiment(text: string): { sentiment: 'positive' | 'neutral' | 'negative'; score: number } {
    const positiveWords = ['good', 'great', 'excellent', 'improve', 'enhance', 'better', 'success'];
    const negativeWords = ['bug', 'error', 'problem', 'issue', 'critical', 'urgent', 'broken', 'fail'];
    
    const lowerText = text.toLowerCase();
    const words = lowerText.split(/\s+/);
    
    let score = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) score += 1;
      if (negativeWords.includes(word)) score -= 1;
    });

    // Normalize score to -1 to 1 range
    const normalizedScore = Math.max(-1, Math.min(1, score / words.length * 10));
    
    let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
    if (normalizedScore > 0.2) sentiment = 'positive';
    else if (normalizedScore < -0.2) sentiment = 'negative';

    return { sentiment, score: Math.round(normalizedScore * 100) / 100 };
  }

  // Helper methods

  private static calculateAverageCompletionTime(tasks: Task[]): number {
    if (tasks.length === 0) return 4;

    const totalTime = tasks.reduce((sum, task) => {
      const completionTime = new Date(task.updatedAt).getTime() - new Date(task.createdAt).getTime();
      return sum + completionTime;
    }, 0);

    const avgMilliseconds = totalTime / tasks.length;
    const avgHours = avgMilliseconds / (1000 * 60 * 60);

    return Math.max(0.5, Math.min(40, avgHours)); // Cap between 0.5 and 40 hours
  }

  private static extractKeywords(text: string): string[] {
    // Remove common words and extract meaningful keywords
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'];
    
    return text
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.includes(word))
      .slice(0, 5);
  }
}
