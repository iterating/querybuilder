import { createClient } from '@supabase/supabase-js';
import { MongoClient } from 'mongodb';
import mysql from 'mysql2/promise';
import pg from 'pg';
import { logger } from '../utils/logger.js';

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

class DatabaseService {
  static getSupabaseClient(url, apiKey) {
    const cacheKey = `supabase:${url}`;
    if (!dbClients.has(cacheKey)) {
      logger.info(`Creating new Supabase connection: ${url}`);
      dbClients.set(cacheKey, {
        client: createClient(url, apiKey),
        timestamp: Date.now()
      });
    }
    dbClients.get(cacheKey).timestamp = Date.now();
    return dbClients.get(cacheKey).client;
  }

  static async getMongoClient(url) {
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
    dbClients.get(cacheKey).timestamp = Date.now();
    return dbClients.get(cacheKey).client;
  }

  static async getMySQLClient(url) {
    const cacheKey = `mysql:${url}`;
    if (!dbClients.has(cacheKey)) {
      logger.info(`Creating new MySQL connection: ${url}`);
      const connection = await mysql.createConnection(url);
      dbClients.set(cacheKey, {
        client: connection,
        timestamp: Date.now()
      });
    }
    dbClients.get(cacheKey).timestamp = Date.now();
    return dbClients.get(cacheKey).client;
  }

  static async getPostgresClient(url) {
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
    dbClients.get(cacheKey).timestamp = Date.now();
    return dbClients.get(cacheKey).client;
  }

  static getActiveConnections() {
    return Array.from(dbClients.entries()).map(([key, value]) => ({
      type: key.split(':')[0],
      lastUsed: new Date(value.timestamp).toISOString()
    }));
  }

  static getConnectionCount() {
    return dbClients.size;
  }
}

export default DatabaseService;
