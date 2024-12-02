import Joi from 'joi';

export const kanbanSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow(null, ''),
});

export const newKanbanSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow(null, ''),
  status: Joi.array().items(
    Joi.object({
      name: Joi.string().max(50).required(),
      description: Joi.string().allow(null, '').max(200),
      maxRecord: Joi.number().integer().min(1).max(99).required(),
    })
  ).required() // Le tableau de status est requis
});

export const updateKanbanSchema = Joi.object({
  title: Joi.string(),
  description: Joi.string().allow(null, ''),
});
