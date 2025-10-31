/**
 * Admin Routes
 */

import { Router } from 'express';
import {
  approveInvestorKYC,
  rejectInvestorKYC,
  approvePropertyOwner,
  rejectPropertyOwner,
  getPendingVerifications,
  syncPropertyNFTs,
  syncAllPropertyNFTs,
} from '../controllers/admin.controller';

const router = Router();

// GET /api/v1/admin/pending-verifications - Get all pending verifications
router.get('/pending-verifications', getPendingVerifications);

// POST /api/v1/admin/investors/:id/approve-kyc - Approve investor KYC
router.post('/investors/:id/approve-kyc', approveInvestorKYC);

// POST /api/v1/admin/investors/:id/reject-kyc - Reject investor KYC
router.post('/investors/:id/reject-kyc', rejectInvestorKYC);

// POST /api/v1/admin/property-owners/:id/approve - Approve property owner
router.post('/property-owners/:id/approve', approvePropertyOwner);

// POST /api/v1/admin/property-owners/:id/reject - Reject property owner
router.post('/property-owners/:id/reject', rejectPropertyOwner);

// POST /api/v1/admin/sync-nft/:tokenId - Sync NFT holdings for a specific property
router.post('/sync-nft/:tokenId', syncPropertyNFTs);

// POST /api/v1/admin/sync-all-nfts - Sync NFT holdings for all properties
router.post('/sync-all-nfts', syncAllPropertyNFTs);

export default router;
