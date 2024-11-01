import Joi from 'joi';

export const toDoListSchema = Joi.object({
  title: Joi.string().min(3).max(50).required(),
  description: Joi.string().min(3).max(255),
  typeId: Joi.number().integer().positive().required(),
});

export const updateToDoListSchema = Joi.object({
  title: Joi.string().min(3).max(50),
  description: Joi.string().min(3).max(255),
  typeId: Joi.number().integer().positive(),
});
