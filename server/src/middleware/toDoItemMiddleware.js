import ToDoItem from "../models/toDoItemModel.js";
import { toDoItemSchema, updateToDoItemSchema } from "../joiSchema/toDoItemSchema.js";
import NotFoundError from "../error/notFoundError.js";

export const isToDoItemInToDoList = async (req, res, next) => {
  try {
    console.log('req.params:', req.params);
    const { itemId, id: listId } = req.params;
  
    const toDoItem = await ToDoItem.findOne({ where: { id: itemId, todolistId: listId } });
  
    if (!toDoItem) throw new NotFoundError('ToDo item not found in this ToDoList.');
  
    req.toDoItem = toDoItem;
    next();
  } catch (error) {
    return next(error);
  }
};

export const setEntity = (req, res, next) => {
  req.entity = ToDoItem;
  next();
}

export const setCreateValidator = (req, res, next) => {
  req.schema = toDoItemSchema;
  next();
}

export const setUpdateValidator = (req, res, next) => {
  req.schema = updateToDoItemSchema;
  next();
}
