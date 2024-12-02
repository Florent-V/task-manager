import Kanban from '../models/kanbanModel.js';
import Status from '../models/statusModel.js';
import Task from "../models/taskModel.js";
import ForbiddenError from "../error/forbiddenError.js";
import NotFoundError from '../error/notFoundError.js';

const includeKanban = [
  {
    model: Status,
    as: 'status',
  },
  {
    model: Task,
    as: 'tasks',
  }
]

// Créer un nouveau kanban
export const createKanban = async (req, res) => {
  const { title, description, statuses } = req.body;

  try {
    const kanban = await Kanban.create({ title, description });
    if (statuses && statuses.length > 0) {
      const statusInstances = statuses.map((status) => ({
        ...status,
        kanbanId: kanban.id,
      }));
      await Status.bulkCreate(statusInstances);
    }
    res.status(201).json(kanban);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création du kanban', error });
  }
};

// Récupérer tous les kanbans
export const getAllKanbans = async (req, res, next) => {
  try {
    res.data.kanbans = await Kanban.findAll(
      { include: includeKanban }
    );
    next();
  } catch (error) {
    return next(error);
  }
};

// Récupération de tous les kanbans d'un utilisateur
export const getKanbansByUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    if (!userId) throw new ForbiddenError('Access denied: You do not have permission to access Kanbans');

    res.data.kanbans = await Kanban.findAll({
      include: [
        ...includeKanban,
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

// Récupération d'un kanban par ID
export const getKanbanById = async (req, res, next) => {
  try {
    const kanban = await Kanban.findByPk(req.params.id, {
      include: includeKanban
    });
    if (!kanban) throw new NotFoundError('Kanban Not Found');

    res.data.kanban = kanban;
    next();
  } catch (error) {
    return next
  }
};


// Mettre à jour un kanban
export const updateKanban = async (req, res) => {
  const { id } = req.params;
  const { title, description, statuses } = req.body;

  try {
    const kanban = await Kanban.findByPk(id);
    if (!kanban) return res.status(404).json({ message: 'Kanban introuvable' });

    await kanban.update({ title, description });

    if (statuses) {
      await Status.destroy({ where: { kanbanId: id } }); // Supprime les anciens statuts
      const statusInstances = statuses.map((status) => ({
        ...status,
        kanbanId: id,
      }));
      await Status.bulkCreate(statusInstances);
    }

    res.json(kanban);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du kanban', error });
  }
};

// Supprimer un kanban
export const deleteKanban = async (req, res) => {
  const { id } = req.params;

  try {
    const kanban = await Kanban.findByPk(id);
    if (!kanban) return res.status(404).json({ message: 'Kanban introuvable' });

    await kanban.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression du kanban', error });
  }
};
