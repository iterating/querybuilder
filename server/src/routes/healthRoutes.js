import express from 'express';
import DatabaseService from '../services/database.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    activeConnections: DatabaseService.getActiveConnections(),
    connectionCount: DatabaseService.getConnectionCount()
  });
});

export default router;
