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
        try {
          const { data, error } = await this.client
            .from(table)
            .select(columns);
          
          if (error) throw new DatabaseError(`Failed to select from ${table}`, error);
          return data;
        } catch (error) {
          logger.error(`Database select error in ${table}:`, error);
          throw error;
        }
      },

      insert: async (values) => {
        try {
          const { data, error } = await this.client
            .from(table)
            .insert(values)
            .select();
          
          if (error) throw new DatabaseError(`Failed to insert into ${table}`, error);
          return data;
        } catch (error) {
          logger.error(`Database insert error in ${table}:`, error);
          throw error;
        }
      },

      update: async (values, conditions) => {
        try {
          const query = this.client.from(table).update(values);
          
          // Apply conditions
          Object.entries(conditions).forEach(([column, value]) => {
            query.eq(column, value);
          });

          const { data, error } = await query.select();
          
          if (error) throw new DatabaseError(`Failed to update ${table}`, error);
          return data;
        } catch (error) {
          logger.error(`Database update error in ${table}:`, error);
          throw error;
        }
      },

      delete: async (conditions) => {
        try {
          const query = this.client.from(table).delete();
          
          // Apply conditions
          Object.entries(conditions).forEach(([column, value]) => {
            query.eq(column, value);
          });

          const { error } = await query;
          
          if (error) throw new DatabaseError(`Failed to delete from ${table}`, error);
        } catch (error) {
          logger.error(`Database delete error in ${table}:`, error);
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
