// ============================================
// MAIN ROUTES
// ============================================
// Tüm route'ları burada birleştiriyoruz

import { Router } from 'express';

// Controller'ları import et
import { HealthController } from '../controllers/health.controller';

// Task routes'unu import et
import taskRoutes from './task.routes';

// Ana router'ı oluştur
const router = Router();

/**
 * API ROUTES
 */

// ==========================================
// ROOT & HEALTH ROUTES
// ==========================================
// GET /api/v1/
router.get('/', HealthController.getRoot);

// GET /api/v1/health
router.get('/health', HealthController.getHealth);

// ==========================================
// TASK ROUTES
// ==========================================
// '/tasks' = Tüm task route'ları /tasks ile başlayacak
// taskRoutes = task.routes.ts'deki tüm route'lar
// 
// Sonuç:
// GET /api/v1/tasks → TaskController.getAllTasks
// GET /api/v1/tasks/:id → TaskController.getTaskById
// POST /api/v1/tasks → TaskController.createTask
router.use('/tasks', taskRoutes);

// Router'ı dışa aktar
export default router;