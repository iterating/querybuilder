import app from './app.js';
import { logger } from './utils/logger.js';
import queryRoutes from './routes/queryRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import { dbService } from './services/database.js';

// Test endpoint
app.get('/api/test', (req, res) => {
  logger.info('Test endpoint hit!');
  res.json({ message: 'API is working!' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    activeConnections: dbService.getActiveConnections(),
    connectionCount: dbService.getConnectionCount()
  });
});

// Routes
app.use('/api/queries', queryRoutes);
app.use('/api/history', historyRoutes);

// 404 handler
app.use((req, res) => {
  logger.warn(`404 - Not Found: ${req.method} ${req.path}`);
  res.status(404).json({
    error: 'Not Found',
    message: `The requested path ${req.path} was not found`
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  logger.info(`Server running on port ${port}`, {
    nodeEnv: process.env.NODE_ENV,
    port: port
  });
});
