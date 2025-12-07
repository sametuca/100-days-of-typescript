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
            data: result.data,
            pagination: result.pagination,
            meta: {
                version: 'v2',
                timestamp: new Date().toISOString(),
                requestId: req.headers['x-request-id']
            }
        });
    }
    catch (error) {
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
router.get('/:id', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const task = await task_service_1.TaskService.getTaskById(req.params.id);
        if (!task) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Task not found',
                    code: 'TASK_NOT_FOUND'
                }
            });
        }
        res.json({
            success: true,
            data: task,
            meta: {
                version: 'v2',
                timestamp: new Date().toISOString()
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: {
                message: error.message,
                code: 'INTERNAL_ERROR'
            }
        });
    }
});
exports.default = router;
//# sourceMappingURL=tasks.routes.js.map