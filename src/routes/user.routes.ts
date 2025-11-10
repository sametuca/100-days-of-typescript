import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import {
  updateProfileSchema,
  changePasswordSchema,
  deleteAccountSchema
} from '../validation/user.validation';
import { validateBody } from '../middleware/validate.middleware';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '@/types';

const router = Router();

router.use(authenticate);
router.get('/', authorize(UserRole.ADMIN), UserController.listUsers);
router.get('/profile', UserController.getProfile);
router.put('/profile', validateBody(updateProfileSchema), UserController.updateProfile);
router.put('/password', validateBody(changePasswordSchema), UserController.changePassword);
router.delete('/account', validateBody(deleteAccountSchema), UserController.deleteAccount);

export default router;