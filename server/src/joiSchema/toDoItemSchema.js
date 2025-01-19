import Joi from 'joi';

export const toDoItemSchema = Joi.object({
  title: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
    'string.base': 'Le titre doit être une chaîne de caractères.',
    'string.empty': 'Le titre est obligatoire.',
    'string.max': 'Le titre ne peut pas dépasser 100 caractères.',
    'any.required': 'Le titre est obligatoire.',
  }),
  description: Joi.string()
    .allow(null, '')
    .max(255)
    .messages({
      'string.base': 'La description doit être une chaîne de caractères.',
    }),
  quantity: Joi.number()
    .min(1)
    .messages({
      'number.base': 'La quantité doit être un nombre.',
      'number.integer': 'LLa quantité doit être un nombre entier.',
      'number.min': 'La quantité doit être au moins de 1.',
    }),
  image: Joi.string(),
  done: Joi.boolean(),
  labelId: Joi.number().integer().min(1),
});

export const updateToDoItemSchema = Joi.object({
  title: Joi.string()
    .min(2)
    .max(50)
    .messages({
      'string.base': 'Le titre doit être une chaîne de caractères.',
      'string.empty': 'Le titre est obligatoire.',
      'string.max': 'Le titre ne peut pas dépasser 100 caractères.',
      'any.required': 'Le titre est obligatoire.',
    }),
  description: Joi.string()
    .allow(null, '')
    .max(255)
    .messages({
      'string.base': 'La description doit être une chaîne de caractères.',
    }),
  quantity: Joi.number()
    .min(1)
    .messages({
      'number.base': 'La quantité doit être un nombre.',
      'number.integer': 'LLa quantité doit être un nombre entier.',
      'number.min': 'La quantité doit être au moins de 1.',
    }),
  image: Joi.string()
    // .uri({ allowRelative: true })
    .allow(null)
    .messages({
      'string.base': 'Le champ image doit être une chaîne de caractères.',
      // 'string.uri': 'Le champ image doit être une URL valide.',
      'any.only': 'Le champ image doit être soit une chaîne, soit null.',
    }),
  done: Joi.boolean(),
  labelId: Joi.number().integer().min(1),
});