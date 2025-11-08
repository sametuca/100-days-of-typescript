import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validation/user.validation';
import { validateBody } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', validateBody(registerSchema), AuthController.register);
router.post('/login', validateBody(loginSchema), AuthController.login);
router.post('/refresh', validateBody(refreshTokenSchema), AuthController.refreshToken);
router.post('/logout', validateBody(refreshTokenSchema), AuthController.logout);
router.post('/logout-all', authenticate, AuthController.logoutAll);

export default router;