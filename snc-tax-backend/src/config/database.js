import pgPromise from 'pg-promise';
import dotenv from 'dotenv';

dotenv.config();

const pgp = pgPromise();

// Support DATABASE_URL (Render, Heroku) or individual params (DO, custom)
let connectionConfig;

if (process.env.DATABASE_URL) {
  connectionConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
  };
} else {
  connectionConfig = {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    database: process.env.DATABASE_NAME || 'snc_tax_db',
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'password',
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
  };
}

// Pool + connection configuration
const db = pgp({
  ...connectionConfig,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // 10s for managed remote DBs
});

// Test connection on startup
export const testConnection = async () => {
  try {
    const result = await db.one('SELECT NOW()');
    console.log('✓ Database connected at:', result.now);
    return true;
  } catch (error) {
    console.error('✗ Database connection failed:', error.message);
    return false;
  }
};

// Health check query
export const healthCheck = async () => {
  try {
    await db.one('SELECT 1');
    return true;
  } catch {
    return false;
  }
};

// Close database connection
export const closeConnection = async () => {
  await pgp.end();
};

export default db;
