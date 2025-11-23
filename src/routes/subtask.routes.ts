import { Router } from 'express';
import { SubtaskController } from '../controllers/subtask.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { z } from 'zod';

const router = Router();

router.use(authenticate);

// Validation schemas
const createSubtaskSchema = z.object({
    title: z.string().min(1, 'Başlık zorunludur')
});

const updateSubtaskSchema = z.object({
    title: z.string().optional(),
    is_completed: z.boolean().optional()
});

// Routes
router.post('/tasks/:taskId/subtasks', validateBody(createSubtaskSchema), SubtaskController.createSubtask);
router.get('/tasks/:taskId/subtasks', SubtaskController.getTaskSubtasks);
router.patch('/subtasks/:id', validateBody(updateSubtaskSchema), SubtaskController.updateSubtask);
router.delete('/subtasks/:id', SubtaskController.deleteSubtask);
router.post('/subtasks/:id/toggle', SubtaskController.toggleComplete);

export default router;
