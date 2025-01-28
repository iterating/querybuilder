import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import { MongoClient } from 'mongodb';
import mysql from 'mysql2/promise';
import pg from 'pg';
import { logger } from './utils/logger.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database client cache with TTL
const dbClients = new Map();
const CLIENT_TTL = 1000 * 60 * 30; // 30 minutes

// Cleanup expired connections periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of dbClients) {
    if (now - value.timestamp > CLIENT_TTL) {
      if (value.client.end) value.client.end();
      if (value.client.close) value.client.close();
      dbClients.delete(key);
      logger.info(`Closed expired connection: ${key}`);
    }
  }
}, 1000 * 60 * 5); // Check every 5 minutes

// Database connection functions
const getSupabaseClient = (url, apiKey) => {
  const cacheKey = `supabase:${url}`;
  if (!dbClients.has(cacheKey)) {
    logger.info(`Creating new Supabase connection: ${url}`);
    dbClients.set(cacheKey, {
      client: createClient(url, apiKey),
      timestamp: Date.now()
    });
  }
  dbClients.get(cacheKey).timestamp = Date.now(); // Update timestamp
  return dbClients.get(cacheKey).client;
};

const getMongoClient = async (url) => {
  const cacheKey = `mongodb:${url}`;
  if (!dbClients.has(cacheKey)) {
    logger.info(`Creating new MongoDB connection: ${url}`);
    const client = new MongoClient(url);
    await client.connect();
    dbClients.set(cacheKey, {
      client,
      timestamp: Date.now()
    });
  }
  dbClients.get(cacheKey).timestamp = Date.now(); // Update timestamp
  return dbClients.get(cacheKey).client;
};

const getMySQLClient = async (url) => {
  const cacheKey = `mysql:${url}`;
  if (!dbClients.has(cacheKey)) {
    logger.info(`Creating new MySQL connection: ${url}`);
    const connection = await mysql.createConnection(url);
    dbClients.set(cacheKey, {
      client: connection,
      timestamp: Date.now()
    });
  }
  dbClients.get(cacheKey).timestamp = Date.now(); // Update timestamp
  return dbClients.get(cacheKey).client;
};

const getPostgresClient = async (url) => {
  const cacheKey = `postgres:${url}`;
  if (!dbClients.has(cacheKey)) {
    logger.info(`Creating new PostgreSQL connection: ${url}`);
    const client = new pg.Client(url);
    await client.connect();
    dbClients.set(cacheKey, {
      client,
      timestamp: Date.now()
    });
  }
  dbClients.get(cacheKey).timestamp = Date.now(); // Update timestamp
  return dbClients.get(cacheKey).client;
};

// Query execution handlers for each database type
const executeSupabaseQuery = async (client, query, tableName) => {
  if (query.trim().toLowerCase().startsWith('select')) {
    // For SELECT queries, use Supabase's query builder
    const { data, error } = await client
      .from(tableName)
      .select(query.replace(/^select\s+/i, '').split('from')[0].trim());
    if (error) throw error;
    return data;
  } else {
    // For other queries, use RPC if available
    const { data, error } = await client.rpc('execute_raw_query', { query_text: query });
    if (error) throw error;
    return data;
  }
};

const executeMongoQuery = async (client, query, tableName) => {
  const db = client.db();
  const collection = db.collection(tableName);

  try {
    // Try to parse as a MongoDB query object
    if (typeof query === 'string') {
      // Handle different MongoDB operations
      if (query.startsWith('db.')) {
        // Execute as a MongoDB command
        const command = eval(`(${query.replace('db.', '').replace('.find', '')})`);
        return await collection.find(command).toArray();
      } else {
        // Try to parse as a JSON query
        const parsedQuery = JSON.parse(query.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3'));
        return await collection.find(parsedQuery).toArray();
      }
    } else {
      return await collection.find(query).toArray();
    }
  } catch (e) {
    logger.error('MongoDB query parsing error:', e);
    throw new Error('Invalid MongoDB query format');
  }
};

const executeMySQLQuery = async (client, query) => {
  const [rows] = await client.execute(query);
  return rows;
};

const executePostgresQuery = async (client, query) => {
  const result = await client.query(query);
  return result.rows;
};

// Main query execution function
const executeQuery = async (dbConfig, query) => {
  const { type, url, apiKey, tableName } = dbConfig;

  try {
    switch (type) {
      case 'supabase': {
        const client = getSupabaseClient(url, apiKey);
        return await executeSupabaseQuery(client, query, tableName);
      }

      case 'mongodb': {
        const client = await getMongoClient(url);
        return await executeMongoQuery(client, query, tableName);
      }

      case 'mysql': {
        const client = await getMySQLClient(url);
        return await executeMySQLQuery(client, query);
      }

      case 'postgres': {
        const client = await getPostgresClient(url);
        return await executePostgresQuery(client, query);
      }

      default:
        throw new Error(`Unsupported database type: ${type}`);
    }
  } catch (error) {
    logger.error(`Database query error (${type}):`, error);
    throw error;
  }
};

// Request validation middleware
const validateQueryRequest = (req, res, next) => {
  const { query, dbConfig } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  if (!dbConfig) {
    return res.status(400).json({ error: 'Database configuration is required' });
  }

  const { type, url } = dbConfig;
  if (!type || !url) {
    return res.status(400).json({ error: 'Database type and URL are required' });
  }

  if (!['supabase', 'mongodb', 'mysql', 'postgres'].includes(type)) {
    return res.status(400).json({ error: 'Unsupported database type' });
  }

  next();
};

// Health check endpoint
app.get('/health', (req, res) => {
  const activeConnections = Array.from(dbClients.entries()).map(([key, value]) => ({
    type: key.split(':')[0],
    lastUsed: new Date(value.timestamp).toISOString()
  }));

  res.status(200).json({ 
    status: 'ok',
    activeConnections,
    connectionCount: dbClients.size
  });
});

// Query execution endpoint
app.post('/api/queries/execute', validateQueryRequest, async (req, res) => {
  try {
    const { query, dbConfig } = req.body;
    const data = await executeQuery(dbConfig, query);
    res.json({ data });
  } catch (error) {
    logger.error('Query execution error:', error);
    res.status(500).json({ 
      error: error.message,
      type: error.name
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Server error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});
