/**
 * DAO Governance Controller
 * Handles governance endpoints for property DAOs
 */

import { Request, Response } from 'express';
import {
  createProposal,
  getProposalById,
  getProposalsByProperty,
  castVote,
  getVoteResults,
  executeProposal,
  getTreasuryBalance,
  getVotingPower,
} from '../services/dao.service';
import { verifyWalletSignature, validateChallengeTimestamp } from '../utils/wallet-signature';

// POST /api/v1/dao/:propertyId/proposals - Create proposal
export const createDAOProposal = async (req: Request, res: Response): Promise<any> => {
  try {
    const { propertyId } = req.params;
    const {
      tokenId,
      proposerAccount,
      title,
      description,
      proposalType,
      proposalData,
      documentCids,
      votingDurationDays,
      quorumPercentage,
      approvalThresholdPercentage,
      signature,
      publicKey,
      message,
    } = req.body;

    // Validation
    if (!proposerAccount || !title || !description || !proposalType || !tokenId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Missing required fields: proposerAccount, title, description, proposalType, tokenId',
        },
      });
    }

    // Verify wallet signature
    if (!signature || !publicKey || !message) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_SIGNATURE',
          message: 'Wallet signature required to create proposal',
        },
      });
    }

    // Validate timestamp
    if (!validateChallengeTimestamp(message)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EXPIRED_SIGNATURE',
          message: 'Signature has expired. Please sign a new message.',
        },
      });
    }

    // Verify signature
    const isValidSignature = await verifyWalletSignature(proposerAccount, message, signature, publicKey);

    if (!isValidSignature) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_SIGNATURE',
          message: 'Invalid wallet signature',
        },
      });
    }

    // Check voting power
    const votingPower = await getVotingPower(proposerAccount, tokenId);

    if (votingPower === 0) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'NO_VOTING_POWER',
          message: 'You must own NFTs from this property to create a proposal',
        },
      });
    }

    // Valid proposal types
    const validTypes = ['maintenance', 'budget', 'distribution', 'asset_sale', 'general'];
    if (!validTypes.includes(proposalType)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TYPE',
          message: `Invalid proposal type. Must be one of: ${validTypes.join(', ')}`,
        },
      });
    }

    // Create proposal
    const proposal = await createProposal({
      propertyId,
      tokenId,
      proposerAccount,
      title,
      description,
      proposalType,
      proposalData,
      documentCids,
      votingDurationDays,
      quorumPercentage,
      approvalThresholdPercentage,
    });

    res.status(201).json({
      success: true,
      message: 'Proposal created successfully',
      data: proposal,
    });
  } catch (error: any) {
    console.error('Error creating proposal:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_PROPOSAL_ERROR',
        message: error.message || 'Failed to create proposal',
      },
    });
  }
};

// GET /api/v1/dao/:propertyId/proposals - List proposals
export const listProposals = async (req: Request, res: Response): Promise<any> => {
  try {
    const { propertyId } = req.params;
    const { status, limit = 50, offset = 0 } = req.query;

    const proposals = await getProposalsByProperty(
      propertyId,
      status as string,
      parseInt(limit as string),
      parseInt(offset as string)
    );

    res.json({
      success: true,
      data: {
        proposals,
        count: proposals.length,
      },
    });
  } catch (error: any) {
    console.error('Error listing proposals:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_PROPOSALS_ERROR',
        message: error.message || 'Failed to fetch proposals',
      },
    });
  }
};

// GET /api/v1/dao/proposals/:id - Get proposal details
export const getProposalDetails = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    const proposal = await getProposalById(id);

    if (!proposal) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Proposal not found',
        },
      });
    }

    res.json({
      success: true,
      data: proposal,
    });
  } catch (error: any) {
    console.error('Error fetching proposal:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_PROPOSAL_ERROR',
        message: error.message || 'Failed to fetch proposal',
      },
    });
  }
};

// POST /api/v1/dao/proposals/:id/vote - Cast vote
export const voteOnProposal = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const {
      voterAccount,
      voteChoice,
      signature,
      publicKey,
      message,
      reason,
    } = req.body;

    // Validation
    if (!voterAccount || !voteChoice || !signature || !publicKey || !message) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Missing required fields: voterAccount, voteChoice, signature, publicKey, message',
        },
      });
    }

    // Valid vote choices
    const validChoices = ['for', 'against', 'abstain'];
    if (!validChoices.includes(voteChoice)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CHOICE',
          message: `Invalid vote choice. Must be one of: ${validChoices.join(', ')}`,
        },
      });
    }

    // Validate timestamp
    if (!validateChallengeTimestamp(message)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EXPIRED_SIGNATURE',
          message: 'Signature has expired. Please sign a new message.',
        },
      });
    }

    // Verify signature
    const isValidSignature = await verifyWalletSignature(voterAccount, message, signature, publicKey);

    if (!isValidSignature) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_SIGNATURE',
          message: 'Invalid wallet signature',
        },
      });
    }

    // Cast vote
    const vote = await castVote({
      proposalId: id,
      voterAccount,
      voteChoice,
      signature,
      publicKey,
      messageSigned: message,
      reason,
    });

    res.json({
      success: true,
      message: 'Vote cast successfully',
      data: vote,
    });
  } catch (error: any) {
    console.error('Error casting vote:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'VOTE_ERROR',
        message: error.message || 'Failed to cast vote',
      },
    });
  }
};

// GET /api/v1/dao/proposals/:id/results - Get vote results
export const getProposalResults = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    const results = await getVoteResults(id);

    res.json({
      success: true,
      data: results,
    });
  } catch (error: any) {
    console.error('Error fetching vote results:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_RESULTS_ERROR',
        message: error.message || 'Failed to fetch vote results',
      },
    });
  }
};

// POST /api/v1/dao/proposals/:id/execute - Execute proposal
export const executeDAOProposal = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const {
      executorAccount,
      signature,
      publicKey,
      message,
    } = req.body;

    // Validation
    if (!executorAccount || !signature || !publicKey || !message) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Missing required fields: executorAccount, signature, publicKey, message',
        },
      });
    }

    // Validate timestamp
    if (!validateChallengeTimestamp(message)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EXPIRED_SIGNATURE',
          message: 'Signature has expired. Please sign a new message.',
        },
      });
    }

    // Verify signature
    const isValidSignature = await verifyWalletSignature(executorAccount, message, signature, publicKey);

    if (!isValidSignature) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_SIGNATURE',
          message: 'Invalid wallet signature',
        },
      });
    }

    // Execute proposal
    const result = await executeProposal(id, executorAccount);

    res.json({
      success: true,
      message: 'Proposal executed successfully',
      data: result,
    });
  } catch (error: any) {
    console.error('Error executing proposal:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'EXECUTE_ERROR',
        message: error.message || 'Failed to execute proposal',
      },
    });
  }
};

// GET /api/v1/dao/:propertyId/treasury - Get treasury info
export const getPropertyTreasury = async (req: Request, res: Response): Promise<any> => {
  try {
    const { propertyId } = req.params;

    const treasury = await getTreasuryBalance(propertyId);

    res.json({
      success: true,
      data: treasury,
    });
  } catch (error: any) {
    console.error('Error fetching treasury:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_TREASURY_ERROR',
        message: error.message || 'Failed to fetch treasury information',
      },
    });
  }
};

export default {
  createDAOProposal,
  listProposals,
  getProposalDetails,
  voteOnProposal,
  getProposalResults,
  executeDAOProposal,
  getPropertyTreasury,
};
