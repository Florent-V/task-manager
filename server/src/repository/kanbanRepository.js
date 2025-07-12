import Kanban from '../models/kanbanModel.js';
import Task from '../models/taskModel.js';
import Imputation from '../models/imputationModel.js';
import User from '../models/userModel.js';

/**
 * Retrieves all Kanbans with user-specific imputations and nested tasks.
 * @param {object} imputationWhereClause - The where clause for filtering imputations.
 * @param {string} userId - The ID of the user for nested filter.
 * @returns {Promise<Kanban[]>}
 */
export function getKanbansWithUserImputations(imputationWhereClause, userId) {
  return Kanban.findAll({
    attributes: ['id', 'title'],
    include: [
      {
        model: Task,
        as: 'tasks',
        attributes: ['id', 'title', 'estimation'],
        required: true,
        include: [
          {
            model: Imputation,
            as: 'imputations',
            attributes: ['id', 'date', 'timeSpent', 'comment'],
            where: imputationWhereClause,
            required: true,
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'firstName', 'lastName', 'email'],
                where: { id: userId },
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
      [{ model: Task, as: 'tasks' }, { model: Imputation, as: 'imputations' }, 'createdAt', 'DESC'],
    ],
  });
}
