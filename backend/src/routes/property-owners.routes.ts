/**
 * Property Owners Routes
 */

import { Router } from 'express';
import {
  registerPropertyOwner,
  submitVerificationDocuments,
  getVerificationStatus,
} from '../controllers/property-owners.controller';

const router = Router();

// POST /api/v1/property-owners/register - Register as property owner
router.post('/register', registerPropertyOwner);

// POST /api/v1/property-owners/:id/verification - Submit verification documents
router.post('/:id/verification', submitVerificationDocuments);

// GET /api/v1/property-owners/:id/verification-status - Check verification status
router.get('/:id/verification-status', getVerificationStatus);

export default router;
