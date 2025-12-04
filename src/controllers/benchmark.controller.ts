import { Request, Response } from 'express';
import { Benchmark } from '../utils/benchmark';
import { TaskService } from '../services/task.service';
import { UserService } from '../services/user.service';

export class BenchmarkController {
  static getBenchmarkResults(_req: Request, res: Response): void {
    const results = Benchmark.getResults();
    res.json({
      success: true,
      data: results,
      count: results.length
    });
  }

  static getBenchmarkStats(req: Request, res: Response): void {
    const { operation } = req.query;
    const stats = Benchmark.getStats(operation as string);
    
    res.json({
      success: true,
      data: stats
    });
  }

  static async runPerformanceTest(_req: Request, res: Response): Promise<void> {
    try {
      const results = {
        taskOperations: await Benchmark.measureAsync('task_list_test', async () => {
          return await TaskService.getAllTasks({});
        }),
        userOperations: await Benchmark.measureAsync('user_list_test', async () => {
          return await UserService.listUsers();
        }),
        systemInfo: Benchmark.measure('system_info_test', () => {
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
          tasks: Benchmark.getStats('task_list_test'),
          users: Benchmark.getStats('user_list_test'),
          system: Benchmark.getStats('system_info_test')
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}