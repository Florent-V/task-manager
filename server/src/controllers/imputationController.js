import User from '../models/userModel.js';
import Imputation from '../models/imputationModel.js';
import Task from '../models/taskModel.js';
import Kanban from '../models/kanbanModel.js';
import logger from '../config/logger.js';
import UnauthorizedError from '../error/unauthorizedError.js';
import NotFoundError from '../error/notFoundError.js';

export async function createImputation(req, res, next) {
  logger.debug('createImputation');
  const { taskId } = req.params;
  const { timeSpent, comment, date } = req.body;
  const userId = req.user.id;

  try {
    const newImputation = await Imputation.create({
      taskId,
      userId,
      timeSpent,
      comment: comment || null,
      date: date || new Date(), // Or allow user to specify date? For now, current date.
    });

    res.statusCode = 201;
    res.data = { imputation: newImputation };

    next();
  } catch (error) {
    next(error);
  }
}

export async function getImputationsForKanban(req, res, next) {
  logger.debug('getImputationsForKanban');
  const { id: kanbanId } = req.params;

  try {
    const tasks = await Task.findAll({
      attributes: ['id', 'title', 'estimation'],
      include: [
        {
          model: Kanban,
          as: 'kanban',
          attributes: ['id', 'title'],
        },
        {
          model: Imputation,
          as: 'imputations',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName', 'email'],
            },
          ],
        },
      ],
      where: {
        kanbanId: kanbanId, // Filtre principal sur l'ID du Kanban
      },
      order: [
        ['id', 'ASC'], // Trie par l'ID de la tâche
        [{ model: Imputation, as: 'imputations' }, 'date', 'DESC'], // Puis par la date d'imputation
        [{ model: Imputation, as: 'imputations' }, 'createdAt', 'DESC'], // Enfin par la date de création
      ],
    });

    res.data = { tasks };
    next();
  } catch (error) {
    next(error);
  }
}

export async function getImputationsForUser(req, res, next) {
  logger.debug('getImputationsForUser');
  // User has to be logged in
  const userId = req.user.id;
  if (!userId) {
    logger.warn('User not authenticated for imputation access.');
    throw new UnauthorizedError('You must be logged in to access this resource.');
  }

  try {
    const includeTaskClause = {
      model: Task,
      as: 'task',
      attributes: ['id', 'title', 'estimation', 'kanbanId'],
      include: [
        {
          model: Kanban,
          as: 'kanban',
          attributes: ['id', 'title'],
        },
      ],
    };

    const imputations = await Imputation.findAll({
      where: { userId: req.user.id }, // Assure-toi que l'ID de l'utilisateur est disponible dans req.user.id
      include: [
        includeTaskClause,
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
      order: [
        [{ model: Task, as: 'task' }, 'id', 'ASC'],
        ['date', 'DESC'],
        ['createdAt', 'DESC'],
      ],
    });

    const kanbans = await Kanban.findAll({
      attributes: ['id', 'title'],
      include: [
        {
          model: Task,
          as: 'tasks',
          attributes: ['id', 'title', 'estimation'],
          include: [
            {
              model: Imputation,
              as: 'imputations',
              attributes: ['id', 'date', 'timeSpent', 'comment'],
              include: [
                {
                  model: User,
                  as: 'user',
                  attributes: ['id', 'firstName', 'lastName', 'email'],
                  where: { id: req.user.id },
                },
                {
                  model: Task,
                  as: 'task',
                  attributes: ['id', 'title'],
                },
              ],
            },
          ],
        },
      ],
      order: [
        ['id', 'ASC'],
        [{ model: Task, as: 'tasks' }, 'id', 'ASC'],
        [{ model: Task, as: 'tasks' }, { model: Imputation, as: 'imputations' }, 'date', 'DESC'],
        [
          { model: Task, as: 'tasks' },
          { model: Imputation, as: 'imputations' },
          'createdAt',
          'DESC',
        ],
      ],
    });

    res.data = { imputations, kanbans };

    next();
  } catch (error) {
    next(error);
  }
}

export async function getImputationsForTask(req, res, next) {
  logger.debug('getImputationsForTask');
  const { taskId } = req.params;
  try {
    const imputations = await Imputation.findAll({
      where: { taskId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
      order: [
        ['date', 'DESC'],
        ['createdAt', 'DESC'],
      ],
    });

    res.data = { imputations };

    next();
  } catch (error) {
    next(error);
  }
}

export async function updateImputation(req, res, next) {
  logger.debug('updateImputation');
  const { taskId, imputationId } = req.params;
  const { timeSpent, comment, date } = req.body;

  try {
    const [updated] = await Imputation.update(
      { timeSpent, comment, date },
      { where: { id: imputationId, taskId } }
    );

    if (!updated) {
      throw new NotFoundError(`Imputation with ID ${imputationId} not found for task ${taskId}.`);
    }

    const updatedImputation = await Imputation.findOne({
      where: { id: imputationId, taskId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
    });

    res.data = { imputation: updatedImputation };
    next();
  } catch (error) {
    next(error);
  }
}

export async function deleteImputation(req, res, next) {
  logger.debug('deleteImputation');
  const { taskId, imputationId } = req.params;

  try {
    const deleted = await Imputation.destroy({
      where: { id: imputationId, taskId },
    });

    if (!deleted) {
      throw new NotFoundError(`Imputation with ID ${imputationId} not found for task ${taskId}.`);
    }

    res.status(204);
    next();
  } catch (error) {
    next(error);
  }
}
