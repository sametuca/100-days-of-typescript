import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';

import { 
  validateCreateTask, 
  validateUpdateTask, 
  validateTaskId 
} from '../middleware/validation.middleware';

const router = Router();

router.get('/', TaskController.getAllTasks);

router.get('/:id', validateTaskId, TaskController.getTaskById);

router.post('/', validateCreateTask, TaskController.createTask);

router.put('/:id', validateTaskId, validateUpdateTask, TaskController.updateTask);

router.delete('/:id', validateTaskId, TaskController.deleteTask);

export default router;