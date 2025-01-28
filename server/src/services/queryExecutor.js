import { logger } from '../utils/logger.js';
import DatabaseService from './database.js';

const SANDBOX_MODE = true; // Enable sandbox mode by default

// List of dangerous keywords that could modify data
const DANGEROUS_KEYWORDS = [
  'insert',
  'update',
  'delete',
  'drop',
  'truncate',
  'alter',
  'create',
  'replace',
  'rename',
  'restore',
  'grant',
  'revoke'
];

class QueryExecutor {
  static validateQuery(query) {
    if (SANDBOX_MODE) {
      const lowerQuery = query.toLowerCase();
      const dangerousOperation = DANGEROUS_KEYWORDS.some(keyword => 
        lowerQuery.includes(keyword)
      );
      
      if (dangerousOperation) {
        throw new Error('Write operations are not allowed in sandbox mode. Only SELECT queries are permitted.');
      }

      if (!lowerQuery.trim().startsWith('select')) {
        throw new Error('Only SELECT queries are allowed in sandbox mode.');
      }
    }
  }

  static async executeMongoQuery(client, query) {
    const db = client.db();
    
    try {
      if (typeof query === 'string') {
        if (SANDBOX_MODE) {
          // In MongoDB, only allow find operations
          if (!query.includes('find') && !query.includes('aggregate')) {
            throw new Error('Only find and aggregate operations are allowed in sandbox mode.');
          }
        }
        // Parse the query string into a MongoDB command
        const command = eval(`(${query})`);
        return await db.command(command);
      } else {
        throw new Error('Query must be a string');
      }
    } catch (e) {
      logger.error('MongoDB query parsing error:', e);
      throw new Error('Invalid MongoDB query format');
    }
  }

  static async executeMySQLQuery(client, query) {
    this.validateQuery(query);
    const [rows] = await client.execute(query);
    return rows;
  }

  static async executePostgresQuery(client, query) {
    this.validateQuery(query);
    const result = await client.query(query);
    return result.rows;
  }

  static async executeQuery(dbConfig, query) {
    const { type, url } = dbConfig;
    
    if (!type || !url) {
      throw new Error('Database configuration is incomplete');
    }

    let client;
    try {
      client = await DatabaseService.getClient(type, url);
      
      let result;
      switch (type) {
        case 'mongodb':
          result = await this.executeMongoQuery(client, query);
          break;
        case 'mysql':
          result = await this.executeMySQLQuery(client, query);
          break;
        case 'postgres':
          result = await this.executePostgresQuery(client, query);
          break;
        default:
          throw new Error(`Unsupported database type: ${type}`);
      }

      return result;
    } catch (error) {
      logger.error(`Query execution error: ${error.message}`, {
        type,
        query,
        error: error.stack
      });
      throw error;
    } finally {
      if (client) {
        await DatabaseService.releaseClient(client);
      }
    }
  }

  static async getQueryHistory(userId) {
    try {
      const client = await DatabaseService.getClient('postgres', process.env.DATABASE_URL);
      const result = await client.query(
        'SELECT * FROM query_history WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );
      return result.rows;
    } catch (error) {
      logger.error(`Failed to get query history: ${error.message}`, {
        userId,
        error: error.stack
      });
      throw error;
    }
  }
}

export default QueryExecutor;
