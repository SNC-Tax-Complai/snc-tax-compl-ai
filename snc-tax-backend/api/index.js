// Vercel Serverless Entry Point — SNC-Compl-Ai™ Backend
// All HTTP requests are routed here via vercel.json rewrites.
import app from '../src/app.js';
import { testConnection } from '../src/config/database.js';
import runMigrations from '../src/utils/runMigrations.js';

let initialized = false;

// Lazy initialization: runs once on cold start.
// Handles DB connection + migrations before the first request is served.
const init = async () => {
  if (initialized) return;
  initialized = true;
  try {
    const connected = await testConnection();
    if (connected) {
      console.log('✓ DB connected — running migrations...');
      await runMigrations();
      console.log('✓ Migrations complete');
    } else {
      console.warn('⚠ DB not reachable — running in degraded mode');
    }
  } catch (err) {
    // Non-fatal: server still responds even if migrations fail
    console.error('Init error (non-fatal):', err.message);
  }
};

// Vercel calls this for every request.
// Express app is used as a request handler — this is the standard pattern.
export default async (req, res) => {
  await init();
  app(req, res);
};
