import Joi from 'joi';

export const createImputationSchema = Joi.object({
  timeSpent: Joi.number().greater(0).required().messages({
    'number.base': `"time" should be a type of 'number'`,
    'number.greater': `"time" should be greater than 0`,
    'any.required': `"time" is a required field`,
  }),
  comment: Joi.string().allow('', null).optional().messages({
    'string.base': `"comment" should be a type of 'text'`,
  }),
  date: Joi.date().allow(null).optional().messages({
    'date.base': `"date" should be a valid date`,
  }),
});

export const updateImputationSchema = Joi.object({
  timeSpent: Joi.number().greater(0).required().messages({
    'number.base': `"time" should be a type of 'number'`,
    'number.greater': `"time" should be greater than 0`,
    'any.required': `"time" is a required field`,
  }),
  comment: Joi.string().allow('', null).optional().messages({
    'string.base': `"comment" should be a type of 'text'`,
  }),
  date: Joi.date().allow(null).optional().messages({
    'date.base': `"date" should be a valid date`,
  }),
}).or('timeSpent', 'comment').messages({
  'object.missing': 'At least one of the fields "timeSpentString" or "comment" must be provided for an update.',
});