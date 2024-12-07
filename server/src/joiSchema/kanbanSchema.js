import Joi from 'joi';
import { stageSchema, stageSchemaForUpdateKanban } from './stageSchema.js';

export const newKanbanSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow(null, ''),
});

export const kanbanSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow(null, ''),
  stages: Joi.array().items(stageSchema).min(1).required(),
});

export const updateKanbanSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow(null, ''),
  stages: Joi.array().items(stageSchemaForUpdateKanban).min(1).required(),
});
