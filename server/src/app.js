import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { logger } from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Determine allowed origins based on environment
const getAllowedOrigins = () => {
  const origins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://querybuilder.vercel.app',
    'https://querybuilder-server.vercel.app'
  ];

  // Add production origins
  if (process.env.VERCEL_URL) {
    origins.push(
      `https://${process.env.VERCEL_URL}`,
      // Also allow the URL without 'www'
      `https://${process.env.VERCEL_URL.replace('www.', '')}`,
      // Allow custom domains if configured
      process.env.PRODUCTION_URL,
      // Allow all Vercel preview deployments
      /^https:\/\/[a-zA-Z0-9-]+-[a-zA-Z0-9-]+\.vercel\.app$/
    );
  }

  // Add any ALLOWED_ORIGINS from environment variables
  if (process.env.ALLOWED_ORIGINS) {
    origins.push(...process.env.ALLOWED_ORIGINS.split(','));
  }

  return origins.filter(Boolean); // Remove any undefined entries
};

// Detailed CORS configuration
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = getAllowedOrigins();
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin) || (allowedOrigins.find(regexp => regexp instanceof RegExp) && allowedOrigins.find(regexp => regexp instanceof RegExp).test(origin))) {
      callback(null, true);
    } else {
      logger.warn(`Origin ${origin} not allowed by CORS`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 86400, // 24 hours
  optionsSuccessStatus: 200
}));

// Add CORS headers to all responses as a backup
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = getAllowedOrigins();
  
  if (origin && (allowedOrigins.includes(origin) || (allowedOrigins.find(regexp => regexp instanceof RegExp) && allowedOrigins.find(regexp => regexp instanceof RegExp).test(origin)))) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.header('Access-Control-Expose-Headers', 'Content-Range, X-Content-Range');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400');
  }
  next();
});

app.use(express.json());

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  logger.info(`Incoming request: ${req.method} ${req.path}`);
  logger.debug(`Headers: ${JSON.stringify(req.headers)}`);
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// Add base URL info to response
app.use((req, res, next) => {
  // Add API base URL to response headers for client reference
  res.setHeader('X-API-Base-URL', process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000'
  );
  next();
});

// Error handler
app.use(errorHandler);

export default app;
