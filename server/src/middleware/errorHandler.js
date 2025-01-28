import { logger } from '../utils/logger.js';
import { AppError } from '../utils/errors.js';

export const errorHandler = (err, req, res, next) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    originalError: err.originalError
  });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }

  // Handle Supabase errors
  if (err.code && err.details && err.hint) {
    return res.status(400).json({
      status: 'error',
      message: err.message,
      details: err.details,
      hint: err.hint
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: err.message
    });
  }

  // Handle unexpected errors
  return res.status(500).json({
    status: 'error',
    message: 'An unexpected error occurred'
  });
};
