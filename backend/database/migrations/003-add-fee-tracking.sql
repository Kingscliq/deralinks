-- ============================================
-- Migration 003: Add Fee Tracking
-- Date: 2025-10-31
-- Description: Add platform fee tracking to marketplace tables
-- ============================================

-- Add fee tracking columns to marketplace_transactions
ALTER TABLE marketplace_transactions
  ADD COLUMN IF NOT EXISTS sale_type VARCHAR(20) DEFAULT 'secondary', -- 'primary' or 'secondary'
  ADD COLUMN IF NOT EXISTS platform_fee DECIMAL(20, 2) DEFAULT 0, -- Platform fee amount
  ADD COLUMN IF NOT EXISTS platform_fee_percentage DECIMAL(5, 2) DEFAULT 0, -- Fee percentage applied
  ADD COLUMN IF NOT EXISTS seller_receives DECIMAL(20, 2) DEFAULT 0; -- Net amount seller receives after fees

-- Add fee tracking columns to marketplace_listings
ALTER TABLE marketplace_listings
  ADD COLUMN IF NOT EXISTS listing_fee DECIMAL(20, 2) DEFAULT 0, -- Listing fee paid
  ADD COLUMN IF NOT EXISTS listing_fee_paid BOOLEAN DEFAULT false, -- Whether listing fee was paid
  ADD COLUMN IF NOT EXISTS listing_fee_paid_at TIMESTAMP; -- When listing fee was paid

-- Add comments for documentation
COMMENT ON COLUMN marketplace_transactions.sale_type IS 'Type of sale: primary (from property owner) or secondary (from other seller)';
COMMENT ON COLUMN marketplace_transactions.platform_fee IS 'Platform fee amount in USD or HBAR';
COMMENT ON COLUMN marketplace_transactions.platform_fee_percentage IS 'Percentage fee applied (10% for primary, 2.5% for secondary)';
COMMENT ON COLUMN marketplace_transactions.seller_receives IS 'Net amount seller receives after platform fees';

COMMENT ON COLUMN marketplace_listings.listing_fee IS 'Listing fee amount (standard: $25, premium: $100)';
COMMENT ON COLUMN marketplace_listings.listing_fee_paid IS 'Whether the listing fee has been paid';
COMMENT ON COLUMN marketplace_listings.listing_fee_paid_at IS 'Timestamp when listing fee was paid';

-- Create index for querying by sale type
CREATE INDEX IF NOT EXISTS idx_marketplace_tx_sale_type ON marketplace_transactions(sale_type);

-- Create index for querying paid listings
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_fee_paid ON marketplace_listings(listing_fee_paid);

-- Add platform revenue tracking table
CREATE TABLE IF NOT EXISTS platform_revenue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Revenue type
  revenue_type VARCHAR(50) NOT NULL, -- 'minting_fee', 'primary_sale_commission', 'platform_transaction_fee', 'listing_fee'

  -- Amount
  amount DECIMAL(20, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',

  -- Related records
  transaction_id UUID REFERENCES marketplace_transactions(id),
  listing_id UUID REFERENCES marketplace_listings(id),
  property_id UUID REFERENCES properties(id),
  token_id VARCHAR(50),

  -- Payer
  payer_hedera_account VARCHAR(50) NOT NULL,

  -- Payment status
  payment_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'failed'
  paid_at TIMESTAMP,

  -- Notes
  description TEXT,
  metadata JSONB,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for platform revenue
CREATE INDEX IF NOT EXISTS idx_platform_revenue_type ON platform_revenue(revenue_type);
CREATE INDEX IF NOT EXISTS idx_platform_revenue_status ON platform_revenue(payment_status);
CREATE INDEX IF NOT EXISTS idx_platform_revenue_payer ON platform_revenue(payer_hedera_account);
CREATE INDEX IF NOT EXISTS idx_platform_revenue_created ON platform_revenue(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_platform_revenue_property ON platform_revenue(property_id);

-- Add comment for platform_revenue table
COMMENT ON TABLE platform_revenue IS 'Tracks all platform revenue from minting fees, commissions, transaction fees, and listing fees';

-- Migration complete
COMMENT ON EXTENSION "uuid-ossp" IS 'Migration 003: Fee tracking added successfully';
