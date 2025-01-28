import { db } from '../lib/db.js';
import { logger } from '../utils/logger.js';
import { DatabaseError, NotFoundError } from '../utils/errors.js';

const HISTORY_TABLE = 'query_history';

export class HistoryService {
  static async getQueries() {
    try {
      const data = await db.query(HISTORY_TABLE).select();
      return data;
    } catch (error) {
      logger.error('HistoryService.getQueries error:', error);
      throw new DatabaseError('Failed to fetch queries', error);
    }
  }

  static async createQuery({ name, query, database_type }) {
    try {
      const data = await db.query(HISTORY_TABLE).insert({
        name: name || 'Unnamed Query',
        query,
        database_type,
        is_favorite: false
      });
      return data;
    } catch (error) {
      logger.error('HistoryService.createQuery error:', error);
      throw new DatabaseError('Failed to create query', error);
    }
  }

  static async updateFavorite(id, is_favorite) {
    try {
      const data = await db.query(HISTORY_TABLE).update(
        { is_favorite },
        { id }
      );

      if (!data || data.length === 0) {
        throw new NotFoundError('Query not found');
      }

      return data[0];
    } catch (error) {
      logger.error('HistoryService.updateFavorite error:', error);
      throw error;
    }
  }

  static async deleteQuery(id) {
    try {
      await db.query(HISTORY_TABLE).delete({ id });
    } catch (error) {
      logger.error('HistoryService.deleteQuery error:', error);
      throw new DatabaseError('Failed to delete query', error);
    }
  }

  static async getSharedQuery(id) {
    try {
      const data = await db.query(HISTORY_TABLE).findOne(
        { id },
        'query, name'
      );

      if (!data) {
        throw new NotFoundError('Query not found');
      }

      return data;
    } catch (error) {
      logger.error('HistoryService.getSharedQuery error:', error);
      throw new DatabaseError('Failed to fetch shared query', error);
    }
  }
}
