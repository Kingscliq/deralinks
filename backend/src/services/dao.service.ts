/**
 * DAO Governance Service
 * Handles proposal creation, voting, and execution
 */

import { query } from '../config/database';

export interface CreateProposalParams {
  propertyId: string;
  tokenId: string;
  proposerAccount: string;
  title: string;
  description: string;
  proposalType: 'maintenance' | 'budget' | 'distribution' | 'asset_sale' | 'general';
  proposalData?: Record<string, any>;
  documentCids?: string[];
  votingDurationDays?: number;
  quorumPercentage?: number;
  approvalThresholdPercentage?: number;
}

export interface CastVoteParams {
  proposalId: string;
  voterAccount: string;
  voteChoice: 'for' | 'against' | 'abstain';
  signature: string;
  publicKey: string;
  messageSigned: string;
  reason?: string;
}

/**
 * Get voting power for an account on a specific property
 */
export const getVotingPower = async (
  accountId: string,
  tokenId: string
): Promise<number> => {
  try {
    const result = await query(
      `SELECT get_voting_power($1, $2) as voting_power`,
      [accountId, tokenId]
    );
    return result.rows[0]?.voting_power || 0;
  } catch (error: any) {
    console.error('Error getting voting power:', error);
    return 0;
  }
};

/**
 * Get total supply of a property token
 */
export const getTotalSupply = async (tokenId: string): Promise<number> => {
  try {
    const result = await query(
      `SELECT total_supply FROM properties WHERE token_id = $1`,
      [tokenId]
    );
    return result.rows[0]?.total_supply || 0;
  } catch (error: any) {
    console.error('Error getting total supply:', error);
    throw error;
  }
};

/**
 * Create a new governance proposal
 */
export const createProposal = async (params: CreateProposalParams) => {
  const {
    propertyId,
    tokenId,
    proposerAccount,
    title,
    description,
    proposalType,
    proposalData = {},
    documentCids = [],
    votingDurationDays = 7,
    quorumPercentage = 51,
    approvalThresholdPercentage = 51,
  } = params;

  try {
    // Get proposer's voting power
    const proposerVotingPower = await getVotingPower(proposerAccount, tokenId);

    if (proposerVotingPower === 0) {
      throw new Error('Proposer must own NFTs to create a proposal');
    }

    // Get total supply
    const totalSupply = await getTotalSupply(tokenId);

    // Calculate voting period
    const votingStartsAt = new Date();
    const votingEndsAt = new Date();
    votingEndsAt.setDate(votingEndsAt.getDate() + votingDurationDays);

    // Create proposal
    const insertQuery = `
      INSERT INTO dao_proposals (
        property_id, token_id, proposer_hedera_account, proposer_voting_power,
        title, description, proposal_type, proposal_data, document_cids,
        voting_starts_at, voting_ends_at, quorum_percentage, approval_threshold_percentage,
        total_voting_power, status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
      ) RETURNING *
    `;

    const result = await query(insertQuery, [
      propertyId,
      tokenId,
      proposerAccount,
      proposerVotingPower,
      title,
      description,
      proposalType,
      JSON.stringify(proposalData),
      documentCids,
      votingStartsAt,
      votingEndsAt,
      quorumPercentage,
      approvalThresholdPercentage,
      totalSupply,
      'active', // Status set to active immediately
    ]);

    return result.rows[0];
  } catch (error: any) {
    console.error('Error creating proposal:', error);
    throw error;
  }
};

/**
 * Get proposal by ID
 */
