import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../config/database.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.join(__dirname, '../migrations');

/**
 * Run all pending migrations
 */
export const runMigrations = async () => {
  try {
    console.log('Starting database migrations...');

    // Create migrations table if it doesn't exist
    await db.none(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Get list of migration files
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    if (files.length === 0) {
      console.log('No migration files found.');
      return;
    }

    // Execute each migration
    for (const file of files) {
      const migrationName = file;

      // Check if migration has already been run
      const result = await db.oneOrNone(
        'SELECT name FROM migrations WHERE name = $1',
        [migrationName]
      );

      if (result) {
        console.log(`✓ Skipped (already executed): ${migrationName}`);
        continue;
      }

      // Read and execute migration
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      try {
        await db.tx(async (t) => {
          // Execute migration SQL
          await t.none(sql);

          // Record migration in migrations table
          await t.none(
            'INSERT INTO migrations (name) VALUES ($1)',
            [migrationName]
          );
        });

        console.log(`✓ Executed: ${migrationName}`);
      } catch (error) {
        console.error(`✗ Failed to execute ${migrationName}:`, error.message);
        throw new Error(`Migration ${migrationName} failed: ${error.message}`);
      }
    }

    console.log('✓ All migrations completed successfully!');
  } catch (error) {
    console.error('Migration error:', error.message);
    throw error;
  }
};

export default runMigrations;
