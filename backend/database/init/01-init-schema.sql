-- ============================================
-- DeraLinks Complete Database Schema
-- PostgreSQL 15+
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: users
-- Stores platform user accounts
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hedera_account VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255),
  role VARCHAR(20) NOT NULL DEFAULT 'investor', -- 'investor', 'property_owner', 'admin'

  -- Verification status
  verification_status VARCHAR(20) DEFAULT 'none', -- 'none', 'basic', 'accredited', 'property_owner'
  verification_nft_serial INTEGER,
  verification_token_id VARCHAR(50),

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

CREATE INDEX idx_users_hedera_account ON users(hedera_account);
CREATE INDEX idx_users_verification ON users(verification_status);

-- ============================================
-- TABLE: properties
-- Stores tokenized property collections
-- ============================================
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Hedera blockchain identifiers
  token_id VARCHAR(50) UNIQUE NOT NULL, -- Hedera token ID (e.g., 0.0.7128093)
  collection_name VARCHAR(255) NOT NULL,
  collection_symbol VARCHAR(10) NOT NULL,

  -- Property owner
  owner_hedera_account VARCHAR(50) NOT NULL,

  -- Property details
  property_name VARCHAR(255) NOT NULL,
  property_type VARCHAR(50) NOT NULL, -- 'real_estate', 'agriculture', 'commercial'
  category VARCHAR(50), -- 'residential', 'farmland', 'office', etc.

  -- Location
  address TEXT NOT NULL,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100) NOT NULL,
  zip_code VARCHAR(20),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Financial details
  total_value DECIMAL(20, 2) NOT NULL, -- Total property valuation
  token_price DECIMAL(20, 2) NOT NULL, -- Price per NFT share
  total_supply INTEGER NOT NULL, -- Total NFT supply
  available_supply INTEGER NOT NULL DEFAULT 0, -- Available for primary sale

  -- Metadata & Media
  description TEXT,
  metadata_cid VARCHAR(255), -- IPFS CID for metadata JSON
  images JSONB DEFAULT '[]', -- Array of IPFS CIDs
  documents JSONB DEFAULT '[]', -- Title deeds, licenses, etc.

  -- Features
  features JSONB DEFAULT '{}', -- {bedrooms: 3, sqft: 2000, etc.}
  amenities TEXT[], -- Array of amenities

  -- Revenue details
  expected_annual_return DECIMAL(5, 2), -- Expected return %
  rental_yield DECIMAL(5, 2), -- Annual rental yield %
  distribution_frequency VARCHAR(20), -- 'monthly', 'quarterly', 'annually'

  -- HCS Topic
  hcs_topic_id VARCHAR(50), -- Topic for property updates

  -- Status
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'active', 'sold_out', 'archived'

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  launched_at TIMESTAMP
);

CREATE INDEX idx_properties_token ON properties(token_id);
CREATE INDEX idx_properties_owner ON properties(owner_hedera_account);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_type ON properties(property_type);
CREATE INDEX idx_properties_country ON properties(country);
CREATE INDEX idx_properties_created ON properties(created_at DESC);

-- ============================================
-- TABLE: nft_holdings
-- Tracks NFT ownership (synced from Hedera Mirror Node)
-- ============================================
CREATE TABLE IF NOT EXISTS nft_holdings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Owner
  owner_hedera_account VARCHAR(50) NOT NULL,

  -- NFT details
  token_id VARCHAR(50) NOT NULL, -- Property token ID
  serial_numbers INTEGER[] NOT NULL, -- Array of owned serial numbers
  quantity INTEGER NOT NULL DEFAULT 0, -- Number of NFTs owned

  -- Financial tracking
  total_invested DECIMAL(20, 2) DEFAULT 0,
  current_value DECIMAL(20, 2) DEFAULT 0,
  total_dividends DECIMAL(20, 2) DEFAULT 0,

  -- Timestamps
  first_acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_holdings_owner ON nft_holdings(owner_hedera_account);
CREATE INDEX idx_holdings_token ON nft_holdings(token_id);
CREATE UNIQUE INDEX idx_holdings_unique ON nft_holdings(owner_hedera_account, token_id);

