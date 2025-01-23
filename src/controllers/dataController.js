import { supabase } from '../lib/supabase.js';

export const getTables = async (req, res, next) => {
  try {
    const { data, error } = await supabase.rpc('get_tables');
    
    if (error) {
      throw error;
    }
    
    res.json({ data });
  } catch (error) {
    next(error);
  }
};

export const getSchemas = async (req, res, next) => {
  try {
    const { data, error } = await supabase.rpc('get_schemas');
    
    if (error) {
      throw error;
    }
    
    res.json({ data });
  } catch (error) {
    next(error);
  }
};
