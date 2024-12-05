import { lowercaseFirstLetter } from "../services/stringService.js";
import NotFoundError from "../error/notFoundError.js";

export const getAll = async (req, res, next) => {
  try {
    const resources = await req.entity.findAll();
    res.data[lowercaseFirstLetter(req.entity.options.name.plural)] = resources;
    next();
  } catch (error) {
    return next(error);
  }
}

export const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resource = await req.entity.findByPk(id);

    if (!resource) throw new NotFoundError('No record found');

    res.data[lowercaseFirstLetter(req.entity.options.name.singular)] = resource;
    next();
  } catch (error) {
    return next(error);
  }
}

export const create = async (req, res, next) => {
  try {
    res.data[lowercaseFirstLetter(req.entity.options.name.singular)] = await req.entity.create(req.body);
    next();
  } catch (error) {
    return next(error);
  }
}

export const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resource = await req.entity.findByPk(id);

    if (!resource) throw new NotFoundError('No record found');

    await resource.update(req.body);

    res.data[lowercaseFirstLetter(req.entity.options.name.singular)] = resource;
    next();
  } catch (error) {
    return next(error);
  }
}

export const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await req.entity.destroy({ where: { id } });

    if (!deleted) throw new NotFoundError(`No record found in ${req.entity.options.name.singular} with id ${id}`);

    res.status(204).json();
  } catch (error) {
    return next(error);
  }
}