/**
 * Users Routes
 */

import { Router } from 'express';
import { getUserAssets } from '../controllers/users.controller';

const router = Router();

// GET /api/v1/users/:accountId/assets
router.get('/:accountId/assets', getUserAssets);

export default router;
