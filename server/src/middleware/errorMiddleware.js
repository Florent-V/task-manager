import NotFoundError from '../error/notFoundError.js';

export const errorHandler = (error, req, res, next) => {
  console.log('errorHandler()');

  // Vide le corps de la réponse
  res.data = {};

  const serializedError = {
    name: error.name,
    message: error.message,
    status: error.status || 500,
    errors: error.errors || [] // Ajoute le tableau d'erreurs si disponible
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
  console.log('### logError()', err);
  next(err);
};