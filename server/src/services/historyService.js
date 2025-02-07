import { db } from '../lib/db.js';
import { logger } from '../utils/logger.js';
import { DatabaseError, NotFoundError } from '../utils/errors.js';

const HISTORY_TABLE = 'query_history';

export class HistoryService {
  static async getQueries() {
    logger.info('Fetching all queries from history');
    try {
      const data = await db.query(HISTORY_TABLE).select();
      logger.info(`Successfully retrieved ${data.length} queries`);
      return data;
    } catch (error) {
      logger.error('HistoryService.getQueries error:', {
        error: error.message,
        stack: error.stack,
        table: HISTORY_TABLE
      });
      throw new DatabaseError('Failed to fetch queries', error);
    }
  }

  static async createQuery({ name, query, database_type }) {
    logger.info('Creating new query:', {
      name,
      database_type,
      queryLength: query.length
    });
    try {
      const data = await db.query(HISTORY_TABLE).insert({
        name: name || 'Unnamed Query',
        query,
        database_type,
        is_favorite: false
      });
      logger.info('Query created successfully:', { id: data[0]?.id });
      return data;
    } catch (error) {
      logger.error('HistoryService.createQuery error:', {
        error: error.message,
        stack: error.stack,
        name,
        database_type
      });
      throw new DatabaseError('Failed to create query', error);
    }
  }

  static async updateFavorite(id, is_favorite) {
    logger.info('Updating favorite status:', { id, is_favorite });
    try {
      const data = await db.query(HISTORY_TABLE).update(
        { is_favorite },
        { id }
      );

      if (!data || data.length === 0) {
        logger.warn('Query not found for favorite update:', { id });
        throw new NotFoundError('Query not found');
      }

      logger.info('Favorite status updated successfully:', { id, is_favorite });
      return data[0];
    } catch (error) {
      logger.error('HistoryService.updateFavorite error:', {
        error: error.message,
        stack: error.stack,
        id,
        is_favorite
      });
      throw error;
    }
  }

  static async deleteQuery(id) {
    logger.info('Deleting query:', { id });
    try {
      await db.query(HISTORY_TABLE).delete({ id });
      logger.info('Query deleted successfully:', { id });
    } catch (error) {
      logger.error('HistoryService.deleteQuery error:', {
        error: error.message,
        stack: error.stack,
        id
      });
      throw new DatabaseError('Failed to delete query', error);
    }
  }

  static async getSharedQuery(id) {
    logger.info('Fetching shared query:', { id });
    try {
      const data = await db.query(HISTORY_TABLE).findOne(
        { id },
        'query, name'
      );

      if (!data) {
        logger.warn('Shared query not found:', { id });
        throw new NotFoundError('Query not found');
      }

      logger.info('Shared query retrieved successfully:', { id });
      return data;
    } catch (error) {
      logger.error('HistoryService.getSharedQuery error:', {
        error: error.message,
        stack: error.stack,
        id
      });
      throw new DatabaseError('Failed to fetch shared query', error);
    }
  }
}
