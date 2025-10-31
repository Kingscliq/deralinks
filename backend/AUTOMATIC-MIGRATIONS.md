# Automatic Database Migrations

## Overview
Database migrations now run automatically during build and deployment. No manual intervention needed!

## How It Works

### Build Process Flow:
```
1. Render triggers build
   ↓
2. npm run build
   ↓
3. Compiles TypeScript (tsc)
   ↓
4. Runs migrations (npm run migrate)
   ↓
5. Migration script connects to database
   ↓
6. Applies pending migrations
   ↓
7. Verifies columns exist
   ↓
8. Build complete ✅
```

### Start Process Flow:
```
1. Render starts service
   ↓
2. npm start
   ↓
3. Runs migrations (safety check)
   ↓
4. Starts Node.js server
   ↓
5. Server ready ✅
```

---

## Updated npm Scripts

```json
{
  "scripts": {
    "build": "tsc && npm run migrate",     // Builds + runs migrations
    "start": "npm run migrate && node dist/index.js",  // Migrates + starts
    "migrate": "node scripts/run-migrations.js",        // Migration runner
    "dev": "nodemon ..."                    // Development (no migration)
  }
}
```

---

## Migration Script

**Location:** `/scripts/run-migrations.js`

**Features:**
- ✅ Automatically connects to DATABASE_URL
- ✅ Runs SQL migrations
- ✅ Idempotent (safe to run multiple times)
- ✅ Verifies columns were added
- ✅ Pretty colored output
- ✅ Error handling
- ✅ Production SSL support

**What it does:**
1. Reads `DATABASE_URL` environment variable
2. Connects to PostgreSQL
3. Runs `003-004-combined-fee-tracking-and-treasury.sql`
4. Verifies migration succeeded
5. Exits with proper status code

---

## Render Configuration

### Build Command:
```bash
npm install && npm run build
```

This will:
- Install dependencies
- Compile TypeScript
- **Run migrations automatically**

### Start Command:
```bash
npm start
```

This will:
- **Run migrations (safety check)**
- Start the server

### Environment Variables Required:
```bash
DATABASE_URL=postgresql://user:pass@host:port/database
NODE_ENV=production
```

---

## Testing Locally

### Test Migration Script:
```bash
# Make sure DATABASE_URL is set
export DATABASE_URL="postgresql://localhost:5432/deralinks_db"

# Run migration
npm run migrate
```

**Expected Output:**
```
🗄️  Starting database migration...

✅ Connected to database

📝 Running migration: 003-004-combined-fee-tracking-and-treasury.sql
✅ Migration completed successfully!

🔍 Verifying migration...
✅ Verification passed: All columns exist
   - is_treasury_listing
   - listing_fee
   - nft_holder_account

✅ Database is ready!
```

### Test Full Build:
```bash
npm run build
```

### Test Start:
```bash
npm start
```

---

## Migration Safety Features

### Idempotent (Safe to Run Multiple Times)
All SQL uses `IF NOT EXISTS`:
```sql
ALTER TABLE marketplace_listings
  ADD COLUMN IF NOT EXISTS listing_fee DECIMAL(20, 2) DEFAULT 0;
```

**Result:** Running twice won't cause errors

### Error Handling
- ✅ Already exists → Success (columns exist)
- ✅ Connection failed → Error with helpful message
- ✅ SQL error → Shows exact error

### Rollback Strategy
If migration fails:
1. Build fails → Render won't deploy broken code
2. Old version keeps running
3. Fix migration SQL
4. Push again

---

## On Render Deployment

### First Deploy (After This Change):
```
1. Push to Git
   ↓
2. Render detects changes
   ↓
3. Runs: npm install && npm run build
   ↓
4. Migration script runs ← ✨ Migrations applied automatically
   ↓
5. Build succeeds
   ↓
6. Runs: npm start
   ↓
7. Migration runs again (safety check)
   ↓
8. Server starts with new columns ✅
```

### Subsequent Deploys:
```
1. Push code changes
   ↓
2. Render builds
   ↓
3. Migration runs (already applied, skips)
   ↓
4. Server starts ✅
```

---

## Monitoring Migrations

### Check Logs on Render:
1. Go to Render Dashboard
2. Click your service
3. Click "Logs"
4. Look for:
   ```
   🗄️  Starting database migration...
   ✅ Migration completed successfully!
   ```

### If Migration Fails:
Look for error in logs:
```
❌ Migration failed:
   column "listing_fee" already exists
```

Don't worry! This means migration was already applied.

---

## Adding New Migrations in Future

### Step 1: Create Migration File
```bash
# Create new migration
touch database/migrations/005-new-feature.sql
```

### Step 2: Update Migration Runner
Edit `/scripts/run-migrations.js`:
```javascript
// Add new migration
const migrations = [
  '003-004-combined-fee-tracking-and-treasury.sql',
  '005-new-feature.sql',  // ← Add here
];
```

### Step 3: Push and Deploy
```bash
git add .
git commit -m "feat: add new migration"
git push
```

Render will run migrations automatically! ✅

---

## Troubleshooting

### "Cannot find module 'pg'"
```bash
# Make sure pg is installed
npm install pg
```

### "DATABASE_URL is not set"
Check Render environment variables:
1. Go to Dashboard → Your Service
2. Click "Environment"
3. Verify `DATABASE_URL` exists

### "Connection refused"
- Database is starting (wait 30 seconds)
- Check DATABASE_URL is correct
- Verify database is running on Render

### Migration runs but columns still missing?
```bash
# Manually verify
psql $DATABASE_URL -c "\d marketplace_listings"
```

---

## Benefits

✅ **Zero Manual Work** - Migrations run automatically
✅ **Always In Sync** - Database matches code
✅ **No Downtime** - Migrations during deployment
✅ **Idempotent** - Safe to run multiple times
✅ **Error Safe** - Build fails if migration fails
✅ **Version Control** - Migrations in Git
✅ **Audit Trail** - See migrations in logs

---

## What Happens Now?

### Next Deploy:
1. Commit and push your code
2. Render automatically builds
3. Migrations run during build
4. Server starts with updated schema
5. Property owners can list from treasury! ✅

### No More Manual Steps:
- ❌ No more psql commands
- ❌ No more manual SQL scripts
- ❌ No more "forgot to migrate"
- ✅ Everything automatic!

---

## Quick Reference

```bash
# Run migrations manually (if needed)
npm run migrate

# Full build (includes migrations)
npm run build

# Start server (includes migration safety check)
npm start

# Development (no migrations)
npm run dev
```
