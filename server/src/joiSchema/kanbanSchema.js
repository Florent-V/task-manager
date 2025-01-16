import Joi from 'joi';
import { stageSchema, stageSchemaForUpdateKanban } from './stageSchema.js';

export const newKanbanSchema = Joi.object({
  title: Joi.string()
    .max(50)
    .required()
    .messages({
      'string.max': 'Le titre ne peut pas dépasser 50 caractères.',
      'any.required': 'Le titre est obligatoire.',
    }),
  description: Joi.string()
    .max(250)
    .allow(null, '')
    .messages({
      'string.max': 'La description ne peut pas dépasser 250 caractères.',
    }),
});

export const kanbanSchema = Joi.object({
  title: Joi.string()
    .max(50)
    .required()
    .messages({
      'string.max': 'Le titre ne peut pas dépasser 50 caractères.',
      'any.required': 'Le titre est obligatoire.',
    }),
  description: Joi.string()
    .max(250)
    .allow(null, '')
    .messages({
      'string.max': 'La description ne peut pas dépasser 250 caractères.',
    }),
  stages: Joi.array()
    .items(stageSchema)
    .min(1)
    .messages({
      'array.min': 'Le kanban doit avoir au moins une colonne.',
    })
    .required(),
});

export const updateKanbanSchema = Joi.object({
  title: Joi.string()
    .max(50)
    .required()
    .messages({
      'string.max': 'Le titre ne peut pas dépasser 50 caractères.',
      'any.required': 'Le titre est obligatoire.',
    }),
  description: Joi.string()
    .max(250)
    .allow(null, '')
    .messages({
      'string.max': 'La description ne peut pas dépasser 250 caractères.',
    }),
  stages: Joi.array()
    .items(stageSchemaForUpdateKanban)
    .min(1)
    .messages({
      'array.min': 'Le kanban doit avoir au moins une colonne.',
    })
    .required(),
});
