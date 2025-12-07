"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BenchmarkController = void 0;
const benchmark_1 = require("../utils/benchmark");
const task_service_1 = require("../services/task.service");
const user_service_1 = require("../services/user.service");
class BenchmarkController {
    static getBenchmarkResults(_req, res) {
        const results = benchmark_1.Benchmark.getResults();
        res.json({
            success: true,
            data: results,
            count: results.length
        });
    }
    static getBenchmarkStats(req, res) {
        const { operation } = req.query;
        const stats = benchmark_1.Benchmark.getStats(operation);
        res.json({
            success: true,
            data: stats
        });
    }
    static async runPerformanceTest(_req, res) {
        try {
            const results = {
                taskOperations: await benchmark_1.Benchmark.measureAsync('task_list_test', async () => {
                    return await task_service_1.TaskService.getAllTasks({});
                }),
                userOperations: await benchmark_1.Benchmark.measureAsync('user_list_test', async () => {
                    return await user_service_1.UserService.listUsers();
                }),
                systemInfo: benchmark_1.Benchmark.measure('system_info_test', () => {
                    return {
                        memory: process.memoryUsage(),
                        uptime: process.uptime(),
                        cpu: process.cpuUsage()
                    };
                })
            };
            res.json({
                success: true,
                message: 'Performance test completed',
                data: results,
                stats: {
                    tasks: benchmark_1.Benchmark.getStats('task_list_test'),
                    users: benchmark_1.Benchmark.getStats('user_list_test'),
                    system: benchmark_1.Benchmark.getStats('system_info_test')
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}
exports.BenchmarkController = BenchmarkController;
//# sourceMappingURL=benchmark.controller.js.map