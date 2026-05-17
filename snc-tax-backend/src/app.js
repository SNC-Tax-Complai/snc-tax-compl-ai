import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import complianceRoutes from './routes/compliance.js';
import companyRoutes from './routes/companies.js';
import notificationRoutes from './routes/notifications.js';
import aiRoutes from './routes/ai.js';
import sarsRoutes from './routes/sars.js';
import adminRoutes from './routes/admin.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import { healthCheck } from './config/database.js';

const app = express();

// Security & parsing middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request logging
app.use(requestLogger);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/sars', sarsRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoints
app.get('/health', async (req, res) => {
  const dbHealthy = await healthCheck();
  res.json({
    status: dbHealthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    database: dbHealthy ? 'connected' : 'disconnected',
    uptime: process.uptime(),
    version: process.env.npm_package_version || '2.0.0',
  });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
