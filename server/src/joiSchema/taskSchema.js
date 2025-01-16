import Joi from 'joi';

export const taskSchema = Joi.object({
  title: Joi.string()
    .max(100)
    .required()
    .messages({
      'string.base': 'Le titre doit être une chaîne de caractères.',
      'string.empty': 'Le titre est obligatoire.',
      'string.max': 'Le titre ne peut pas dépasser 100 caractères.',
      'any.required': 'Le titre est obligatoire.',
    }),
  description: Joi.string()
    .allow(null, '')
    .messages({
      'string.base': 'La description doit être une chaîne de caractères.',
    }),
  estimation: Joi.number()
    .integer()
    .min(0)
    .required()
    .messages({
      'number.base': 'Le temps estimé doit être un nombre.',
      'number.integer': 'Le temps estimé doit être un nombre entier.',
      'number.min': 'Le temps estimé doit être au moins de 0.',
      'any.required': 'Le temps estimé est obligatoire.',
    }),
  loggedTime: Joi.number()
    .integer()
    .min(0)
    .required()
    .messages({
      'number.base': 'Le temps consigné doit être un nombre.',
      'number.integer': 'Le temps consigné doit être un nombre entier.',
      'number.min': 'Le temps consigné doit être au moins de 0.',
      'any.required': 'Le temps consigné est obligatoire.',
    }),
  priorityId: Joi.number()
    .integer()
    .messages({
      '*': 'La priorité n’est pas valide.',
    }),
  sizeId: Joi.number()
    .integer()
    .messages({
      '*': 'La taille n’est pas valide.',
    }),
  stageId: Joi.number()
    .integer()
    .messages({
      '*': 'La colonne n’est pas valide.',
    }),
  assignedToId: Joi.number()
    .integer()
    .messages({
      '*': "L'utilisateur n’est pas valide.",
    }),
});

export const updateTaskSchema = Joi.object({
  title: Joi.string(),
  description: Joi.string().allow(null, ''),
  estimation: Joi.number().integer().min(0),
  loggedTime: Joi.number().integer().min(0),
  priorityId: Joi.number().integer(),
  sizeId: Joi.number().integer(),
  stageId: Joi.number().integer(),
  assignedToId: Joi.number().integer(),
});
