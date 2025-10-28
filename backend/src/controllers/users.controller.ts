/**
 * Users Controller
 * Handles user-related endpoints
 */

import { Request, Response } from 'express';
import { query } from '../config/database';
import { getAccountNFTs } from '../services/hedera.service';
import type { UserAssetsResponse } from '../types/api.types';

// GET /api/v1/users/:accountId/assets
export const getUserAssets = async (
  req: Request<{ accountId: string }>,
  res: Response<UserAssetsResponse | { success: false; error: any }>
): Promise<any> => {
  try {
    const { accountId } = req.params;

    if (!accountId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Account ID is required',
        },
      });
    }

    // Step 1: Get all NFTs owned by this account from Mirror Node
    console.log(`📊 Fetching NFTs for account ${accountId}...`);
    const nfts = await getAccountNFTs(accountId);

    if (nfts.length === 0) {
      return res.json({
        success: true,
        data: {
          accountId,
          totalProperties: 0,
          totalNFTs: 0,
          totalInvested: 0,
          currentValue: 0,
          totalDividends: 0,
          roi: 0,
          holdings: [],
        },
      });
    }

    // Step 2: Group NFTs by token ID (property)
    const nftsByToken: Record<string, any[]> = {};
    nfts.forEach(nft => {
      const tokenId = nft.token_id;
      if (!nftsByToken[tokenId]) {
        nftsByToken[tokenId] = [];
      }
      nftsByToken[tokenId].push(nft);
    });

    const tokenIds = Object.keys(nftsByToken);

    // Step 3: Get property details from database
    const propertiesQuery = `
      SELECT
        id, token_id, property_name, collection_symbol, property_type,
        city, country, total_value, token_price, total_supply,
        description, images, features, amenities,
        expected_annual_return, rental_yield, status
      FROM properties
      WHERE token_id = ANY($1)
    `;

    const propertiesResult = await query(propertiesQuery, [tokenIds]);
    const propertiesMap = new Map(
      propertiesResult.rows.map((p: any) => [p.token_id, p])
    );

    // Step 4: Get holdings data from database
    const holdingsQuery = `
      SELECT
        token_id, serial_numbers, quantity,
        total_invested, current_value, total_dividends,
        first_acquired_at, last_updated_at
      FROM nft_holdings
      WHERE owner_hedera_account = $1 AND token_id = ANY($2)
    `;

    const holdingsResult = await query(holdingsQuery, [accountId, tokenIds]);
    const holdingsMap = new Map(
      holdingsResult.rows.map((h: any) => [h.token_id, h])
    );

    // Step 5: Build response
    const holdings: any[] = [];
    let totalInvested = 0;
    let currentValue = 0;
    let totalDividends = 0;

    for (const tokenId of tokenIds) {
      const property: any = propertiesMap.get(tokenId);
      if (!property) continue;

      const tokenNFTs = nftsByToken[tokenId];
      const serialNumbers = tokenNFTs.map(nft => parseInt(nft.serial_number));
      const quantity = serialNumbers.length;

      // Get holdings data (if exists) or calculate from Mirror Node
      let holdingData: any = holdingsMap.get(tokenId);

      if (!holdingData) {
        // If not in DB, create estimated values
        const invested = quantity * property.token_price;
        holdingData = {
          total_invested: invested,
          current_value: invested, // Assume no change if no data
          total_dividends: 0,
          first_acquired_at: new Date(),
          last_updated_at: new Date(),
        };
      }

      const ownershipPercentage = (quantity / property.total_supply) * 100;

      holdings.push({
        propertyId: property.id,
        tokenId: property.token_id,
        propertyName: property.property_name,
        collectionSymbol: property.collection_symbol,
        propertyType: property.property_type,
        city: property.city,
        country: property.country,
        serialNumbers,
        quantity,
        ownershipPercentage: parseFloat(ownershipPercentage.toFixed(4)),
        invested: parseFloat(holdingData.total_invested || 0),
        currentValue: parseFloat(holdingData.current_value || 0),
        tokenPrice: parseFloat(property.token_price),
        dividendsReceived: parseFloat(holdingData.total_dividends || 0),
        expectedAnnualReturn: parseFloat(property.expected_annual_return || 0),
        rentalYield: parseFloat(property.rental_yield || 0),
        totalValue: parseFloat(property.total_value),
        totalSupply: property.total_supply,
        description: property.description || '',
        images: property.images || [],
        features: property.features || {},
        amenities: property.amenities || [],
        status: property.status,
        firstAcquired: holdingData.first_acquired_at,
        lastUpdated: holdingData.last_updated_at,
      });

      totalInvested += parseFloat(holdingData.total_invested || 0);
      currentValue += parseFloat(holdingData.current_value || 0);
      totalDividends += parseFloat(holdingData.total_dividends || 0);
    }

    const roi = totalInvested > 0
      ? ((currentValue - totalInvested) / totalInvested) * 100
      : 0;

    res.json({
      success: true,
      data: {
        accountId,
        totalProperties: holdings.length,
        totalNFTs: nfts.length,
        totalInvested: parseFloat(totalInvested.toFixed(2)),
        currentValue: parseFloat(currentValue.toFixed(2)),
        totalDividends: parseFloat(totalDividends.toFixed(2)),
        roi: parseFloat(roi.toFixed(2)),
        holdings,
      },
    });
  } catch (error: any) {
    console.error('Error fetching user assets:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: error.message || 'Failed to fetch user assets',
      },
    });
  }
};

export default {
  getUserAssets,
};
