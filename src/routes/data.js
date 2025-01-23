import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getTables, getSchemas } from '../controllers/dataController.js';

export const router = express.Router();

router.use(authenticate);

router.get('/tables', getTables);
router.get('/schemas', getSchemas);
