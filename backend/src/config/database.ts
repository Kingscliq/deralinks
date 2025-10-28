/**
 * PostgreSQL Database Configuration
 */

import { Pool, QueryResult } from 'pg';

// Database connection pool
let pool: Pool | null = null;

// Initialize database connection
export const initDatabase = (): Pool => {
  if (!pool) {
    // Check if DATABASE_URL is provided (Render, Heroku, etc.)
    if (process.env.DATABASE_URL) {
      console.log('🔌 Using DATABASE_URL for connection');
      pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
        max: parseInt(process.env.DB_POOL_MAX || '10'),
        min: parseInt(process.env.DB_POOL_MIN || '2'),
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      });
    } else {
      // Use individual environment variables (local development)
      console.log('🔌 Using individual DB variables for connection');
      pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        user: process.env.DB_USER || 'deralinks',
        password: process.env.DB_PASSWORD || 'deralinks_dev_password',
        database: process.env.DB_NAME || 'deralinks_db',
        max: parseInt(process.env.DB_POOL_MAX || '10'),
        min: parseInt(process.env.DB_POOL_MIN || '2'),
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      });
    }

    pool.on('error', (err: Error) => {
      console.error('Unexpected database error:', err);
    });

    console.log('✅ Database connection pool initialized');
  }

  return pool;
};

// Get database pool instance
export const getPool = (): Pool => {
  if (!pool) {
    return initDatabase();
  }
  return pool;
};

// Execute query with error handling
export const query = async (text: string, params?: any[]): Promise<QueryResult> => {
  const pool = getPool();
  try {
    const start = Date.now();
    const result = await pool.query(text, params);
    const duration = Date.now() - start;

    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Query executed', { text, duration, rows: result.rowCount });
    }

    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Close database connection
export const closeDatabase = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('✅ Database connection closed');
  }
};

// Test database connection
export const testConnection = async (): Promise<boolean> => {
  try {
    const result = await query('SELECT NOW() as time');
    console.log('✅ Database connection test successful:', result.rows[0].time);
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    return false;
  }
};

export default {
  initDatabase,
  getPool,
  query,
  closeDatabase,
  testConnection,
};
