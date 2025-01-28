import express from 'express';
import {
  getTemplates,
  createTemplate,
  deleteTemplate
} from '../controllers/templateController.js';

const router = express.Router();

// Get all templates
router.get('/', getTemplates);

// Create a new template
router.post('/', createTemplate);

// Delete a template
router.delete('/:id', deleteTemplate);

export default router;
