import Task from "../models/taskModel.js";
import NotFoundError from "../error/notFoundError.js";

// Création d'une nouvelle tâche
export const createTask = async (req, res, next) => {
  try {
    const { id: kanbanId } = req.params;
    const { title, description, estimation, loggedTime, priorityId, sizeId, stageId, assignedToId } = req.body;

    const newTask = await Task.create({ title, description, estimation, loggedTime, priorityId, sizeId, stageId, assignedToId, kanbanId });

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
       task: await Task.findAll({ where: { kanbanId } })
    }

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
      task = await Task.findByPk(taskId);
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
    const { title, description, estimation, loggedTime, priorityId, sizeId, stageId, assignedToId } = req.body;

    const [updated] = await Task.update(
      { title, description, estimation, loggedTime, priorityId, sizeId, stageId, assignedToId },
      { where: { id: taskId } }
      );

    if (!updated) throw new NotFoundError('Task not found.');

    const updatedTask = await Task.findByPk(taskId);

    res.data = { task: updatedTask };
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