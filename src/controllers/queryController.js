import { supabase } from '../lib/supabase.js';
import { logger } from '../utils/logger.js';

export const executeQuery = async (req, res, next) => {
  try {
    const { query, parameters } = req.body;
    const userId = req.user.id;

    logger.info(`Executing query for user ${userId}`);

    const { data, error } = await supabase.rpc('execute_query', {
      query_text: query,
      query_params: parameters
    });

    if (error) {
      throw error;
    }

    // Store query in history
    await supabase.from('query_history').insert({
      user_id: userId,
      query,
      executed_at: new Date().toISOString(),
      status: 'success'
    });

    res.json({ data });
  } catch (error) {
    // Store failed query in history
    if (req.user?.id) {
      await supabase.from('query_history').insert({
        user_id: req.user.id,
        query: req.body.query,
        executed_at: new Date().toISOString(),
        status: 'error',
        error_message: error.message
      });
    }
    next(error);
  }
};

export const getQueryHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const { data, error } = await supabase
      .from('query_history')
      .select('*')
      .eq('user_id', userId)
      .order('executed_at', { ascending: false })
      .limit(100);

    if (error) {
      throw error;
    }

    res.json({ data });
  } catch (error) {
    next(error);
  }
};
