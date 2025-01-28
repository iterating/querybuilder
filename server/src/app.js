import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { logger } from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import queryRoutes from './routes/queryRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import healthRoutes from './routes/healthRoutes.js';

const app = express();

// Detailed CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  logger.info(`Incoming request: ${req.method} ${req.path}`);
  logger.info(`Headers: ${JSON.stringify(req.headers)}`);
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// Test endpoint
app.get('/api/test', (req, res) => {
  logger.info('Test endpoint hit!');
  res.json({ message: 'API is working!' });
});

// Routes
app.use('/api/queries', queryRoutes);
app.use('/api/history', historyRoutes);
app.use('/health', healthRoutes);

// 404 handler
app.use((req, res) => {
  logger.warn(`404 - Not Found: ${req.method} ${req.path}`);
  res.status(404).json({
    error: 'Not Found',
    message: `The requested path ${req.path} was not found`
  });
});

// Error handler
app.use(errorHandler);

export default app;
