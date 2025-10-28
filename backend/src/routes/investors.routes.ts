/**
 * Investors Routes
 */

import { Router } from 'express';
import {
  registerInvestor,
  getInvestorProfile,
  submitKYC,
  getInvestorTransactions,
} from '../controllers/investors.controller';

const router = Router();

// POST /api/v1/investors/register - Register new investor
router.post('/register', registerInvestor);

// GET /api/v1/investors/:id/profile - Get investor profile
router.get('/:id/profile', getInvestorProfile);

// POST /api/v1/investors/:id/kyc - Submit KYC documents
router.post('/:id/kyc', submitKYC);

// GET /api/v1/investors/:id/transactions - Get transaction history
router.get('/:id/transactions', getInvestorTransactions);

export default router;
