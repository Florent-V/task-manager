import { createImputationSchema, updateImputationSchema } from '../joiSchema/imputationSchema.js';
import UnauthorizedError from '../error/unauthorizedError.js';
import logger from '../config/logger.js';
import Imputation from "../models/imputationModel.js";

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

export const checkImputationAccess = (req, res, next) => {
  try {
    if (!req.user) {
      logger.warn('User not authenticated for imputation access.');
      throw new UnauthorizedError('You must be logged in to access this resource.');
    }
    const { taskId, imputationId  } = req.params;
    const userId = req.user.id;

    req.imputation = Imputation.findOne({ where: { id: imputationId, taskId, userId } });
    if (!req.imputation) {
      logger.warn(`User ${userId} attempted to access non-existent imputation ${imputationId} for task ${taskId}.`);
      throw new UnauthorizedError('You do not have permission to access this imputation.');
    }

    logger.info(`User ${req.user.id} attempting to access/modify imputation. Basic auth check passed.`);
    next();
  } catch (error) {
    return next(error);
  }
};