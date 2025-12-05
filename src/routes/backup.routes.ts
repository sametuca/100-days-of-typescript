import { Router } from 'express';
import { BackupController } from '../controllers/backup.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../types';

const router = Router();
const backupController = new BackupController();

// Tüm backup route'ları admin yetkisi gerektirir
router.use(authenticate);
router.use(authorize(UserRole.ADMIN));

/**
 * @swagger
 * /api/backup:
 *   post:
 *     summary: Yeni yedek oluştur
 *     tags: [Backup]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Yedek başarıyla oluşturuldu
 *       500:
 *         description: Sunucu hatası
 */
router.post('/', backupController.createBackup);

/**
 * @swagger
 * /api/backup:
 *   get:
 *     summary: Tüm yedekleri listele
 *     tags: [Backup]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Yedekler başarıyla listelendi
 */
router.get('/', backupController.listBackups);

/**
 * @swagger
 * /api/backup/status:
 *   get:
 *     summary: Yedekleme durumunu getir
 *     tags: [Backup]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Yedekleme durumu
 */
router.get('/status', backupController.getBackupStatus);

/**
 * @swagger
 * /api/backup/{backupId}/restore:
 *   post:
 *     summary: Yedeği geri yükle
 *     tags: [Backup]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: backupId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Yedek başarıyla geri yüklendi
 *       404:
 *         description: Yedek bulunamadı
 */
router.post('/:backupId/restore', backupController.restoreBackup);

/**
 * @swagger
 * /api/backup/{backupId}/verify:
 *   get:
 *     summary: Yedeği doğrula
 *     tags: [Backup]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: backupId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Yedek doğrulama sonucu
 */
router.get('/:backupId/verify', backupController.verifyBackup);

/**
 * @swagger
 * /api/backup/{backupId}:
 *   delete:
 *     summary: Yedeği sil
 *     tags: [Backup]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: backupId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Yedek başarıyla silindi
 *       404:
 *         description: Yedek bulunamadı
 */
router.delete('/:backupId', backupController.deleteBackup);

export default router;