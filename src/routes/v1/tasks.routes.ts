import { Router } from 'express';
import { TaskService } from '../../services/task.service';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// V1 Task endpoints - Legacy format
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await TaskService.getAllTasks(req.query as any);
    
    // V1 format - simple array response
    res.json({
      success: true,
      tasks: result.data,
      total: result.pagination?.total || 0
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const task = await TaskService.getTaskById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // V1 format
    res.json({
      success: true,
      task
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;