import NotFoundError from '../error/notFoundError.js';
import * as taskRepository from '../repository/taskRepository.js';

// Création d'une nouvelle tâche
export const createTask = async (req, res, next) => {
  try {
    const { id: kanbanId } = req.params;
    const { title, description, estimation, priorityId, sizeId, stageId, assignedToId } = req.body;

    const newTask = await taskRepository.createTask({
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
    const { search } = req.query;

    res.data.tasks = await taskRepository.getTasksByKanban(kanbanId, search);

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
      task = await taskRepository.getTaskById(taskId);

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

    const updatedTask = await taskRepository.updateTask(taskId, {
      title,
      description,
      estimation,
      priorityId,
      sizeId,
      stageId,
      assignedToId,
    });

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

    const updatedTask = await taskRepository.updateTask(taskId, { stageId, assignedToId });

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

    await taskRepository.updateTask(taskId, { isArchived: true });

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

    await taskRepository.updateTask(taskId, { isArchived: false });

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

    await taskRepository.deleteTask(taskId);

    res.statusCode = 204;
    next();
  } catch (error) {
    return next(error);
  }
};
