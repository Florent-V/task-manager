import User from "../models/userModel.js";
import Imputation from "../models/imputationModel.js";
import NotFoundError from '../error/notFoundError.js';
import logger from '../config/logger.js';

export async function createImputation(req, res, next) {
  const { taskId } = req.params;
  const { timeSpent, comment, date } = req.body;
  const userId = req.user.id;

  try {

    const newImputation = await Imputation.create({
      taskId,
      userId,
      timeSpent,
      comment: comment || null,
      date: date || new Date(), // Or allow user to specify date? For now, current date.
    });

    res.statusCode = 201;
    res.data = { imputation: newImputation };

    next();
  } catch (error) {
    next(error);
  }
}

export async function getImputationsForTask(req, res, next) {
  const { taskId } = req.params;
  try {
    const imputations = await Imputation.findAll({
      where: { taskId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email'],
      }],
      order: [['date', 'DESC'], ['createdAt', 'DESC']],
    });

    res.data = { imputations };

    next();
  } catch (error) {
    next(error);
  }
}

export async function updateImputation(req, res, next) {
  const { taskId, imputationId } = req.params;
  const { timeSpent, comment, date } = req.body;

  try {

    const [updated] = await Imputation.update(
      { timeSpent, comment, date },
      { where: { id: imputationId, taskId } }
    )

    if (!updated) {
      throw new NotFoundError(`Imputation with ID ${imputationId} not found for task ${taskId}.`);
    }

    const updatedImputation = await Imputation.findOne({
      where: { id: imputationId, taskId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email'],
      }],
    });

    res.data = { imputation: updatedImputation };
    next();

  } catch (error) {
    next(error);
  }
}

export async function deleteImputation(req, res, next) {
  const { taskId, imputationId } = req.params;

  try {
    const deleted = await Imputation.destroy({
      where: { id: imputationId, taskId }
    });

    if (!deleted) {
      throw new NotFoundError(`Imputation with ID ${imputationId} not found for task ${taskId}.`);
    }

    res.status(204);
    next();
  } catch (error) {
    next(error);
  }
}