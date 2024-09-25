import ToDoListType from '../models/toDoListTypeModel.js';
import NotFoundError from '../error/notFoundError.js';

// Création d'un ToDoListType
export const createToDoListType = async (req, res, next) => {
  try {
    const toDoListType = await ToDoListType.create(req.body);
    res.data.toDoListType = toDoListType;
    next();
  } catch (error) {
    return next(error)
  }
};

// Récupération de tous les ToDoListTypes
export const getAllToDoListTypes = async (req, res, next) => {
  try {
    const toDoListTypes = await ToDoListType.findAll();
    res.data.toDoListTypes = toDoListTypes;
    next();
  } catch (error) {
    return next(error)
  }
};

// Récupération d'un ToDoListType par ID
export const getToDoListTypeById = async (req, res, next) => {
  try {
    const toDoListType = await ToDoListType.findByPk(req.params.id);
    if (!toDoListType) throw new NotFoundError('toDoListType Not Found');

    res.data.toDoListType = toDoListType;
    next();
  } catch (error) {
    return next(error)
  }
};

// Mise à jour d'un ToDoListType
export const updateToDoListType = async (req, res, next) => {
  try {
    const [updated] = await ToDoListType.update(req.body, {
      where: { id: req.params.id }
    });
    if (!updated) throw new NotFoundError('toDoListType Not Found');

    const updatedToDoListType = await ToDoListType.findByPk(req.params.id);
    res.data.toDoListType = updatedToDoListType;
    next();
  } catch (error) {
    return next(error)
  }
};

// Suppression d'un ToDoListType
export const deleteToDoListType = async (req, res, next) => {
  try {
    const deleted = await ToDoListType.destroy({
      where: { id: req.params.id }
    });
    if (!deleted) throw new NotFoundError('toDoListType Not Found');
    
    res.status(204).json();
  } catch (error) {
    return next(error)
  }
};
