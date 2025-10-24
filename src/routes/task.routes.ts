// Express Router'ı import et
import { Router } from 'express';

// Task controller'ı import et
import { TaskController } from '../controllers/task.controller';

// Yeni router oluştur
const router = Router();

/**
 * TASK ROUTES
 */

// ==========================================
// GET /api/v1/tasks
// ==========================================
// Tüm taskları listele
// router.get() = GET isteğini dinle
// '/' = Bu route'un path'i
// TaskController.getAllTasks = Çalışacak method
router.get('/', TaskController.getAllTasks);

// ==========================================
// GET /api/v1/tasks/:id
// ==========================================
// Tek task getir
// ':id' = URL parametresi (dinamik değer)
// Örnek: /tasks/1, /tasks/abc123
// req.params.id ile erişilebilir
router.get('/:id', TaskController.getTaskById);

// ==========================================
// POST /api/v1/tasks
// ==========================================
// Yeni task oluştur
// router.post() = POST isteğini dinle
// Body'de JSON veri beklenir
router.post('/', TaskController.createTask);

// Router'ı dışa aktar
export default router;