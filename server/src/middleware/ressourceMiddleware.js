import NotFoundError from '../error/notFoundError.js';
import ForbiddenError from '../error/forbiddenError.js';
import BadRequestError from '../error/badRequestError.js';
import { lowercaseFirstLetter } from '../services/stringService.js';

export const getUserRessources = async (req, res, next) => {
  try {
    const userId = req.user.id;
    console.log('req.entity', req.entity);

    const resources = await req.entity.findAll({ where: { userId } });
  
    if (!resources) throw new NotFoundError('No record found');
  
    res.data[lowercaseFirstLetter(req.entity.options.name.plural)] = resources;
    next();
  } catch (error) {
    return next(error);
  }
};

export const getUserRessourceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const resource = await req.entity.findOne({ where: { id, userId } });
  
    if (!resource) throw new ForbiddenError('Access denied: You do not have permission to access this product');
  
    res.data[lowercaseFirstLetter(req.entity.options.name.singular)] = resource;
    next();
  } catch (error) {
    return next(error);
  }
};

export const authorizeManyToManyRessourceAccess = async (req, res, next) => {
  try {

    if (!await res.data[lowercaseFirstLetter(req.entity.options.name.singular)].hasUser(req.user.id)) {
      throw new ForbiddenError('Access denied: You do not have permission to access this ressource');
    }

    next();

  } catch (error) {
    return next(error);
  }
};

export const authorizeRessourceAccess = async (req, res, next) => {
  try {
    if (req.data.userId !== req.user.id) {
      throw new ForbiddenError('Access denied: You do not have permission to access this ressource');
    }
    res.data[lowercaseFirstLetter(req.entity.options.name.singular)] = req.data;
    next();
  } catch (error) {
    return next(error);
  }
};

export const validate = (req, res, next) => {
  try {
    const { error } = req.schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map(err => ({
        field: err.path[0], // Nom du champ (ex: "firstName")
        message: err.message // Message d'erreur
      }));

      throw new BadRequestError('Invalid input', errors);
    }
    next();
  } catch (error) {
    return next(error);
  }
};
