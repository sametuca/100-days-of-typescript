"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analysis_controller_1 = require("../controllers/analysis.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware.authenticate);
const analysisRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: 'Too many analysis requests, please try again later'
});
router.post('/code', analysisRateLimit, analysis_controller_1.AnalysisController.analyzeCode);
router.post('/batch', analysisRateLimit, analysis_controller_1.AnalysisController.analyzeBatch);
router.get('/report', analysis_controller_1.AnalysisController.getQualityReport);
router.get('/metrics', analysis_controller_1.AnalysisController.getQualityMetrics);
router.get('/issues/top', analysis_controller_1.AnalysisController.getTopIssues);
router.get('/trend/:fileName', analysis_controller_1.AnalysisController.getQualityTrend);
exports.default = router;
//# sourceMappingURL=analysis.routes.js.map