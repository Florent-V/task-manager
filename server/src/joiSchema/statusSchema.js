import Joi from 'joi';

export const statusSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow(null, ''),
  maxRecord: Joi.number().integer().min(1).required(),
  kanbanId: Joi.number().integer().required(),
});

export const updateStatusSchema = Joi.object({
  name: Joi.string(),
  description: Joi.string().allow(null, ''),
  maxRecord: Joi.number().integer().min(1),
  kanbanId: Joi.number().integer(),
});
