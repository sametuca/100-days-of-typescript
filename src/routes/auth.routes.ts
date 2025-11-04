import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { registerSchema } from '../validation/user.validation';
import { validateBody } from '../middleware/validate.middleware';

const router = Router();

router.post('/register', validateBody(registerSchema), AuthController.register);

export default router;