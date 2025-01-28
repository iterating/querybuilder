import { logger } from '../utils/logger.js';
import DatabaseService from './database.js';

class QueryExecutor {
  static async executeSupabaseQuery(client, query, tableName) {
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
  }

  static async executeMongoQuery(client, query, tableName) {
    const db = client.db();
    const collection = db.collection(tableName);

    try {
      if (typeof query === 'string') {
        if (query.startsWith('db.')) {
          const command = eval(`(${query.replace('db.', '').replace('.find', '')})`);
          return await collection.find(command).toArray();
        } else {
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

  static async executeMySQLQuery(client, query) {
    const [rows] = await client.execute(query);
    return rows;
  }

  static async executePostgresQuery(client, query) {
    const result = await client.query(query);
    return result.rows;
  }

  static async executeQuery(dbConfig, query) {
    const { type, url, apiKey, tableName } = dbConfig;

    try {
      switch (type) {
        case 'supabase': {
          const client = DatabaseService.getSupabaseClient(url, apiKey);
          return await this.executeSupabaseQuery(client, query, tableName);
        }

        case 'mongodb': {
          const client = await DatabaseService.getMongoClient(url);
          return await this.executeMongoQuery(client, query, tableName);
        }

        case 'mysql': {
          const client = await DatabaseService.getMySQLClient(url);
          return await this.executeMySQLQuery(client, query);
        }

        case 'postgres': {
          const client = await DatabaseService.getPostgresClient(url);
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

export default QueryExecutor;
