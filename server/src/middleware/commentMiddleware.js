import { commentSchema, updateCommentSchema } from '../joiSchema/commentSchema.js';
import Comment from '../models/commentModel.js';
import logger from '../config/logger.js';
import UnauthorizedError from '../error/unauthorizedError.js';
import NotFoundError from '../error/notFoundError.js';

export const setCommentEntity = (req, res, next) => {
  req.entity = Comment;
  next();
};

export const setCommentCreateValidator = (req, res, next) => {
  req.schema = commentSchema;
  next();
};

export const setCommentUpdateValidator = (req, res, next) => {
  req.schema = updateCommentSchema;
  next();
};

export const isCommentInTask = async (req, res, next) => {
  try {
    const { taskId, commentId } = req.params;

    const comment = await Comment.findOne({ where: { id: commentId, taskId: taskId } });

    if (!comment) throw new NotFoundError('Comment not found in this Task.');

    req.comment = comment;
    next();
  } catch (error) {
    return next(error);
  }
};

export const checkCommentAccess = async (req, res, next) => {
  try {
    if (!req.user) {
      logger.warn('User not authenticated for imputation access.');
      throw new UnauthorizedError('You must be logged in to access this resource.');
    }
    const { taskId, commentId } = req.params;
    const userId = req.user.id;

    req.comment = await Comment.findOne({ where: { id: commentId, taskId } });
    if (!req.comment) {
      logger.warn(
        `User ${userId} attempted to access non-existent comment ${commentId} for task ${taskId}.`
      );
      throw new NotFoundError(`Comment with ID ${commentId} not found for task ${taskId}.`);
    }

    if (req.comment.authorId !== userId) {
      logger.warn(`User ${userId} attempted to access comment ${commentId} not owned by them.`);
      throw new UnauthorizedError('You do not have permission to access this comment.');
    }

    logger.info(
      `User ${req.user.id} attempting to access/modify comment. Basic auth check passed.`
    );

    next();
  } catch (error) {
    return next(error);
  }
};
