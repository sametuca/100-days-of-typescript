import { Router } from 'express';
import { VersionController } from '../controllers/version.controller';

const router = Router();

router.get('/versions', VersionController.getVersionInfo);
router.get('/versions/:version', VersionController.getVersionStatus);

export default router;