// Vercel serverless entry point for SNC-TAX Compl-Ai™ Backend
import { config } from 'dotenv';
config();

import app from '../src/app.js';
import { testConnection } from '../src/config/database.js';
import runMigrations from '../src/utils/runMigrations.js';

// Lazy initialization — runs once per cold start
let initPromise = null;
const initialize = () => {
  if (!initPromise) {
    initPromise = (async () => {
      try {
        const connected = await testConnection();
        if (connected) {
          await runMigrations();
          console.log('✓ DB connected and migrations applied');
        } else {
          console.warn('⚠ DB not connected — API running in degraded mode');
        }
      } catch (err) {
        console.error('Init error (non-fatal):', err.message);
      }
    })();
  }
  return initPromise;
};

// Vercel handler — initialize on first request, then delegate to Express
export default async (req, res) => {
  await initialize();
  return app(req, res);
};
