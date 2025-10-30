/**
 * Properties Controller
 * Handles property NFT minting and management
 */

import { Request, Response } from 'express';
import { query } from '../config/database';
import { createPropertyCollection, mintNFTsToTreasury } from '../services/hedera.service';
import { uploadFile, uploadJSON } from '../services/ipfs.service';
import type { MintPropertyRequest, MintPropertyResponse } from '../types/api.types';

// POST /api/v1/properties/mint
export const mintProperty = async (
  req: Request<{}, {}, MintPropertyRequest>,
  res: Response<MintPropertyResponse | { success: false; error: any }>
): Promise<any> => {
  try {
    const {
      ownerHederaAccount,
      propertyName,
      collectionName,
      collectionSymbol,
      propertyType,
      category,
      address,
      city,
      state,
      country,
      zipCode,
      latitude,
      longitude,
      totalValue,
      totalSupply,
      tokenPrice,
      expectedAnnualReturn,
      rentalYield,
      distributionFrequency,
      description,
      features,
      amenities,
      images,
      documents,
      royaltyPercentage = 5,
    } = req.body;

    // Handle uploaded files from multipart/form-data
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const imageFiles = files?.images || [];
    const documentFiles = files?.documents || [];

    // Parse numeric fields (multipart/form-data sends everything as strings)
    const parsedTotalSupply = typeof totalSupply === 'string' ? parseInt(totalSupply, 10) : totalSupply;
    const parsedTotalValue = typeof totalValue === 'string' ? parseFloat(totalValue) : totalValue;
    const parsedTokenPrice = typeof tokenPrice === 'string' ? parseFloat(tokenPrice) : tokenPrice;
    const parsedLatitude = latitude ? (typeof latitude === 'string' ? parseFloat(latitude) : latitude) : undefined;
    const parsedLongitude = longitude ? (typeof longitude === 'string' ? parseFloat(longitude) : longitude) : undefined;
    const parsedAnnualReturn = expectedAnnualReturn ? (typeof expectedAnnualReturn === 'string' ? parseFloat(expectedAnnualReturn) : expectedAnnualReturn) : undefined;
    const parsedRentalYield = rentalYield ? (typeof rentalYield === 'string' ? parseFloat(rentalYield) : rentalYield) : undefined;
    const parsedRoyaltyPercentage = royaltyPercentage ? (typeof royaltyPercentage === 'string' ? parseFloat(royaltyPercentage) : royaltyPercentage) : 5;

    // Validation
    if (!ownerHederaAccount || !propertyName || !collectionName || !collectionSymbol) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Missing required fields',
        },
      });
    }

    // TODO: Check if owner has property-owner verification NFT
    // const hasVerification = await checkVerification(ownerHederaAccount, 'property-owner');
    // if (!hasVerification) {
    //   return res.status(403).json({
    //     success: false,
    //     error: {
    //       code: 'VERIFICATION_REQUIRED',
    //       message: 'Property owner verification required',
    //     },
    //   });
    // }

    // Step 1: Upload images to IPFS
    console.log(`📸 Uploading ${imageFiles.length} image(s) to IPFS...`);
    const imageUrls: string[] = [];

    if (imageFiles.length > 0) {
      for (const file of imageFiles) {
        const cid = await uploadFile(file.buffer, file.originalname);
        const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;
        imageUrls.push(gatewayUrl);
        console.log(`✅ Uploaded ${file.originalname} → ${cid}`);
      }
    } else if (images && Array.isArray(images)) {
      // Fallback: accept pre-uploaded URLs from body (for backward compatibility)
      imageUrls.push(...images);
    }

    // Step 2: Upload documents to IPFS
    console.log(`📄 Uploading ${documentFiles.length} document(s) to IPFS...`);
    const documentUrls: string[] = [];

    if (documentFiles.length > 0) {
      for (const file of documentFiles) {
        const cid = await uploadFile(file.buffer, file.originalname);
        const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;
        documentUrls.push(gatewayUrl);
        console.log(`✅ Uploaded ${file.originalname} → ${cid}`);
      }
    } else if (documents && Array.isArray(documents)) {
      // Fallback: accept pre-uploaded documents from body (for backward compatibility)
      // Documents can be objects {name, cid, type} or strings (URLs)
      documents.forEach((doc: any) => {
        if (typeof doc === 'string') {
          documentUrls.push(doc);
        } else if (doc.cid) {
          documentUrls.push(`https://gateway.pinata.cloud/ipfs/${doc.cid}`);
        }
      });
    }

    // Step 3: Create full metadata JSON
    const metadata = {
      name: propertyName,
      description: description || '',
      type: propertyType,
      category: category || '',
      location: {
        address,
        city,
        state: state || '',
        country,
        zipCode: zipCode || '',
        coordinates: parsedLatitude && parsedLongitude ? {
          latitude: parsedLatitude,
          longitude: parsedLongitude,
        } : undefined,
      },
      financial: {
        totalValue: parsedTotalValue,
        tokenPrice: parsedTokenPrice,
        totalSupply: parsedTotalSupply,
        expectedAnnualReturn: parsedAnnualReturn || 0,
        rentalYield: parsedRentalYield || 0,
        distributionFrequency: distributionFrequency || '',
      },
      features: features || {},
      amenities: amenities || [],
      images: imageUrls,
      documents: documentUrls,
      createdAt: new Date().toISOString(),
    };

    // Step 2: Upload metadata to IPFS
    console.log('📤 Uploading metadata to IPFS...');
    const metadataCID = await uploadJSON(metadata);

    // Step 3: Create NFT collection on Hedera
    console.log('⛓️  Creating NFT collection on Hedera...');
    const treasuryAccount = process.env.TREASURY_ACCOUNT_ID || process.env.OPERATOR_ID!;
    const feeCollectorAccount = process.env.FEE_COLLECTOR_ACCOUNT_ID || process.env.OPERATOR_ID!;

    const hederaResult = await createPropertyCollection({
      collectionName,
      collectionSymbol,
      treasuryAccount,
      feeCollectorAccount,
      royaltyPercentage: parsedRoyaltyPercentage,
      totalSupply: parsedTotalSupply,
    });

    // Step 4: Mint NFTs to treasury
    console.log(`🪙 Minting ${parsedTotalSupply} NFT(s) to treasury...`);
    const metadataCIDs = Array(parsedTotalSupply).fill(metadataCID);

    const mintResult = await mintNFTsToTreasury({
      tokenId: hederaResult.tokenId,
      supplyKey: hederaResult.supplyKey,
      quantity: parsedTotalSupply,
      metadataCIDs,
    });

    console.log(`✅ Minted NFTs with serial numbers: ${mintResult.serialNumbers[0]} to ${mintResult.serialNumbers[mintResult.serialNumbers.length - 1]}`);

    // Step 5: Save to database
    console.log('💾 Saving property to database...');
    const insertQuery = `
      INSERT INTO properties (
        token_id, collection_name, collection_symbol,
        owner_hedera_account, property_name, property_type, category,
        address, city, state, country, zip_code, latitude, longitude,
        total_value, token_price, total_supply, available_supply,
        description, metadata_cid, images, documents,
        features, amenities,
        expected_annual_return, rental_yield, distribution_frequency,
        hcs_topic_id, status, launched_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
        $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30
      ) RETURNING id, token_id, hcs_topic_id, created_at
    `;

    const result = await query(insertQuery, [
      hederaResult.tokenId,
      collectionName,
      collectionSymbol,
      ownerHederaAccount,
      propertyName,
      propertyType,
      category || null,
      address,
      city,
      state || null,
      country,
      zipCode || null,
      parsedLatitude || null,
      parsedLongitude || null,
      parsedTotalValue,
      parsedTokenPrice,
      parsedTotalSupply,
      parsedTotalSupply, // available_supply initially equals total_supply
      description || null,
      metadataCID,
      JSON.stringify(imageUrls),
      JSON.stringify(documentUrls),
      JSON.stringify(features || {}),
      amenities || [],
      parsedAnnualReturn || null,
      parsedRentalYield || null,
      distributionFrequency || null,
      hederaResult.hcsTopicId,
      'active',
      new Date(),
    ]);

    const property = result.rows[0];

    // Step 5: Return response
    const network = process.env.HEDERA_NETWORK || 'testnet';
    const explorerUrl = `https://hashscan.io/${network}/token/${hederaResult.tokenId}`;

    res.status(201).json({
      success: true,
      message: 'Property NFT collection minted successfully',
      data: {
        propertyId: property.id,
        tokenId: hederaResult.tokenId,
        collectionName,
        collectionSymbol,
        totalSupply: parsedTotalSupply,
        tokenPrice: parsedTokenPrice,
        hcsTopicId: hederaResult.hcsTopicId,
        metadata: {
          metadataCID,
          metadataUrl: `https://gateway.pinata.cloud/ipfs/${metadataCID}`,
        },
        media: {
          images: imageUrls,
          documents: documentUrls,
        },
        nfts: {
          mintedCount: mintResult.serialNumbers.length,
          serialNumbers: mintResult.serialNumbers,
          mintTransactionId: mintResult.transactionId,
        },
        hedera: {
          transactionId: hederaResult.transactionId,
          timestamp: hederaResult.timestamp,
          explorerUrl,
        },
      },
    });
  } catch (error: any) {
    console.error('Error minting property:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'MINT_ERROR',
        message: error.message || 'Failed to mint property NFT collection',
      },
    });
  }
};

