// ============================================
// ROUTES - YOL TARİFLERİ
// ============================================
// Routes = Hangi URL hangi controller'a gidecek?
// Örnek: /health URL'i → HealthController.getHealth'e git

// Router = Express'in yönlendirme sistemi
import { Router } from 'express';

// HealthController'ı import et (az önce yazdığımız)
import { HealthController } from '../controllers/health.controller';

// router objesi oluştur
// Bu obje üzerinden tüm route'ları tanımlayacağız
const router = Router();

/**
 * API Routes - API Yolları
 */

// ==========================================
// GET /api/v1/
// ==========================================
// router.get() = GET isteğini dinle
// İlk parametre: URL path'i ('/' = ana sayfa)
// İkinci parametre: Çalışacak function (HealthController.getRoot)
// 
// Kullanıcı http://localhost:3000/api/v1/ adresine giderse
// HealthController.getRoot çalışır
router.get('/', HealthController.getRoot);

// ==========================================
// GET /api/v1/health
// ==========================================
// Kullanıcı http://localhost:3000/api/v1/health adresine giderse
// HealthController.getHealth çalışır
router.get('/health', HealthController.getHealth);

// router'ı dışa aktar (export)
// Böylece src/index.ts dosyasında kullanabiliriz
export default router;