import { createImputationSchema, updateImputationSchema } from '../joiSchema/imputationSchema.js';
import logger from '../config/logger.js';
import Imputation from '../models/imputationModel.js';
import NotFoundError from '../error/notFoundError.js';
import UnauthorizedError from '../error/unauthorizedError.js';

export const setImputationEntity = (req, res, next) => {
  req.entity = Imputation;
  next();
};

export const setImputationCreateValidator = (req, res, next) => {
  req.schema = createImputationSchema;
  next();
};

// Middleware to validate request body against updateImputationSchema
export const setImputationUpdateValidator = (req, res, next) => {
  req.schema = updateImputationSchema;
  next();
};

export const checkImputationAccess = async (req, res, next) => {
  try {
    if (!req.user) {
      logger.warn('User not authenticated for imputation access.');
      throw new UnauthorizedError('You must be logged in to access this resource.');
    }
    const { taskId, imputationId } = req.params;
    const userId = req.user.id;

    req.imputation = await Imputation.findOne({ where: { id: imputationId, taskId } });
    if (!req.imputation) {
      logger.warn(
        `User ${userId} attempted to access non-existent imputation ${imputationId} for task ${taskId}.`
      );
      throw new NotFoundError(`Imputation with ID ${imputationId} not found for task ${taskId}.`);
    }

    if (req.imputation.userId !== userId) {
      logger.warn(
        `User ${userId} attempted to access imputation ${imputationId} not owned by them.`
      );
      throw new UnauthorizedError('You do not have permission to access this imputation.');
    }

    logger.info(
      `User ${req.user.id} attempting to access/modify imputation. Basic auth check passed.`
    );
    next();
  } catch (error) {
    return next(error);
  }
};
