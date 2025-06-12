import sequelize from '../database/connect.js';
import models from '../models/index.js';
import { parseTimeInput, formatTimeOutput } from '../services/imputationTimeService.js';
import BadRequestError from '../error/badRequestError.js';
import NotFoundError from '../error/notFoundError.js';
import logger from '../config/logger.js';

const Imputation = models.imputation;
const Task = models.task;
const User = models.user; // Assuming 'user' is the key in models object

/**
 * Internal helper to update the loggedTime on a task.
 * @param {string} taskId - The ID of the task to update.
 * @param {import('sequelize').Transaction} transaction - The Sequelize transaction object.
 */
async function updateTaskLoggedTime(taskId, transaction) {
  logger.info(`Calculating total logged time for task ${taskId}`);
  const task = await Task.findByPk(taskId, { transaction, attributes: ['id'] });
  if (!task) {
    // This case should ideally be prevented by foreign key constraints or prior checks
    logger.error(`Task not found when trying to update logged time: ${taskId}`);
    throw new NotFoundError(`Task with ID ${taskId} not found.`);
  }

  const result = await Imputation.findOne({
    attributes: [[sequelize.fn('SUM', sequelize.col('timeSpent')), 'total']],
    where: { taskId },
    transaction,
    raw: true,
  });
  const totalLoggedTime = parseInt(result.total, 10) || 0;

  await Task.update({ loggedTime: totalLoggedTime }, { where: { id: taskId }, transaction });
  logger.info(`Task ${taskId} loggedTime updated to ${totalLoggedTime}`);
}

export async function createImputation(req, res, next) {
  const { taskId } = req.params;
  const { timeSpentString, comment } = req.body;
  const userId = req.user.id; // Assuming req.user is populated

  try {
    const timeSpent = parseTimeInput(timeSpentString);
    if (timeSpent <= 0) {
      throw new BadRequestError('Invalid timeSpentString. It must be a valid time format (e.g., "1h 30m") and represent a positive duration.');
    }

    // Check if task exists
    const task = await Task.findByPk(taskId);
    if (!task) {
      throw new NotFoundError(`Task with ID ${taskId} not found.`);
    }
    // Check if user exists -
    // Foreign key constraint will handle if user doesn't exist,
    // but a check here can provide a clearer error.
    const user = await User.findByPk(userId);
    if (!user) {
      // This should ideally not happen if req.user.id is from a valid token
      throw new NotFoundError(`User with ID ${userId} not found.`);
    }


    const result = await sequelize.transaction(async (t) => {
      const newImputation = await Imputation.create({
        taskId,
        userId,
        timeSpent,
        comment: comment || null, // Ensure comment is null if empty string or undefined
        date: new Date(), // Or allow user to specify date? For now, current date.
      }, { transaction: t });

      await updateTaskLoggedTime(taskId, t);

      return newImputation;
    });

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getImputationsForTask(req, res, next) {
  const { taskId } = req.params;
  try {
    const task = await Task.findByPk(taskId);
    if (!task) {
      throw new NotFoundError(`Task with ID ${taskId} not found.`);
    }

    const imputations = await Imputation.findAll({
      where: { taskId },
      include: [{
        model: User,
        as: 'user', // Must match the alias defined in relations
        attributes: ['id', 'firstName', 'lastName', 'email'], // Specify user attributes to return
      }],
      order: [['date', 'DESC'], ['createdAt', 'DESC']],
    });
    res.status(200).json(imputations);
  } catch (error) {
    next(error);
  }
}

export async function updateImputation(req, res, next) {
  const { taskId, imputationId } = req.params;
  const { timeSpentString, comment } = req.body;
  const userId = req.user.id; // For ownership check if implemented later

  try {
    if (!timeSpentString && comment === undefined) {
      throw new BadRequestError('At least one field (timeSpentString or comment) must be provided for an update.');
    }

    let timeSpent;
    if (timeSpentString !== undefined) {
      timeSpent = parseTimeInput(timeSpentString);
      if (timeSpent <= 0 && timeSpentString) { // Allow "" to mean "don't update time" but not invalid time
        throw new BadRequestError('Invalid timeSpentString. It must be a valid time format (e.g., "1h 30m") and represent a positive duration if provided.');
      }
    }

    const result = await sequelize.transaction(async (t) => {
      const imputation = await Imputation.findOne({
        where: { id: imputationId, taskId },
        transaction: t,
      });

      if (!imputation) {
        throw new NotFoundError(`Imputation with ID ${imputationId} not found for task ${taskId}.`);
      }

      // Optional: Add ownership check here: if (imputation.userId !== userId && !req.user.isAdmin) throw new ForbiddenError();

      const updateData = {};
      if (timeSpentString !== undefined) { // Only update if timeSpentString was actually provided
        updateData.timeSpent = timeSpent;
      }
      if (comment !== undefined) {
        updateData.comment = comment;
      }

      await imputation.update(updateData, { transaction: t });
      await updateTaskLoggedTime(taskId, t);
      return imputation;
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function deleteImputation(req, res, next) {
  const { taskId, imputationId } = req.params;
  const userId = req.user.id; // For ownership check

  try {
    const result = await sequelize.transaction(async (t) => {
      const imputation = await Imputation.findOne({
        where: { id: imputationId, taskId },
        transaction: t,
      });

      if (!imputation) {
        throw new NotFoundError(`Imputation with ID ${imputationId} not found for task ${taskId}.`);
      }

      // Optional: Add ownership check here: if (imputation.userId !== userId && !req.user.isAdmin) throw new ForbiddenError();

      await imputation.destroy({ transaction: t });
      await updateTaskLoggedTime(taskId, t);
      return true; // Indicate success for transaction
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}