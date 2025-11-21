"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const task_controller_1 = require("../controllers/task.controller");
const task_validation_1 = require("../validation/task.validation");
const validate_middleware_1 = require("../middleware/validate.middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rate_limit_middleware_1 = require("../middleware/rate-limit.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get('/dashboard', task_controller_1.TaskController.getDashboard);
router.get('/', (0, validate_middleware_1.validateQuery)(task_validation_1.taskQuerySchema), task_controller_1.TaskController.getAllTasks);
router.get('/:id', (0, validate_middleware_1.validateParams)(task_validation_1.taskIdSchema), task_controller_1.TaskController.getTaskById);
router.post('/', rate_limit_middleware_1.createTaskLimiter, (0, validate_middleware_1.validateBody)(task_validation_1.createTaskSchema), task_controller_1.TaskController.createTask);
router.put('/:id', (0, validate_middleware_1.validateParams)(task_validation_1.taskIdSchema), (0, validate_middleware_1.validateBody)(task_validation_1.updateTaskSchema), task_controller_1.TaskController.updateTask);
router.delete('/:id', (0, validate_middleware_1.validateParams)(task_validation_1.taskIdSchema), task_controller_1.TaskController.deleteTask);
exports.default = router;
//# sourceMappingURL=task.routes.js.map