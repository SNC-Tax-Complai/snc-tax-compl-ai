import pgPromise from 'pg-promise';
import dotenv from 'dotenv';

dotenv.config();

const pgp = pgPromise();

const cn = {
  host: process.env.DATABASE_HOST || 'localhost',
  port: process.env.DATABASE_PORT || 5432,
  database: process.env.DATABASE_NAME || 'snc_tax_db',
  user: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'password',
};

// Connection pool configuration
const db = pgp({
  ...cn,
  // Connection pool settings
  max: 30, // max pool size
  idleTimeoutMillis: 30000, // close idle clients after 30s
  connectionTimeoutMillis: 2000, // return an error after 2s if connection could not be established
});

// Test connection on startup
export const testConnection = async () => {
  try {
    const result = await db.one('SELECT NOW()');
    console.log('✓ Database connected successfully at:', result.now);
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
