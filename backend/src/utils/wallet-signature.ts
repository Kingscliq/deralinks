/**
 * Wallet Signature Verification Utility
 * Verifies Hedera wallet signatures for DApp authentication
 */

import { PublicKey } from '@hashgraph/sdk';
import { query } from '../config/database';

/**
 * Generate a challenge message for wallet signature
 * The user signs this message with their wallet to prove ownership
 */
export const generateChallenge = (accountId: string): string => {
  const timestamp = Date.now();
  const nonce = Math.random().toString(36).substring(7);

  return `DeraLinks Authentication\n\nAccount: ${accountId}\nTimestamp: ${timestamp}\nNonce: ${nonce}\n\nPlease sign this message to authenticate with DeraLinks.`;
};

/**
 * Verify a wallet signature
 * @param accountId - Hedera account ID (e.g., "0.0.123456")
 * @param message - The original message that was signed
 * @param signature - The signature in hex format
 * @param publicKey - The public key in hex format (optional - will query Hedera if not provided)
 * @returns true if signature is valid
 */
export const verifyWalletSignature = async (
  accountId: string,
  message: string,
  signature: string,
  publicKey?: string
): Promise<boolean> => {
  try {
    // Validate inputs
    if (!accountId || !message || !signature) {
      console.error('Missing required parameters for signature verification');
      return false;
    }

    // Validate account ID format
    if (!accountId.match(/^\d+\.\d+\.\d+$/)) {
      console.error('Invalid account ID format');
      return false;
    }

    // If public key not provided, we'd need to query it from Hedera Mirror Node
    // For DApps, the frontend typically provides the public key from the wallet
    if (!publicKey) {
      console.error('Public key is required for signature verification');
      return false;
    }

    // Parse public key
    let parsedPublicKey: PublicKey;
    try {
      parsedPublicKey = PublicKey.fromString(publicKey);
    } catch (error) {
      console.error('Invalid public key format:', error);
      return false;
    }

    // Convert message to bytes
    const messageBytes = Buffer.from(message, 'utf-8');

    // Convert signature from hex to bytes
    const signatureBytes = Buffer.from(signature, 'hex');

    // Verify signature
    const isValid = parsedPublicKey.verify(messageBytes, signatureBytes);

    if (isValid) {
      console.log(`✅ Valid signature for account ${accountId}`);
    } else {
      console.log(`❌ Invalid signature for account ${accountId}`);
    }

    return isValid;
  } catch (error: any) {
    console.error('Error verifying wallet signature:', error);
    return false;
  }
};

/**
 * Verify signature and check if user owns a specific verification NFT
 * @param accountId - Hedera account ID
 * @param message - Message that was signed
 * @param signature - Signature in hex
 * @param publicKey - Public key in hex
 * @param verificationType - Type of verification to check (property-owner, investor, kyc, accredited-investor)
 * @returns Object with verification status and details
 */
export const verifyWalletAndNFT = async (
  accountId: string,
  message: string,
  signature: string,
  publicKey: string,
  verificationType: string
): Promise<{
  isValid: boolean;
  hasVerification: boolean;
  verificationType?: string;
  serialNumbers?: number[];
}> => {
  try {
    // First verify the wallet signature
    const isValidSignature = await verifyWalletSignature(
      accountId,
      message,
      signature,
      publicKey
    );

    if (!isValidSignature) {
      return {
        isValid: false,
        hasVerification: false,
      };
    }

    // Get verification token ID for this type
    const tokenQuery = `
      SELECT value as token_id
      FROM platform_config
      WHERE key = $1
    `;
    const configKey = `verification_token_${verificationType}`;
    const tokenResult = await query(tokenQuery, [configKey]);

    if (tokenResult.rows.length === 0) {
      console.log(`No verification token configured for type: ${verificationType}`);
      return {
        isValid: true,
        hasVerification: false,
      };
    }

    const verificationTokenId = tokenResult.rows[0].token_id;

    // Check if user owns this verification NFT
    const holdingsQuery = `
      SELECT vt.serial_numbers
      FROM verification_tokens vt
      WHERE vt.account_id = $1 AND vt.token_id = $2
    `;
    const holdingsResult = await query(holdingsQuery, [accountId, verificationTokenId]);

    if (holdingsResult.rows.length > 0 && holdingsResult.rows[0].serial_numbers.length > 0) {
      console.log(`✅ Account ${accountId} has ${verificationType} verification`);
      return {
        isValid: true,
        hasVerification: true,
        verificationType,
        serialNumbers: holdingsResult.rows[0].serial_numbers,
      };
    }

    console.log(`⚠️  Account ${accountId} does not have ${verificationType} verification`);
    return {
      isValid: true,
      hasVerification: false,
    };
  } catch (error: any) {
    console.error('Error verifying wallet and NFT:', error);
    return {
      isValid: false,
      hasVerification: false,
    };
  }
};

/**
 * Check if an account owns any verification NFT (for general authentication)
 * @param accountId - Hedera account ID
 * @returns Object with verification details
 */
export const checkVerificationStatus = async (
  accountId: string
): Promise<{
  hasAnyVerification: boolean;
  verifications: Array<{
    type: string;
    tokenId: string;
    serialNumbers: number[];
  }>;
}> => {
  try {
    // Get all verification tokens owned by this account
    const holdingsQuery = `
      SELECT
        vt.token_id,
        vt.serial_numbers,
        pc.key as config_key
      FROM verification_tokens vt
      JOIN platform_config pc ON pc.value = vt.token_id
      WHERE vt.account_id = $1
        AND array_length(vt.serial_numbers, 1) > 0
        AND pc.key LIKE 'verification_token_%'
    `;
    const result = await query(holdingsQuery, [accountId]);

    const verifications = result.rows.map((row: any) => {
      // Extract verification type from config key (e.g., "verification_token_property-owner" -> "property-owner")
      const type = row.config_key.replace('verification_token_', '');
      return {
        type,
        tokenId: row.token_id,
        serialNumbers: row.serial_numbers,
      };
    });

    return {
      hasAnyVerification: verifications.length > 0,
      verifications,
    };
  } catch (error: any) {
    console.error('Error checking verification status:', error);
    return {
      hasAnyVerification: false,
      verifications: [],
    };
  }
};

/**
 * Validate challenge message timestamp (prevent replay attacks)
 * @param message - The challenge message
 * @param maxAgeMs - Maximum age in milliseconds (default: 5 minutes)
 * @returns true if timestamp is within acceptable range
 */
export const validateChallengeTimestamp = (
  message: string,
  maxAgeMs: number = 5 * 60 * 1000 // 5 minutes
): boolean => {
  try {
    // Extract timestamp from message
    const timestampMatch = message.match(/Timestamp: (\d+)/);
    if (!timestampMatch) {
      console.error('No timestamp found in challenge message');
      return false;
    }

    const timestamp = parseInt(timestampMatch[1], 10);
    const now = Date.now();
    const age = now - timestamp;

    if (age < 0) {
      console.error('Challenge timestamp is in the future');
      return false;
    }

    if (age > maxAgeMs) {
      console.error(`Challenge timestamp is too old (${age}ms > ${maxAgeMs}ms)`);
      return false;
    }

    return true;
  } catch (error: any) {
    console.error('Error validating challenge timestamp:', error);
    return false;
  }
};

export default {
  generateChallenge,
  verifyWalletSignature,
  verifyWalletAndNFT,
  checkVerificationStatus,
  validateChallengeTimestamp,
};
