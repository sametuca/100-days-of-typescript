import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import {
  updateProfileSchema,
  changePasswordSchema,
  deleteAccountSchema
} from '../validation/user.validation';
import { validateBody } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/profile', UserController.getProfile);
router.put('/profile', validateBody(updateProfileSchema), UserController.updateProfile);
router.put('/password', validateBody(changePasswordSchema), UserController.changePassword);
router.delete('/account', validateBody(deleteAccountSchema), UserController.deleteAccount);

export default router;