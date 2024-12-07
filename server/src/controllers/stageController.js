import Stage from '../models/stageModel.js';
import NotFoundError from '../error/notFoundError.js';

// Création d'un nouveau stage
export const createStage = async (req, res, next) => {
  try {
    const { id: kanbanId } = req.params;
    const { name, description, maxRecord } = req.body;

    const newStage = await Stage.create({ name, description, maxRecord, kanbanId });

    res.statusCode = 201;
    res.data = { stage: newStage };
    next();
  } catch (error) {
    return next(error);
  }
};

// Récupération de tous les stages d'un kanban
export const getAllStagesByKanban = async (req, res, next) => {
  try {
    const { id: kanbanId } = req.params;

    res.data = {
      stages: await Stage.findAll({ where: { kanbanId } })
    };
    next();
  } catch (error) {
    return next(error);
  }
};

// Récupération d'un stage par id
export const getStageById = async (req, res, next) => {
  try {
    let stage = req.stage;
    if (!stage) {
      const { id: stageId } = req.params;
      stage = await Stage.findByPk(stageId);
      if (!stage) throw new NotFoundError('Stage not found');
    }

    res.data = { stage };
    next();
  } catch (error) {
    return next(error);
  }
};

// Mise à jour d'un stage
export const updateStage = async (req, res, next) => {
  try {
    const { stageId } = req.params;
    const { name, description, maxRecord } = req.body;

    const [updated] = await Stage.update({ name, description, maxRecord }, { where: { id: stageId } });

    if (!updated) throw new NotFoundError('Stage not found');

    const updatedStage = await Stage.findByPk(stageId);
    res.data = { stage: updatedStage };
    next();
  } catch (error) {
    return next(error);
  }
};

// Suppression d'un stage
export const deleteStage = async (req, res, next) => {
  try {
    const { stageId } = req.params;
    const deleted = await Stage.destroy({ where: { id: stageId } });

    if (!deleted) throw new NotFoundError('Stage not found');

    res.statusCode = 204;
    next();
  } catch (error) {
    return next(error);
  }
};