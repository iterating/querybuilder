import { HistoryService } from '../services/historyService.js';
import { ValidationError } from '../utils/errors.js';

export const getQueryHistory = async (req, res, next) => {
  try {
    const data = await HistoryService.getQueries();
    res.json({ data });
  } catch (error) {
    next(error);
  }
};

export const saveQuery = async (req, res, next) => {
  try {
    const { name, query, database_type } = req.body;
    
    if (!query) {
      throw new ValidationError('Query is required');
    }

    const data = await HistoryService.createQuery({ name, query, database_type });
    res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
};

export const toggleFavorite = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { is_favorite } = req.body;

    if (typeof is_favorite !== 'boolean') {
      throw new ValidationError('is_favorite must be a boolean value');
    }

    const data = await HistoryService.updateFavorite(id, is_favorite);
    res.json({ data });
  } catch (error) {
    next(error);
  }
};

export const deleteQuery = async (req, res, next) => {
  try {
    const { id } = req.params;
    await HistoryService.deleteQuery(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const shareQuery = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await HistoryService.getSharedQuery(id);
    res.json({ data });
  } catch (error) {
    next(error);
  }
};
