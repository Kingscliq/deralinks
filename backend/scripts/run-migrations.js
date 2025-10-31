#!/usr/bin/env node

/**
 * Automatic Database Migration Runner
 * Runs all pending migrations before app starts
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// ANSI color codes for pretty output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

async function runMigrations() {
  console.log(`${colors.blue}🗄️  Starting database migration...${colors.reset}\n`);

  // Get database connection string
  const connectionString = process.env.DATABASE_URL || process.env.DB_CONNECTION_STRING;

  if (!connectionString) {
    console.error(`${colors.red}❌ Error: No database connection string found${colors.reset}`);
    console.error('   Set DATABASE_URL environment variable\n');
    process.exit(1);
  }

  const client = new Client({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    await client.connect();
    console.log(`${colors.green}✅ Connected to database${colors.reset}\n`);

    // Get migrations directory
    const migrationsDir = path.join(__dirname, '..', 'database', 'migrations');

    // Read migration file
    const migrationFile = path.join(migrationsDir, '003-004-combined-fee-tracking-and-treasury.sql');

    if (!fs.existsSync(migrationFile)) {
      console.log(`${colors.yellow}⚠️  Migration file not found: ${migrationFile}${colors.reset}`);
      console.log('   Skipping migration...\n');
      await client.end();
      return;
    }

    const migrationSQL = fs.readFileSync(migrationFile, 'utf8');

    console.log(`${colors.blue}📝 Running migration: 003-004-combined-fee-tracking-and-treasury.sql${colors.reset}`);

    // Run migration
    await client.query(migrationSQL);

    console.log(`${colors.green}✅ Migration completed successfully!${colors.reset}\n`);

    // Verify columns were added
    console.log(`${colors.blue}🔍 Verifying migration...${colors.reset}`);

    const verifyQuery = `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'marketplace_listings'
        AND column_name IN ('listing_fee', 'is_treasury_listing', 'nft_holder_account')
      ORDER BY column_name;
    `;

    const result = await client.query(verifyQuery);

    if (result.rows.length >= 3) {
      console.log(`${colors.green}✅ Verification passed: All columns exist${colors.reset}`);
      result.rows.forEach(row => {
        console.log(`   - ${row.column_name}`);
      });
    } else {
      console.log(`${colors.yellow}⚠️  Warning: Some columns may be missing${colors.reset}`);
    }

    console.log('');

  } catch (error) {
    // Check if error is because columns already exist (which is fine)
    if (error.message.includes('already exists') || error.message.includes('duplicate')) {
      console.log(`${colors.green}✅ Migration already applied (columns exist)${colors.reset}\n`);
    } else {
      console.error(`${colors.red}❌ Migration failed:${colors.reset}`);
      console.error(`   ${error.message}\n`);
      process.exit(1);
    }
  } finally {
    await client.end();
  }
}

// Run migrations
runMigrations()
  .then(() => {
    console.log(`${colors.green}✅ Database is ready!${colors.reset}\n`);
    process.exit(0);
  })
  .catch((error) => {
    console.error(`${colors.red}❌ Fatal error:${colors.reset}`, error);
    process.exit(1);
  });
