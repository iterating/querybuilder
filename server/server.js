import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import { logger } from './utils/logger.js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Validate required environment variables
const requiredEnvVars = ['SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  logger.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

const app = express();

// Basic request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint (before other routes)
app.get('/health', (req, res) => {
  // Check Supabase connection
  const supabaseAvailable = process.env.SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  res.status(200).json({ 
    status: 'ok',
    supabase: supabaseAvailable ? 'configured' : 'not configured'
  });
});

// Query execution endpoint
app.post('/api/queries/execute', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Execute the query using Supabase
    const { data, error } = await supabase
      .from('your_table_name')  // Replace with your actual table name
      .select()
      .textSearch('content', query);  // Adjust this based on your actual query needs

    if (error) {
      logger.error('Query execution error:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ data });
  } catch (error) {
    logger.error('Unexpected error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 404 handler
app.use((req, res) => {
  logger.warn(`404 - Not Found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    error: 'Not Found',
    message: `The requested path ${req.path} was not found`,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Handle specific error types
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Origin not allowed',
      timestamp: new Date().toISOString()
    });
  }

  // Handle Supabase errors
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: err.error || 'Database Error',
      message: err.message,
      timestamp: new Date().toISOString()
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message,
      details: err.details,
      timestamp: new Date().toISOString()
    });
  }

  // Generic error response
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

const port = process.env.PORT || 3000
app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});
