import Joi from 'joi';

export const stageSchema = Joi.object({
  name: Joi.string().max(50)
    .required()
    .messages({
      'string.max': 'Le titre de la colonne ne peut pas dépasser 50 caractères.',
      'any.required': 'Le titre est obligatoire.',
    }),
  description: Joi.string()
    .max(150)
    .allow(null, '')
    .messages({
      'string.max': 'La description de la colonne ne peut pas dépasser 150 caractères.',
    }), maxRecord: Joi.number().integer().min(1).max(99).required(),
});

export const stageSchemaForUpdateKanban = Joi.object({
  id: Joi.number().integer(),
  name: Joi.string().max(50)
    .required()
    .messages({
      'string.max': 'Le titre de la colonne ne peut pas dépasser 50 caractères.',
      'any.required': 'Le titre est obligatoire.',
    }),
  description: Joi.string()
    .max(150)
    .allow(null, '')
    .messages({
      'string.max': 'La description de la colonne ne peut pas dépasser 150 caractères.',
    }), maxRecord: Joi.number().integer().min(1).max(99).required(), kanbanId: Joi.string().guid(),
});

export const updateStageSchema = Joi.object({
  name: Joi.string().max(50)
    .required()
    .messages({
      'string.max': 'Le titre de la colonne ne peut pas dépasser 50 caractères.',
      'any.required': 'Le titre est obligatoire.',
    }),
  description: Joi.string()
    .max(150)
    .allow(null, '')
    .messages({
      'string.max': 'La description de la colonne ne peut pas dépasser 150 caractères.',
    }), maxRecord: Joi.number().integer().min(1).max(99),
});
