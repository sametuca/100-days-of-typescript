import { APIGatewayProxyHandler, Context } from 'aws-lambda';
import logger from '../../utils/logger';

/**
 * Create task via serverless function
 */
export const createTaskHandler: APIGatewayProxyHandler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    logger.info('Create task function invoked', {
      requestId: context.requestId,
      memory: context.memoryLimitInMB
    });

    const body = JSON.parse(event.body || '{}');
    const { title, description, priority, status, userId } = body;

    // Validation
    if (!title || !userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Title and userId are required' })
      };
    }

    // Mock task creation
    const task = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      description: description || '',
      priority: priority || 'medium',
      status: status || 'todo',
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    };
  } catch (error: any) {
    logger.error('Create task function error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

/**
 * Get task by ID via serverless function
 */
export const getTaskHandler: APIGatewayProxyHandler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    const taskId = event.pathParameters?.id;

    if (!taskId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Task ID is required' })
      };
    }

    // Mock task retrieval
    const task = {
      id: taskId,
      title: 'Sample Task',
      description: 'This is a sample task',
      priority: 'high',
      status: 'in-progress',
      userId: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    };
  } catch (error: any) {
    logger.error('Get task function error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

/**
 * List tasks for user via serverless function
 */
export const listTasksHandler: APIGatewayProxyHandler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    const userId = event.queryStringParameters?.userId;
    const limit = parseInt(event.queryStringParameters?.limit || '10');
    const offset = parseInt(event.queryStringParameters?.offset || '0');

    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'User ID is required' })
      };
    }

    // Mock task listing
    const tasks = Array.from({ length: 5 }, (_, i) => ({
      id: `task-${i}`,
      title: `Task ${i + 1}`,
      description: 'Sample task',
      priority: 'medium',
      status: 'todo',
      userId: parseInt(userId),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tasks: tasks.slice(offset, offset + limit),
        total: tasks.length,
        limit,
        offset
      })
    };
  } catch (error: any) {
    logger.error('List tasks function error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

/**
 * Delete task via serverless function
 */
export const deleteTaskHandler: APIGatewayProxyHandler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    const taskId = event.pathParameters?.id;

    if (!taskId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Task ID is required' })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true,
        message: `Task ${taskId} deleted successfully`
      })
    };
  } catch (error: any) {
    logger.error('Delete task function error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

/**
 * Process task updates asynchronously
 */
export const processTaskUpdateHandler = async (event: any): Promise<void> => {
  try {
    logger.info('Processing task updates', { eventCount: event.Records?.length });

    for (const record of event.Records || []) {
      const { taskId, status, timestamp } = JSON.parse(record.body);

      logger.info('Processing task update', { taskId, status, timestamp });

      // Update task status
      // await updateTaskStatus(taskId, status);

      // Send notifications
      // await notifyTaskStatusChange(taskId, status);

      // Update analytics
      // await recordTaskMetric(taskId, status, timestamp);
    }

    logger.info('Task updates processed successfully');
  } catch (error: any) {
    logger.error('Process task update error:', error);
    throw error;
  }
};
