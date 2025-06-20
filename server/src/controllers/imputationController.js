import User from '../models/userModel.js';
import Imputation from '../models/imputationModel.js';
import Task from '../models/taskModel.js';
import Kanban from '../models/kanbanModel.js';
import NotFoundError from '../error/notFoundError.js';
import logger from '../config/logger.js';

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
  const { kanbanId } = req.params;

  try {
    const imputations = await Imputation.findAll({
      include: [
        {
          model: Task,
          as: 'task',
          attributes: ['id', 'title', 'estimation'],
          include: [
            {
              model: Kanban,
              as: 'kanban',
              attributes: [], // Per requirement "only to filter", though main filter is now top-level
              // No 'where' here as the main filtering is '$task.kanbanId$'
            },
          ],
          required: true, // Ensures only imputations with tasks that could match the where clause are returned
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
      where: {
        '$task.kanbanId$': kanbanId, // Main filter on Task.kanbanId as per requirement
      },
      order: [
        [{ model: Task, as: 'task' }, 'id', 'ASC'], // Order by task id
        ['date', 'DESC'], // Then by imputation date
        ['createdAt', 'DESC'],
      ],
    });

    res.data = { imputations };
    next();
  } catch (error) {
    next(error);
  }
}

export async function getImputationsForUser(req, res, next) {
  logger.debug('getImputationsForUser');
  const { userId } = req.params;
  const { kanbanId } = req.query; // Get kanbanId from query parameters

  try {
    const whereClause = { userId: userId }; // Main where for Imputation model

    const includeTaskClause = {
      model: Task,
      as: 'task',
      attributes: ['id', 'title', 'estimation', 'kanbanId'], // Ensure kanbanId is available if needed directly on task
      include: [{
        model: Kanban,
        as: 'kanban',
        attributes: ['id', 'title'],
      }],
    };

    // If kanbanId is provided in the query, add a filter to the Task include
    if (kanbanId) {
      // The Task model itself must have a 'kanbanId' field for this to work directly.
      // If the association is purely through the Kanban model, the where should be on the included Kanban model.
      // Assuming Task has a direct kanbanId foreign key.
      includeTaskClause.where = { kanbanId: kanbanId };
      includeTaskClause.required = true; // Make this an INNER JOIN condition for the task's Kanban
    }

    const imputations = await Imputation.findAll({
      where: whereClause,
      include: [
        includeTaskClause,
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
      order: [
        // Order by Task ID, then by imputation date
        // Accessing nested model for ordering: [{ model: Task, as: 'task' }, 'id', 'ASC']
        [{ model: Task, as: 'task' }, 'id', 'ASC'],
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
// Note: The original file did not have an explicit module.exports,
// it relied on ES6 exports. The functions are already exported.
// No changes needed to module.exports unless the file structure was different.

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
