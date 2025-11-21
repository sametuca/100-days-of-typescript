import { Router } from 'express';
import { CommentController } from '../controllers/comment.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.put('/:id', CommentController.updateComment);
router.delete('/:id', CommentController.deleteComment);

export default router;
