import Stage from "../models/stageModel.js";
import { stageSchema, updateStageSchema } from "../joiSchema/stageSchema.js";
import NotFoundError from "../error/notFoundError.js";

export const isStageInKanban = async (req, res, next) => {
  try {
    const { stageId, id: kanbanId } = req.params;

    const stage = await Stage.findOne({ where: { id: stageId, kanbanId: kanbanId } });

    if (!stage) throw new NotFoundError('Stage not found in this Kanban.');

    req.stage = stage;
    next();
  } catch (error) {
    return next(error);
  }
};

export const setStageEntity = (req, res, next) => {
  req.entity = Stage;
  next();
}

export const setStageCreateValidator = (req, res, next) => {
  req.schema = stageSchema;
  next();
}

export const setStageUpdateValidator = (req, res, next) => {
  req.schema = updateStageSchema;
  next();
}