-- ============================================
-- TABLE: marketplace_listings
-- Secondary market NFT listings
-- ============================================
CREATE TABLE IF NOT EXISTS marketplace_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Seller
  seller_hedera_account VARCHAR(50) NOT NULL,

  -- NFT being sold
  token_id VARCHAR(50) NOT NULL,
  serial_numbers INTEGER[] NOT NULL, -- Specific NFTs for sale
  quantity INTEGER NOT NULL,

  -- Pricing
  price_per_nft DECIMAL(20, 2) NOT NULL, -- Price per NFT
  total_price DECIMAL(20, 2) NOT NULL, -- Total listing price
  currency VARCHAR(10) DEFAULT 'USD',

  -- Listing details
  title VARCHAR(255),
  description TEXT,

  -- Terms
  min_purchase INTEGER DEFAULT 1,
  max_purchase INTEGER,

  -- Status
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'sold', 'cancelled', 'expired'

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  sold_at TIMESTAMP
);

CREATE INDEX idx_listings_seller ON marketplace_listings(seller_hedera_account);
CREATE INDEX idx_listings_token ON marketplace_listings(token_id);
CREATE INDEX idx_listings_status ON marketplace_listings(status);
CREATE INDEX idx_listings_price ON marketplace_listings(price_per_nft);
CREATE INDEX idx_listings_created ON marketplace_listings(created_at DESC);

-- ============================================
-- TABLE: transactions
-- All platform transactions
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Parties
  from_hedera_account VARCHAR(50),
  to_hedera_account VARCHAR(50),

  -- Transaction type
  transaction_type VARCHAR(30) NOT NULL, -- 'mint', 'primary_sale', 'secondary_sale', 'transfer', 'dividend'

  -- NFT details
  token_id VARCHAR(50),
  serial_numbers INTEGER[],
  quantity INTEGER,

  -- Financial
  amount DECIMAL(20, 2),
  currency VARCHAR(10) DEFAULT 'USD',
  fee_amount DECIMAL(20, 2),

  -- Hedera transaction
  hedera_transaction_id VARCHAR(100),
  hedera_timestamp TIMESTAMP,

  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'failed'

  -- Metadata
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_from ON transactions(from_hedera_account);
CREATE INDEX idx_transactions_to ON transactions(to_hedera_account);
CREATE INDEX idx_transactions_token ON transactions(token_id);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_hedera_id ON transactions(hedera_transaction_id);
CREATE INDEX idx_transactions_created ON transactions(created_at DESC);

-- ============================================
-- TABLE: platform_config
-- System configuration
-- ============================================
CREATE TABLE IF NOT EXISTS platform_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  config_key VARCHAR(100) UNIQUE NOT NULL,
  config_value TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial config
INSERT INTO platform_config (config_key, config_value, description) VALUES
  ('verification_token_property-owner', '0.0.12345', 'Property Owner Verification NFT Token ID'),
  ('verification_token_investor', '0.0.12346', 'Investor Verification NFT Token ID'),
  ('verification_token_kyc', '0.0.12347', 'KYC Verification NFT Token ID'),
  ('verification_token_accredited-investor', '0.0.12348', 'Accredited Investor Verification NFT Token ID'),
  ('treasury_account_id', '', 'Platform Treasury Account'),
  ('fee_collector_account_id', '', 'Fee Collector Account'),
  ('platform_fee_percentage', '2.5', 'Platform fee percentage'),
  ('kyc_threshold_usd', '2000', 'KYC required above this amount')
ON CONFLICT (config_key) DO NOTHING;

-- ============================================
-- TABLE: investors
-- Investor registration and profiles
-- ============================================
CREATE TABLE IF NOT EXISTS investors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Identity
  hedera_account_id VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  country VARCHAR(100) NOT NULL,

  -- Type
  investor_type VARCHAR(30) DEFAULT 'retail', -- 'retail', 'accredited', 'institutional'

  -- Verification status
  kyc_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
  kyc_verified_at TIMESTAMP,
  accreditation_status VARCHAR(20) DEFAULT 'pending',
  accreditation_verified_at TIMESTAMP,

  -- Verification NFT
  verification_nft_token_id VARCHAR(50),
  verification_nft_serial INTEGER,

  -- Timestamps
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_investors_hedera ON investors(hedera_account_id);
CREATE INDEX idx_investors_email ON investors(email);
CREATE INDEX idx_investors_kyc_status ON investors(kyc_status);

