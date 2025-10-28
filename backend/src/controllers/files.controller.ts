/**
 * Files Controller
 * Handles file uploads to IPFS
 */

import { Request, Response } from 'express';
import { uploadFile, uploadJSON, getIPFSUrl } from '../services/ipfs.service';

// POST /api/v1/files/upload - Upload single file to IPFS
export const uploadFileToIPFS = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILE',
          message: 'No file provided. Use multipart/form-data with field name "file"',
        },
      });
    }

    const file = req.file;
    console.log(`📤 Uploading file to IPFS: ${file.originalname} (${file.size} bytes)`);

    // Upload to IPFS
    const cid = await uploadFile(file.buffer, file.originalname);

    res.status(201).json({
      success: true,
      message: 'File uploaded to IPFS successfully',
      data: {
        cid,
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        ipfsUrl: getIPFSUrl(cid),
        gatewayUrl: `https://gateway.pinata.cloud/ipfs/${cid}`,
      },
    });
  } catch (error: any) {
    console.error('Error uploading file to IPFS:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: error.message || 'Failed to upload file to IPFS',
      },
    });
  }
};

// POST /api/v1/files/upload-multiple - Upload multiple files to IPFS
export const uploadMultipleFilesToIPFS = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    // Check if files were uploaded
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILES',
          message: 'No files provided. Use multipart/form-data with field name "files"',
        },
      });
    }

    const files = req.files;
    console.log(`📤 Uploading ${files.length} files to IPFS...`);

    // Upload all files in parallel
    const uploadPromises = files.map(async (file: Express.Multer.File) => {
      const cid = await uploadFile(file.buffer, file.originalname);
      return {
        cid,
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        ipfsUrl: getIPFSUrl(cid),
        gatewayUrl: `https://gateway.pinata.cloud/ipfs/${cid}`,
      };
    });

    const uploadedFiles = await Promise.all(uploadPromises);

    res.status(201).json({
      success: true,
      message: `${uploadedFiles.length} file(s) uploaded to IPFS successfully`,
      data: {
        files: uploadedFiles,
        totalFiles: uploadedFiles.length,
        totalSize: files.reduce((sum, file) => sum + file.size, 0),
      },
    });
  } catch (error: any) {
    console.error('Error uploading files to IPFS:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: error.message || 'Failed to upload files to IPFS',
      },
    });
  }
};

// POST /api/v1/files/upload-json - Upload JSON metadata to IPFS
export const uploadJSONToIPFS = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const metadata = req.body;

    // Validation
    if (!metadata || Object.keys(metadata).length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_METADATA',
          message: 'No JSON metadata provided in request body',
        },
      });
    }

    console.log('📤 Uploading JSON metadata to IPFS...');

    // Upload to IPFS
    const cid = await uploadJSON(metadata);

    res.status(201).json({
      success: true,
      message: 'JSON metadata uploaded to IPFS successfully',
      data: {
        cid,
        ipfsUrl: getIPFSUrl(cid),
        gatewayUrl: `https://gateway.pinata.cloud/ipfs/${cid}`,
        metadata,
      },
    });
  } catch (error: any) {
    console.error('Error uploading JSON to IPFS:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: error.message || 'Failed to upload JSON to IPFS',
      },
    });
  }
};

// GET /api/v1/files/:cid - Get file info from IPFS
export const getFileInfo = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { cid } = req.params;

    if (!cid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CID',
          message: 'IPFS CID is required',
        },
      });
    }

    res.json({
      success: true,
      data: {
        cid,
        ipfsUrl: getIPFSUrl(cid),
        gatewayUrl: `https://gateway.pinata.cloud/ipfs/${cid}`,
        publicUrl: `https://ipfs.io/ipfs/${cid}`,
        instructions: {
          retrieve: 'Use the gatewayUrl to fetch the file content',
          alternatives: [
            `https://gateway.pinata.cloud/ipfs/${cid}`,
            `https://ipfs.io/ipfs/${cid}`,
            `https://cloudflare-ipfs.com/ipfs/${cid}`,
          ],
        },
      },
    });
  } catch (error: any) {
    console.error('Error getting file info:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INFO_ERROR',
        message: error.message || 'Failed to get file info',
      },
    });
  }
};

export default {
  uploadFileToIPFS,
  uploadMultipleFilesToIPFS,
  uploadJSONToIPFS,
  getFileInfo,
};
