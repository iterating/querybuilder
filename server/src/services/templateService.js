import { supabase } from '../lib/supabaseClient.js';
import { logger } from '../utils/logger.js';
import { DatabaseError, NotFoundError } from '../utils/errors.js';

export class TemplateService {
  static async getTemplates() {
    try {
      const { data, error } = await supabase
        .from('query_templates')
        .select('*')
        .order('name');

      if (error) throw new DatabaseError('Failed to fetch templates', error);
      return data;
    } catch (error) {
      logger.error('TemplateService.getTemplates error:', error);
      throw error;
    }
  }

  static async createTemplate({ name, query, description }) {
    try {
      const { data, error } = await supabase
        .from('query_templates')
        .insert([{ name, query, description }])
        .select()
        .single();

      if (error) throw new DatabaseError('Failed to create template', error);
      return data;
    } catch (error) {
      logger.error('TemplateService.createTemplate error:', error);
      throw error;
    }
  }

  static async deleteTemplate(id) {
    try {
      const { error } = await supabase
        .from('query_templates')
        .delete()
        .eq('id', id);

      if (error) throw new DatabaseError('Failed to delete template', error);
    } catch (error) {
      logger.error('TemplateService.deleteTemplate error:', error);
      throw error;
    }
  }
}
