/**
 * Files Routes
 */

import { Router } from 'express';
import {
  uploadFileToIPFS,
  uploadMultipleFilesToIPFS,
  uploadJSONToIPFS,
  getFileInfo,
} from '../controllers/files.controller';
import { uploadSingle, uploadMultiple } from '../middleware/upload.middleware';

const router = Router();

// POST /api/v1/files/upload - Upload single file to IPFS
router.post('/upload', uploadSingle, uploadFileToIPFS);

// POST /api/v1/files/upload-multiple - Upload multiple files to IPFS
router.post('/upload-multiple', uploadMultiple, uploadMultipleFilesToIPFS);

// POST /api/v1/files/upload-json - Upload JSON metadata to IPFS
router.post('/upload-json', uploadJSONToIPFS);

// GET /api/v1/files/:cid - Get file info from IPFS
router.get('/:cid', getFileInfo);

export default router;
