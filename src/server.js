import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { router as authRouter } from './routes/auth.js';
import { router as queryRouter } from './routes/queries.js';
import { router as dataRouter } from './routes/data.js';
import { logger } from './utils/logger.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/queries', queryRouter);
app.use('/api/data', dataRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message 
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start server if not in production (Vercel handles this in production)
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    logger.info(`Server running on port ${port}`);
  });
}

// Export for Vercel
export default app;
