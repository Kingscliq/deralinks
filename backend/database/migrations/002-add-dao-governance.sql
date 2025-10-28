-- ============================================
-- DAO Governance Tables Migration
-- Adds proposal and voting system for property governance
-- ============================================

-- ============================================
-- TABLE: dao_proposals
-- Governance proposals for each property
-- ============================================
CREATE TABLE IF NOT EXISTS dao_proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Property this proposal is for
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  token_id VARCHAR(50) NOT NULL, -- For quick lookup

  -- Proposer
  proposer_hedera_account VARCHAR(50) NOT NULL,
  proposer_voting_power INTEGER NOT NULL DEFAULT 0, -- NFTs owned at proposal time

  -- Proposal details
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  proposal_type VARCHAR(30) NOT NULL, -- 'maintenance', 'budget', 'distribution', 'asset_sale', 'general'

  -- Proposal data (JSON for flexibility)
  proposal_data JSONB DEFAULT '{}', -- Budget amounts, contractor info, sale details, etc.

  -- Attachments
  document_cids TEXT[], -- IPFS CIDs for supporting documents

  -- Voting parameters
  voting_starts_at TIMESTAMP NOT NULL,
  voting_ends_at TIMESTAMP NOT NULL,
  quorum_percentage INTEGER DEFAULT 51, -- % of total supply needed to vote
  approval_threshold_percentage INTEGER DEFAULT 51, -- % of votes needed to pass

  -- Vote tallying
  total_voting_power INTEGER NOT NULL DEFAULT 0, -- Total NFTs in circulation
  votes_for INTEGER DEFAULT 0,
  votes_against INTEGER DEFAULT 0,
  votes_abstain INTEGER DEFAULT 0,
  unique_voters INTEGER DEFAULT 0,

  -- Vote power tracking
  voting_power_for INTEGER DEFAULT 0, -- Number of NFTs voting FOR
  voting_power_against INTEGER DEFAULT 0, -- Number of NFTs voting AGAINST
  voting_power_abstain INTEGER DEFAULT 0, -- Number of NFTs voting ABSTAIN

  -- Results
  quorum_reached BOOLEAN DEFAULT false,
  proposal_passed BOOLEAN DEFAULT false,

  -- Status
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'active', 'passed', 'rejected', 'executed', 'cancelled'

  -- Execution
  executed_at TIMESTAMP,
  execution_transaction_id VARCHAR(100),
  execution_notes TEXT,

  -- HCS tracking
  hcs_message_sequence_number BIGINT, -- Sequence number of proposal in HCS topic

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  cancelled_at TIMESTAMP
);

CREATE INDEX idx_proposals_property ON dao_proposals(property_id);
CREATE INDEX idx_proposals_token ON dao_proposals(token_id);
CREATE INDEX idx_proposals_proposer ON dao_proposals(proposer_hedera_account);
CREATE INDEX idx_proposals_status ON dao_proposals(status);
CREATE INDEX idx_proposals_type ON dao_proposals(proposal_type);
CREATE INDEX idx_proposals_voting_ends ON dao_proposals(voting_ends_at);
CREATE INDEX idx_proposals_created ON dao_proposals(created_at DESC);

-- ============================================
-- TABLE: dao_votes
-- Individual votes on proposals
-- ============================================
CREATE TABLE IF NOT EXISTS dao_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Proposal
  proposal_id UUID NOT NULL REFERENCES dao_proposals(id) ON DELETE CASCADE,

  -- Voter
  voter_hedera_account VARCHAR(50) NOT NULL,

  -- Vote details
  vote_choice VARCHAR(20) NOT NULL, -- 'for', 'against', 'abstain'
  voting_power INTEGER NOT NULL, -- Number of NFTs owned by voter

  -- Wallet signature (for verification)
  message_signed TEXT NOT NULL, -- The challenge message that was signed
  signature VARCHAR(500) NOT NULL, -- Wallet signature
  public_key VARCHAR(200), -- Voter's public key

  -- Vote reason (optional)
  reason TEXT,

  -- Delegation (for future enhancement)
  delegated_from_account VARCHAR(50),
  is_delegated BOOLEAN DEFAULT false,

  -- HCS tracking
  hcs_message_sequence_number BIGINT, -- Sequence number of vote in HCS topic

  -- Timestamps
  voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_votes_proposal ON dao_votes(proposal_id);
