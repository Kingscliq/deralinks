/**
 * Tokens Routes
 */

import { Router } from 'express';
import {
  mintToken,
  getTokenInformation,
  transferToken,
  getTokenHoldersInfo,
} from '../controllers/tokens.controller';

const router = Router();

// POST /api/v1/tokens/mint - Mint NFT collection
router.post('/mint', mintToken);

// GET /api/v1/tokens/:tokenId/info - Get token information
router.get('/:tokenId/info', getTokenInformation);

// POST /api/v1/tokens/transfer - Initiate token transfer
router.post('/transfer', transferToken);

// GET /api/v1/tokens/:tokenId/holders - Get NFT holders
router.get('/:tokenId/holders', getTokenHoldersInfo);

export default router;
