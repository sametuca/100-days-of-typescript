"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceController = void 0;
const performance_monitor_service_1 = require("../services/performance-monitor.service");
const bottleneck_detector_service_1 = require("../services/bottleneck-detector.service");
const optimization_service_1 = require("../services/optimization.service");
const logger_1 = __importDefault(require("../utils/logger"));
class PerformanceController {
    static async getMetrics(req, res) {
        try {
            const minutes = req.query.minutes ? parseInt(req.query.minutes) : 60;
            const metrics = performance_monitor_service_1.PerformanceMonitorService.getMetrics(minutes);
            res.json({
                success: true,
                data: metrics
            });
        }
        catch (error) {
            logger_1.default.error('Performance metrics retrieval failed:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve performance metrics',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async getAPIPerformance(req, res) {
        try {
            const endpoint = req.query.endpoint;
            const minutes = req.query.minutes ? parseInt(req.query.minutes) : 60;
            const performance = performance_monitor_service_1.PerformanceMonitorService.getAPIPerformance(endpoint, minutes);
            res.json({
                success: true,
                data: performance
            });
        }
        catch (error) {
            logger_1.default.error('API performance retrieval failed:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve API performance data',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async detectBottlenecks(_req, res) {
        try {
            const bottlenecks = bottleneck_detector_service_1.BottleneckDetectorService.detectBottlenecks();
            logger_1.default.info(`Bottleneck detection completed, found ${bottlenecks.length} new issues`);
            res.json({
                success: true,
                data: bottlenecks
            });
        }
        catch (error) {
            logger_1.default.error('Bottleneck detection failed:', error);
            res.status(500).json({
                success: false,
                message: 'Bottleneck detection failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async getActiveAlerts(_req, res) {
        try {
            const alerts = bottleneck_detector_service_1.BottleneckDetectorService.getActiveAlerts();
            res.json({
                success: true,
                data: alerts
            });
        }
        catch (error) {
            logger_1.default.error('Active alerts retrieval failed:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve active alerts',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async generateOptimizations(_req, res) {
        try {
            const suggestions = optimization_service_1.OptimizationService.generateSuggestions();
            logger_1.default.info(`Generated ${suggestions.length} optimization suggestions`);
            res.json({
                success: true,
                data: suggestions
            });
        }
        catch (error) {
            logger_1.default.error('Optimization generation failed:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate optimizations',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async getOptimizations(req, res) {
        try {
            const category = req.query.category;
            const suggestions = optimization_service_1.OptimizationService.getSuggestions(category);
            res.json({
                success: true,
                data: suggestions
            });
        }
        catch (error) {
            logger_1.default.error('Optimizations retrieval failed:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve optimizations',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async generateReport(req, res) {
        try {
            const hours = req.query.hours ? parseInt(req.query.hours) : 24;
            const report = optimization_service_1.OptimizationService.generatePerformanceReport(hours);
            logger_1.default.info(`Performance report generated for ${hours} hours`);
            res.json({
                success: true,
                data: report
            });
        }
        catch (error) {
            logger_1.default.error('Performance report generation failed:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate performance report',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}
exports.PerformanceController = PerformanceController;
//# sourceMappingURL=performance.controller.js.map