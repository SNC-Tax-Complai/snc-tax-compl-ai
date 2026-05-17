import app from './app.js';
import { config } from 'dotenv';
import { testConnection, closeConnection } from './config/database.js';
import runMigrations from './utils/runMigrations.js';

config();

const PORT = process.env.PORT || 5000;

/**
 * Initialize database and start server
 */
const startServer = async () => {
  try {
    console.log('\n========================================');
    console.log('SNC-TAX Backend Initialization');
    console.log('========================================\n');

    // Test database connection
    console.log('Testing database connection...');
    const connected = await testConnection();

    if (!connected) {
      console.warn('\n⚠ Warning: Database connection failed');
      console.warn('Server will start but database features will not be available');
      console.warn('Please configure DATABASE_* environment variables\n');
    } else {
      // Run migrations if database is connected
      try {
        await runMigrations();
      } catch (error) {
        console.error('\nMigration failed:', error.message);
        console.error('Attempting to start server anyway...\n');
      }
    }

    // Start the Express server
    const server = app.listen(PORT, () => {
      console.log(`\n✓ SNC-TAX Backend running on http://localhost:${PORT}`);
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
      console.log('\n========================================\n');
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('\nSIGTERM signal received: closing HTTP server');
      server.close(async () => {
        console.log('HTTP server closed');
        await closeConnection();
        console.log('Database connection closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      console.log('\nSIGINT signal received: closing HTTP server');
      server.close(async () => {
        console.log('HTTP server closed');
        await closeConnection();
        console.log('Database connection closed');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
