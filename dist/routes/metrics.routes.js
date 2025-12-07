"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const metrics_controller_1 = require("../controllers/metrics.controller");
const router = (0, express_1.Router)();
router.get('/metrics', metrics_controller_1.MetricsController.getPrometheusMetrics);
router.get('/metrics/json', metrics_controller_1.MetricsController.getMetricsJson);
router.get('/metrics/system', metrics_controller_1.MetricsController.getSystemMetrics);
exports.default = router;
//# sourceMappingURL=metrics.routes.js.map