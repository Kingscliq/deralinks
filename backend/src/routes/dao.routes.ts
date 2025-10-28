/**
 * DAO Governance Routes
 */

import { Router } from 'express';
import {
  createDAOProposal,
  listProposals,
  getProposalDetails,
  voteOnProposal,
  getProposalResults,
  executeDAOProposal,
  getPropertyTreasury,
} from '../controllers/dao.controller';

const router = Router();

// POST /api/v1/dao/:propertyId/proposals - Create proposal
router.post('/:propertyId/proposals', createDAOProposal);

// GET /api/v1/dao/:propertyId/proposals - List proposals for property
router.get('/:propertyId/proposals', listProposals);

// GET /api/v1/dao/:propertyId/treasury - Get property treasury info
router.get('/:propertyId/treasury', getPropertyTreasury);

// GET /api/v1/dao/proposals/:id - Get proposal details
router.get('/proposals/:id', getProposalDetails);

// POST /api/v1/dao/proposals/:id/vote - Cast vote on proposal
router.post('/proposals/:id/vote', voteOnProposal);

// GET /api/v1/dao/proposals/:id/results - Get vote results
router.get('/proposals/:id/results', getProposalResults);

// POST /api/v1/dao/proposals/:id/execute - Execute passed proposal
router.post('/proposals/:id/execute', executeDAOProposal);

export default router;
