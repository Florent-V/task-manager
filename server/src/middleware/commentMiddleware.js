import Comment from '../models/commentModel.js';
import { commentSchema, updateCommentSchema } from '../joiSchema/commentSchema.js';
import Task from '../models/taskModel.js';
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