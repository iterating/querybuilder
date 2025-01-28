import Joi from 'joi';

export const createTemplateSchema = Joi.object({
  name: Joi.string().trim().required(),
  query: Joi.string().required(),
  description: Joi.string().trim().allow(''),
});
