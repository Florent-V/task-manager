import Joi from 'joi';

export const createImputationSchema = Joi.object({
  timeSpentString: Joi.string().required().messages({
    'string.base': `"timeSpentString" should be a type of 'text'`,
    'string.empty': `"timeSpentString" cannot be an empty field`,
    'any.required': `"timeSpentString" is a required field`,
  }),
  comment: Joi.string().allow('').optional().messages({
    'string.base': `"comment" should be a type of 'text'`,
  }),
});

export const updateImputationSchema = Joi.object({
  timeSpentString: Joi.string().optional().messages({
    'string.base': `"timeSpentString" should be a type of 'text'`,
  }),
  comment: Joi.string().allow('').optional().messages({
    'string.base': `"comment" should be a type of 'text'`,
  }),
}).or('timeSpentString', 'comment').messages({
  'object.missing': 'At least one of the fields "timeSpentString" or "comment" must be provided for an update.',
});