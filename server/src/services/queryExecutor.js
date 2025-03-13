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

    logger.info('Executing MongoDB query:', {
      tableName,
      query: typeof query === 'string' ? query : JSON.stringify(query)
    });

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
              logger.info('Executing aggregation pipeline:', { pipeline });
              const result = await collection.aggregate(pipeline).toArray();
              logger.info('Aggregation result:', { count: result.length });
              return result;
            } catch (parseError) {
              logger.error('Failed to parse pipeline:', { error: parseError.message, jsonStr });
              throw new Error(`Failed to parse aggregation pipeline: ${parseError.message}`);
            }
          }
        }
        
        try {
          // Try parsing as JSON
          const parsedQuery = JSON.parse(query);
          logger.info('Parsed query:', { parsedQuery });
          
          if (Array.isArray(parsedQuery)) {
            logger.info('Executing array query as aggregation');
            const result = await collection.aggregate(parsedQuery).toArray();
            logger.info('Array query result:', { count: result.length });
            return result;
          } else if (parsedQuery.find !== undefined) {
            logger.info('Executing find query');
            const result = await collection.find(parsedQuery.find).toArray();
            logger.info('Find query result:', { count: result.length });
            return result;
          } else {
            logger.info('Executing default find query');
            const result = await collection.find(parsedQuery).toArray();
            logger.info('Default query result:', { count: result.length });
            return result;
          }
        } catch (parseError) {
          logger.error('Failed to parse query:', { error: parseError.message, query });
          throw new Error(`Invalid query format. Please use valid JSON or MongoDB shell syntax. Error: ${parseError.message}`);
        }
      } else {
        // Handle object/array queries
        if (Array.isArray(query)) {
          logger.info('Executing object array query as aggregation');
          const result = await collection.aggregate(query).toArray();
          logger.info('Object array query result:', { count: result.length });
          return result;
        } else if (query.find !== undefined) {
          logger.info('Executing object find query');
          const result = await collection.find(query.find).toArray();
          logger.info('Object find query result:', { count: result.length });
          return result;
        } else {
          logger.info('Executing default object query');
          const result = await collection.find(query).toArray();
          logger.info('Default object query result:', { count: result.length });
          return result;
        }
      }
    } catch (error) {
      logger.error('MongoDB query execution error:', {
        error: error.message,
        stack: error.stack,
        query,
        tableName
      });
      throw error;
    }
  }

  async executeMySQLQuery(client, query, tableName) {
    const [rows] = await client.execute(query);
    return rows;
  }

  async executePostgresQuery(client, query, tableName) {
    try {
      // Handle the query differently based on its content
      if (query.includes('{table_name}')) {
        if (!tableName) {
          throw new Error('Table name is required when using {table_name} placeholder in PostgreSQL queries');
        }
        
        // For PostgreSQL, we can't use {table_name} syntax directly
        // We need to safely substitute the table name with proper quoting
        const quotedTableName = `"${tableName.replace(/"/g, '""')}"`;
        
        // Replace the table name placeholder
        const modifiedQuery = query.replace(/{table_name}/g, quotedTableName);
        
        logger.info('Executing PostgreSQL query with table substitution:', {
          modifiedQuery,
          tableName
        });
        
        // Execute the modified query
        const result = await client.query(modifiedQuery);
        return result.rows;
      } else if (tableName && query.toLowerCase().includes('table_name')) {
        // Handle cases where the query contains the literal "table_name" instead of placeholder
        const quotedTableName = `"${tableName.replace(/"/g, '""')}"`;
        const modifiedQuery = query.replace(/table_name/g, quotedTableName);
        
        logger.info('Executing PostgreSQL query with literal table_name substitution:', {
          modifiedQuery,
          tableName
        });
        
        const result = await client.query(modifiedQuery);
        return result.rows;
      } else {
        // No special handling needed, execute as-is
        const result = await client.query(query);
        return result.rows;
      }
    } catch (error) {
      // Enhanced error logging to help diagnose issues
      logger.error('PostgreSQL query execution error:', {
        errorMessage: error.message,
        errorCode: error.code,
        sqlState: error.sqlState,
        position: error.position,
        query,
        tableName
      });
      throw error;
    }
  }

  async executeQuery(dbConfig, query) {
    const { type, url, apiKey, tableName } = dbConfig;

    try {
      logger.info('Executing query for database type:', {
        type,
        hasTableName: !!tableName,
        queryPreview: query.substring(0, 100) + (query.length > 100 ? '...' : '')
      });

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
          return await this.executeMySQLQuery(client, query, tableName);
        }

        case 'postgres': {
          const client = await dbService.getPostgresClient(url);
          return await this.executePostgresQuery(client, query, tableName);
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
