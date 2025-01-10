import Task from '../models/taskModel.js';
import Size from '../models/sizeModel.js';
import Priority from '../models/priorityModel.js';
import { taskSchema, updateTaskSchema } from '../joiSchema/taskSchema.js';
import NotFoundError from '../error/notFoundError.js';

export const setTaskEntity = (req, res, next) => {
  req.entity = Task;
  next();
};

export const setTaskCreateValidator = (req, res, next) => {
  req.schema = taskSchema;
  next();
};

export const setTaskUpdateValidator = (req, res, next) => {
  req.schema = updateTaskSchema;
  next();
};

export const isTaskInKanban = async (req, res, next) => {
  try {
    const { taskId, id: kanbanId } = req.params;

    const task = await Task.findOne({ where: { id: taskId, kanbanId: kanbanId } });

    if (!task) throw new NotFoundError('Task not found in this Kanban.');

    req.task = task;
    next();
  } catch (error) {
    return next(error);
  }
};

export const checkTaskRelationship = async (req, res, next) => {
  try {
    const { assignedToId, stageId, sizeId, priorityId } = req.body;

    const kanban = res.data.kanban;
    // check if the user is in the kanban
    if (assignedToId && !kanban.users.find(user => user.id === assignedToId)) {
      throw new NotFoundError('User not found in kanban');
    }

    // check if the stage is in the kanban
    if (stageId && !kanban.stages.find(stage => stage.id === stageId)) {
      throw new NotFoundError('Stage not found in kanban');
    }

    // check if size exist in database
    if (sizeId) {
      const size = await Size.findByPk(sizeId);
      if (!size) throw new NotFoundError('Size not found');
    }

    // check if priority exist in database
    if (priorityId) {
      const priority = await Priority.findByPk(priorityId);
      if (!priority) throw new NotFoundError('Priority not found');
    }

    next();
  } catch (error) {
    return next(error);
  }
};