-- ============================================
-- TABLE: kyc_submissions
-- KYC document submissions for investors
-- ============================================
CREATE TABLE IF NOT EXISTS kyc_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  investor_id UUID NOT NULL REFERENCES investors(id) ON DELETE CASCADE,

  -- Document details
  document_type VARCHAR(50) NOT NULL, -- 'passport', 'drivers_license', 'national_id'
  document_number VARCHAR(100),
  document_cid VARCHAR(255) NOT NULL, -- IPFS CID

  -- Verification type
  verification_type VARCHAR(30) DEFAULT 'kyc', -- 'kyc', 'accredited-investor'

  -- Additional info
  additional_info JSONB,

  -- Review
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP,
  rejection_reason TEXT,
  admin_notes TEXT
);

CREATE INDEX idx_kyc_investor ON kyc_submissions(investor_id);
CREATE INDEX idx_kyc_status ON kyc_submissions(status);
CREATE INDEX idx_kyc_submitted ON kyc_submissions(submitted_at DESC);

-- ============================================
-- TABLE: property_owners
-- Property owner registration and verification
-- ============================================
CREATE TABLE IF NOT EXISTS property_owners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Identity
  hedera_account_id VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  country VARCHAR(100) NOT NULL,

  -- Owner type
  owner_type VARCHAR(30) DEFAULT 'individual', -- 'individual', 'company'
  company_name VARCHAR(255),
  company_registration_number VARCHAR(100),

  -- Verification status
  verification_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
  verified_at TIMESTAMP,

  -- Verification NFT
  verification_nft_token_id VARCHAR(50),
  verification_nft_serial INTEGER,

  -- Timestamps
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_property_owners_hedera ON property_owners(hedera_account_id);
CREATE INDEX idx_property_owners_email ON property_owners(email);
CREATE INDEX idx_property_owners_status ON property_owners(verification_status);

-- ============================================
-- TABLE: property_owner_verifications
-- Property owner verification document submissions
-- ============================================
CREATE TABLE IF NOT EXISTS property_owner_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  owner_id UUID NOT NULL REFERENCES property_owners(id) ON DELETE CASCADE,

  -- KYC documents
  government_id_cid VARCHAR(255) NOT NULL,
  proof_of_address_cid VARCHAR(255) NOT NULL,
  selfie_with_id_cid VARCHAR(255),

  -- Property documents
  title_deed_cid VARCHAR(255) NOT NULL,
  property_appraisal_cid VARCHAR(255),
  property_photos_cids TEXT[],
  tax_receipt_cid VARCHAR(255),
  mortgage_document_cid VARCHAR(255),

  -- Property details
  property_address TEXT NOT NULL,
  property_city VARCHAR(100),
  property_country VARCHAR(100),
  property_value DECIMAL(20, 2),
  property_type VARCHAR(50),
  additional_notes TEXT,

  -- Review
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP,
  rejection_reason TEXT,
  admin_notes TEXT
);

CREATE INDEX idx_property_owner_verif_owner ON property_owner_verifications(owner_id);
CREATE INDEX idx_property_owner_verif_status ON property_owner_verifications(status);
CREATE INDEX idx_property_owner_verif_submitted ON property_owner_verifications(submitted_at DESC);

-- ============================================
-- TABLE: marketplace_offers
-- Offers made on marketplace listings
-- ============================================
CREATE TABLE IF NOT EXISTS marketplace_offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  listing_id UUID NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,

  -- Buyer
  buyer_hedera_account VARCHAR(50) NOT NULL,

  -- Offer details
  offer_price DECIMAL(20, 2) NOT NULL, -- Price per NFT offered
  quantity INTEGER NOT NULL, -- Number of NFTs wanted
  total_offer_amount DECIMAL(20, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'HBAR',

  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'expired'

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  responded_at TIMESTAMP
);

