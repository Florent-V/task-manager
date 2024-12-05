import Joi from 'joi';

export const stageSchema = Joi.object({
  name: Joi.string().max(50).required(),
  description: Joi.string().allow(null, '').max(200),
  maxRecord: Joi.number().integer().min(1).max(99).required(),
});

export const stageSchemaForUpdateKanban = Joi.object({
  id: Joi.number().integer(),
  name: Joi.string().max(50).required(),
  description: Joi.string().allow(null, '').max(200),
  maxRecord: Joi.number().integer().min(1).max(99).required(),
  kanbanId: Joi.string().guid(),
});

export const updateStageSchema = Joi.object({
  name: Joi.string().max(50),
  description: Joi.string().allow(null, '').max(200),
  maxRecord: Joi.number().integer().min(1).max(99),
});
