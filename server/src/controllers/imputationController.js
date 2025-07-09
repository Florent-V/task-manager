import { Op } from 'sequelize';
import User from '../models/userModel.js';
import Imputation from '../models/imputationModel.js';
import Task from '../models/taskModel.js';
import Kanban from '../models/kanbanModel.js';
import logger from '../config/logger.js';
import UnauthorizedError from '../error/unauthorizedError.js';
import NotFoundError from '../error/notFoundError.js';
import { getTaskTimingSums } from "../repository/taskRepository.js";
import { getPaginatedImputationsDetail } from "../services/imputationService.js";
import { getPaginatedTasksSummary } from "../services/taskService.js";

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
      date: date || new Date(),
    });

    res.statusCode = 201;
    res.data = { imputation: newImputation };

    next();
  } catch (error) {
    next(error);
  }
}

export async function getKanbanImputationTotals(req, res, next) {
  logger.debug('getKanbanImputationTotals');
  const { id: kanbanId } = req.params;

  try {
    res.data = await getTaskTimingSums(kanbanId);
    next();
  } catch (error) {
    next(error);
  }
}

export async function getTasksSummaryForKanbanPaginated(req, res, next) {
  logger.debug('CTRL: getTasksSummaryForKanbanPaginated');
  const { id: kanbanId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  try {
    res.data = await getPaginatedTasksSummary(kanbanId, parseInt(page, 10), parseInt(limit, 10));
    next();
  } catch (error) {
    console.log("## ERROR", error);
    next(error);
  }
}

export async function oldgetTasksSummaryForKanbanPaginated(req, res, next) {
  logger.debug('getTasksSummaryForKanbanPaginated');
  const { id: kanbanId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

  try {
    const tasksData = await Task.findAndCountAll({
      attributes: ['id', 'title', 'estimation', 'createdAt'],
      where: { kanbanId },
      include: [
        {
          model: Imputation,
          as: 'imputations',
          attributes: ['id', 'timeSpent', 'date', 'comment', 'userId'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName', 'email'],
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit, 10),
      offset,
      distinct: true, // Important for correct count with includes
    });

    res.data = { rows: tasksData.rows, count: tasksData.count };
    next();
  } catch (error) {
    next(error);
  }
}

export async function getDetailedImputationsForKanbanPaginated(req, res, next) {
  logger.debug('CTRL: getDetailedImputationsForKanbanPaginated');
  const { id: kanbanId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  try {
    res.data = await getPaginatedImputationsDetail(kanbanId, parseInt(page, 10), parseInt(limit, 10));
    next();
  } catch (error) {
    next(error);
  }
}

export async function oldgetDetailedImputationsForKanbanPaginated(req, res, next) {
  logger.debug('getDetailedImputationsForKanbanPaginated');
  const { id: kanbanId } = req.params; // kanbanId is passed as 'id' from the route
  const { page = 1, limit = 10 } = req.query;
  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

  try {
    const imputationsData = await Imputation.findAndCountAll({
      attributes: ['id', 'timeSpent', 'date', 'comment', 'userId', 'taskId'],
      include: [
        {
          model: Task,
          as: 'task',
          attributes: ['id', 'title', 'estimation', 'createdAt'], // Include task attributes needed by frontend
          where: { kanbanId }, // Filter by kanbanId through the Task model
          required: true, // Ensures only imputations from tasks in this kanban are fetched
        },
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
      limit: parseInt(limit, 10),
      offset,
      distinct: true, // Important for correct count with includes
    });
    res.data = { rows: imputationsData.rows, count: imputationsData.count };
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

  const { startDate, endDate } = req.query;
  logger.debug(
    `Fetching imputations for user ${userId} with startDate: ${startDate}, endDate: ${endDate}`
  );

  try {
    // Base where clause for imputations
    const imputationWhereClause = {
      userId: req.user.id, // Ensure we only get imputations for the logged-in user
    };

    // Liste des paramètres de date à vérifier
    const dateParams = [
      { param: startDate, operator: Op.gte },
      { param: endDate, operator: Op.lte },
    ];
    // Filtrer les paramètres définis et construire l'objet date
    const dateConditions = dateParams.reduce((acc, { param, operator }) => {
      if (param) {
        acc[operator] = new Date(param);
      }
      return acc;
    }, {});
    // Ajouter les conditions de date à l'objet principal si nécessaire
    if (Object.getOwnPropertySymbols(dateConditions).length > 0) {
      imputationWhereClause.date = dateConditions;
    }

    const imputations = await Imputation.findAll({
      where: imputationWhereClause,
      include: [
        {
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
        },
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
          required: true, // Assure que seules les tâches avec des imputations sont incluses
          include: [
            {
              model: Imputation,
              as: 'imputations',
              attributes: ['id', 'date', 'timeSpent', 'comment'],
              where: imputationWhereClause, // Apply date and user filter here
              required: true, // Assure que seules les tâches avec des imputations sont incluses
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
