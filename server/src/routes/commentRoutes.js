import express from 'express';
import {
  setCommentEntity,
  setCommentCreateValidator,
  setCommentUpdateValidator,
  checkCommentAccess,
} from '../middleware/commentMiddleware.js';
import { validate } from '../middleware/ressourceMiddleware.js';
import {
  createComment,
  getAllCommentsByTask,
  updateComment,
  deleteComment,
} from '../controllers/commentController.js';

const router = express.Router({ mergeParams: true });

router.use(setCommentEntity);
// POST /task/:taskId/comments - Create a new comment for a task
router.post('/', setCommentCreateValidator, validate, createComment);

// GET /task/:taskId/comments - Get all comments for a specific task
router.get('/', getAllCommentsByTask);

// PUT /task/:taskId/comments/:commentId - Update a specific comment
router.patch('/:commentId', checkCommentAccess, setCommentUpdateValidator, validate, updateComment);

// DELETE /task/:taskId/comments/:commentId - Delete a specific comment
router.delete('/:commentId', checkCommentAccess, deleteComment);

export default router;
