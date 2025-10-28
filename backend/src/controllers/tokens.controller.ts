/**
 * Tokens Controller
 * Handles NFT token operations
 */

import { Request, Response } from 'express';
import { query } from '../config/database';
import {
  createPropertyCollection,
  getTokenInfo,
  getTokenHolders,
} from '../services/hedera.service';
import type { MintPropertyRequest } from '../types/api.types';

// POST /api/v1/tokens/mint - Mint NFT collection
export const mintToken = async (
  req: Request<{}, {}, MintPropertyRequest>,
  res: Response
): Promise<any> => {
  try {
    const {
      collectionName,
      collectionSymbol,
      totalSupply,
      royaltyPercentage = 5,
    } = req.body;

    // Validation
    if (!collectionName || !collectionSymbol || !totalSupply) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Missing required fields: collectionName, collectionSymbol, totalSupply',
        },
      });
    }

    console.log('⛓️  Creating NFT collection on Hedera...');
    const treasuryAccount = process.env.TREASURY_ACCOUNT_ID || process.env.OPERATOR_ID!;
    const feeCollectorAccount = process.env.FEE_COLLECTOR_ACCOUNT_ID || process.env.OPERATOR_ID!;

    const hederaResult = await createPropertyCollection({
      collectionName,
      collectionSymbol,
      treasuryAccount,
      feeCollectorAccount,
      royaltyPercentage,
      totalSupply,
    });

    const network = process.env.HEDERA_NETWORK || 'testnet';
    const explorerUrl = `https://hashscan.io/${network}/token/${hederaResult.tokenId}`;

    res.status(201).json({
      success: true,
      message: 'NFT collection minted successfully',
      data: {
        tokenId: hederaResult.tokenId,
        collectionName,
        collectionSymbol,
        totalSupply,
        hcsTopicId: hederaResult.hcsTopicId,
        hedera: {
          transactionId: hederaResult.transactionId,
          timestamp: hederaResult.timestamp,
          explorerUrl,
        },
      },
    });
  } catch (error: any) {
    console.error('Error minting token:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'MINT_ERROR',
        message: error.message || 'Failed to mint NFT collection',
      },
    });
  }
};

// GET /api/v1/tokens/:tokenId/info - Get token information
export const getTokenInformation = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { tokenId } = req.params;

    if (!tokenId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Token ID is required',
        },
      });
    }

    console.log(`🔍 Fetching token info for ${tokenId}...`);

    // Get token info from Mirror Node
    const tokenInfo = await getTokenInfo(tokenId);

    // Get property details from database (if exists)
    const propertyQuery = `
      SELECT
        id, property_name, property_type, category,
        city, country, total_value, token_price,
        total_supply, available_supply, description,
        metadata_cid, images, expected_annual_return,
        rental_yield, status, created_at
      FROM properties
      WHERE token_id = $1
    `;

    const propertyResult = await query(propertyQuery, [tokenId]);
    const property = propertyResult.rows[0] || null;

    res.json({
      success: true,
      data: {
        tokenId,
        tokenInfo: {
          name: tokenInfo.name,
          symbol: tokenInfo.symbol,
          type: tokenInfo.type,
          totalSupply: tokenInfo.total_supply,
          maxSupply: tokenInfo.max_supply,
          treasuryAccountId: tokenInfo.treasury_account_id,
          adminKey: tokenInfo.admin_key,
          kycKey: tokenInfo.kyc_key,
          freezeKey: tokenInfo.freeze_key,
          supplyKey: tokenInfo.supply_key,
          customFees: tokenInfo.custom_fees || [],
          createdTimestamp: tokenInfo.created_timestamp,
          modifiedTimestamp: tokenInfo.modified_timestamp,
        },
        property,
        network: process.env.HEDERA_NETWORK || 'testnet',
        explorerUrl: `https://hashscan.io/${process.env.HEDERA_NETWORK || 'testnet'}/token/${tokenId}`,
      },
    });
  } catch (error: any) {
    console.error('Error fetching token info:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: error.message || 'Failed to fetch token information',
      },
    });
  }
};

// POST /api/v1/tokens/transfer - Initiate token transfer
export const transferToken = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const {
      tokenId,
      fromAccount,
      toAccount,
      serialNumbers,
    } = req.body;

    // Validation
    if (!tokenId || !fromAccount || !toAccount || !serialNumbers || serialNumbers.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Missing required fields: tokenId, fromAccount, toAccount, serialNumbers',
        },
      });
    }

    console.log(`🔄 Initiating transfer of ${serialNumbers.length} NFT(s) from ${fromAccount} to ${toAccount}...`);

    // Record transfer intent in database
    const transferQuery = `
      INSERT INTO nft_transfers (
        token_id, from_account, to_account, serial_numbers,
        quantity, status, initiated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, token_id, from_account, to_account, serial_numbers,
                quantity, status, initiated_at
    `;

    const result = await query(transferQuery, [
      tokenId,
      fromAccount,
      toAccount,
      serialNumbers,
      serialNumbers.length,
      'pending',
      new Date(),
    ]);

    const transfer = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Transfer initiated. User must approve the transaction in their wallet.',
      data: {
        transferId: transfer.id,
        tokenId: transfer.token_id,
        fromAccount: transfer.from_account,
        toAccount: transfer.to_account,
        serialNumbers: transfer.serial_numbers,
        quantity: transfer.quantity,
        status: transfer.status,
        initiatedAt: transfer.initiated_at,
        instructions: {
          step1: 'User must associate with the token if not already associated',
          step2: 'User must approve the NFT transfer transaction',
          step3: 'Transaction will be executed on Hedera network',
          step4: 'Status will be updated to "completed" after confirmation',
        },
      },
    });
  } catch (error: any) {
    console.error('Error initiating transfer:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TRANSFER_ERROR',
        message: error.message || 'Failed to initiate token transfer',
      },
    });
  }
};

// GET /api/v1/tokens/:tokenId/holders - Get NFT holders
export const getTokenHoldersInfo = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { tokenId } = req.params;

    if (!tokenId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Token ID is required',
        },
      });
    }

    console.log(`📊 Fetching holders for token ${tokenId}...`);

    // Get holders from Mirror Node
    const holders = await getTokenHolders(tokenId);

    // Get property details for context
    const propertyQuery = `
      SELECT
        id, property_name, collection_symbol, total_supply, token_price
      FROM properties
      WHERE token_id = $1
    `;

    const propertyResult = await query(propertyQuery, [tokenId]);
    const property = propertyResult.rows[0] || null;

    // Calculate ownership percentages
    const holdersWithPercentage = holders.map((holder: any) => ({
      accountId: holder.accountId,
      serialNumbers: holder.serialNumbers,
      quantity: holder.quantity,
      ownershipPercentage: property
        ? parseFloat(((holder.quantity / property.total_supply) * 100).toFixed(4))
        : 0,
    }));

    // Sort by quantity descending
    holdersWithPercentage.sort((a: any, b: any) => b.quantity - a.quantity);

    res.json({
      success: true,
      data: {
        tokenId,
        propertyName: property?.property_name || null,
        collectionSymbol: property?.collection_symbol || null,
        totalSupply: property?.total_supply || 0,
        totalHolders: holders.length,
        holders: holdersWithPercentage,
      },
    });
  } catch (error: any) {
    console.error('Error fetching token holders:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: error.message || 'Failed to fetch token holders',
      },
    });
  }
};

export default {
  mintToken,
  getTokenInformation,
  transferToken,
  getTokenHoldersInfo,
};
