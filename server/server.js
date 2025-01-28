import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import { MongoClient } from 'mongodb';
import mysql from 'mysql2/promise';
import pg from 'pg';
import { logger } from './utils/logger.js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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

// Middleware
app.use(cors());
app.use(express.json());

// Database client cache
const dbClients = new Map();

// Database connection functions
const getSupabaseClient = (url, apiKey) => {
  const cacheKey = `supabase:${url}`;
  if (!dbClients.has(cacheKey)) {
    dbClients.set(cacheKey, createClient(url, apiKey));
  }
  return dbClients.get(cacheKey);
};

const getMongoClient = async (url) => {
  const cacheKey = `mongodb:${url}`;
  if (!dbClients.has(cacheKey)) {
    const client = new MongoClient(url);
    await client.connect();
    dbClients.set(cacheKey, client);
  }
  return dbClients.get(cacheKey);
};

const getMySQLClient = async (url) => {
  const cacheKey = `mysql:${url}`;
  if (!dbClients.has(cacheKey)) {
    const connection = await mysql.createConnection(url);
    dbClients.set(cacheKey, connection);
  }
  return dbClients.get(cacheKey);
};

const getPostgresClient = async (url) => {
  const cacheKey = `postgres:${url}`;
  if (!dbClients.has(cacheKey)) {
    const client = new pg.Client(url);
    await client.connect();
    dbClients.set(cacheKey, client);
  }
  return dbClients.get(cacheKey);
};

// Execute query based on database type
const executeQuery = async (dbConfig, query) => {
  const { type, url, apiKey, tableName } = dbConfig;

  try {
    switch (type) {
      case 'supabase': {
        const supabase = getSupabaseClient(url, apiKey);
        const { data, error } = await supabase
          .from(tableName)
          .select()
          .textSearch('content', query);
        if (error) throw error;
        return data;
      }

      case 'mongodb': {
        const client = await getMongoClient(url);
        const db = client.db();
        const collection = db.collection(tableName);
        return await collection.find({ $text: { $search: query } }).toArray();
      }

      case 'mysql': {
        const connection = await getMySQLClient(url);
        const [rows] = await connection.execute(query);
        return rows;
      }

      case 'postgres': {
        const client = await getPostgresClient(url);
        const result = await client.query(query);
        return result.rows;
      }

      default:
        throw new Error(`Unsupported database type: ${type}`);
    }
  } catch (error) {
    logger.error('Database query error:', error);
    throw error;
  }
};

// Basic request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// Health check endpoint
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
    const { query, dbConfig } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    if (!dbConfig || !dbConfig.type || !dbConfig.url) {
      return res.status(400).json({ error: 'Database configuration is required' });
    }

    const data = await executeQuery(dbConfig, query);
    res.json({ data });
  } catch (error) {
    logger.error('Query execution error:', error);
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
