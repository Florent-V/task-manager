import Joi from 'joi';

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
