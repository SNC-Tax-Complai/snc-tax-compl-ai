import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import authRoutes from './routes/auth.js';
import complianceRoutes from './routes/compliance.js';
import companyRoutes from './routes/companies.js';
import notificationRoutes from './routes/notifications.js';
import aiRoutes from './routes/ai.js';
import sarsRoutes from './routes/sars.js';
import adminRoutes from './routes/admin.js';
import aiSettingsRoutes from './routes/aiSettings.js';
import documentRoutes from './routes/documents.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import { healthCheck } from './config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security & parsing middleware
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.loca.lt')) {
      cb(null, true);
    } else {
      cb(null, true);
    }
  },
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
app.use('/api/ai-settings', aiSettingsRoutes);
app.use('/api/documents', documentRoutes);

// Version endpoint — used by connected clients to detect new builds
app.get('/api/version', (req, res) => {
  try {
    const versionFile = path.join(distPath, 'version.json');
    const data = JSON.parse(readFileSync(versionFile, 'utf8'));
    res.json(data);
  } catch {
    res.json({ version: 'unknown', buildTime: null });
  }
});

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

// Serve frontend build (for tunnel/production mode)
const distPath = path.join(__dirname, '../../snc-tax-frontend/dist');
app.use(express.static(distPath));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path === '/health') return next();
  res.sendFile(path.join(distPath, 'index.html'));
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
