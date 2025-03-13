import { createClient } from '@supabase/supabase-js';
import { MongoClient } from 'mongodb';
import mysql from 'mysql2/promise';
import pg from 'pg';
import { logger } from '../utils/logger.js';
import fetch from 'node-fetch';

class DatabaseService {
  constructor() {
    this.clients = new Map();
    this.CLIENT_TTL = 1000 * 60 * 30; // 30 minutes
    this.startCleanupInterval();
  }

  startCleanupInterval() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.clients) {
        if (now - value.timestamp > this.CLIENT_TTL) {
          if (value.client.end) value.client.end();
          if (value.client.close) value.client.close();
          this.clients.delete(key);
          logger.info(`Closed expired connection: ${key}`);
        }
      }
    }, 1000 * 60 * 5); // Check every 5 minutes
  }

  getSupabaseClient(url, apiKey) {
    const cacheKey = `supabase:${url}`;
    if (!this.clients.has(cacheKey)) {
      logger.info(`Creating new Supabase connection: ${url}`);
      const options = {
        auth: { persistSession: false },
        global: { fetch }
      };
      this.clients.set(cacheKey, {
        client: createClient(url, apiKey, options),
        timestamp: Date.now()
      });
    }
    this.clients.get(cacheKey).timestamp = Date.now();
    return this.clients.get(cacheKey).client;
  }

  async getMongoClient(url) {
    const cacheKey = `mongodb:${url}`;
    if (!this.clients.has(cacheKey)) {
      logger.info(`Creating new MongoDB connection: ${url}`);
      const client = new MongoClient(url);
      await client.connect();
      this.clients.set(cacheKey, {
        client,
        timestamp: Date.now()
      });
    }
    this.clients.get(cacheKey).timestamp = Date.now();
    return this.clients.get(cacheKey).client;
  }

  async getMySQLClient(url) {
    const cacheKey = `mysql:${url}`;
    if (!this.clients.has(cacheKey)) {
      logger.info(`Creating new MySQL connection: ${url}`);
      const connection = await mysql.createConnection(url);
      this.clients.set(cacheKey, {
        client: connection,
        timestamp: Date.now()
      });
    }
    this.clients.get(cacheKey).timestamp = Date.now();
    return this.clients.get(cacheKey).client;
  }

  async getPostgresClient(url) {
    const cacheKey = `postgres:${url}`;
    if (!this.clients.has(cacheKey)) {
      logger.info(`Creating new PostgreSQL connection: ${url}`);
      try {
        const client = new pg.Client({
          connectionString: url,
          connectionTimeoutMillis: 10000,
          statement_timeout: 30000
        });
        
        await client.connect();
        
        await client.query('SELECT 1 as connected');
        logger.info('PostgreSQL connection established successfully');
        
        this.clients.set(cacheKey, {
          client,
          timestamp: Date.now()
        });
      } catch (error) {
        logger.error('Failed to create PostgreSQL connection:', {
          error: error.message,
          stack: error.stack,
          url: url.replace(/:[^:@]+@/, ':***@')
        });
        throw new Error(`Failed to connect to PostgreSQL: ${error.message}`);
      }
    }
    this.clients.get(cacheKey).timestamp = Date.now();
    return this.clients.get(cacheKey).client;
  }

  getActiveConnections() {
    return Array.from(this.clients.entries()).map(([key, value]) => ({
      type: key.split(':')[0],
      lastUsed: new Date(value.timestamp).toISOString()
    }));
  }

  getConnectionCount() {
    return this.clients.size;
  }
}

export const dbService = new DatabaseService();
