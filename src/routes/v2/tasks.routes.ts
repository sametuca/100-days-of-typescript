import { Router } from 'express';
import { TaskService } from '../../services/task.service';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// V2 Task endpoints - Enhanced format
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await TaskService.getAllTasks(req.query as any);
    
    // V2 format - enhanced response with metadata
    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
      meta: {
        version: 'v2',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id']
      }
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false,
      error: {
        message: error.message,
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString()
      }
    });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const task = await TaskService.getTaskById(req.params.id);
    if (!task) {
      return res.status(404).json({ 
        success: false,
        error: {
          message: 'Task not found',
          code: 'TASK_NOT_FOUND'
        }
      });
    }
    
    // V2 format - enhanced response
    res.json({
      success: true,
      data: task,
      meta: {
        version: 'v2',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false,
      error: {
        message: error.message,
        code: 'INTERNAL_ERROR'
      }
    });
  }
});

export default router;