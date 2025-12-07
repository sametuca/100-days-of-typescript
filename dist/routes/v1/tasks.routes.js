"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const task_service_1 = require("../../services/task.service");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get('/', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const result = await task_service_1.TaskService.getAllTasks(req.query);
        res.json({
            success: true,
            tasks: result.data,
            total: result.pagination?.total || 0
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get('/:id', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const task = await task_service_1.TaskService.getTaskById(req.params.id);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json({
            success: true,
            task
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=tasks.routes.js.map