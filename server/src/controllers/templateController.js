import { TemplateService } from '../services/templateService.js';
import { ValidationError } from '../utils/errors.js';

export const getTemplates = async (req, res, next) => {
  try {
    const data = await TemplateService.getTemplates();
    res.json({ data });
  } catch (error) {
    next(error);
  }
};

export const createTemplate = async (req, res, next) => {
  try {
    const { name, query, description } = req.body;

    if (!name || !query) {
      throw new ValidationError('Name and query are required');
    }

    const data = await TemplateService.createTemplate({ name, query, description });
    res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
};

export const deleteTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;
    await TemplateService.deleteTemplate(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
