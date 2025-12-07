"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const testing_controller_1 = require("../controllers/testing.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware.authenticate);
const testingRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: 'Too many testing requests, please try again later'
});
router.post('/generate', testingRateLimit, testing_controller_1.TestingController.generateTests);
router.post('/generate/bulk', testingRateLimit, testing_controller_1.TestingController.generateBulkTests);
router.post('/generate/integration', testing_controller_1.TestingController.generateIntegrationTests);
router.post('/generate/e2e', testing_controller_1.TestingController.generateE2ETests);
router.get('/coverage', testing_controller_1.TestingController.analyzeCoverage);
router.get('/coverage/history', testing_controller_1.TestingController.getCoverageHistory);
router.get('/coverage/trend', testing_controller_1.TestingController.getCoverageTrend);
router.post('/quality-gates', testing_controller_1.TestingController.createQualityGate);
router.get('/quality-gates', testing_controller_1.TestingController.getQualityGates);
router.get('/quality-gates/default', testing_controller_1.TestingController.getDefaultQualityGate);
router.post('/quality-gates/:gateId/evaluate', testing_controller_1.TestingController.evaluateQualityGate);
exports.default = router;
//# sourceMappingURL=testing.routes.js.map