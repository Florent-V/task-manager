import sequelize from "../database/connect.js";
import { QueryTypes } from 'sequelize';
import Imputation from '../models/imputationModel.js';
import Task from '../models/taskModel.js';
import User from '../models/userModel.js';


/**
 * Retrieves the sum of estimated and imputed times for tasks in a specific Kanban.
 *
 * @param {string} kanbanId - The ID of the Kanban for which to retrieve task timing sums.
 * @returns {Promise<{tasksTotalEstimatedTime: number, tasksTotalImputedTime: number}>} A promise that resolves to an object containing the sums of estimated and imputed times.
 */
export async function getTaskTimingSums(kanbanId) {
  const result = await sequelize.query(
    `
    SELECT
      SUM(t.estimation) AS tasksTotalEstimatedTime,
      COALESCE(SUM(i.timeSpent), 0) AS tasksTotalImputedTime
    FROM
      task t
    LEFT JOIN
      imputation i ON t.id = i.taskId AND i.taskId IS NOT NULL
    WHERE
      t.kanbanId = :kanbanId
    `,
    {
      replacements: { kanbanId },
      type: QueryTypes.SELECT
    }
  );
  return result[0];
}


/**
 * Retrieves paginated tasks associated with a specific Kanban ID.
 *
 * @param {string} kanbanId - The ID of the Kanban for which to retrieve tasks.
 * @param {number} limit - The maximum number of tasks to retrieve.
 * @param {number} offset - The number of tasks to skip before starting to collect the result set
 * @returns {Promise<{rows: Task[], count: number}>} The tasks and total count.
 */
export function getTasksByKanbanIdPaginated(kanbanId, limit, offset) {
  return Task.findAndCountAll({
    attributes: ['id', 'title', 'estimation', 'createdAt'],
    where: { kanbanId },
    include: [
      {
        model: Imputation,
        as: 'imputations',
        attributes: ['id', 'timeSpent', 'date', 'comment', 'userId'], // Specify needed fields
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email'], // Specify needed fields
          },
        ],
      },
    ],
    order: [['createdAt', 'DESC']],
    limit,
    offset,
    distinct: true, // Necessary for correct count with includes that might create duplicates before distinct
    // subQuery: false, // May be needed depending on the complexity and if `distinct` alone doesn't solve count issues with Sequelize. Test first.
  });
}
