import { Router } from 'express';
import { MetricsController } from '../controllers/metrics.controller';

const router = Router();

router.get('/metrics', MetricsController.getPrometheusMetrics);
router.get('/metrics/json', MetricsController.getMetricsJson);
router.get('/metrics/system', MetricsController.getSystemMetrics);

export default router;