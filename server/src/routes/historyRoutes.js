import express from 'express';
import {
  getQueryHistory,
  saveQuery,
  toggleFavorite,
  deleteQuery,
  shareQuery
} from '../controllers/historyController.js';

const router = express.Router();

// Get all queries
router.get('/', getQueryHistory);

// Save a new query
router.post('/', saveQuery);

// Toggle favorite status
router.patch('/:id/favorite', toggleFavorite);

// Delete a query
router.delete('/:id', deleteQuery);

// Share a query
router.get('/:id/share', shareQuery);

export default router;