export const getProposalById = async (proposalId: string) => {
  try {
    const result = await query(
      `SELECT p.*, prop.property_name, prop.collection_name
       FROM dao_proposals p
       JOIN properties prop ON p.property_id = prop.id
       WHERE p.id = $1`,
      [proposalId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  } catch (error: any) {
    console.error('Error getting proposal:', error);
    throw error;
  }
};

/**
 * Get all proposals for a property
 */
export const getProposalsByProperty = async (
  propertyId: string,
  status?: string,
  limit: number = 50,
  offset: number = 0
) => {
  try {
    let queryText = `
      SELECT p.*, prop.property_name, prop.collection_name
      FROM dao_proposals p
      JOIN properties prop ON p.property_id = prop.id
      WHERE p.property_id = $1
    `;

    const params: any[] = [propertyId];
    let paramCount = 1;

    if (status) {
      paramCount++;
      queryText += ` AND p.status = $${paramCount}`;
      params.push(status);
    }

    queryText += ` ORDER BY p.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await query(queryText, params);

    return result.rows;
  } catch (error: any) {
    console.error('Error getting proposals:', error);
    throw error;
  }
};

/**
 * Cast a vote on a proposal
 */
export const castVote = async (params: CastVoteParams) => {
  const {
    proposalId,
    voterAccount,
    voteChoice,
    signature,
    publicKey,
    messageSigned,
    reason,
  } = params;

  try {
    // Get proposal details
    const proposal = await getProposalById(proposalId);

    if (!proposal) {
      throw new Error('Proposal not found');
    }

    // Check if voting period is active
    const now = new Date();
    const votingEnds = new Date(proposal.voting_ends_at);
    const votingStarts = new Date(proposal.voting_starts_at);

    if (now < votingStarts) {
      throw new Error('Voting has not started yet');
    }

    if (now > votingEnds) {
      throw new Error('Voting period has ended');
    }

    if (proposal.status !== 'active') {
      throw new Error('Proposal is not active');
    }

    // Get voter's voting power
    const votingPower = await getVotingPower(voterAccount, proposal.token_id);

    if (votingPower === 0) {
      throw new Error('Voter must own NFTs to vote');
    }

    // Check if voter has already voted
    const existingVote = await query(
      `SELECT id FROM dao_votes WHERE proposal_id = $1 AND voter_hedera_account = $2`,
      [proposalId, voterAccount]
    );

    if (existingVote.rows.length > 0) {
      // Update existing vote
      const updateQuery = `
        UPDATE dao_votes
        SET vote_choice = $1, voting_power = $2, signature = $3,
            public_key = $4, message_signed = $5, reason = $6, updated_at = CURRENT_TIMESTAMP
        WHERE proposal_id = $7 AND voter_hedera_account = $8
        RETURNING *
      `;

      const result = await query(updateQuery, [
        voteChoice,
        votingPower,
        signature,
        publicKey,
        messageSigned,
        reason || null,
        proposalId,
        voterAccount,
      ]);

      return result.rows[0];
    } else {
      // Insert new vote
      const insertQuery = `
        INSERT INTO dao_votes (
          proposal_id, voter_hedera_account, vote_choice, voting_power,
          signature, public_key, message_signed, reason
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;

      const result = await query(insertQuery, [
        proposalId,
        voterAccount,
        voteChoice,
        votingPower,
        signature,
        publicKey,
        messageSigned,
        reason || null,
      ]);

      return result.rows[0];
    }
  } catch (error: any) {
    console.error('Error casting vote:', error);
    throw error;
  }
};

/**
 * Get vote results for a proposal
 */
export const getVoteResults = async (proposalId: string) => {
  try {
    const proposal = await getProposalById(proposalId);

    if (!proposal) {
      throw new Error('Proposal not found');
    }

    // Get all votes
    const votesQuery = `
      SELECT voter_hedera_account, vote_choice, voting_power, voted_at, reason
      FROM dao_votes
      WHERE proposal_id = $1
      ORDER BY voted_at DESC
    `;

    const votesResult = await query(votesQuery, [proposalId]);

    // Calculate percentages
    const totalVotingPower = proposal.total_voting_power;
    const votedPower = proposal.voting_power_for + proposal.voting_power_against + proposal.voting_power_abstain;
    const participationRate = totalVotingPower > 0 ? (votedPower / totalVotingPower) * 100 : 0;

    const totalVotesFor = proposal.voting_power_for + proposal.voting_power_against;
    const forPercentage = totalVotesFor > 0 ? (proposal.voting_power_for / totalVotesFor) * 100 : 0;
    const againstPercentage = totalVotesFor > 0 ? (proposal.voting_power_against / totalVotesFor) * 100 : 0;

    return {
      proposal: {
        id: proposal.id,
        title: proposal.title,
        status: proposal.status,
        voting_ends_at: proposal.voting_ends_at,
        quorum_percentage: proposal.quorum_percentage,
        approval_threshold_percentage: proposal.approval_threshold_percentage,
      },
      results: {
        total_voting_power: totalVotingPower,
        votes_for: proposal.votes_for,
        votes_against: proposal.votes_against,
        votes_abstain: proposal.votes_abstain,
        voting_power_for: proposal.voting_power_for,
        voting_power_against: proposal.voting_power_against,
        voting_power_abstain: proposal.voting_power_abstain,
        unique_voters: proposal.unique_voters,
        participation_rate: participationRate.toFixed(2),
        for_percentage: forPercentage.toFixed(2),
        against_percentage: againstPercentage.toFixed(2),
        quorum_reached: proposal.quorum_reached,
        proposal_passed: proposal.proposal_passed,
      },
      votes: votesResult.rows,
    };
  } catch (error: any) {
    console.error('Error getting vote results:', error);
    throw error;
  }
};

/**
 * Execute a passed proposal
 */
export const executeProposal = async (proposalId: string, executorAccount: string) => {
  try {
    const proposal = await getProposalById(proposalId);

    if (!proposal) {
      throw new Error('Proposal not found');
    }

    if (proposal.status !== 'passed' && !proposal.proposal_passed) {
      throw new Error('Proposal has not passed');
    }

    const now = new Date();
    const votingEnds = new Date(proposal.voting_ends_at);

    if (now < votingEnds) {
      throw new Error('Voting period has not ended yet');
    }

    // Update proposal status to executed
    const updateQuery = `
      UPDATE dao_proposals
      SET status = 'executed',
          executed_at = CURRENT_TIMESTAMP,
          execution_notes = $1
      WHERE id = $2
      RETURNING *
    `;

    const result = await query(updateQuery, [
      `Executed by ${executorAccount}`,
      proposalId,
    ]);

    // TODO: Implement actual execution logic based on proposal type
    // For maintenance: Create treasury transaction
    // For distribution: Queue dividend distribution
    // For asset_sale: Update property status
    // etc.

    return result.rows[0];
  } catch (error: any) {
    console.error('Error executing proposal:', error);
    throw error;
  }
};

/**
 * Get treasury balance for a property
 */
export const getTreasuryBalance = async (propertyId: string) => {
  try {
    const result = await query(
      `SELECT
        id, property_name, token_id,
        treasury_balance, treasury_currency,
        total_income, total_expenses, total_distributions,
        last_distribution_at
       FROM properties
       WHERE id = $1`,
      [propertyId]
    );

    if (result.rows.length === 0) {
      throw new Error('Property not found');
    }

    return result.rows[0];
  } catch (error: any) {
    console.error('Error getting treasury balance:', error);
    throw error;
  }
};

export default {
  getVotingPower,
  getTotalSupply,
  createProposal,
  getProposalById,
  getProposalsByProperty,
  castVote,
  getVoteResults,
  executeProposal,
  getTreasuryBalance,
};
