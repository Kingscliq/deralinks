/**
 * IPFS Service using Pinata
 * Handles metadata and file uploads
 */

import axios from 'axios';

const PINATA_API_URL = 'https://api.pinata.cloud';

// Get Pinata JWT token
const getPinataJWT = (): string => {
  const jwt = process.env.PINATA_JWT;
  if (!jwt) {
    throw new Error('PINATA_JWT must be set in environment variables');
  }
  return jwt;
};

// Upload JSON metadata to IPFS
export const uploadJSON = async (metadata: any): Promise<string> => {
  try {
    const jwt = getPinataJWT();

    const response = await axios.post(
      `${PINATA_API_URL}/pinning/pinJSONToIPFS`,
      {
        pinataContent: metadata,
        pinataMetadata: {
          name: metadata.name || 'Property Metadata',
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt}`,
        },
      }
    );

    const cid = response.data.IpfsHash;
    console.log('✅ Uploaded to IPFS:', cid);
    return cid;
  } catch (error: any) {
    console.error('Error uploading to IPFS:', error.message);
    throw new Error(`Failed to upload metadata to IPFS: ${error.message}`);
  }
};

// Upload file to IPFS
export const uploadFile = async (
  fileBuffer: Buffer,
  fileName: string
): Promise<string> => {
  try {
    const jwt = getPinataJWT();

    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('file', fileBuffer, fileName);
    formData.append('pinataMetadata', JSON.stringify({ name: fileName }));

    const response = await axios.post(
      `${PINATA_API_URL}/pinning/pinFileToIPFS`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${jwt}`,
        },
        maxBodyLength: Infinity,
      }
    );

    const cid = response.data.IpfsHash;
    console.log('✅ File uploaded to IPFS:', cid);
    return cid;
  } catch (error: any) {
    console.error('Error uploading file to IPFS:', error.message);
    throw new Error(`Failed to upload file to IPFS: ${error.message}`);
  }
};

// Get IPFS gateway URL
export const getIPFSUrl = (cid: string): string => {
  return `https://gateway.pinata.cloud/ipfs/${cid}`;
};

export default {
  uploadJSON,
  uploadFile,
  getIPFSUrl,
};
