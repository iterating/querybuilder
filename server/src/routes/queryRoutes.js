import express from 'express';
import { logger } from '../utils/logger.js';
import { queryExecutor } from '../services/queryExecutor.js';

const router = express.Router();

// Request validation middleware
const validateQueryRequest = (req, res, next) => {
  const { query, dbConfig } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  if (!dbConfig) {
    return res.status(400).json({ error: 'Database configuration is required' });
  }

  const { type, url, tableName } = dbConfig;
  if (!type || !url) {
    return res.status(400).json({ error: 'Database type and URL are required' });
  }

  if (!['supabase', 'mongodb', 'mysql', 'postgres'].includes(type)) {
    return res.status(400).json({ error: 'Unsupported database type' });
  }

  // Validate tableName is provided when using placeholders in query
  if (query.includes('{table_name}') && !tableName) {
    return res.status(400).json({ error: 'Table name is required when using {table_name} placeholder' });
  }

  next();
};

// Execute query endpoint
router.post('/execute', validateQueryRequest, async (req, res) => {
  try {
    logger.info('Executing query with config:', {
      dbType: req.body.dbConfig.type,
      query: req.body.query
    });

    const { query, dbConfig } = req.body;
    const data = await queryExecutor.executeQuery(dbConfig, query);
    
    logger.info('Query executed successfully');
    res.json({ data });
  } catch (error) {
    logger.error('Query execution error:', {
      error: error.message,
      stack: error.stack,
      dbType: req.body?.dbConfig?.type,
      query: req.body?.query
    });
    
    res.status(500).json({ 
      error: error.message,
      type: error.name,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

export default router;