// GET /api/v1/properties - List all properties
export const listProperties = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const {
      status,
      propertyType,
      city,
      country,
      minPrice,
      maxPrice,
      limit = 50,
      offset = 0,
    } = req.query;

    let queryText = `
      SELECT
        id, token_id, property_name, collection_name, collection_symbol,
        owner_hedera_account, property_type, category,
        city, state, country, total_value, token_price,
        total_supply, available_supply, images, status,
        expected_annual_return, rental_yield, created_at
      FROM properties
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      queryText += ` AND status = $${paramCount}`;
      params.push(status);
    }

    if (propertyType) {
      paramCount++;
      queryText += ` AND property_type = $${paramCount}`;
      params.push(propertyType);
    }

    if (city) {
      paramCount++;
      queryText += ` AND LOWER(city) = LOWER($${paramCount})`;
      params.push(city);
    }

    if (country) {
      paramCount++;
      queryText += ` AND LOWER(country) = LOWER($${paramCount})`;
      params.push(country);
    }

    if (minPrice) {
      paramCount++;
      queryText += ` AND token_price >= $${paramCount}`;
      params.push(parseFloat(minPrice as string));
    }

    if (maxPrice) {
      paramCount++;
      queryText += ` AND token_price <= $${paramCount}`;
      params.push(parseFloat(maxPrice as string));
    }

    queryText += ` ORDER BY created_at DESC`;

    paramCount++;
    queryText += ` LIMIT $${paramCount}`;
    params.push(parseInt(limit as string));

    paramCount++;
    queryText += ` OFFSET $${paramCount}`;
    params.push(parseInt(offset as string));

    const result = await query(queryText, params);

    res.json({
      success: true,
      data: {
        properties: result.rows,
        count: result.rows.length,
      },
    });
  } catch (error: any) {
    console.error('Error listing properties:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: error.message || 'Failed to list properties',
      },
    });
  }
};

// GET /api/v1/properties/:id - Get property details
export const getPropertyDetails = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;

    const propertyQuery = `
      SELECT * FROM properties WHERE id = $1 OR token_id = $1
    `;

    const result = await query(propertyQuery, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Property not found',
        },
      });
    }

    const property = result.rows[0];

    res.json({
      success: true,
      data: property,
    });
  } catch (error: any) {
    console.error('Error fetching property details:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: error.message || 'Failed to fetch property details',
      },
    });
  }
};

// PUT /api/v1/properties/:id - Update property
export const updateProperty = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const allowedFields = [
      'description',
      'images',
      'documents',
      'features',
      'amenities',
      'expected_annual_return',
      'rental_yield',
      'status',
      'available_supply',
    ];

    const updateFields: string[] = [];
    const values: any[] = [];
    let paramCount = 0;

    Object.keys(updates).forEach((key) => {
      if (allowedFields.includes(key)) {
        paramCount++;
        updateFields.push(`${key} = $${paramCount}`);

        if (key === 'images' || key === 'documents' || key === 'features') {
          values.push(JSON.stringify(updates[key]));
        } else {
          values.push(updates[key]);
        }
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_UPDATES',
          message: 'No valid fields to update',
        },
      });
    }

    paramCount++;
    const updateQuery = `
      UPDATE properties
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount} OR token_id = $${paramCount}
      RETURNING *
    `;
    values.push(id);

    const result = await query(updateQuery, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Property not found',
        },
      });
    }

    res.json({
      success: true,
      message: 'Property updated successfully',
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error('Error updating property:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: error.message || 'Failed to update property',
      },
    });
  }
};

// POST /api/v1/properties/:id/verify - Trigger document verification
export const verifyPropertyDocuments = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;
    const { verificationType, accountId, signature, publicKey, message } = req.body;

    // Validation
    if (!accountId || !signature || !publicKey || !message) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Account ID, signature, public key, and message are required for authentication',
        },
      });
    }

    // Import wallet verification utility
    const { verifyWalletAndNFT } = await import('../utils/wallet-signature');

    // Verify wallet signature and property-owner verification NFT
    const verificationResult = await verifyWalletAndNFT(
      accountId,
      message,
      signature,
      publicKey,
      'property-owner'
    );

    if (!verificationResult.isValid) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_SIGNATURE',
          message: 'Invalid wallet signature',
        },
      });
    }

    if (!verificationResult.hasVerification) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'VERIFICATION_REQUIRED',
          message: 'Property owner verification NFT required',
        },
      });
    }

    // Get property details
    const propertyQuery = `
      SELECT id, token_id, property_name, owner_hedera_account, documents, verification_status
      FROM properties
      WHERE id = $1 OR token_id = $1
    `;
    const propertyResult = await query(propertyQuery, [id]);

    if (propertyResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Property not found',
        },
      });
    }

    const property = propertyResult.rows[0];

    // Check if requester is the property owner
    if (property.owner_hedera_account !== accountId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Only the property owner can trigger document verification',
        },
      });
    }

    // Check if property has documents
    const documents = typeof property.documents === 'string'
      ? JSON.parse(property.documents)
      : property.documents;

    if (!documents || documents.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_DOCUMENTS',
          message: 'No documents available for verification',
        },
      });
    }

    // Update property verification status to "pending"
    const updateQuery = `
      UPDATE properties
      SET verification_status = 'pending',
          verification_requested_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, property_name, verification_status, verification_requested_at
    `;
    const updateResult = await query(updateQuery, [property.id]);

    // TODO: In production, this would trigger an actual verification workflow:
    // - Send documents to third-party verification service (e.g., property registry API)
    // - Queue background job for AI-powered document analysis
    // - Notify admin dashboard for manual review
    // - Send notification to property owner about verification initiation

    // Create verification log entry
    const logQuery = `
      INSERT INTO verification_logs (
        property_id,
        requester_account_id,
        verification_type,
        status,
        requested_at
      ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      RETURNING id, created_at
    `;
    const logResult = await query(logQuery, [
      property.id,
      accountId,
      verificationType || 'document-verification',
      'initiated',
    ]);

    res.json({
      success: true,
      message: 'Document verification initiated successfully',
      data: {
        propertyId: updateResult.rows[0].id,
        propertyName: updateResult.rows[0].property_name,
        verificationStatus: updateResult.rows[0].verification_status,
        requestedAt: updateResult.rows[0].verification_requested_at,
        verificationLogId: logResult.rows[0].id,
        documentsCount: documents.length,
        nextSteps: [
          'Documents will be reviewed by our verification team',
          'You will receive a notification once verification is complete',
          'Verification typically takes 3-5 business days',
        ],
      },
    });
  } catch (error: any) {
    console.error('Error verifying property documents:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'VERIFICATION_ERROR',
        message: error.message || 'Failed to initiate document verification',
      },
    });
  }
};

export default {
  mintProperty,
  listProperties,
  getPropertyDetails,
  updateProperty,
  verifyPropertyDocuments,
};
