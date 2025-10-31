-- Migration 004: Add treasury listing support
-- Allows property owners to list NFTs directly from treasury

-- Add flag to track if listing is from treasury (property owner) or from investor
ALTER TABLE marketplace_listings
  ADD COLUMN IF NOT EXISTS is_treasury_listing BOOLEAN DEFAULT false;

-- Add comment for clarity
COMMENT ON COLUMN marketplace_listings.is_treasury_listing IS
  'True if property owner is listing NFTs from treasury; False if investor is listing owned NFTs';

-- Create index for faster queries on treasury listings
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_treasury
  ON marketplace_listings(is_treasury_listing)
  WHERE status = 'active';

-- Add actual holder account column (for transfer logic)
ALTER TABLE marketplace_listings
  ADD COLUMN IF NOT EXISTS nft_holder_account VARCHAR(50);

COMMENT ON COLUMN marketplace_listings.nft_holder_account IS
  'The Hedera account that actually holds the NFTs (treasury for primary listings, seller for secondary)';
