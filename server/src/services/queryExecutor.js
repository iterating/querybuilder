import { logger } from '../utils/logger.js';
import { dbService } from './database.js';

class QueryExecutor {
  async executeSupabaseQuery(client, query, tableName) {
    try {
      if (query.trim().toLowerCase().startsWith('select')) {
        // For SELECT queries, use Supabase's query builder
        const { data, error } = await client
          .from(tableName)
          .select(query.replace(/^select\s+/i, '').split('from')[0].trim());
        
        if (error) {
          logger.error('Supabase SELECT query error:', error);
          throw error;
        }
        return data;
      } else {
        // For other queries, use RPC if available
        const { data, error } = await client.rpc('execute_raw_query', { query_text: query });
        if (error) {
          logger.error('Supabase RPC query error:', error);
          throw error;
        }
        return data;
      }
    } catch (error) {
      logger.error('Supabase query execution error:', {
        error: error.message,
        stack: error.stack,
        query,
        tableName
      });
      throw error;
    }
  }

  async executeMongoQuery(client, query, tableName) {
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
  }

  async executeMySQLQuery(client, query) {
    const [rows] = await client.execute(query);
    return rows;
  }

  async executePostgresQuery(client, query) {
    const result = await client.query(query);
    return result.rows;
  }

  async executeQuery(dbConfig, query) {
    const { type, url, apiKey, tableName } = dbConfig;

    try {
      switch (type) {
        case 'supabase': {
          const client = dbService.getSupabaseClient(url, apiKey);
          return await this.executeSupabaseQuery(client, query, tableName);
        }

        case 'mongodb': {
          const client = await dbService.getMongoClient(url);
          return await this.executeMongoQuery(client, query, tableName);
        }

        case 'mysql': {
          const client = await dbService.getMySQLClient(url);
          return await this.executeMySQLQuery(client, query);
        }

        case 'postgres': {
          const client = await dbService.getPostgresClient(url);
          return await this.executePostgresQuery(client, query);
        }

        default:
          throw new Error(`Unsupported database type: ${type}`);
      }
    } catch (error) {
      logger.error(`Database query error (${type}):`, error);
      throw error;
    }
  }
}

export const queryExecutor = new QueryExecutor();
