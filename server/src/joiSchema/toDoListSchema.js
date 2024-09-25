import Joi from 'joi';

export const toDoListSchema = Joi.object({
  title: Joi.string().min(3).max(30).required(),
  description: Joi.string().min(3).max(255),
});

export const updateToDoListSchema = Joi.object({
  title: Joi.string().min(3).max(30),
  description: Joi.string().min(3).max(255),
});
