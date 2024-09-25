import ToDoList from '../models/toDoListModel.js';
import ToDoItem from '../models/toDoItemModel.js';
import NotFoundError from '../error/notFoundError.js';

// Création d'un ToDoList
export const createToDoList = async (req, res, next) => {
  try {
    const userId = req.user.id;
    req.body.userId = userId;

    res.statusCode = 201;
    res.data.toDoList = await ToDoList.create(req.body);
    next();
  } catch (error) {
    return next(error);
  }
};

// Récupération de tous les ToDoList
export const getAllToDoLists = async (req, res, next) => {
  try {
    const todoLists = await ToDoList.findAll();
    res.status(200).json(todoLists);
  } catch (error) {
    return next(error);
  }
};

// Récupération d'un ToDoList par ID
export const getToDoListById = async (req, res, next) => {
  try {
    const toDoList = await ToDoList.findByPk(req.params.id, {
      include: [
        {
          model: ToDoItem, // Assure-toi que ce modèle est correctement importé
          as: 'toDoItems'
        }
      ]
    });
    if (!toDoList) throw new NotFoundError('ToDoList Not Found');
    console.log('toDoList', toDoList);

    req.data = toDoList;
    next();
  } catch (error) {
    return next(error);
  }
};

// Mise à jour d'un ToDoList
export const updateToDoList = async (req, res, next) => {
  try {
    if (req.file) req.body.image = req.file.filename;
    const [updated] = await ToDoList.update(req.body, {
      where: { id: req.params.id }
    });

    if (!updated) throw new NotFoundError('ToDoList Not Found');

    res.data.toDoList = await ToDoList.findByPk(req.params.id);
    next();
  } catch (error) {
    return next(error);
  }
};

// Suppression d'un ToDoList
export const deleteToDoList = async (req, res, next) => {
  try {
    const deleted = await ToDoList.destroy({
      where: { id: req.params.id }
    });

    if (!deleted) throw new NotFoundError('ToDoList Not Found');

    res.status(204).json();
  } catch (error) {
    return next(error);
  }
};
