import { signupSchema, signinSchema, updateUserSchema } from "../joiSchema/userJoiSchema.js";
import _ from 'lodash';

export const setSignupValidator = (req, res, next) => {
  req.body = _.pick(req.body, ['username', 'firstName', 'lastName', 'email', 'password', 'confirmPassword']);
  req.schema = signupSchema;

  next();
}

export const setSigninValidator = (req, res, next) => {
  req.body = _.pick(req.body, ['email', 'password']);
  req.schema = signinSchema;

  next();
}

export const setUpdateUserValidator = (req, res, next) => {
  req.body = _.pick(req.body, ['username', 'firstName', 'lastName', 'email', 'password', 'confirmPassword']);
  req.schema = updateUserSchema;

  next();
}
