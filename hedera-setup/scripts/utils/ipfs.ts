import { PinataSDK } from "pinata";
import fs from "fs";
import path from "path";

/**
 * IPFS Utility using Pinata
 * Upload files and JSON to IPFS
 */

let pinata: PinataSDK | null = null;

/**
 * Initialize Pinata client
 */
export function initPinata(): PinataSDK {
  const jwt = process.env.PINATA_JWT;

  if (!jwt) {
    throw new Error(
      "PINATA_JWT not found in .env file. Get your JWT from https://app.pinata.cloud"
    );
  }

  if (!pinata) {
    pinata = new PinataSDK({
      pinataJwt: jwt,
      pinataGateway: "gateway.pinata.cloud",
    });
  }

  return pinata;
}

/**
 * Upload a file to IPFS via Pinata
 */
export async function uploadFile(
  filePath: string
): Promise<string> {
  const client = initPinata();

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const file = new File(
    [fs.readFileSync(filePath)],
    path.basename(filePath),
    {
      type: getContentType(filePath),
    }
  );

  const upload = await (client.upload as any).public.file(file);

  console.log(`   ✅ Uploaded: ${path.basename(filePath)}`);
  console.log(`   📍 IPFS CID: ${upload.cid}`);
  console.log(`   🔗 Gateway URL: https://gateway.pinata.cloud/ipfs/${upload.cid}`);

  return upload.cid;
}

/**
 * Upload JSON data to IPFS via Pinata
 */
export async function uploadJSON(
  data: any
): Promise<string> {
  const client = initPinata();

  const upload = await (client.upload as any).public.json(data);

  console.log(`   ✅ Uploaded JSON metadata`);
  console.log(`   📍 IPFS CID: ${upload.cid}`);
  console.log(`   🔗 Gateway URL: https://gateway.pinata.cloud/ipfs/${upload.cid}`);

  return upload.cid;
}

/**
 * Upload multiple files to IPFS via Pinata
 */
export async function uploadFiles(
  filePaths: string[]
): Promise<string> {
  const client = initPinata();

  const fileObjects: File[] = [];

  for (const filePath of filePaths) {
    if (!fs.existsSync(filePath)) {
      console.warn(`   ⚠️  File not found, skipping: ${filePath}`);
      continue;
    }

    const file = new File(
      [fs.readFileSync(filePath)],
      path.basename(filePath),
      {
        type: getContentType(filePath),
      }
    );
    fileObjects.push(file);
  }

  if (fileObjects.length === 0) {
    throw new Error(`No valid files found to upload`);
  }

  const upload = await (client.upload as any).public.fileArray(fileObjects);

  console.log(`   ✅ Uploaded ${fileObjects.length} files`);
  console.log(`   📍 IPFS CID: ${upload.cid}`);
  console.log(`   🔗 Gateway URL: https://gateway.pinata.cloud/ipfs/${upload.cid}`);

  return upload.cid;
}

/**
 * Get content type based on file extension
 */
function getContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
    ".json": "application/json",
    ".pdf": "application/pdf",
    ".mp4": "video/mp4",
    ".mov": "video/quicktime",
  };

  return mimeTypes[ext] || "application/octet-stream";
}

/**
 * Generate NFT metadata JSON conforming to standard
 */
export interface NFTMetadata {
  name: string;
  description: string;
  image: string; // IPFS URI (ipfs://CID or https://gateway.../CID)
  external_url?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  properties?: Record<string, any>;
}

export function createNFTMetadata(
  name: string,
  description: string,
  imageCID: string,
  attributes?: Array<{ trait_type: string; value: string | number }>,
  properties?: Record<string, any>
): NFTMetadata {
  return {
    name,
    description,
    image: `ipfs://${imageCID}`,
    attributes: attributes || [],
    properties: properties || {},
  };
}

/**
 * Test Pinata connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const client = initPinata();
    const test = await client.testAuthentication();
    console.log("✅ Pinata connection successful!");
    console.log(`   Status: ${test}`);
    return true;
  } catch (error) {
    console.error("❌ Pinata connection failed:", error);
    return false;
  }
}
