import ToDoList from "../models/toDoListModel.js";
import { toDoListSchema, updateToDoListSchema } from "../joiSchema/toDoListSchema.js";
import ForbiddenError from '../error/forbiddenError.js';

export const authorizeToDoListAccess = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
  
    const todolist = await ToDoList.findOne({ where: { id, userId } });
  
    if (!todolist) throw new ForbiddenError('Access denied: You do not have permission to access this product');
  
    req.todolist = todolist;
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
