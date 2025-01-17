import Size from '../models/sizeModel.js';
import { sizeSchema, updateSizeSchema } from '../joiSchema/sizeSchema.js';

export const setEntity = (req, res, next) => {
  req.entity = Size;
  next();
};

export const setCreateValidator = (req, res, next) => {
  req.schema = sizeSchema;
  next();
};

export const setUpdateValidator = (req, res, next) => {
  req.schema = updateSizeSchema;
  next();
};
