import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { registerSchema } from '../validation/user.validation';
import { validateBody } from '../middleware/validate.middleware';
import { loginSchema } from '../validation/user.validation';
const router = Router();
router.post('/login', validateBody(loginSchema), AuthController.login);
router.post('/register', validateBody(registerSchema), AuthController.register);

export default router;