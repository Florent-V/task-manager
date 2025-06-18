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
  // Estimation will be input as a string (e.g., "2d 4h") and parsed in the controller.
  // It's optional; if not provided, controller will default to 0.
  // estimation: Joi.string().allow(null, '').messages({
  //   'string.base': 'Le temps estimé doit être une chaîne de caractères (ex: "2h 30m").',
  // }),
  estimation: Joi.string()
    .pattern(/^(?:\d+d)?(?:\d+h)?(?:\d+m)?$/)
    .allow(null, '')
    .messages({
      'string.base': 'Le temps estimé doit être une chaîne de caractères (ex: "2h 30m").',
      'string.pattern.base': 'Le temps estimé doit être au format valide (ex: "2d 4h 30m").',
    }),
  loggedTime: Joi.number().integer().min(0).required().messages({
    'number.base': 'Le temps consigné doit être un nombre.',
    'number.integer': 'Le temps consigné doit être un nombre entier.',
    'number.min': 'Le temps consigné doit être au moins de 0.',
    'any.required': 'Le temps consigné est obligatoire.',
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
  estimation: Joi.string()
    .pattern(/^(?:\d+d)?(?:\d+h)?(?:\d+m)?$/)
    .allow(null, '')
    .messages({
      'string.base': 'Le temps estimé doit être une chaîne de caractères (ex: "2h 30m").',
      'string.pattern.base': 'Le temps estimé doit être au format valide (ex: "2d 4h 30m").',
    }),
  loggedTime: Joi.number().integer().min(0).required().messages({
    'number.base': 'Le temps consigné doit être un nombre.',
    'number.integer': 'Le temps consigné doit être un nombre entier.',
    'number.min': 'Le temps consigné doit être au moins de 0.',
    'any.required': 'Le temps consigné est obligatoire.',
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
