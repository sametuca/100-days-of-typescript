import { Router } from 'express';
import { MigrationController } from '../controllers/migration.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../types';

const router = Router();

router.get('/migrations/status', authenticate, authorize(UserRole.ADMIN), MigrationController.getMigrationStatus);
router.post('/migrations/run', authenticate, authorize(UserRole.ADMIN), MigrationController.runMigrations);
router.post('/migrations/rollback', authenticate, authorize(UserRole.ADMIN), MigrationController.rollbackMigrations);

export default router;