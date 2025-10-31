# Database Migration Instructions

## Problem
The production database is missing columns needed for fee tracking and treasury listings.

**Error:** `column "listing_fee" of relation "marketplace_listings" does not exist`

## Solution
Apply the combined migration that adds all necessary columns.

---

## Method 1: Using Render Dashboard (EASIEST)

### Step 1: Get Database Connection String
1. Go to https://dashboard.render.com
2. Click on your PostgreSQL database
3. Click **Connect** button (top right)
4. Copy the **External Connection String** (starts with `postgresql://`)

### Step 2: Connect via Terminal
```bash
# Replace with your actual connection string from Render
psql "postgresql://deralinks_db_user:xxxxx@dpg-xxxxx.oregon-postgres.render.com/deralinks_db"
```

### Step 3: Run Migration
Once connected, run:
```sql
\i /Users/user/Documents/deralinks/backend/database/migrations/003-004-combined-fee-tracking-and-treasury.sql
```

Or if path doesn't work, copy-paste the SQL directly:
```sql
-- Copy the entire contents of 003-004-combined-fee-tracking-and-treasury.sql
-- Paste into the psql terminal
-- Press Enter
```

### Step 4: Verify
```sql
-- Check if columns were added
\d marketplace_listings

-- Should show:
--   listing_fee
--   listing_fee_paid
--   listing_fee_paid_at
--   is_treasury_listing
--   nft_holder_account
```

---

## Method 2: Using Render's Built-in Shell

### Step 1: Open Render Shell
1. Go to https://dashboard.render.com
2. Click on your PostgreSQL database
3. Click **Shell** tab
4. You'll see a psql prompt

### Step 2: Copy-Paste Migration SQL
1. Open `/database/migrations/003-004-combined-fee-tracking-and-treasury.sql`
2. Copy ALL the content
3. Paste into the Render Shell
4. Press Enter

### Step 3: Verify
```sql
\d marketplace_listings
```

---

## Method 3: Using Migration Script (Automated)

### Step 1: Set Environment Variable
```bash
# Get connection string from Render dashboard
export DATABASE_URL="postgresql://deralinks_db_user:xxxxx@dpg-xxxxx.oregon-postgres.render.com/deralinks_db"
```

### Step 2: Run Script
```bash
cd /Users/user/Documents/deralinks/backend
./scripts/apply-migration.sh
```

---

## What the Migration Does

### Adds to `marketplace_listings` table:
- `listing_fee` - Amount charged for listing ($25 or $100)
- `listing_fee_paid` - Whether fee was paid
- `listing_fee_paid_at` - When it was paid
- `is_treasury_listing` - TRUE if property owner listing from treasury
- `nft_holder_account` - Account that actually holds the NFTs

### Adds to `marketplace_transactions` table:
- `sale_type` - 'primary' or 'secondary'
- `platform_fee` - Platform fee amount
- `platform_fee_percentage` - Fee % (10% or 2.5%)
- `seller_receives` - Net amount after fees

### Creates new table:
- `platform_revenue` - Tracks all platform earnings

---

## After Migration

### Test Property Owner Listing:
```bash
curl -X POST https://deralinks-backend.onrender.com/api/v1/marketplace/list \
  -H "Content-Type: application/json" \
  -d '{
    "sellerHederaAccount": "0.0.7144250",
    "tokenId": "0.0.7170282",
    "serialNumbers": [1, 2],
    "pricePerNFT": 24,
    "currency": "USD"
  }'
```

**Expected:** Success (property owner can now list from treasury!)

---

## Troubleshooting

### Error: "psql: command not found"
Install PostgreSQL client:
```bash
# macOS
brew install postgresql

# Ubuntu/Debian
sudo apt-get install postgresql-client
```

### Error: "connection refused"
- Check your connection string is correct
- Ensure your IP is whitelisted in Render (usually auto-whitelisted)

### Error: "permission denied"
- Make sure you're using the correct database user credentials
- The connection string from Render should have full permissions

---

## Migration Status

- ✅ Migration file created
- ✅ Script created and executable
- ⏳ **PENDING: Apply to production database**
- ⏳ Test listing endpoint after migration

---

## Need Help?

1. **Can't connect to database?**
   - Use Render's built-in Shell (Method 2 - easiest)

2. **Migration fails?**
   - Copy error message
   - The migration uses `IF NOT EXISTS` so it's safe to run multiple times

3. **Want to verify without applying?**
   ```sql
   -- Check current columns
   \d marketplace_listings
   ```
