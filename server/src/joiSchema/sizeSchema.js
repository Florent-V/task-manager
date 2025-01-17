import Joi from 'joi';

export const sizeSchema = Joi.object({
  label: Joi.string().required(),
  name: Joi.string().required(),
  color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).required(),
});

export const updateSizeSchema = Joi.object({
  label: Joi.string(),
  name: Joi.string(),
  color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/),
});
