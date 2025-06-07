import Joi from 'joi';

export const signupSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  firstName: Joi.string().min(3).max(30).required(),
  lastName: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  confirmPassword: Joi.any()
    .valid(Joi.ref('password'))
    .required()
    .label('confirm password')
    .messages({ 'any.only': '{{#label}} does not match password' }),
});

export const signinSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const updateUserSchema = Joi.object({
  username: Joi.string().min(3).max(30),
  firstName: Joi.string().min(3).max(30),
  lastName: Joi.string().min(3).max(30),
  email: Joi.string().email(),
  image: Joi.string()
    // .uri({ allowRelative: true })
    .allow(null)
    .messages({
      'string.base': 'Le champ image doit être une chaîne de caractères.',
      // 'string.uri': 'Le champ image doit être une URL valide.',
      'any.only': 'Le champ image doit être soit une chaîne, soit null.',
    }),
});
