import express from 'express';
import { validateQuery } from '../middleware/queryValidator.js';
import { authenticate } from '../middleware/auth.js';
import { queryRateLimit } from '../middleware/rateLimit.js';
import { executeQuery, getQueryHistory } from '../controllers/queryController.js';

export const router = express.Router();

// Apply rate limiting to all routes
router.use(queryRateLimit);

// Public endpoint for executing queries
router.post('/execute', validateQuery, executeQuery);

// Protected routes require authentication
router.use(authenticate);
router.get('/history', getQueryHistory);
