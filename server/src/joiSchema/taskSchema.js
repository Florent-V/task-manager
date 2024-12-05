import Joi from 'joi';

export const taskSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow(null, ''),
  estimation: Joi.number().integer().min(0).required(),
  loggedTime: Joi.number().integer().min(0).required(),
  kanbanId: Joi.number().integer().required(),
  priorityId: Joi.number().integer().required(),
  sizeId: Joi.number().integer().required(),
  stageId: Joi.number().integer().required(),
  userId: Joi.number().integer().required(),
});

export const updateTaskSchema = Joi.object({
  title: Joi.string(),
  description: Joi.string().allow(null, ''),
  estimation: Joi.number().integer().min(0),
  loggedTime: Joi.number().integer().min(0),
  kanbanId: Joi.number().integer(),
  priorityId: Joi.number().integer(),
  sizeId: Joi.number().integer(),
  stageId: Joi.number().integer(),
  userId: Joi.number().integer(),
});
