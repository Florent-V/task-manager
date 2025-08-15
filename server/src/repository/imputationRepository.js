import Imputation from '../models/imputationModel.js';
import Task from '../models/taskModel.js';
import User from '../models/userModel.js';
import Kanban from '../models/kanbanModel.js';

/**
 * Calculates the sum of time spent for all imputations in a specific Kanban.
 * @param {string} kanbanId - The ID of the Kanban.
 * @returns {Promise<number>} The total sum of time spent.
 */
export async function sumImputationsTimeSpentByKanbanId(kanbanId) {
  const totalTimeSpent = await Imputation.sum('timeSpent', {
    include: [
      {
        model: Task,
        as: 'task',
        where: { kanbanId },
        attributes: [],
        required: true,
      },
    ],
  });
  return totalTimeSpent || 0;
}

/**
 * Finds and counts all imputations for a specific Kanban with pagination,
 * including details of the associated task and user.
 * @param {string} kanbanId - The ID of the Kanban.
 * @param {number} limit - The number of imputations per page.
 * @param {number} offset - The offset for pagination.
 * @returns {Promise<{rows: Imputation[], count: number}>} The imputations and total count.
 */
export function getImputationsByKanbanIdPaginated(kanbanId, limit, offset) {
  return Imputation.findAndCountAll({
    attributes: ['id', 'timeSpent', 'date', 'comment', 'userId', 'taskId'],
    include: [
      {
        model: Task,
        as: 'task',
        attributes: ['id', 'title', 'estimation', 'createdAt'],
        where: { kanbanId },
        required: true,
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
    limit,
    offset,
    distinct: true, // Necessary for correct count with includes that might create duplicates before distinct
    raw: true, // Convertit directement les résultats en objets simples
    nest: true, // Assure que les résultats sont imbriqués correctement
  });
}

/**
 * Retrieves all imputations for a user with nested task and kanban.
 * @param {object} imputationWhereClause - where clause for Imputation.
 * @returns {Promise<Imputation[]>}
 */
export function getImputationsForUserByWhereClause(imputationWhereClause) {
  return Imputation.findAll({
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
}

/**
 * Retrieves all imputations for a given task.
 * @param {string} taskId - The ID of the task.
 * @returns {Promise<Imputation[]>}
 */
export function getImputationsByTaskId(taskId) {
  return Imputation.findAll({
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
}
