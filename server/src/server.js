import 'dotenv/config';
import express from 'express';
import { router as authRouter } from './routes/auth.js';
import { router as queryRouter } from './routes/queries.js';
import { router as dataRouter } from './routes/data.js';
import { corsMiddleware } from './middleware/cors.js';
import { logger } from './utils/logger.js';

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

// Error handling for JSON parsing
app.use(express.json({
  limit: '1mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({ 
        error: 'Invalid JSON',
        message: 'The request body contains invalid JSON'
      });
      throw new Error('Invalid JSON');
    }
  }
}));

// Apply CORS middleware
app.use(corsMiddleware);

// Health check endpoint (before other routes)
app.get('/health', (req, res) => {
  // Check Supabase connection
  const supabaseAvailable = process.env.SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    supabase: supabaseAvailable ? 'configured' : 'not configured'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({ 
    name: 'Data Analytics API',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    docs: '/api/docs'
  });
});

// API Routes with versioning prefix
const apiPrefix = '/api';
app.use(`${apiPrefix}/auth`, authRouter);
app.use(`${apiPrefix}/queries`, queryRouter);
app.use(`${apiPrefix}/data`, dataRouter);

// API Documentation endpoint
app.get(`${apiPrefix}/docs`, (req, res) => {
  res.status(200).json({
    version: '1.0.0',
    endpoints: {
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register',
        refresh: 'POST /api/auth/refresh'
      },
      queries: {
        execute: 'POST /api/queries/execute',
        history: 'GET /api/queries/history'
      },
      data: {
        tables: 'GET /api/data/tables',
        columns: 'GET /api/data/tables/:table/columns'
      }
    }
  });
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

// Start server if not in production (Vercel handles this in production)
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    logger.info(`Server running on port ${port}`);
    logger.info(`Environment: ${process.env.NODE_ENV}`);
  });
}

export default app;
