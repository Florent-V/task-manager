import express from 'express';
import {
  setCommentEntity,
  setCommentCreateValidator,
  setCommentUpdateValidator, isCommentInTask
} from '../middleware/commentMiddleware.js';
import { validate } from '../middleware/ressourceMiddleware.js';
import {
  createComment,
  getAllCommentsByTask,
  updateComment,
  deleteComment
} from '../controllers/commentController.js';

const router = express.Router({ mergeParams: true });

router.post('/', setCommentCreateValidator, validate, createComment);

router.get('/', getAllCommentsByTask);

router.use('/:commentId', isCommentInTask);
// router.get('/:taskId', getTaskById);
router.patch('/:commentId', setCommentUpdateValidator, validate, updateComment);
router.delete('/:commentId', deleteComment);

export default router;