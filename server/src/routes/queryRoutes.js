import express from 'express';
import { validateQuery } from '../middleware/queryValidator.js';
import { authenticate } from '../middleware/auth.js';
import { queryRateLimit } from '../middleware/rateLimit.js';
import QueryExecutor from '../services/queryExecutor.js';

const router = express.Router();

// Apply rate limiting to all routes
router.use(queryRateLimit);

// Public endpoint for executing queries
router.post('/execute', validateQuery, async (req, res, next) => {
  try {
    const { query, dbConfig } = req.body;
    const data = await QueryExecutor.executeQuery(dbConfig, query);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// Protected routes require authentication
router.use(authenticate);

router.get('/history', async (req, res, next) => {
  try {
    const history = await QueryExecutor.getQueryHistory(req.user.id);
    res.json({ history });
  } catch (error) {
    next(error);
  }
});

export default router;
