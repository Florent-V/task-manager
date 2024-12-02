import Joi from 'joi';

export const statusSchema = Joi.object({
  name: Joi.string().max(50).required(),
  description: Joi.string().allow(null, '').max(200),
  maxRecord: Joi.number().integer().min(1).max(99).required(),
  kanbanId: Joi.number().integer().required(),
});

export const updateStatusSchema = Joi.object({
  name: Joi.string().max(50),
  description: Joi.string().allow(null, '').max(200),
  maxRecord: Joi.number().integer().min(1).max(99),
  kanbanId: Joi.number().integer(),
});
