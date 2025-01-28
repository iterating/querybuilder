import Joi from 'joi';

export const createQuerySchema = Joi.object({
  name: Joi.string().trim().allow('').default('Unnamed Query'),
  query: Joi.string().required(),
  database_type: Joi.string().required(),
});

export const updateFavoriteSchema = Joi.object({
  is_favorite: Joi.boolean().required(),
});
