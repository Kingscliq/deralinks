#!/bin/bash

# Apply database migration to Render PostgreSQL
# Usage: ./scripts/apply-migration.sh

echo "🗄️  Applying database migration to production..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is not set"
    echo "   Please set it with your Render PostgreSQL connection string"
    echo "   export DATABASE_URL='postgresql://user:password@host:port/database'"
    exit 1
fi

# Apply the combined migration
echo "📝 Running migration: 003-004-combined-fee-tracking-and-treasury.sql"
psql "$DATABASE_URL" -f database/migrations/003-004-combined-fee-tracking-and-treasury.sql

if [ $? -eq 0 ]; then
    echo "✅ Migration applied successfully!"
    echo ""
    echo "Verifying columns were added:"
    psql "$DATABASE_URL" -c "\d marketplace_listings" | grep -E "(listing_fee|is_treasury_listing|nft_holder_account)"
else
    echo "❌ Migration failed!"
    exit 1
fi
