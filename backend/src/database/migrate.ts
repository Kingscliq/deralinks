/**
 * Database Migration Runner
 *
 * Automatically runs database schema migrations on startup.
 * Safe to run multiple times (idempotent).
 */

import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

interface Migration {
  id: number;
  name: string;
  executed_at: Date;
}

/**
 * Run all pending database migrations
 */
export async function runMigrations(pool: Pool): Promise<void> {
  console.log('🔧 Starting database migrations...');

  try {
    // Create migrations tracking table if it doesn't exist
    await createMigrationsTable(pool);

    // Get list of executed migrations
    const executedMigrations = await getExecutedMigrations(pool);
    console.log(`📋 Found ${executedMigrations.length} previously executed migrations`);

    // Define migrations in order
    const migrations = [
      {
        id: 1,
        name: '01-init-schema',
        file: path.join(__dirname, '../../database/schema.sql'),
      },
      {
        id: 2,
        name: '02-add-dao-governance',
        file: path.join(__dirname, '../../database/migrations/002-add-dao-governance.sql'),
      },
    ];

    // Execute pending migrations
    let executedCount = 0;
    for (const migration of migrations) {
      const alreadyExecuted = executedMigrations.some(m => m.id === migration.id);

      if (alreadyExecuted) {
        console.log(`⏭️  Skipping migration ${migration.id}: ${migration.name} (already executed)`);
        continue;
      }

      console.log(`🚀 Running migration ${migration.id}: ${migration.name}`);

      // Check if file exists
      if (!fs.existsSync(migration.file)) {
        console.warn(`⚠️  Migration file not found: ${migration.file}`);
        continue;
      }

      // Read and execute migration SQL
      const sql = fs.readFileSync(migration.file, 'utf8');

      try {
        await pool.query('BEGIN');
        await pool.query(sql);
        await pool.query(
          'INSERT INTO _migrations (id, name) VALUES ($1, $2)',
          [migration.id, migration.name]
        );
        await pool.query('COMMIT');

        console.log(`✅ Migration ${migration.id} completed: ${migration.name}`);
        executedCount++;
      } catch (error) {
        await pool.query('ROLLBACK');
        console.error(`❌ Migration ${migration.id} failed: ${migration.name}`);
        throw error;
      }
    }

    if (executedCount === 0) {
      console.log('✅ Database schema is up to date (no migrations needed)');
    } else {
      console.log(`✅ Successfully executed ${executedCount} migration(s)`);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

/**
 * Create migrations tracking table
 */
async function createMigrationsTable(pool: Pool): Promise<void> {
  const sql = `
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await pool.query(sql);
}

/**
 * Get list of executed migrations
 */
async function getExecutedMigrations(pool: Pool): Promise<Migration[]> {
  try {
    const result = await pool.query(
      'SELECT id, name, executed_at FROM _migrations ORDER BY id ASC'
    );
    return result.rows;
  } catch (error) {
    // If table doesn't exist yet, return empty array
    return [];
  }
}

/**
 * Check if a specific table exists
 */
export async function tableExists(pool: Pool, tableName: string): Promise<boolean> {
  const result = await pool.query(
    `SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = $1
    )`,
    [tableName]
  );
  return result.rows[0].exists;
}

/**
 * Get database schema version
 */
export async function getSchemaVersion(pool: Pool): Promise<number> {
  try {
    const result = await pool.query(
      'SELECT MAX(id) as version FROM _migrations'
    );
    return result.rows[0].version || 0;
  } catch (error) {
    return 0;
  }
}

export default {
  runMigrations,
  tableExists,
  getSchemaVersion,
};
