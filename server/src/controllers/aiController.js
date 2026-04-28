import aiService from '../services/aiService.js';
import logger from '../config/logger.js';
import ToDoList from '../models/toDoListModel.js';
import ToDoItem from '../models/toDoItemModel.js';
import ToDoListType from '../models/toDoListTypeModel.js';
import { includeToDoList } from './toDoListController.js';

export async function generateToDoList(req, res) {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: 'Le prompt est requis.' });
  }

  try {
    const tasks = await aiService.generateToDoList(prompt);
    res.json(tasks);
  } catch (error) {
    logger.error(`Erreur API /ai/generate-todolist: ${error.message}`, { prompt });
    // Masquer les détails de l'erreur au client pour des raisons de sécurité
    res
      .status(500)
      .json({ message: 'Une erreur est survenue lors de la génération de la liste de tâches.' });
  }
}

export async function organizeToDoList(req, res, next) {
  const { id } = req.params;

  try {
    const toDoList = await ToDoList.findByPk(id, {
      include: [
        {
          model: ToDoItem,
          as: 'toDoItems',
          where: { done: false },
          required: false,
        },
      ],
    });

    if (!toDoList) {
      throw new Error('Liste de tâches non trouvée.');
    }

    const itemsToOrganize = toDoList.toDoItems.map((item) => ({
      id: item.id,
      title: item.title,
    }));

    if (itemsToOrganize.length === 0) {
      return res.status(400).json({ message: 'Aucun élément non fait à organiser.' });
    }

    // 1. Nettoyer les catégories existantes
    await ToDoItem.update({ category: null }, { where: { toDoListId: id } });

    // 2. Appeler l'IA
    const categorizedItems = await aiService.organizeToDoList(itemsToOrganize);

    // 3. Mettre à jour la base de données
    for (const catItem of categorizedItems) {
      await ToDoItem.update({ category: catItem.category }, { where: { id: catItem.id } });
    }

    // 4. Retourner la todolist complète mise à jour
    res.data.toDoList = await ToDoList.findByPk(id, {
      include: includeToDoList,
    });
    next();
  } catch (error) {
    logger.error(`Erreur API /ai/organize-todolist: ${error.message}`);
    return next(error);
  }
}
