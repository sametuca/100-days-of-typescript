"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const performance_controller_1 = require("../controllers/performance.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware.authenticate);
router.get('/metrics', performance_controller_1.PerformanceController.getMetrics);
router.get('/api', performance_controller_1.PerformanceController.getAPIPerformance);
router.post('/bottlenecks/detect', performance_controller_1.PerformanceController.detectBottlenecks);
router.get('/alerts', performance_controller_1.PerformanceController.getActiveAlerts);
router.post('/optimizations/generate', performance_controller_1.PerformanceController.generateOptimizations);
router.get('/optimizations', performance_controller_1.PerformanceController.getOptimizations);
router.get('/report', performance_controller_1.PerformanceController.generateReport);
exports.default = router;
//# sourceMappingURL=performance.routes.js.map