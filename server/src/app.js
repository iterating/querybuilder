import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { logger } from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import queryRoutes from './routes/queryRoutes.js';
import healthRoutes from './routes/healthRoutes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// Routes
app.use('/api/queries', queryRoutes);
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
