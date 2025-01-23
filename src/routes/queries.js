import express from 'express';
import { validateQuery } from '../middleware/queryValidator.js';
import { authenticate } from '../middleware/auth.js';
import { executeQuery, getQueryHistory } from '../controllers/queryController.js';

export const router = express.Router();

router.use(authenticate);

router.post('/execute', validateQuery, executeQuery);
router.get('/history', getQueryHistory);
