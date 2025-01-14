import Joi from 'joi';

export const commentSchema = Joi.object({
  title: Joi.string().allow(null, ''),
  content: Joi.string().required(),
});

export const updateCommentSchema = Joi.object({
  title: Joi.string().allow(null, ''),
  content: Joi.string().required(),
});
