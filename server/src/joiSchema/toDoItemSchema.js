import Joi from 'joi';

export const toDoItemSchema = Joi.object({
  title: Joi.string().min(3).max(30).required(),
  description: Joi.string().min(3).max(255),
  quantity: Joi.number().min(1),
  done: Joi.boolean(),
  labelId: Joi.number().integer().min(1),
});

export const updateToDoItemSchema = Joi.object({
  title: Joi.string().min(3).max(30),
  description: Joi.string().min(3).max(255),
  quantity: Joi.number().min(1),
  done: Joi.boolean(),
  labelId: Joi.number().integer().min(1),
});