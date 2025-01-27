import { supabase } from '../lib/supabase.js';
import { logger } from '../utils/logger.js';

export const executeQuery = async (req, res, next) => {
  const { query, parameters = [] } = req.body;
  const startTime = Date.now();

  try {
    logger.info('Executing query', { query });

    // For now, just return a mock response
    const mockData = {
      message: "Query received successfully",
      query,
      parameters,
      timestamp: new Date().toISOString()
    };

    const executionTime = Date.now() - startTime;
    logger.info(`Query processed in ${executionTime}ms`);

    res.json(mockData);
  } catch (error) {
    logger.error('Error executing query:', error);
    next(error);
  }
};

export const getQueryHistory = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { data, error } = await supabase
      .from('query_history')
      .select('*')
      .eq('user_id', userId)
      .order('executed_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    res.json(data);
  } catch (error) {
    logger.error('Error fetching query history:', error);
    next(error);
  }
};
