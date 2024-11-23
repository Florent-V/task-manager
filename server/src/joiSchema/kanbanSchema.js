import Joi from 'joi';

export const kanbanSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow(null, ''),
});

export const updateKanbanSchema = Joi.object({
  title: Joi.string(),
  description: Joi.string().allow(null, ''),
});
