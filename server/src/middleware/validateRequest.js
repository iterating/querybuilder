import Joi from 'joi';
import { ValidationError } from '../utils/errors.js';

export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const message = error.details.map(detail => detail.message).join(', ');
      next(new ValidationError(message));
      return;
    }

    next();
  };
};
