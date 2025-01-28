import express from 'express';
import QueryExecutor from '../services/queryExecutor.js';
import { validateQueryRequest } from '../middleware/validation.js';

const router = express.Router();

router.post('/execute', validateQueryRequest, async (req, res, next) => {
  try {
    const { query, dbConfig } = req.body;
    const data = await QueryExecutor.executeQuery(dbConfig, query);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

export default router;
