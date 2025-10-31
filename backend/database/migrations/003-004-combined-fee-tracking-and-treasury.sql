-- ============================================
-- Combined Migration 003 + 004: Fee Tracking & Treasury Listings
-- Date: 2025-10-31
-- Description: Add platform fee tracking and treasury listing support
-- ============================================

-- PART 1: Fee Tracking (Migration 003)
-- ============================================

-- Add fee tracking columns to marketplace_transactions
ALTER TABLE marketplace_transactions
  ADD COLUMN IF NOT EXISTS sale_type VARCHAR(20) DEFAULT 'secondary',
  ADD COLUMN IF NOT EXISTS platform_fee DECIMAL(20, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS platform_fee_percentage DECIMAL(5, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS seller_receives DECIMAL(20, 2) DEFAULT 0;

-- Add fee tracking columns to marketplace_listings
ALTER TABLE marketplace_listings
  ADD COLUMN IF NOT EXISTS listing_fee DECIMAL(20, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS listing_fee_paid BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS listing_fee_paid_at TIMESTAMP;

-- Create platform revenue tracking table
CREATE TABLE IF NOT EXISTS platform_revenue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  revenue_type VARCHAR(50) NOT NULL,
  amount DECIMAL(20, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  transaction_id UUID REFERENCES marketplace_transactions(id),
  listing_id UUID REFERENCES marketplace_listings(id),
  property_id UUID REFERENCES properties(id),
  token_id VARCHAR(50),
  payer_hedera_account VARCHAR(50) NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'pending',
  paid_at TIMESTAMP,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PART 2: Treasury Listing Support (Migration 004)
-- ============================================

-- Add treasury listing support columns
ALTER TABLE marketplace_listings
  ADD COLUMN IF NOT EXISTS is_treasury_listing BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS nft_holder_account VARCHAR(50);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_marketplace_tx_sale_type ON marketplace_transactions(sale_type);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_fee_paid ON marketplace_listings(listing_fee_paid);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_treasury ON marketplace_listings(is_treasury_listing) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_platform_revenue_type ON platform_revenue(revenue_type);
CREATE INDEX IF NOT EXISTS idx_platform_revenue_status ON platform_revenue(payment_status);
CREATE INDEX IF NOT EXISTS idx_platform_revenue_payer ON platform_revenue(payer_hedera_account);
CREATE INDEX IF NOT EXISTS idx_platform_revenue_created ON platform_revenue(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_platform_revenue_property ON platform_revenue(property_id);

-- Add comments for documentation
COMMENT ON COLUMN marketplace_transactions.sale_type IS 'Type of sale: primary (from property owner) or secondary (from other seller)';
COMMENT ON COLUMN marketplace_transactions.platform_fee IS 'Platform fee amount in USD or HBAR';
COMMENT ON COLUMN marketplace_transactions.platform_fee_percentage IS 'Percentage fee applied (10% for primary, 2.5% for secondary)';
COMMENT ON COLUMN marketplace_transactions.seller_receives IS 'Net amount seller receives after platform fees';

COMMENT ON COLUMN marketplace_listings.listing_fee IS 'Listing fee amount (standard: $25, premium: $100)';
COMMENT ON COLUMN marketplace_listings.listing_fee_paid IS 'Whether the listing fee has been paid';
COMMENT ON COLUMN marketplace_listings.listing_fee_paid_at IS 'Timestamp when listing fee was paid';
COMMENT ON COLUMN marketplace_listings.is_treasury_listing IS 'True if property owner is listing NFTs from treasury; False if investor is listing owned NFTs';
COMMENT ON COLUMN marketplace_listings.nft_holder_account IS 'The Hedera account that actually holds the NFTs (treasury for primary listings, seller for secondary)';

COMMENT ON TABLE platform_revenue IS 'Tracks all platform revenue from minting fees, commissions, transaction fees, and listing fees';

-- Migration complete
SELECT 'Combined Migration 003-004: Fee tracking and treasury listing support added successfully' AS status;
