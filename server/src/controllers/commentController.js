import Comment from '../models/commentModel.js';
import NotFoundError from '../error/notFoundError.js';

// Création d'une nouvelle tâche
export const createComment = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    console.log("taskId: ", taskId);
    const authorId = req.user.id;
    console.log("authorId: ", authorId);
    const { title, content } = req.body;
    console.log("title: ", title);
    console.log("content: ", content);

    const newComment = await Comment.create({
      title,
      content,
      taskId,
      authorId
    });

    const createdComment = await Comment.findByPk(newComment.id);

    res.statusCode = 201;
    res.data = { comment: createdComment };

    next();
  } catch (error) {
    return next(error);
  }
};

// Récupération de toutes les tâches d'un kanban
export const getAllCommentsByTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    res.data = {
      comments: await Comment.findAll({ where: { taskId } })
    };

    next();
  } catch (error) {
    return next(error);
  }
};

// Mise à jour d'un comment
export const updateComment = async (req, res, next) => {
  try {
    const { taskId, commentId } = req.params;
    const { title, content, authorId } = req.body;

    const [updated] = await Comment.update(
      { title, content, taskId, authorId },
      { where: { id: commentId } }
    );

    if (!updated) throw new NotFoundError('Comment not found.');

    const updatedComment = await Comment.findByPk(commentId);

    res.data = { comment: updatedComment };
    next();
  } catch (error) {
    return next(error);
  }
};

// Suppression d'une tâche
export const deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const deleted = await Comment.destroy({ where: { id: commentId } });

    if (!deleted) throw new NotFoundError('Comment not found.');

    res.statusCode = 204;
    next();
  } catch (error) {
    return next(error);
  }
};