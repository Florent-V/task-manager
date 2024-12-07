import Kanban from '../models/kanbanModel.js';
import { newKanbanSchema, kanbanSchema, updateKanbanSchema } from '../joiSchema/kanbanSchema.js';


export const setKanbanEntity = (req, res, next) => {
  req.entity = Kanban;
  next();
};

export const setKanbanCreateValidator = (req, res, next) => {
  req.schema = kanbanSchema;
  next();
};

export const setKanbanUpdateValidator = (req, res, next) => {
  req.schema = updateKanbanSchema;
  next();
};
