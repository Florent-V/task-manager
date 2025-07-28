import sequelize from '../database/connect.js';
import { Op } from 'sequelize';
import Kanban from '../models/kanbanModel.js';
import Stage from '../models/stageModel.js';
import Task from '../models/taskModel.js';
import Imputation from '../models/imputationModel.js';
import User from '../models/userModel.js';

/**
 * @typedef {{
 *    title: string;
 *    description: string;
 *    stages: Array<Object>;
 * }} KanbanData
 */

const includeKanban = [
  {
    model: Stage,
    as: 'stages',
  },
  {
    model: Task,
    as: 'tasks',
    separate: true,
    order: [['priorityId', 'DESC']],
    include: [
      {
        model: Imputation,
        as: 'imputations',
        attributes: ['id', 'timeSpent'],
      },
    ],
  },
  {
    model: User,
    as: 'users',
    attributes: ['id', 'username', 'firstName', 'lastName'],
  },
];

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

/**
 * Creates a new Kanban for a given user.
 *
 * @param {string} userId - The ID of the user creating the Kanban.
 * @param {KanbanData} kanbanData - The data needed to create the Kanban.
 * @returns {Promise<{newKanban: Object}>} An object containing the newly created Kanban.
 * @throws {Error} Throws an error if the creation of the Kanban fails.
 */
export const createKanban = async (userId, { title, description, stages }) => {
  return await sequelize.transaction(async (t) => {

    // Create a new Kanban
    const newKanban = await Kanban.create(
      { title, description, stages },
      {
        transaction: t,
        include: {
          model: Stage,
          as: 'stages',
        },
      }
    );

    // Associate the Kanban with the current user
    await newKanban.addUsers([userId], { transaction: t });

    return { newKanban };
  });
};

/**
 * Retrieves all Kanbans.
 *
 * @returns {Promise<Array>} A list of all Kanbans.
 * @throws {Error} Throws an error if the retrieval fails.
 */
export const getAllKanbans = async () => {
  return await Kanban.findAll({ include: includeKanban });
};

/**
 * Retrieves all Kanbans for a given user.
 *
 * @param {string} userId - The ID of the user whose Kanbans are to be retrieved.
 * @param {string} search - Optional search term to filter Kanbans.
 * @returns {Promise<Array>} A list of Kanbans associated with the user.
 * @throws {Error} Throws an error if the retrieval fails.
 */
export const getKanbansByUser = async (userId, search) => {

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

  return await Kanban.findAll({
    where: whereCondition,
    include: [
      ...includeKanban,
      {
        model: User,
        as: 'users',
        where: { id: userId },
        attributes: [],
      },
    ],
  });
};

/**
 * Retrieves a Kanban by its ID.
 *
 * @param {string} id - The ID of the Kanban to retrieve.
 * @returns {Promise<Object|null>} The Kanban object if found, otherwise null.
 * @throws {Error} Throws an error if the retrieval fails.
 */
export const getKanbanById = async (id) => {
  return await Kanban.findByPk(id, { include: includeKanban });
};

/**
 * Updates a Kanban.
 *
 * @param {string} id - The ID of the Kanban to update.
 * @param {KanbanData} kanbanData - The data needed to create the Kanban.
 * @returns {Promise<Object>} The updated Kanban object.
 * @throws {Error} Throws an error if the update fails.
 */
export const updateKanban = async (id, { title, description, stages }) => {
  return await sequelize.transaction(async (t) => {
    const kanban = await getKanbanById(id);
    if (!kanban) throw new Error('Kanban Not Found');

    // Update the Kanban
    await kanban.update({ title, description }, { transaction: t });

    const existingStages = kanban.stages;
    const existingIds = existingStages.map((stage) => stage.id);
    const stagesToUpdate = stages.filter((s) => s.id && existingIds.includes(s.id));
    const stagesToCreate = stages.filter((s) => !s.id);
    const stagesToDelete = existingStages.filter((stat) => !stages.some((s) => s.id === stat.id));

    // Update existing stages
    for (const stage of stagesToUpdate) {
      await Stage.update(
        { name: stage.name, description: stage.description, maxRecord: stage.maxRecord },
        { where: { id: stage.id }, transaction: t }
      );
    }

    // Create new stages
    if (stagesToCreate.length > 0) {
      const stagesWithKanbanId = stagesToCreate.map((stage) => ({
        ...stage,
        kanbanId: id,
      }));
      await Stage.bulkCreate(stagesWithKanbanId, { transaction: t });
    }

    // Delete stages not included in the request
    for (const stage of stagesToDelete) {
      await stage.destroy({ transaction: t });
    }

    return kanban;
  });
};