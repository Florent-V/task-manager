import { updateUserSchema } from '../joiSchema/userJoiSchema.js';
import _ from 'lodash';

export const setUpdateUserValidator = (req, res, next) => {
  req.body = _.pick(req.body, ['username', 'firstName', 'lastName', 'email']);
  req.schema = updateUserSchema;

  next();
};
