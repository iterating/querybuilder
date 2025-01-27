import Joi from 'joi';

const MAX_QUERY_LENGTH = 10000; // 10KB limit
const MAX_PARAMS = 100;

const querySchema = Joi.object({
  query: Joi.string()
    .max(MAX_QUERY_LENGTH)
    .required()
    .custom((value, helpers) => {
      // Prevent multiple statements
      if (value.includes(';')) {
        return helpers.error('string.multipleStatements');
      }
      // Prevent dangerous operations
      const dangerous = /\b(DROP|DELETE|TRUNCATE|ALTER|GRANTw|REVOKE)\b/i;
      if (dangerous.test(value)) {
        return helpers.error('string.dangerousOperation');
      }
      return value;
    }),
  parameters: Joi.array()
    .items(Joi.alternatives().try(
      Joi.string(),
      Joi.number(),
      Joi.boolean(),
      Joi.date()
    ))
    .max(MAX_PARAMS)
    .default([])
});

export const validateQuery = async (req, res, next) => {
  try {
    const validated = await querySchema.validateAsync(req.body);
    req.body = validated;
    next();
  } catch (error) {
    res.status(400).json({
      error: 'Invalid query',
      details: error.details?.[0]?.message
    });
  }
};
