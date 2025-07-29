import sequelize from '../database/connect.js';
import { Op } from 'sequelize';
import { QueryTypes } from 'sequelize';
import Imputation from '../models/imputationModel.js';
import Task from '../models/taskModel.js';
import User from '../models/userModel.js';
import Kanban from '../models/kanbanModel.js';
import Comment from "../models/commentModel.js";

/**
 * @typedef {{
 *    title: string;
 *    description: string;
 *    estimation: number;
 *    priorityId: number;
 *    sizeId: number;
 *    stageId: number;
 *    assignedToId: number;
 *    kanbanId: number;
 * }} TaskData
 */

export const includeTask = [
  {
    model: Comment,
    as: 'comments',
  },
  {
    model: Imputation,
    as: 'imputations',
    include: [
      {
        model: User,
        as: 'user', // Must match the alias defined in relations
        attributes: ['id', 'firstName', 'lastName', 'email'], // Specify user attributes to return
      },
    ],
    order: [
      ['date', 'DESC'],
      ['createdAt', 'DESC'],
    ],
  },
  {
    model: Kanban,
    as: 'kanban',
    attributes: ['id', 'title'],
  },
];

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
      type: QueryTypes.SELECT,
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

/**
 * Retrieves all tasks associated with a specific Kanban ID.
 *
 * @param {string} kanbanId - The ID of the Kanban for which to retrieve tasks.
 * @returns {Promise<Task[]>} The tasks associated with the Kanban.
 */
export function getTasksWithImputationsByKanban(kanbanId) {
  return Task.findAll({
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
}

/**
 * Creates a new task.
 *
 * @param {TaskData} taskData - The data needed to create the task.
 * @returns {Promise<Object>} The newly created task object.
 * @throws {Error} Throws an error if the creation of the task fails.
 */
export const createTask = (taskData) => {
  return Task.create(taskData);
};

/**
 * Retrieves all tasks for a given Kanban ID, with optional search filtering.
 *
 * @param {string} kanbanId - The ID of the Kanban whose tasks are to be retrieved.
 * @param {string} [search] - Optional search term to filter tasks by title or description.
 * @returns {Promise<Array>} A list of tasks associated with the Kanban.
 * @throws {Error} Throws an error if the retrieval fails.
 */
export const getTasksByKanban = (kanbanId, search) => {

  const whereCondition = {
    [Op.and]: [
      search
        ? {
          [Op.or]: [
            { title: { [Op.like]: `%${search}%` } },
            { description: { [Op.like]: `%${search}%` } },
          ],
        }
        : {},
    ],
  };

  return Task.findAll({
    where: whereCondition,
    include: includeTask,
  });
};

/**
 * Retrieves a task by its ID.
 *
 * @param {string} taskId - The ID of the task to retrieve.
 * @returns {Promise<Object|null>} The task object if found, otherwise null.
 * @throws {Error} Throws an error if the retrieval fails.
 */
export const getTaskById = (taskId) => {
  return Task.findByPk(taskId, { include: includeTask });
};

/**
 * Updates a task.
 *
 * @param {string} taskId - The ID of the task to update.
 * @param {Object} taskData - The data to update the task with.
 * @returns {Promise<Object>} The updated task object.
 * @throws {Error} Throws an error if the update fails.
 */
export const updateTask = async (taskId, taskData) => {
  const [updated] = await Task.update(taskData, { where: { id: taskId } });
  if (!updated) throw new Error('Task not found.');
  return await Task.findByPk(taskId, { include: includeTask });
};

/**
 * Deletes a task.
 *
 * @param {string} taskId - The ID of the task to delete.
 * @returns {Promise<boolean>} True if the task was successfully deleted.
 * @throws {Error} Throws an error if the delete operation fails.
 */
export const deleteTask = async (taskId) => {
  const deleted = await Task.destroy({ where: { id: taskId } });
  if (!deleted) throw new Error('Task not found.');
  return deleted;
};