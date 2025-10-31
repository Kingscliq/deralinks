/**
 * Marketplace Controller
 * Handles NFT marketplace operations
 */

import { Request, Response } from 'express';
import { query } from '../config/database';
import { getAccountNFTs } from '../services/hedera.service';
import {
  calculatePrimarySaleCommission,
  calculatePlatformTransactionFee,
  PLATFORM_FEES
} from '../config/fees.config';
import type {
  CreateListingRequest,
  CreateListingResponse,
  GetListingsResponse,
} from '../types/api.types';

// POST /api/v1/marketplace/list
export const createListing = async (
  req: Request<{}, {}, CreateListingRequest>,
  res: Response<CreateListingResponse | { success: false; error: any }>
): Promise<any> => {
  try {
    const {
      sellerHederaAccount,
      tokenId,
      serialNumbers,
      pricePerNFT,
      currency = 'HBAR',
      expiresAt,
    } = req.body;

    // Validation
    if (!sellerHederaAccount || !tokenId || !serialNumbers || serialNumbers.length === 0 || !pricePerNFT) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Missing required fields',
        },
      });
    }

    // Calculate listing fee
    const listingFee = PLATFORM_FEES.LISTING_FEE.STANDARD;
    console.log(`💰 Platform listing fee: $${listingFee} USD`);

    // Step 1: Verify seller owns these NFTs
    console.log(`🔍 Verifying ownership for account ${sellerHederaAccount}...`);
    const nfts = await getAccountNFTs(sellerHederaAccount, tokenId);
    const ownedSerialNumbers = nfts.map(nft => parseInt(nft.serial_number));

    // Check if all requested serial numbers are owned by seller
    const notOwned = serialNumbers.filter((serial: number) => !ownedSerialNumbers.includes(serial));
    if (notOwned.length > 0) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'OWNERSHIP_ERROR',
          message: `Seller does not own serial numbers: ${notOwned.join(', ')}`,
        },
      });
    }

    // Step 2: Check if property exists in database
    const propertyQuery = `
      SELECT id, property_name, collection_symbol, token_price, total_supply
      FROM properties
      WHERE token_id = $1
    `;
    const propertyResult = await query(propertyQuery, [tokenId]);

    if (propertyResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROPERTY_NOT_FOUND',
          message: 'Property not found in database',
        },
      });
    }

    const property = propertyResult.rows[0];

    // Step 3: Check if any of these NFTs are already listed
    const existingListingsQuery = `
      SELECT id, serial_numbers
      FROM marketplace_listings
      WHERE token_id = $1
        AND seller_hedera_account = $2
        AND status = 'active'
    `;
    const existingListingsResult = await query(existingListingsQuery, [tokenId, sellerHederaAccount]);

    // Find any overlapping serial numbers
    const alreadyListed: number[] = [];
    existingListingsResult.rows.forEach((listing: any) => {
      const overlap = serialNumbers.filter((serial: number) => listing.serial_numbers.includes(serial));
      alreadyListed.push(...overlap);
    });

    if (alreadyListed.length > 0) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'ALREADY_LISTED',
          message: `Serial numbers already listed: ${alreadyListed.join(', ')}`,
        },
      });
    }

    // Step 4: Create listing in database
    console.log('💾 Creating marketplace listing...');
    const insertQuery = `
      INSERT INTO marketplace_listings (
        seller_hedera_account, token_id, serial_numbers, quantity,
        price_per_nft, total_price, currency, expires_at, status, listing_fee
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, seller_hedera_account, token_id, serial_numbers,
                quantity, price_per_nft, total_price, currency,
                status, created_at, expires_at, listing_fee
    `;

    const quantity = serialNumbers.length;
    const totalPrice = pricePerNFT * quantity;
    const expiresAtDate = expiresAt ? new Date(expiresAt) : null;

    const result = await query(insertQuery, [
      sellerHederaAccount,
      tokenId,
      serialNumbers,
      quantity,
      pricePerNFT,
      totalPrice,
      currency,
      expiresAtDate,
      'active',
      listingFee,
    ]);

    const listing = result.rows[0];

    // Step 5: Return response
    res.status(201).json({
      success: true,
      message: 'NFT(s) listed successfully',
      data: {
        listingId: listing.id,
        propertyId: property.id,
        propertyName: property.property_name,
        collectionSymbol: property.collection_symbol,
        tokenId: listing.token_id,
        serialNumbers: listing.serial_numbers,
        quantity: listing.quantity,
        pricePerNFT: parseFloat(listing.price_per_nft),
        totalPrice: parseFloat(listing.total_price),
        currency: listing.currency,
        status: listing.status,
        listedAt: listing.created_at,
        expiresAt: listing.expires_at,
        // @ts-ignore - fees field not in type definition, but valid for response
        fees: {
          listingFee: listingFee,
          currency: 'USD',
          note: 'Listing fee must be paid to platform to activate listing',
          validFor: `${PLATFORM_FEES.LISTING_FEE.DURATION_DAYS} days`,
        },
      },
    });
  } catch (error: any) {
    console.error('Error creating listing:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'LISTING_ERROR',
        message: error.message || 'Failed to create marketplace listing',
      },
    });
  }
};

