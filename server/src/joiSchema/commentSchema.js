import Joi from 'joi';

export const commentSchema = Joi.object({
  title: Joi.string()
    .allow(null, '')
    .max(50)
    .messages({
      'string.max': 'Le titre ne peut pas dépasser 50 caractères.',
    }),
  content: Joi.string()
    .required()
    .messages({
      'string.max': 'La description ne peut pas dépasser 250 caractères.',
      'any.required': 'Le contenu est obligatoire.',
    }),
});

export const updateCommentSchema = Joi.object({
  title: Joi.string()
    .allow(null, '')
    .max(50)
    .messages({
      'string.max': 'Le titre ne peut pas dépasser 50 caractères.',
    }),
  content: Joi.string()
    .required()
    .messages({
      'string.max': 'La description ne peut pas dépasser 250 caractères.',
      'any.required': 'Le contenu est obligatoire.',
    }),
});