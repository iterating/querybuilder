import Joi from 'joi';

const querySchema = Joi.object({
  query: Joi.string().required(),
  parameters: Joi.array().items(Joi.any()).default([])
});

export const validateQuery = async (req, res, next) => {
  try {
    const validated = await querySchema.validateAsync(req.body);
    req.body = validated;
    next();
  } catch (error) {
    next(error);
  }
};
