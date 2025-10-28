/**
 * Verification Routes
 */

import { Router } from 'express';
import { getVerificationTokenId } from '../controllers/verification.controller';

const router = Router();

// GET /api/v1/verification/token-id
router.get('/token-id', getVerificationTokenId);

export default router;
