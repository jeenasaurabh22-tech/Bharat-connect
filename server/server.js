import express from 'express';
import { createServer } from 'http';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import { initSocket } from './socket/index.js';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { connectDB } from './config/db.js';
import { connectRedis } from './config/redis.js';
import logger from './config/logger.js';
import requestId from './middleware/requestId.js';
import requestLogger from './middleware/requestLogger.js';
import errorHandler from './middleware/errorHandler.js';
import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';
import documentRoutes from './routes/document.routes.js';
import schemeRoutes from './routes/scheme.routes.js';
import aiRoutes from './routes/ai.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import applicationRoutes from './routes/application.routes.js';
import adminRoutes from './routes/admin.routes.js';
import './workers/email.worker.js';
import './workers/ocr.worker.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginOpenerPolicy: false,
    hsts: false,
  })
);
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
  })
);
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});
app.use('/api/', limiter);
app.use(requestId);
app.use(requestLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to BharatConnect AI Backend API Server',
    version: '1.0.0',
  });
});
app.use('/uploads', express.static('uploads'));
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admin', adminRoutes);
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.use(errorHandler);
const startServer = async () => {
  try {
    await connectDB();
    await connectRedis();
    const server = createServer(app);
    const corsOptions = {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    };
    initSocket(server, corsOptions);
    server.listen(PORT, () => {
      logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
  } catch (error) {
    logger.error(`Critical Server Startup Failure: ${error.message}`);
    process.exit(1);
  }
};
startServer();