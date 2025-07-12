import { Op } from 'sequelize';
import User from '../models/userModel.js';
import Imputation from '../models/imputationModel.js';
import logger from '../config/logger.js';
import UnauthorizedError from '../error/unauthorizedError.js';
import NotFoundError from '../error/notFoundError.js';
import {
  getTaskTimingSums,
  getTasksWithImputationsByKanban,
} from '../repository/taskRepository.js';
import { getPaginatedImputationsDetail } from '../services/imputationService.js';
import { getPaginatedTasksSummary } from '../services/taskService.js';
import {
  getImputationsForUserByWhereClause,
  getImputationsByTaskId,
} from '../repository/imputationRepository.js';
import { getKanbansWithUserImputations } from '../repository/kanbanRepository.js';

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
    console.log('## ERROR', error);
    next(error);
  }
}

export async function getDetailedImputationsForKanbanPaginated(req, res, next) {
  logger.debug('CTRL: getDetailedImputationsForKanbanPaginated');
  const { id: kanbanId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  try {
    res.data = await getPaginatedImputationsDetail(
      kanbanId,
      parseInt(page, 10),
      parseInt(limit, 10)
    );
    next();
  } catch (error) {
    next(error);
  }
}

export async function getImputationsForKanban(req, res, next) {
  logger.debug('getImputationsForKanban');
  const { id: kanbanId } = req.params;

  try {
    const tasks = await getTasksWithImputationsByKanban(kanbanId);

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

    const imputations = await getImputationsForUserByWhereClause(imputationWhereClause);
    const kanbans = await getKanbansWithUserImputations(imputationWhereClause, userId);

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
    const imputations = await getImputationsByTaskId(taskId);

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
