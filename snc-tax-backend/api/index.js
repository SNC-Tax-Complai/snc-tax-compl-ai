// Vercel Serverless — SNC-Compl-Ai™ Backend
// Self-contained handler: avoids complex import chain on cold start.
// Lazy-loads the full Express app only when needed.

let app = null;

const getApp = async () => {
  if (!app) {
    const mod = await import('../src/app.js');
    app = mod.default;
    // Run migrations once on cold start
    try {
      const db = await import('../src/config/database.js');
      const mig = await import('../src/utils/runMigrations.js');
      const connected = await db.testConnection();
      if (connected) await mig.default();
    } catch (e) {
      console.error('Init error (non-fatal):', e.message);
    }
  }
  return app;
};

export default async (req, res) => {
  // Inline health check — always responds even if Express fails to load
  if (req.url === '/health' || req.url === '/api/health') {
    let dbOk = false;
    try {
      const db = await import('../src/config/database.js');
      dbOk = await db.healthCheck();
    } catch (e) {}
    return res.json({
      status: dbOk ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      database: dbOk ? 'connected' : 'disconnected',
      version: '2.1.0'
    });
  }

  // All other routes — load the full Express app
  try {
    const expressApp = await getApp();
    return expressApp(req, res);
  } catch (err) {
    console.error('Handler error:', err.message);
    return res.status(500).json({ error: 'Server initializing', retry: true });
  }
};
