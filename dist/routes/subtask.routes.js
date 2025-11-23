"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const subtask_controller_1 = require("../controllers/subtask.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
const createSubtaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Başlık zorunludur')
});
const updateSubtaskSchema = zod_1.z.object({
    title: zod_1.z.string().optional(),
    is_completed: zod_1.z.boolean().optional()
});
router.post('/tasks/:taskId/subtasks', (0, validate_middleware_1.validateBody)(createSubtaskSchema), subtask_controller_1.SubtaskController.createSubtask);
router.get('/tasks/:taskId/subtasks', subtask_controller_1.SubtaskController.getTaskSubtasks);
router.patch('/subtasks/:id', (0, validate_middleware_1.validateBody)(updateSubtaskSchema), subtask_controller_1.SubtaskController.updateSubtask);
router.delete('/subtasks/:id', subtask_controller_1.SubtaskController.deleteSubtask);
router.post('/subtasks/:id/toggle', subtask_controller_1.SubtaskController.toggleComplete);
exports.default = router;
//# sourceMappingURL=subtask.routes.js.map