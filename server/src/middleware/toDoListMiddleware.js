import ToDoList from "../models/toDoListModel.js";
import { toDoListSchema, updateToDoListSchema } from "../joiSchema/toDoListSchema.js";
import ForbiddenError from '../error/forbiddenError.js';

export const authorizeToDoListAccess = async (req, res, next) => {
  try {
    if (!await res.data.toDoList.hasUser(req.user.id)) {
      throw new ForbiddenError('Access denied: You do not have permission to access this ressource');
    }

    next();
  } catch (error) {
    return next(error);
  }
};

export const setEntity = (req, res, next) => {
  req.entity = ToDoList;
  next();
}

export const setCreateValidator = (req, res, next) => {
  req.schema = toDoListSchema;
  next();
}

export const setUpdateValidator = (req, res, next) => {
  req.schema = updateToDoListSchema;
  next();
}
