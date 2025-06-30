import Task from '../models/taskModel.js';
import Comment from '../models/commentModel.js';
import Kanban from '../models/kanbanModel.js';
import User from '../models/userModel.js';
import Imputation from '../models/imputationModel.js';
import NotFoundError from '../error/notFoundError.js';

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

// Création d'une nouvelle tâche
export const createTask = async (req, res, next) => {
  try {
    const { id: kanbanId } = req.params;
    const { title, description, estimation, priorityId, sizeId, stageId, assignedToId } = req.body;

    const newTask = await Task.create({
      title,
      description,
      estimation,
      priorityId,
      sizeId,
      stageId,
      assignedToId,
      kanbanId,
    });

    res.statusCode = 201;
    res.data = { task: newTask };

    next();
  } catch (error) {
    return next(error);
  }
};

// Récupération de toutes les tâches d'un kanban
export const getAllTasksByKanban = async (req, res, next) => {
  try {
    const { id: kanbanId } = req.params;

    res.data = {
      task: await Task.findAll({ where: { kanbanId }, include: includeTask }),
    };

    next();
  } catch (error) {
    return next(error);
  }
};

// Récupération d'une tâche par son id
export const getTaskById = async (req, res, next) => {
  try {
    let task = req.task;
    if (!task) {
      const { id: taskId } = req.params;
      task = await Task.findByPk(taskId, { include: includeTask });

      if (!task) throw new NotFoundError('Task not found.');
    }

    res.data = { task };
    next();
  } catch (error) {
    return next(error);
  }
};

// Mise à jour d'une tâche
export const updateTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { title, description, estimation, priorityId, sizeId, stageId, assignedToId } = req.body;

    const [updated] = await Task.update(
      {
        title,
        description,
        estimation,
        priorityId,
        sizeId,
        stageId,
        assignedToId,
      },
      { where: { id: taskId } }
    );

    if (!updated) throw new NotFoundError('Task not found.');

    const updatedTask = await Task.findByPk(taskId, { include: includeTask });

    res.data = { task: updatedTask };
    next();
  } catch (error) {
    return next(error);
  }
};

export const updateStageTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { stageId, assignedToId } = req.body;

    const [updated] = await Task.update({ stageId, assignedToId }, { where: { id: taskId } });

    if (!updated) throw new NotFoundError('Task not found.');

    const updatedTask = await Task.findByPk(taskId, { include: includeTask });

    res.data = { task: updatedTask };
    next();
  } catch (error) {
    return next(error);
  }
};

// Archivage  d'une tâche
export const archiveTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    const [updated] = await Task.update({ isArchived: true }, { where: { id: taskId } });
    if (!updated) throw new NotFoundError('Task not found.');

    res.data = {};
    next();
  } catch (error) {
    return next(error);
  }
};

// Restoration d'une tâche
export const restoreTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    const [updated] = await Task.update({ isArchived: false }, { where: { id: taskId } });
    if (!updated) throw new NotFoundError('Task not found.');

    res.data = {};
    next();
  } catch (error) {
    return next(error);
  }
};

// Suppression d'une tâche
export const deleteTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const deleted = await Task.destroy({ where: { id: taskId } });

    if (!deleted) throw new NotFoundError('Task not found.');

    res.statusCode = 204;
    next();
  } catch (error) {
    return next(error);
  }
};
