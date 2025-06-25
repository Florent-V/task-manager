import NotFoundError from '../error/notFoundError.js';
import logger from '../config/logger.js';

// eslint-disable-next-line no-unused-vars
export const errorHandler = (error, req, res, next) => {
  logger.error('Error handled by errorHandler:', {
    name: error.name,
    message: error.message,
    status: error.status,
    path: req.path,
    // Consider adding error.stack here if not too verbose for all errors,
    // or rely on the development environment check below for stack trace.
  });

  // Vide le corps de la réponse
  res.data = {};

  const serializedError = {
    name: error.name,
    message: error.message,
    status: error.status || 500,
    errors: error.errors || [], // Ajoute le tableau d'erreurs si disponible
  };

  if (process.env.NODE_ENV === 'development') {
    serializedError.stack = error.stack;
  }

  res.status(serializedError.status || 500).send(serializedError);
};

export const notFound = (req, res, next) => {
  return next(new NotFoundError('Page Not Found'));
};

export const logError = (err, req, res, next) => {
  logger.error('Error logged by logError:', {
    name: err.name,
    message: err.message,
    status: err.status,
    path: req.path,
    stack: err.stack, // Log stack trace here as it's a dedicated error logger
  });
  next(err);
};
