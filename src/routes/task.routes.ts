import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import {
  createTaskSchema,
  updateTaskSchema,
  taskIdSchema,
  taskQuerySchema
} from '../validation/task.validation';
import { validateBody, validateParams, validateQuery } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { createTaskLimiter } from '../middleware/rate-limit.middleware';
const router = Router();

router.use(authenticate);

router.get('/', validateQuery(taskQuerySchema), TaskController.getAllTasks);
router.get('/:id', validateParams(taskIdSchema), TaskController.getTaskById);
router.post('/', createTaskLimiter, validateBody(createTaskSchema), TaskController.createTask);
router.put('/:id', validateParams(taskIdSchema), validateBody(updateTaskSchema), TaskController.updateTask);
router.delete('/:id', validateParams(taskIdSchema), TaskController.deleteTask);
export default router;