import { Router } from 'express';
import { BenchmarkController } from '../controllers/benchmark.controller';

const router = Router();

router.get('/benchmark/results', BenchmarkController.getBenchmarkResults);
router.get('/benchmark/stats', BenchmarkController.getBenchmarkStats);
router.post('/benchmark/test', BenchmarkController.runPerformanceTest);

export default router;