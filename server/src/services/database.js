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
      DatabaseService.releaseClient(value.client);
      dbClients.delete(key);
      logger.info(`Closed expired connection: ${key}`);
    }
  }
}, 1000 * 60 * 5); // Check every 5 minutes

class DatabaseService {
  static async getClient(type, url) {
    const cacheKey = `${type}:${url}`;
    
    if (dbClients.has(cacheKey)) {
      dbClients.get(cacheKey).timestamp = Date.now();
      return dbClients.get(cacheKey).client;
    }

    logger.info(`Creating new ${type} connection: ${url}`);
    let client;

    try {
      switch (type) {
        case 'mongodb': {
          client = new MongoClient(url);
          await client.connect();
          break;
        }
        case 'mysql': {
          client = await mysql.createConnection(url);
          break;
        }
        case 'postgres': {
          client = new pg.Client(url);
          await client.connect();
          break;
        }
        default:
          throw new Error(`Unsupported database type: ${type}`);
      }

      dbClients.set(cacheKey, {
        client,
        timestamp: Date.now()
      });

      return client;
    } catch (error) {
      logger.error(`Failed to create ${type} connection:`, error);
      throw error;
    }
  }

  static async releaseClient(client) {
    try {
      if (!client) return;

      if (client.end) await client.end();
      if (client.close) await client.close();
    } catch (error) {
      logger.error('Error releasing database client:', error);
    }
  }
}

export default DatabaseService;
