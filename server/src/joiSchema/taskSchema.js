import Joi from 'joi';

export const taskSchema = Joi.object({
  title: Joi.string().max(100).required().messages({
    'string.base': 'Le titre doit être une chaîne de caractères.',
    'string.empty': 'Le titre est obligatoire.',
    'string.max': 'Le titre ne peut pas dépasser 100 caractères.',
    'any.required': 'Le titre est obligatoire.',
  }),
  description: Joi.string().allow(null, '').messages({
    'string.base': 'La description doit être une chaîne de caractères.',
  }),
  estimation: Joi.number().greater(0).required().messages({
    'number.base': `"time" should be a type of 'number'`,
    'number.greater': `"time" should be greater than 0`,
    'any.required': `"time" is a required field`,
  }),
  priorityId: Joi.number().integer().messages({
    '*': 'La priorité n’est pas valide.',
  }),
  sizeId: Joi.number().integer().messages({
    '*': 'La taille n’est pas valide.',
  }),
  stageId: Joi.number().integer().allow(null).optional().messages({
    '*': 'La colonne n’est pas valide.',
  }),
  assignedToId: Joi.number().integer().allow(null).optional().messages({
    '*': "L'utilisateur n’est pas valide.",
  }),
});

export const updateTaskSchema = Joi.object({
  title: Joi.string().max(100).required().messages({
    'string.base': 'Le titre doit être une chaîne de caractères.',
    'string.empty': 'Le titre est obligatoire.',
    'string.max': 'Le titre ne peut pas dépasser 100 caractères.',
    'any.required': 'Le titre est obligatoire.',
  }),
  description: Joi.string().allow(null, '').messages({
    'string.base': 'La description doit être une chaîne de caractères.',
  }),
  estimation: Joi.number().greater(0).required().messages({
    'number.base': `"time" should be a type of 'number'`,
    'number.greater': `"time" should be greater than 0`,
    'any.required': `"time" is a required field`,
  }),
  priorityId: Joi.number().integer().messages({
    '*': 'La priorité n’est pas valide.',
  }),
  sizeId: Joi.number().integer().messages({
    '*': 'La taille n’est pas valide.',
  }),
  stageId: Joi.number().integer().allow(null).optional().messages({
    '*': 'La colonne n’est pas valide.',
  }),
  assignedToId: Joi.number().integer().allow(null).optional().messages({
    '*': "L'utilisateur n’est pas valide.",
  }),
});

export const updateStageTaskSchema = Joi.object({
  stageId: Joi.number().integer().allow(null).optional().messages({
    '*': 'La colonne n’est pas valide.',
  }),
  assignedToId: Joi.number().integer().allow(null).optional().messages({
    '*': "L'utilisateur n’est pas valide.",
  }),
});
