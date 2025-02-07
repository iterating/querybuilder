import { createClient } from '@supabase/supabase-js';
import { config } from '../config/index.js';
import { DatabaseError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

class Database {
  constructor() {
    this.client = createClient(config.supabase.url, config.supabase.anonKey);
  }

  async query(table) {
    return {
      select: async (columns = '*') => {
        logger.debug('Executing SELECT query:', {
          table,
          columns
        });
        try {
          const { data, error } = await this.client
            .from(table)
            .select(columns);
          
          if (error) {
            logger.error('Database SELECT error:', {
              error: error.message,
              table,
              columns
            });
            throw new DatabaseError(`Failed to select from ${table}`, error);
          }
          logger.debug('SELECT query successful:', {
            table,
            rowCount: data?.length
          });
          return data;
        } catch (error) {
          logger.error(`Database SELECT error in ${table}:`, {
            error: error.message,
            stack: error.stack,
            table,
            columns
          });
          throw error;
        }
      },

      insert: async (values) => {
        logger.debug('Executing INSERT query:', {
          table,
          values
        });
        try {
          const { data, error } = await this.client
            .from(table)
            .insert(values)
            .select();
          
          if (error) {
            logger.error('Database INSERT error:', {
              error: error.message,
              table,
              values
            });
            throw new DatabaseError(`Failed to insert into ${table}`, error);
          }
          logger.debug('INSERT query successful:', {
            table,
            insertedId: data?.[0]?.id
          });
          return data;
        } catch (error) {
          logger.error(`Database INSERT error in ${table}:`, {
            error: error.message,
            stack: error.stack,
            table,
            values
          });
          throw error;
        }
      },

      update: async (values, conditions) => {
        logger.debug('Executing UPDATE query:', {
          table,
          values,
          conditions
        });
        try {
          const query = this.client.from(table).update(values);
          
          // Apply conditions
          Object.entries(conditions).forEach(([column, value]) => {
            query.eq(column, value);
          });

          const { data, error } = await query.select();
          
          if (error) {
            logger.error('Database UPDATE error:', {
              error: error.message,
              table,
              values,
              conditions
            });
            throw new DatabaseError(`Failed to update ${table}`, error);
          }
          logger.debug('UPDATE query successful:', {
            table,
            updatedRows: data?.length
          });
          return data;
        } catch (error) {
          logger.error(`Database UPDATE error in ${table}:`, {
            error: error.message,
            stack: error.stack,
            table,
            values,
            conditions
          });
          throw error;
        }
      },

      delete: async (conditions) => {
        logger.debug('Executing DELETE query:', {
          table,
          conditions
        });
        try {
          const { error } = await this.client
            .from(table)
            .delete()
            .match(conditions);
          
          if (error) {
            logger.error('Database DELETE error:', {
              error: error.message,
              table,
              conditions
            });
            throw new DatabaseError(`Failed to delete from ${table}`, error);
          }
          logger.debug('DELETE query successful:', {
            table,
            conditions
          });
        } catch (error) {
          logger.error(`Database DELETE error in ${table}:`, {
            error: error.message,
            stack: error.stack,
            table,
            conditions
          });
          throw error;
        }
      },

      findOne: async (conditions, columns = '*') => {
        try {
          const query = this.client.from(table).select(columns);
          
          // Apply conditions
          Object.entries(conditions).forEach(([column, value]) => {
            query.eq(column, value);
          });

          const { data, error } = await query.single();
          
          if (error) throw new DatabaseError(`Failed to find one in ${table}`, error);
          return data;
        } catch (error) {
          logger.error(`Database findOne error in ${table}:`, error);
          throw error;
        }
      }
    };
  }
}

export const db = new Database();
