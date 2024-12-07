import Priority from '../models/priorityModel.js';
import { prioritySchema, updatePrioritySchema } from '../joiSchema/prioritySchema.js';

export const setEntity = (req, res, next) => {
  req.entity = Priority;
  next();
};

export const setCreateValidator = (req, res, next) => {
  req.schema = prioritySchema;
  next();
};

export const setUpdateValidator = (req, res, next) => {
  req.schema = updatePrioritySchema;
  next();
};