CREATE INDEX idx_votes_voter ON dao_votes(voter_hedera_account);
CREATE INDEX idx_votes_choice ON dao_votes(vote_choice);
CREATE INDEX idx_votes_voted_at ON dao_votes(voted_at DESC);
CREATE UNIQUE INDEX idx_votes_unique ON dao_votes(proposal_id, voter_hedera_account); -- One vote per voter per proposal

-- ============================================
-- TABLE: dao_treasury_transactions
-- Track treasury income and expenses per property
-- ============================================
CREATE TABLE IF NOT EXISTS dao_treasury_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Property
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  token_id VARCHAR(50) NOT NULL,

  -- Transaction details
  transaction_type VARCHAR(30) NOT NULL, -- 'income', 'expense', 'distribution', 'initial_deposit'
  category VARCHAR(50), -- 'rent', 'maintenance', 'taxes', 'insurance', 'dividend', etc.

  -- Amount
  amount DECIMAL(20, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'HBAR',

  -- Description
  description TEXT NOT NULL,

  -- Related entities
  related_account VARCHAR(50), -- Recipient or payer account
  related_proposal_id UUID REFERENCES dao_proposals(id), -- If related to a proposal

  -- Hedera transaction
  hedera_transaction_id VARCHAR(100),
  hedera_timestamp TIMESTAMP,

  -- Attachments
  document_cids TEXT[], -- Receipts, invoices, etc.

  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'failed'

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE INDEX idx_treasury_property ON dao_treasury_transactions(property_id);
CREATE INDEX idx_treasury_token ON dao_treasury_transactions(token_id);
CREATE INDEX idx_treasury_type ON dao_treasury_transactions(transaction_type);
CREATE INDEX idx_treasury_proposal ON dao_treasury_transactions(related_proposal_id);
CREATE INDEX idx_treasury_created ON dao_treasury_transactions(created_at DESC);

-- ============================================
-- Add treasury tracking to properties table
-- ============================================
ALTER TABLE properties ADD COLUMN IF NOT EXISTS treasury_balance DECIMAL(20, 2) DEFAULT 0;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS treasury_currency VARCHAR(10) DEFAULT 'HBAR';
ALTER TABLE properties ADD COLUMN IF NOT EXISTS total_income DECIMAL(20, 2) DEFAULT 0;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS total_expenses DECIMAL(20, 2) DEFAULT 0;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS total_distributions DECIMAL(20, 2) DEFAULT 0;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS last_distribution_at TIMESTAMP;

-- ============================================
-- TRIGGERS
-- ============================================

CREATE TRIGGER trigger_proposals_updated_at
BEFORE UPDATE ON dao_proposals
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_votes_updated_at
BEFORE UPDATE ON dao_votes
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to calculate voting power for an account on a specific property
CREATE OR REPLACE FUNCTION get_voting_power(
  p_account_id VARCHAR(50),
  p_token_id VARCHAR(50)
) RETURNS INTEGER AS $$
DECLARE
  v_voting_power INTEGER;
BEGIN
  SELECT COALESCE(quantity, 0)
  INTO v_voting_power
  FROM nft_holdings
  WHERE owner_hedera_account = p_account_id
    AND token_id = p_token_id;

  RETURN COALESCE(v_voting_power, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to update proposal vote tallies after a vote is cast
CREATE OR REPLACE FUNCTION update_proposal_tally()
RETURNS TRIGGER AS $$
BEGIN
  -- Update vote counts and voting power in proposal
  IF TG_OP = 'INSERT' THEN
    -- New vote
    UPDATE dao_proposals
    SET
      unique_voters = unique_voters + 1,
      votes_for = votes_for + CASE WHEN NEW.vote_choice = 'for' THEN 1 ELSE 0 END,
      votes_against = votes_against + CASE WHEN NEW.vote_choice = 'against' THEN 1 ELSE 0 END,
      votes_abstain = votes_abstain + CASE WHEN NEW.vote_choice = 'abstain' THEN 1 ELSE 0 END,
      voting_power_for = voting_power_for + CASE WHEN NEW.vote_choice = 'for' THEN NEW.voting_power ELSE 0 END,
      voting_power_against = voting_power_against + CASE WHEN NEW.vote_choice = 'against' THEN NEW.voting_power ELSE 0 END,
      voting_power_abstain = voting_power_abstain + CASE WHEN NEW.vote_choice = 'abstain' THEN NEW.voting_power ELSE 0 END
    WHERE id = NEW.proposal_id;

  ELSIF TG_OP = 'UPDATE' THEN
    -- Vote changed
    UPDATE dao_proposals
    SET
      votes_for = votes_for
        - CASE WHEN OLD.vote_choice = 'for' THEN 1 ELSE 0 END
        + CASE WHEN NEW.vote_choice = 'for' THEN 1 ELSE 0 END,
      votes_against = votes_against
        - CASE WHEN OLD.vote_choice = 'against' THEN 1 ELSE 0 END
        + CASE WHEN NEW.vote_choice = 'against' THEN 1 ELSE 0 END,
      votes_abstain = votes_abstain
        - CASE WHEN OLD.vote_choice = 'abstain' THEN 1 ELSE 0 END
        + CASE WHEN NEW.vote_choice = 'abstain' THEN 1 ELSE 0 END,
      voting_power_for = voting_power_for
        - CASE WHEN OLD.vote_choice = 'for' THEN OLD.voting_power ELSE 0 END
        + CASE WHEN NEW.vote_choice = 'for' THEN NEW.voting_power ELSE 0 END,
      voting_power_against = voting_power_against
        - CASE WHEN OLD.vote_choice = 'against' THEN OLD.voting_power ELSE 0 END
        + CASE WHEN NEW.vote_choice = 'against' THEN NEW.voting_power ELSE 0 END,
      voting_power_abstain = voting_power_abstain
        - CASE WHEN OLD.vote_choice = 'abstain' THEN OLD.voting_power ELSE 0 END
        + CASE WHEN NEW.vote_choice = 'abstain' THEN NEW.voting_power ELSE 0 END
    WHERE id = NEW.proposal_id;
  END IF;

  -- Check if quorum reached and proposal passed
  UPDATE dao_proposals
  SET
    quorum_reached = ((voting_power_for + voting_power_against + voting_power_abstain)::DECIMAL / total_voting_power * 100) >= quorum_percentage,
    proposal_passed =
      (((voting_power_for + voting_power_against + voting_power_abstain)::DECIMAL / total_voting_power * 100) >= quorum_percentage)
      AND
      ((voting_power_for::DECIMAL / NULLIF(voting_power_for + voting_power_against, 0) * 100) >= approval_threshold_percentage)
  WHERE id = NEW.proposal_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_vote_tally
AFTER INSERT OR UPDATE ON dao_votes
FOR EACH ROW EXECUTE FUNCTION update_proposal_tally();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE dao_proposals IS 'Governance proposals for property DAOs';
COMMENT ON TABLE dao_votes IS 'Individual votes on DAO proposals';
COMMENT ON TABLE dao_treasury_transactions IS 'Treasury income and expenses per property';

COMMENT ON COLUMN dao_proposals.quorum_percentage IS 'Percentage of total supply that must vote';
COMMENT ON COLUMN dao_proposals.approval_threshold_percentage IS 'Percentage of votes needed to pass (of those who voted)';
COMMENT ON COLUMN dao_proposals.total_voting_power IS 'Total NFTs in circulation at proposal creation';
COMMENT ON COLUMN dao_proposals.voting_power_for IS 'Total NFTs voting FOR';
COMMENT ON COLUMN dao_proposals.voting_power_against IS 'Total NFTs voting AGAINST';
COMMENT ON COLUMN dao_proposals.voting_power_abstain IS 'Total NFTs voting ABSTAIN';
