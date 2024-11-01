import QRCode from 'qrcode';
import ToDoList from '../models/toDoListModel.js';
import ToDoItem from '../models/toDoItemModel.js';
import NotFoundError from '../error/notFoundError.js';
import ToDoListType from "../models/toDoListTypeModel.js";
import User from "../models/userModel.js";
import ForbiddenError from "../error/forbiddenError.js";

const includeToDoList = [
  {
    model: ToDoItem,
    as: 'toDoItems'
  },
  {
    model: ToDoListType,
    as: 'type',
    attributes: ['id', 'name'],
  }
];

// Création d'un ToDoList
export const createToDoList = async (req, res, next) => {
  try {
    const userId = req.user.id;
    if (!userId) throw new ForbiddenError('Access denied: You do not have permission to create ToDoList');

    // Crée une nouvelle todolist
    const newToDoList = await ToDoList.create(req.body);
    // Associe la todolist à l'utilisateur courant
    await newToDoList.addUsers([userId]);
    // Récupère la todolist avec les items et le type
    const toDoList = await ToDoList.findByPk(newToDoList.id, {
      include: includeToDoList
    });

    res.statusCode = 201;
    res.data.toDoList = toDoList;

    next();
  } catch (error) {
    return next(error);
  }
};

// Récupération de tous les ToDoList
export const getAllToDoLists = async (req, res, next) => {
  try {
    res.data.toDoLists = await ToDoList.findAll(
      { include: includeToDoList }
    );
  } catch (error) {
    return next(error);
  }
};

// Récupération de toutes les todolists d'un utilisateur
export const getAllToDoListsByUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    if (!userId) throw new ForbiddenError('Access denied: You do not have permission to access ToDoList');

    res.data.toDoLists = await ToDoList.findAll({
      include: [
        ...includeToDoList,
        {
          model: User,
          as: 'users',
          where: { id: userId },
          attributes: []
        }
      ]
    });
    next();
  } catch (error) {
    return next(error);
  }
};

// Récupération d'un ToDoList par ID
export const getToDoListById = async (req, res, next) => {
  try {
    const toDoList = await ToDoList.findByPk(req.params.id, {
      include: includeToDoList
    });
    if (!toDoList) throw new NotFoundError('ToDoList Not Found');

    res.data.toDoList = toDoList;
    next();
  } catch (error) {
    return next(error);
  }
};

export const getUserToDoListById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    if (!userId) throw new ForbiddenError('Access denied: You do not have permission to access ToDoList');

    const { id } = req.params;
    const todolist = await ToDoList.findOne({
      include: [
        ...includeToDoList,
        {
          model: User,
          as: 'users',
          where: { id: userId },
          attributes: []
        }
      ],
      where: { id } }
    );

    if (!todolist) throw new ForbiddenError('Access denied: You do not have permission to access this product');

    res.data = todolist;

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

    res.data.toDoList = await ToDoList.findByPk(req.params.id, {
      include: [
        {
          model: ToDoItem,
          as: 'toDoItems'
        },
        {
          model: ToDoListType,
          as: 'type',
          attributes: ['id', 'name'],
        }
      ]
    });
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

// Share toDoList
export const shareToDoList = async (req, res, next) => {
  try {
    const userId = req.user.id;
    if (!userId) throw new ForbiddenError('Access denied: You do not have permission to share ToDoList');

    // Récupérer ou générer le lien de partage
    const shareLink = `${process.env.CLIENT_ORIGIN}/todolist/${req.params.id}/join`;

    // Générer le QR code à partir du lien de partage
    QRCode.toDataURL(shareLink, (err, url) => {
      if (err) return res.status(500).json({ error: 'Erreur QR Code' });
      res.json({
        qrCodeUrl: url,
        linkUrl: shareLink
      });
    });

  } catch (error) {
    return next(error);
  }
};

// join todolist
export const joinToDoList = async (req, res, next) => {
  try {
    const userId = req.user.id;
    if (!userId) throw new ForbiddenError('Access denied: You do not have permission to join ToDoList');

    // vérifier si userId est déjà dans la liste
    const isUserInList = await res.data.toDoList.hasUser(userId);
    if (isUserInList) throw new ForbiddenError('Access denied: You are already in the list');

    await res.data.toDoList.addUsers([userId]);

    next();
  } catch (error) {
    return next(error);
  }
}
