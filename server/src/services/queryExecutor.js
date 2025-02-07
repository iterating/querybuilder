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
    if (!tableName) {
      throw new Error('Collection name is required for MongoDB queries');
    }

    const db = client.db();
    const collection = db.collection(tableName);

    try {
      // Handle MongoDB shell syntax
      if (typeof query === 'string') {
        if (query.startsWith('db.collection.aggregate')) {
          // Extract the array from db.collection.aggregate([...])
          const match = query.match(/\[([\s\S]*)\]/);
          if (match) {
            const pipelineStr = match[1];
            // Convert the pipeline string to valid JSON by:
            // 1. Replace single quotes with double quotes
            // 2. Add quotes around unquoted keys
            const jsonStr = `[${pipelineStr}]`
              .replace(/'/g, '"')
              .replace(/(\s*?{\s*?|\s*?,\s*?)(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '$1"$3":')
              .replace(/\$([a-zA-Z0-9_]+)/g, '"$$1"');
            try {
              const pipeline = JSON.parse(jsonStr);
              return await collection.aggregate(pipeline).toArray();
            } catch (parseError) {
              throw new Error(`Failed to parse aggregation pipeline: ${parseError.message}`);
            }
          }
        }
        
        try {
          // Try parsing as JSON
          const parsedQuery = JSON.parse(query);
          if (Array.isArray(parsedQuery)) {
            return await collection.aggregate(parsedQuery).toArray();
          } else if (parsedQuery.aggregate) {
            return await collection.aggregate(parsedQuery.aggregate).toArray();
          } else if (parsedQuery.find) {
            return await collection.find(parsedQuery.find).toArray();
          } else {
            return await collection.find(parsedQuery).toArray();
          }
        } catch (parseError) {
          throw new Error(`Invalid query format. Please use valid JSON or MongoDB shell syntax. Error: ${parseError.message}`);
        }
      } else {
        // Handle object/array queries
        if (Array.isArray(query)) {
          return await collection.aggregate(query).toArray();
        } else if (query.aggregate) {
          return await collection.aggregate(query.aggregate).toArray();
        } else if (query.find) {
          return await collection.find(query.find).toArray();
        } else {
          return await collection.find(query).toArray();
        }
      }
    } catch (error) {
      logger.error('MongoDB query execution error:', {
        error: error.message,
        stack: error.stack,
        dbType: 'mongodb',
        query,
        tableName
      });
      throw error;
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
