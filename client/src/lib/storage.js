import { DEFAULT_TEMPLATES } from './defaultTemplates';

const HISTORY_KEY = 'querybuilder:history';
const TEMPLATES_KEY = 'querybuilder:templates';
const DEFAULT_TEMPLATES_LOADED_KEY = 'querybuilder:default_templates_loaded';

export class Storage {
  static getHistory() {
    try {
      const data = localStorage.getItem(HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading history:', error);
      return [];
    }
  }

  static saveHistory(queries) {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(queries));
    } catch (error) {
      console.error('Error saving history:', error);
    }
  }

  static getTemplates() {
    try {
      // Load default templates if they haven't been loaded yet
      const defaultTemplatesLoaded = localStorage.getItem(DEFAULT_TEMPLATES_LOADED_KEY);
      if (!defaultTemplatesLoaded) {
        this.saveTemplates(DEFAULT_TEMPLATES);
        localStorage.setItem(DEFAULT_TEMPLATES_LOADED_KEY, 'true');
        return DEFAULT_TEMPLATES;
      }

      const data = localStorage.getItem(TEMPLATES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading templates:', error);
      return [];
    }
  }

  static saveTemplates(templates) {
    try {
      localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
    } catch (error) {
      console.error('Error saving templates:', error);
    }
  }

  static resetToDefaultTemplates() {
    try {
      this.saveTemplates(DEFAULT_TEMPLATES);
      localStorage.setItem(DEFAULT_TEMPLATES_LOADED_KEY, 'true');
      return DEFAULT_TEMPLATES;
    } catch (error) {
      console.error('Error resetting to default templates:', error);
      return [];
    }
  }
}
