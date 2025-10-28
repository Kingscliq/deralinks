/**
 * Verification Controller
 * Handles verification-related endpoints
 */

import { Request, Response } from 'express';
import { query } from '../config/database';
import type { GetVerificationTokenResponse } from '../types/api.types';

// GET /api/v1/verification/token-id
export const getVerificationTokenId = async (
  req: Request,
  res: Response<GetVerificationTokenResponse | { success: false; error: any }>
): Promise<any> => {
  try {
    const { verificationType } = req.query;

    // Validation
    if (!verificationType) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Verification type is required',
        },
      });
    }

    // Valid verification types
    const validTypes = ['property-owner', 'investor', 'kyc', 'accredited-investor'];
    if (!validTypes.includes(verificationType as string)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TYPE',
          message: `Invalid verification type. Must be one of: ${validTypes.join(', ')}`,
        },
      });
    }

    // Query platform config for verification token ID
    console.log(`🔍 Fetching verification token ID for type: ${verificationType}...`);
    const configQuery = `
      SELECT value as token_id
      FROM platform_config
      WHERE key = $1
    `;

    const configKey = `verification_token_${verificationType}`;
    const result = await query(configQuery, [configKey]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TOKEN_NOT_FOUND',
          message: `Verification token not configured for type: ${verificationType}`,
        },
      });
    }

    const tokenId = result.rows[0].token_id;

    // Get token details from platform_config if available
    const detailsQuery = `
      SELECT
        key,
        value,
        description,
        updated_at
      FROM platform_config
      WHERE key LIKE $1
    `;

    const detailsResult = await query(detailsQuery, [`verification_token_${verificationType}%`]);

    // Build token details
    const tokenDetails: any = {
      tokenId,
      verificationType,
    };

    // Extract additional details if available
    detailsResult.rows.forEach((row: any) => {
      if (row.key === `verification_token_${verificationType}_name`) {
        tokenDetails.tokenName = row.value;
      } else if (row.key === `verification_token_${verificationType}_symbol`) {
        tokenDetails.tokenSymbol = row.value;
      } else if (row.key === `verification_token_${verificationType}_description`) {
        tokenDetails.description = row.value;
      }
    });

    res.json({
      success: true,
      data: {
        ...tokenDetails,
        network: process.env.HEDERA_NETWORK || 'testnet',
        explorerUrl: `https://hashscan.io/${process.env.HEDERA_NETWORK || 'testnet'}/token/${tokenId}`,
      },
    });
  } catch (error: any) {
    console.error('Error fetching verification token ID:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: error.message || 'Failed to fetch verification token ID',
      },
    });
  }
};

export default {
  getVerificationTokenId,
};
