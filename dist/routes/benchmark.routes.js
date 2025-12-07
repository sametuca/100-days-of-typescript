"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const benchmark_controller_1 = require("../controllers/benchmark.controller");
const router = (0, express_1.Router)();
router.get('/benchmark/results', benchmark_controller_1.BenchmarkController.getBenchmarkResults);
router.get('/benchmark/stats', benchmark_controller_1.BenchmarkController.getBenchmarkStats);
router.post('/benchmark/test', benchmark_controller_1.BenchmarkController.runPerformanceTest);
exports.default = router;
//# sourceMappingURL=benchmark.routes.js.map