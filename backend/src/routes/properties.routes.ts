/**
 * Properties Routes
 */

import { Router } from 'express';
import {
  mintProperty,
  listProperties,
  getPropertyDetails,
  updateProperty,
  verifyPropertyDocuments,
} from '../controllers/properties.controller';

const router = Router();

// POST /api/v1/properties/mint
router.post('/mint', mintProperty);

// GET /api/v1/properties - List all properties with filters
router.get('/', listProperties);

// GET /api/v1/properties/:id - Get property details
router.get('/:id', getPropertyDetails);

// PUT /api/v1/properties/:id - Update property
router.put('/:id', updateProperty);

// POST /api/v1/properties/:id/verify - Trigger document verification
router.post('/:id/verify', verifyPropertyDocuments);

export default router;
