import ToDoListType from '../models/toDoListTypeModel.js';
import { toDoListTypeSchema } from '../joiSchema/toDoListTypeSchema.js';

export const setEntity = (req, res, next) => {
  req.entity = ToDoListType;
  next();
};

export const setCreateValidator = (req, res, next) => {
  req.schema = toDoListTypeSchema;
  next();
};

export const setUpdateValidator = (req, res, next) => {
  req.schema = toDoListTypeSchema;
  next();
};


