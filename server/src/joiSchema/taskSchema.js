import Joi from 'joi';

export const taskSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow(null, ''),
  estimation: Joi.number().integer().min(0).required(),
  loggedTime: Joi.number().integer().min(0).required(),
  priorityId: Joi.number().integer(),
  sizeId: Joi.number().integer(),
  stageId: Joi.number().integer(),
  assignedToId: Joi.number().integer(),
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
