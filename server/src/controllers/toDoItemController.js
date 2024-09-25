import ToDoItem from '../models/toDoItemModel.js';
import NotFoundError from '../error/notFoundError.js';

// Création d'un ToDoItem
export const createToDoItem = async (req, res, next) => {
  try {
    req.body.toDoListId = req.params.id;

    res.statusCode = 201;
    res.data.toDoItem = await ToDoItem.create(req.body);
    next();
  } catch (error) {
    return next(error);
  }
};

// Récupération de tous les ToDoItem
export const getToDoItems = async (req, res, next) => {
  const id = req.params.id;
  try {
    const toDoItems = await ToDoItem.findAll({
      where: {
        toDoListId: id
      }
    });
    res.data.toDoItems = toDoItems;
    next();
  } catch (error) {
    return next(error);
  }
};

// Récupération d'un ToDoItem par ID
export const getToDoItemById = async (req, res, next) => {
  console.log('coucou')
  try {
    if (!req.toDoItem) {
      const toDoItem = await ToDoItem.findByPk(req.params.itemId);
      if (!toDoItem) throw new NotFoundError('ToDoItem Not Found');
    }
    res.data.toDoItem = req.toDoItem;
    next();
  } catch (error) {
    return next(error);
  }
};

// Mise à jour d'un ToDoItem
export const updateToDoItem = async (req, res, next) => {
  try {
    console.log('coucou')
    console.log('req.body', req.body)
    console.log('req.params.itemId', req.params.itemId)
    const [updated] = await ToDoItem.update(req.body, {
      where: { id: req.params.itemId }
    });
    console.log('updated', updated)

    if (!updated) throw new NotFoundError('ToDoItem Not Found');

    const uptadedItem = await ToDoItem.findByPk(req.params.itemId);
    res.data = { toDoItem: uptadedItem };
    res.status(200).json({ toDoItem: uptadedItem });
    console.log('res.data', res.data)
    // next();
  } catch (error) {
    return next(error);
  }
};

// Suppression d'un ToDoItem
export const deleteToDoItem = async (req, res, next) => {
  try {
    const deleted = await ToDoItem.destroy({
      where: { id: req.params.itemId }
    });

    if (!deleted) throw new NotFoundError('ToDoItem Not Found');

    res.status(204).json();
  } catch (error) {
    return next(error);
  }
};


// const todoItem = await ToDoItem.findOne({
//   where: {
//     id: itemId,
//     listId: listId,
//   },
//   include: {
//     model: ToDoList,
//     where: { userId: userId }  // vérifier que l'utilisateur est bien le propriétaire
//   }
// });

// const todoList = await ToDoList.findOne({
//   where: {
//     id: listId,
//     userId: userId,  // vérifier que l'utilisateur est bien le propriétaire
//   },
//   include: [ToDoItem]
// });

// // Ensuite, vérifier que le ToDoItem appartient à cette liste
// const todoItem = todoList.ToDoItems.find(item => item.id === parseInt(itemId));

// const listId = req.params.listId; // Récupérer le paramètre :listId depuis la route

// const todoItems = await ToDoItem.findAll({
//   where: {
//     toDoListId: listId // Filtrer par le champ toDoListId
//   }
// });


// const newToDoList = await ToDoList.create({
//   title: 'Ma nouvelle liste',
//   ToDoItems: [
//     { content: 'Premier item' },
//     { content: 'Deuxième item' },
//     { content: 'Troisième item' }
//   ]
// }, {
//   include: [ToDoItem] // Indiquer que tu veux créer aussi les ToDoItems associés
// });

// const toDoList = await ToDoList.findByPk(req.params.id, {
//   include: {
//     model: ToDoItem,
//     attributes: ['id', 'content'], // Sélectionner uniquement certains champs des ToDoItems
//     where: { completed: false },   // Filtrer par des critères (facultatif)
//     required: false // Inclure la ToDoList même s'il n'y a pas de ToDoItems associés
//   }
// });

// const toDoList = await ToDoList.findOne({
//   where: {
//     id: listId,
//     userId: userId,  // vérifier que l'utilisateur est bien le propriétaire
//   },
//   include: [ToDoItem] // Inclure les ToDoItems associés, entre crochets
// });