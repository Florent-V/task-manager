import sequelize from '../database/connect.js';
import Kanban from '../models/kanbanModel.js';
import Stage from '../models/stageModel.js';
import Task from '../models/taskModel.js';
import User from '../models/userModel.js';
import ForbiddenError from '../error/forbiddenError.js';
import NotFoundError from '../error/notFoundError.js';

const includeKanban = [
  {
    model: Stage,
    as: 'stages',
  },
  {
    model: Task,
    as: 'tasks',
  },
  {
    model: User,
    as: 'users',
    attributes: ['id', 'username', 'firstName', 'lastName'],
  },
];

// Créer un nouveau kanban
export const createKanban = async (req, res, next) => {

  try {
    const userId = req.user.id;
    if (!userId) throw new ForbiddenError('Access denied: You do not have permission to create ToDoList');

    const result = await sequelize.transaction(async (t) => {
      const { title, description, stages } = req.body;

      // Crée un nouveau kanban
      const newKanban = await Kanban.create(
        { title, description, stages },
        {
          transaction: t, include: {
            model: Stage,
            as: 'stages',
          }
        }
      );
      // Associe la todolist à l'utilisateur courant
      await newKanban.addUsers([userId], { transaction: t });

      return { newKanban };
    });

    res.statusCode = 201;
    res.data.kanban = result.newKanban;
    next();
  } catch (error) {
    return next(error);
  }
};

// Récupérer tous les kanbans
export const getAllKanbans = async (req, res, next) => {
  try {
    res.data.kanbans = await Kanban.findAll(
      { include: includeKanban }
    );
    next();
  } catch (error) {
    return next(error);
  }
};

// Récupération de tous les kanbans d'un utilisateur
export const getKanbansByUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    if (!userId) throw new ForbiddenError('Access denied: You do not have permission to access Kanbans');

    res.data.kanbans = await Kanban.findAll({
      include: [
        ...includeKanban,
        {
          model: User,
          as: 'users',
          where: { id: userId },
          attributes: []
        }
      ]
    });
    next();
  } catch (error) {
    return next(error);
  }
};

// Récupération d'un kanban par ID
export const getKanbanById = async (req, res, next) => {
  try {
    console.log('req.params', req.params);
    const kanban = await Kanban.findByPk(req.params.id, {
      include: includeKanban
    });

    if (!kanban) throw new NotFoundError('Kanban Not Found');

    res.data.kanban = kanban;
    next();
  } catch (error) {
    return next(error);
  }
};


// Mettre à jour un kanban
export const updateKanban = async (req, res, next) => {
  const { id } = req.params;
  const { title, description, stages } = req.body;

  try {
    // Démarrage d'une transaction
    await sequelize.transaction(async (t) => {
      // Récupérer le kanban existant
      const kanban = res.data.kanban;

      // Mise à jour du Kanban
      await kanban.update({ title, description }, { transaction: t });

      // Gestion des statuts
      const existingStages = kanban.stages;
      const existingIds = existingStages.map((stage) => stage.id);

      const stagesToUpdate = stages.filter((s) => s.id && existingIds.includes(s.id));
      const stagesToCreate = stages.filter((s) => !s.id);
      const stagesToDelete = existingStages.filter((stat) => !stages.some((s) => s.id === stat.id));

      // Mise à jour des statuts existants
      for (const stage of stagesToUpdate) {
        await Stage.update(
          { name: stage.name, description: stage.description, maxRecord: stage.maxRecord },
          { where: { id: stage.id }, transaction: t }
        );
      }

      // Création des nouveaux statuts
      if (stagesToCreate.length > 0) {
        const stagesWithKanbanId = stagesToCreate.map((stage) => ({
          ...stage,
          kanbanId: id,
        }));
        await Stage.bulkCreate(stagesWithKanbanId, { transaction: t });
      }

      // Suppression des statuts non inclus dans la requête
      for (const stage of stagesToDelete) {
        await stage.destroy({ transaction: t });
      }
    });

    next();
  } catch (error) {
    return next(error);
  }
};