// GET /api/v1/marketplace/listings
export const getListings = async (
  req: Request,
  res: Response<GetListingsResponse | { success: false; error: any }>
): Promise<any> => {
  try {
    const {
      tokenId,
      propertyType,
      city,
      country,
      minPrice,
      maxPrice,
      status = 'active',
      limit = 50,
      offset = 0,
    } = req.query;

    // Build dynamic query
    let queryText = `
      SELECT
        l.id as listing_id,
        l.seller_hedera_account,
        l.token_id,
        l.serial_numbers,
        l.quantity,
        l.price_per_nft,
        l.total_price,
        l.currency,
        l.status,
        l.created_at,
        l.expires_at,
        p.id as property_id,
        p.property_name,
        p.collection_symbol,
        p.property_type,
        p.city,
        p.country,
        p.token_price,
        p.total_value,
        p.total_supply,
        p.images,
        p.features,
        p.amenities
      FROM marketplace_listings l
      INNER JOIN properties p ON l.token_id = p.token_id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramCount = 0;

    // Apply filters
    if (status) {
      paramCount++;
      queryText += ` AND l.status = $${paramCount}`;
      params.push(status);
    }

    if (tokenId) {
      paramCount++;
      queryText += ` AND l.token_id = $${paramCount}`;
      params.push(tokenId);
    }

    if (propertyType) {
      paramCount++;
      queryText += ` AND p.property_type = $${paramCount}`;
      params.push(propertyType);
    }

    if (city) {
      paramCount++;
      queryText += ` AND LOWER(p.city) = LOWER($${paramCount})`;
      params.push(city);
    }

    if (country) {
      paramCount++;
      queryText += ` AND LOWER(p.country) = LOWER($${paramCount})`;
      params.push(country);
    }

    if (minPrice) {
      paramCount++;
      queryText += ` AND l.price_per_nft >= $${paramCount}`;
      params.push(parseFloat(minPrice as string));
    }

    if (maxPrice) {
      paramCount++;
      queryText += ` AND l.price_per_nft <= $${paramCount}`;
      params.push(parseFloat(maxPrice as string));
    }

    // Add ordering and pagination
    queryText += ` ORDER BY l.created_at DESC`;

    paramCount++;
    queryText += ` LIMIT $${paramCount}`;
    params.push(parseInt(limit as string));

    paramCount++;
    queryText += ` OFFSET $${paramCount}`;
    params.push(parseInt(offset as string));

    // Execute query
    console.log('📊 Fetching marketplace listings...');
    const result = await query(queryText, params);

    // Count total matching listings (without pagination)
    let countQuery = `
      SELECT COUNT(*) as total
      FROM marketplace_listings l
      INNER JOIN properties p ON l.token_id = p.token_id
      WHERE 1=1
    `;
    const countParams: any[] = [];
    let countParamCount = 0;

    if (status) {
      countParamCount++;
      countQuery += ` AND l.status = $${countParamCount}`;
      countParams.push(status);
    }

    if (tokenId) {
      countParamCount++;
      countQuery += ` AND l.token_id = $${countParamCount}`;
      countParams.push(tokenId);
    }

    if (propertyType) {
      countParamCount++;
      countQuery += ` AND p.property_type = $${countParamCount}`;
      countParams.push(propertyType);
    }

    if (city) {
      countParamCount++;
      countQuery += ` AND LOWER(p.city) = LOWER($${countParamCount})`;
      countParams.push(city);
    }

    if (country) {
      countParamCount++;
      countQuery += ` AND LOWER(p.country) = LOWER($${countParamCount})`;
      countParams.push(country);
    }

    if (minPrice) {
      countParamCount++;
      countQuery += ` AND l.price_per_nft >= $${countParamCount}`;
      countParams.push(parseFloat(minPrice as string));
    }

    if (maxPrice) {
      countParamCount++;
      countQuery += ` AND l.price_per_nft <= $${countParamCount}`;
      countParams.push(parseFloat(maxPrice as string));
    }

    const countResult = await query(countQuery, countParams);
    const totalListings = parseInt(countResult.rows[0].total);

    // Format response
    const listings = result.rows.map((row: any) => ({
      listingId: row.listing_id,
      sellerHederaAccount: row.seller_hedera_account,
      propertyId: row.property_id,
      propertyName: row.property_name,
      collectionSymbol: row.collection_symbol,
      tokenId: row.token_id,
      serialNumbers: row.serial_numbers,
      quantity: row.quantity,
      pricePerNFT: parseFloat(row.price_per_nft),
      totalPrice: parseFloat(row.total_price),
      currency: row.currency,
      propertyType: row.property_type,
      city: row.city,
      country: row.country,
      originalTokenPrice: parseFloat(row.token_price),
      propertyTotalValue: parseFloat(row.total_value),
      totalSupply: row.total_supply,
      images: row.images || [],
      features: row.features || {},
      amenities: row.amenities || [],
      status: row.status,
      listedAt: row.created_at,
      expiresAt: row.expires_at,
    }));

    res.json({
      success: true,
      data: {
        listings,
        pagination: {
          total: totalListings,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          hasMore: parseInt(offset as string) + listings.length < totalListings,
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching listings:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: error.message || 'Failed to fetch marketplace listings',
      },
    });
  }
};

// POST /api/v1/marketplace/offers - Make offer on a listing
export const makeOffer = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const {
      listingId,
      buyerHederaAccount,
      offerPrice,
      quantity,
      currency = 'HBAR',
      expiresAt,
    } = req.body;

    // Validation
    if (!listingId || !buyerHederaAccount || !offerPrice) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Missing required fields: listingId, buyerHederaAccount, offerPrice',
        },
      });
    }

    // Check if listing exists and is active
    const listingQuery = `
      SELECT
        l.id, l.seller_hedera_account, l.token_id, l.serial_numbers,
        l.quantity, l.price_per_nft, l.total_price, l.currency, l.status,
        p.property_name, p.collection_symbol
      FROM marketplace_listings l
      INNER JOIN properties p ON l.token_id = p.token_id
      WHERE l.id = $1
    `;

    const listingResult = await query(listingQuery, [listingId]);

    if (listingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'LISTING_NOT_FOUND',
          message: 'Listing not found',
        },
      });
    }

    const listing = listingResult.rows[0];

    if (listing.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'LISTING_INACTIVE',
          message: 'Listing is not active',
        },
      });
    }

    // Prevent seller from making offer on their own listing
    if (listing.seller_hedera_account === buyerHederaAccount) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_OFFER',
          message: 'Cannot make offer on your own listing',
        },
      });
    }

    // Validate quantity
    const offerQuantity = quantity || listing.quantity;
    if (offerQuantity > listing.quantity) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_QUANTITY',
          message: `Requested quantity exceeds available quantity (${listing.quantity})`,
        },
      });
    }

    // Create offer in database
    console.log('💰 Creating marketplace offer...');
    const insertQuery = `
      INSERT INTO marketplace_offers (
        listing_id, buyer_hedera_account, offer_price, quantity,
        total_offer_amount, currency, expires_at, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, listing_id, buyer_hedera_account, offer_price,
                quantity, total_offer_amount, currency, status,
                created_at, expires_at
    `;

    const totalOfferAmount = offerPrice * offerQuantity;
    const expiresAtDate = expiresAt ? new Date(expiresAt) : null;

    const result = await query(insertQuery, [
      listingId,
      buyerHederaAccount,
      offerPrice,
      offerQuantity,
      totalOfferAmount,
      currency,
      expiresAtDate,
      'pending',
    ]);

    const offer = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Offer created successfully',
      data: {
        offerId: offer.id,
        listingId: offer.listing_id,
        propertyName: listing.property_name,
        collectionSymbol: listing.collection_symbol,
        buyerHederaAccount: offer.buyer_hedera_account,
        sellerHederaAccount: listing.seller_hedera_account,
        offerPrice: parseFloat(offer.offer_price),
        quantity: offer.quantity,
        totalOfferAmount: parseFloat(offer.total_offer_amount),
        listingPrice: parseFloat(listing.price_per_nft),
        currency: offer.currency,
        status: offer.status,
        createdAt: offer.created_at,
        expiresAt: offer.expires_at,
      },
    });
  } catch (error: any) {
    console.error('Error making offer:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'OFFER_ERROR',
        message: error.message || 'Failed to make offer',
      },
    });
  }
};

// POST /api/v1/marketplace/buy - Purchase NFT from listing
export const buyNFT = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const {
      listingId,
      buyerHederaAccount,
      quantity,
    } = req.body;

    // Validation
    if (!listingId || !buyerHederaAccount) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Missing required fields: listingId, buyerHederaAccount',
        },
      });
    }

    // Get listing details including property owner to determine if this is a primary or secondary sale
    const listingQuery = `
      SELECT
        l.id, l.seller_hedera_account, l.token_id, l.serial_numbers,
        l.quantity, l.price_per_nft, l.total_price, l.currency, l.status,
        p.id as property_id, p.property_name, p.collection_symbol, p.owner_hedera_account
      FROM marketplace_listings l
      INNER JOIN properties p ON l.token_id = p.token_id
      WHERE l.id = $1 AND l.status = 'active'
    `;

    const listingResult = await query(listingQuery, [listingId]);

    if (listingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'LISTING_NOT_FOUND',
          message: 'Active listing not found',
        },
      });
    }

    const listing = listingResult.rows[0];

    // Validate buyer is not the seller
    if (listing.seller_hedera_account === buyerHederaAccount) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PURCHASE',
          message: 'Cannot purchase your own listing',
        },
      });
    }

    // Validate quantity
    const purchaseQuantity = quantity || listing.quantity;
    if (purchaseQuantity > listing.quantity) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_QUANTITY',
          message: `Requested quantity exceeds available quantity (${listing.quantity})`,
        },
      });
    }

    // Calculate total price
    const totalPrice = listing.price_per_nft * purchaseQuantity;
    const serialNumbersToPurchase = listing.serial_numbers.slice(0, purchaseQuantity);

    // Determine if this is a primary sale (from property owner) or secondary sale
    const isPrimarySale = listing.seller_hedera_account === listing.owner_hedera_account;

    // Calculate platform fees based on sale type
    let platformFee: number;
    let sellerReceives: number;
    let feeType: string;
    let feePercentage: number;

    if (isPrimarySale) {
      // Primary sale: 10% commission to platform
      feePercentage = PLATFORM_FEES.PRIMARY_SALE_COMMISSION;
      platformFee = calculatePrimarySaleCommission(totalPrice);
      feeType = 'Primary Sale Commission';
      sellerReceives = totalPrice - platformFee;
      console.log(`💰 Primary sale detected - Platform commission: ${platformFee.toFixed(2)} USD (${feePercentage}%)`);
    } else {
      // Secondary sale: 2.5% platform transaction fee (royalty fee of 5% is built into NFT)
      feePercentage = PLATFORM_FEES.PLATFORM_TRANSACTION_FEE;
      platformFee = calculatePlatformTransactionFee(totalPrice);
      feeType = 'Platform Transaction Fee';
      // Note: Hedera enforces the 5% royalty automatically, so it's already deducted
      sellerReceives = totalPrice - platformFee;
      console.log(`💰 Secondary sale detected - Platform fee: ${platformFee.toFixed(2)} USD (${feePercentage}%)`);
      console.log(`   Royalty (${PLATFORM_FEES.ROYALTY_FEE}%) enforced by Hedera smart contract`);
    }

    // Create purchase transaction record with fee tracking
    console.log('🛒 Creating purchase transaction...');
    const purchaseQuery = `
      INSERT INTO marketplace_transactions (
        listing_id, buyer_hedera_account, seller_hedera_account,
        token_id, serial_numbers, quantity, price_per_nft,
        total_price, currency, status, transaction_type,
        sale_type, platform_fee, platform_fee_percentage, seller_receives
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING id, listing_id, buyer_hedera_account, seller_hedera_account,
                token_id, serial_numbers, quantity, price_per_nft,
                total_price, currency, status, created_at,
                sale_type, platform_fee, platform_fee_percentage, seller_receives
    `;

    const txResult = await query(purchaseQuery, [
      listingId,
      buyerHederaAccount,
      listing.seller_hedera_account,
      listing.token_id,
      serialNumbersToPurchase,
      purchaseQuantity,
      listing.price_per_nft,
      totalPrice,
      listing.currency,
      'pending',
      'purchase',
      isPrimarySale ? 'primary' : 'secondary',
      platformFee,
      feePercentage,
      sellerReceives,
    ]);

    const transaction = txResult.rows[0];

    // Update listing status if fully sold
    if (purchaseQuantity === listing.quantity) {
      await query(
        `UPDATE marketplace_listings SET status = 'sold', sold_at = NOW() WHERE id = $1`,
        [listingId]
      );
    } else {
      // Partially sold - update remaining quantity
      const remainingSerials = listing.serial_numbers.slice(purchaseQuantity);
      await query(
        `UPDATE marketplace_listings
         SET quantity = $1, serial_numbers = $2, total_price = $3
         WHERE id = $4`,
        [
          listing.quantity - purchaseQuantity,
          remainingSerials,
          listing.price_per_nft * (listing.quantity - purchaseQuantity),
          listingId,
        ]
      );
    }

    res.status(201).json({
      success: true,
      message: 'Purchase initiated successfully. Proceed with payment and NFT transfer.',
      data: {
        transactionId: transaction.id,
        listingId: transaction.listing_id,
        propertyId: listing.property_id,
        propertyName: listing.property_name,
        collectionSymbol: listing.collection_symbol,
        tokenId: transaction.token_id,
        serialNumbers: transaction.serial_numbers,
        quantity: transaction.quantity,
        pricePerNFT: parseFloat(transaction.price_per_nft),
        totalPrice: parseFloat(transaction.total_price),
        currency: transaction.currency,
        buyerHederaAccount: transaction.buyer_hedera_account,
        sellerHederaAccount: transaction.seller_hedera_account,
        status: transaction.status,
        createdAt: transaction.created_at,
        saleType: isPrimarySale ? 'primary' : 'secondary',
        fees: {
          platformFee: parseFloat(platformFee.toFixed(2)),
          feeType: feeType,
          feePercentage: feePercentage,
          sellerReceives: parseFloat(sellerReceives.toFixed(2)),
          ...(isPrimarySale ? {} : {
            royaltyFee: PLATFORM_FEES.ROYALTY_FEE,
            royaltyNote: 'Enforced automatically by Hedera smart contract to property owner'
          }),
          breakdown: {
            totalPrice: parseFloat(transaction.total_price),
            platformFee: parseFloat(platformFee.toFixed(2)),
            sellerReceives: parseFloat(sellerReceives.toFixed(2)),
            ...(isPrimarySale ? {
              description: `Property owner receives ${((100 - feePercentage)).toFixed(1)}% after ${feePercentage}% platform commission`
            } : {
              description: `Seller receives ${((100 - feePercentage)).toFixed(1)}% after ${feePercentage}% platform fee. ${PLATFORM_FEES.ROYALTY_FEE}% royalty to property owner is automatically enforced by NFT contract`
            })
          },
          currency: transaction.currency,
        },
        instructions: {
          step1: 'Transfer payment to seller account',
          step2: 'Seller approves and transfers NFT to buyer',
          step3: 'Transaction status will be updated to "completed"',
          paymentDetails: {
            recipient: transaction.seller_hedera_account,
            amount: parseFloat(transaction.total_price),
            currency: transaction.currency,
            platformFeeRecipient: PLATFORM_FEES.FEE_COLLECTOR_ACCOUNT,
            platformFeeAmount: parseFloat(platformFee.toFixed(2)),
          },
        },
      },
    });
  } catch (error: any) {
    console.error('Error purchasing NFT:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PURCHASE_ERROR',
        message: error.message || 'Failed to purchase NFT',
      },
    });
  }
};

export default {
  createListing,
  getListings,
  makeOffer,
  buyNFT,
};