CREATE INDEX idx_offers_listing ON marketplace_offers(listing_id);
CREATE INDEX idx_offers_buyer ON marketplace_offers(buyer_hedera_account);
CREATE INDEX idx_offers_status ON marketplace_offers(status);
CREATE INDEX idx_offers_created ON marketplace_offers(created_at DESC);

-- ============================================
-- TABLE: marketplace_transactions
-- Completed marketplace purchase transactions
-- ============================================
CREATE TABLE IF NOT EXISTS marketplace_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  listing_id UUID REFERENCES marketplace_listings(id),

  -- Parties
  buyer_hedera_account VARCHAR(50) NOT NULL,
  seller_hedera_account VARCHAR(50) NOT NULL,

  -- NFT details
  token_id VARCHAR(50) NOT NULL,
  serial_numbers INTEGER[] NOT NULL,
  quantity INTEGER NOT NULL,

  -- Pricing
  price_per_nft DECIMAL(20, 2) NOT NULL,
  total_price DECIMAL(20, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'HBAR',

  -- Transaction type
  transaction_type VARCHAR(30) DEFAULT 'purchase', -- 'purchase', 'offer_accepted'

  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'failed'

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE INDEX idx_marketplace_tx_buyer ON marketplace_transactions(buyer_hedera_account);
CREATE INDEX idx_marketplace_tx_seller ON marketplace_transactions(seller_hedera_account);
CREATE INDEX idx_marketplace_tx_token ON marketplace_transactions(token_id);
CREATE INDEX idx_marketplace_tx_status ON marketplace_transactions(status);
CREATE INDEX idx_marketplace_tx_created ON marketplace_transactions(created_at DESC);

-- ============================================
-- TABLE: nft_transfers
-- NFT transfer requests and tracking
-- ============================================
CREATE TABLE IF NOT EXISTS nft_transfers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Transfer details
  token_id VARCHAR(50) NOT NULL,
  from_account VARCHAR(50) NOT NULL,
  to_account VARCHAR(50) NOT NULL,
  serial_numbers INTEGER[] NOT NULL,
  quantity INTEGER NOT NULL,

  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'failed'

  -- Hedera transaction
  hedera_transaction_id VARCHAR(100),
  hedera_timestamp TIMESTAMP,

  -- Timestamps
  initiated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE INDEX idx_nft_transfers_token ON nft_transfers(token_id);
CREATE INDEX idx_nft_transfers_from ON nft_transfers(from_account);
CREATE INDEX idx_nft_transfers_to ON nft_transfers(to_account);
CREATE INDEX idx_nft_transfers_status ON nft_transfers(status);
CREATE INDEX idx_nft_transfers_initiated ON nft_transfers(initiated_at DESC);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_properties_updated_at
BEFORE UPDATE ON properties
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_listings_updated_at
BEFORE UPDATE ON marketplace_listings
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_platform_config_updated_at
BEFORE UPDATE ON platform_config
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_investors_updated_at
BEFORE UPDATE ON investors
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_property_owners_updated_at
BEFORE UPDATE ON property_owners
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE users IS 'Platform user accounts';
COMMENT ON TABLE properties IS 'Tokenized property collections';
COMMENT ON TABLE nft_holdings IS 'NFT ownership tracking';
COMMENT ON TABLE marketplace_listings IS 'Secondary market listings';
COMMENT ON TABLE transactions IS 'All platform transactions';
COMMENT ON TABLE platform_config IS 'System configuration';
COMMENT ON TABLE investors IS 'Investor registration and profiles';
COMMENT ON TABLE kyc_submissions IS 'KYC document submissions for investors';
COMMENT ON TABLE property_owners IS 'Property owner registration and verification';
COMMENT ON TABLE property_owner_verifications IS 'Property owner verification document submissions';
COMMENT ON TABLE marketplace_offers IS 'Offers made on marketplace listings';
COMMENT ON TABLE marketplace_transactions IS 'Completed marketplace purchase transactions';
COMMENT ON TABLE nft_transfers IS 'NFT transfer requests and tracking';

-- ============================================
-- Grant permissions (adjust as needed)
-- ============================================

-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO deralinks;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO deralinks;
