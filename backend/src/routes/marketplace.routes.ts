/**
 * Marketplace Routes
 */

import { Router } from 'express';
import {
  createListing,
  getListings,
  makeOffer,
  buyNFT,
} from '../controllers/marketplace.controller';

const router = Router();

// POST /api/v1/marketplace/list - Create listing
router.post('/list', createListing);

// GET /api/v1/marketplace/listings - Get all listings
router.get('/listings', getListings);

// POST /api/v1/marketplace/offers - Make offer on listing
router.post('/offers', makeOffer);

// POST /api/v1/marketplace/buy - Purchase NFT
router.post('/buy', buyNFT);

export default router;
