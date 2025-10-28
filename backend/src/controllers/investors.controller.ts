/**
 * Investors Controller
 * Handles investor registration, profiles, and KYC
 */

import { Request, Response } from 'express';
import { query } from '../config/database';
import { getAccountNFTs } from '../services/hedera.service';

// POST /api/v1/investors/register - Register new investor
export const registerInvestor = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const {
      hederaAccountId,
      email,
      fullName,
      country,
      investorType,
      kycStatus = 'pending',
      accreditationStatus = 'pending',
    } = req.body;

    // Validation
    if (!hederaAccountId || !email || !fullName || !country) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Missing required fields: hederaAccountId, email, fullName, country',
        },
      });
    }

    // Check if investor already exists
    const existingQuery = `
      SELECT id, hedera_account_id, email FROM investors
      WHERE hedera_account_id = $1 OR email = $2
    `;

    const existingResult = await query(existingQuery, [hederaAccountId, email]);

    if (existingResult.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'INVESTOR_EXISTS',
          message: 'Investor already registered with this Hedera account or email',
          data: {
            existingAccount: existingResult.rows[0].hedera_account_id,
          },
        },
      });
    }

    // Insert new investor
    console.log('👤 Registering new investor...');
    const insertQuery = `
      INSERT INTO investors (
        hedera_account_id, email, full_name, country,
        investor_type, kyc_status, accreditation_status, registered_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, hedera_account_id, email, full_name, country,
                investor_type, kyc_status, accreditation_status, registered_at
    `;

    const result = await query(insertQuery, [
      hederaAccountId,
      email,
      fullName,
      country,
      investorType || 'retail',
      kycStatus,
      accreditationStatus,
      new Date(),
    ]);

    const investor = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Investor registered successfully',
      data: {
        investorId: investor.id,
        hederaAccountId: investor.hedera_account_id,
        email: investor.email,
        fullName: investor.full_name,
        country: investor.country,
        investorType: investor.investor_type,
        kycStatus: investor.kyc_status,
        accreditationStatus: investor.accreditation_status,
        registeredAt: investor.registered_at,
      },
    });
  } catch (error: any) {
    console.error('Error registering investor:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REGISTRATION_ERROR',
        message: error.message || 'Failed to register investor',
      },
    });
  }
};

// GET /api/v1/investors/:id/profile - Get investor profile
export const getInvestorProfile = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Investor ID is required',
        },
      });
    }

    console.log(`🔍 Fetching investor profile for ${id}...`);

    // Get investor details (by ID or Hedera account)
    const investorQuery = `
      SELECT
        id, hedera_account_id, email, full_name, country,
        investor_type, kyc_status, kyc_verified_at,
        accreditation_status, accreditation_verified_at,
        registered_at, updated_at
      FROM investors
      WHERE id = $1 OR hedera_account_id = $1
    `;

    const investorResult = await query(investorQuery, [id]);

    if (investorResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'INVESTOR_NOT_FOUND',
          message: 'Investor not found',
        },
      });
    }

    const investor = investorResult.rows[0];

    // Get investor's NFT holdings summary
    let holdingsSummary = null;
    try {
      const nfts = await getAccountNFTs(investor.hedera_account_id);

      // Group by token ID
      const tokenIds = [...new Set(nfts.map((nft: any) => nft.token_id))];

      // Get property details for owned tokens
      if (tokenIds.length > 0) {
        const propertiesQuery = `
          SELECT token_id, property_name, total_value, token_price
          FROM properties
          WHERE token_id = ANY($1)
        `;

        const propertiesResult = await query(propertiesQuery, [tokenIds]);
        const propertiesMap = new Map(
          propertiesResult.rows.map((p: any) => [p.token_id, p])
        );

        let totalInvested = 0;
        tokenIds.forEach((tokenId: string) => {
          const property = propertiesMap.get(tokenId);
          if (property) {
            const nftCount = nfts.filter((nft: any) => nft.token_id === tokenId).length;
            totalInvested += nftCount * parseFloat(property.token_price);
          }
        });

        holdingsSummary = {
          totalProperties: tokenIds.length,
          totalNFTs: nfts.length,
          estimatedValue: parseFloat(totalInvested.toFixed(2)),
        };
      }
    } catch (error) {
      console.error('Error fetching holdings:', error);
      holdingsSummary = {
        totalProperties: 0,
        totalNFTs: 0,
        estimatedValue: 0,
      };
    }

    // Get transaction count
    const txCountQuery = `
      SELECT COUNT(*) as transaction_count
      FROM marketplace_transactions
      WHERE buyer_hedera_account = $1 OR seller_hedera_account = $1
    `;

    const txCountResult = await query(txCountQuery, [investor.hedera_account_id]);
    const transactionCount = parseInt(txCountResult.rows[0].transaction_count);

    res.json({
      success: true,
      data: {
        investorId: investor.id,
        hederaAccountId: investor.hedera_account_id,
        email: investor.email,
        fullName: investor.full_name,
        country: investor.country,
        investorType: investor.investor_type,
        kycStatus: investor.kyc_status,
        kycVerifiedAt: investor.kyc_verified_at,
        accreditationStatus: investor.accreditation_status,
        accreditationVerifiedAt: investor.accreditation_verified_at,
        registeredAt: investor.registered_at,
        updatedAt: investor.updated_at,
        statistics: {
          ...holdingsSummary,
          transactionCount,
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching investor profile:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: error.message || 'Failed to fetch investor profile',
      },
    });
  }
};

// POST /api/v1/investors/:id/kyc - Submit KYC documents
export const submitKYC = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;
    const {
      documentType,
      documentNumber,
      documentCID,
      verificationType,
      additionalInfo,
    } = req.body;

    // Validation
    if (!id || !documentType || !documentCID) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Missing required fields: id, documentType, documentCID',
        },
      });
    }

    // Check if investor exists
    const investorQuery = `
      SELECT id, hedera_account_id, email, full_name FROM investors
      WHERE id = $1 OR hedera_account_id = $1
    `;

    const investorResult = await query(investorQuery, [id]);

    if (investorResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'INVESTOR_NOT_FOUND',
          message: 'Investor not found',
        },
      });
    }

    const investor = investorResult.rows[0];

    // Insert KYC submission
    console.log('📝 Submitting KYC documents...');
    const insertQuery = `
      INSERT INTO kyc_submissions (
        investor_id, document_type, document_number,
        document_cid, verification_type, additional_info,
        status, submitted_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, investor_id, document_type, verification_type,
                status, submitted_at
    `;

    const result = await query(insertQuery, [
      investor.id,
      documentType,
      documentNumber || null,
      documentCID,
      verificationType || 'kyc',
      additionalInfo ? JSON.stringify(additionalInfo) : null,
      'pending',
      new Date(),
    ]);

    const submission = result.rows[0];

    // Update investor KYC status
    await query(
      `UPDATE investors SET kyc_status = 'pending', updated_at = NOW() WHERE id = $1`,
      [investor.id]
    );

    res.status(201).json({
      success: true,
      message: 'KYC documents submitted successfully',
      data: {
        submissionId: submission.id,
        investorId: submission.investor_id,
        investorName: investor.full_name,
        documentType: submission.document_type,
        verificationType: submission.verification_type,
        status: submission.status,
        submittedAt: submission.submitted_at,
        documentUrl: `https://gateway.pinata.cloud/ipfs/${documentCID}`,
        nextSteps: {
          step1: 'Documents will be reviewed by compliance team',
          step2: 'You will be notified via email once verification is complete',
          step3: 'Upon approval, your KYC status will be updated to "verified"',
        },
      },
    });
  } catch (error: any) {
    console.error('Error submitting KYC:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'KYC_SUBMISSION_ERROR',
        message: error.message || 'Failed to submit KYC documents',
      },
    });
  }
};

// GET /api/v1/investors/:id/transactions - Get transaction history
export const getInvestorTransactions = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;
    const {
      transactionType,
      status,
      limit = 50,
      offset = 0,
    } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Investor ID is required',
        },
      });
    }

    // Get investor's Hedera account
    const investorQuery = `
      SELECT id, hedera_account_id, full_name FROM investors
      WHERE id = $1 OR hedera_account_id = $1
    `;

    const investorResult = await query(investorQuery, [id]);

    if (investorResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'INVESTOR_NOT_FOUND',
          message: 'Investor not found',
        },
      });
    }

    const investor = investorResult.rows[0];

    console.log(`📊 Fetching transactions for investor ${investor.hedera_account_id}...`);

    // Build dynamic query
    let queryText = `
      SELECT
        t.id as transaction_id,
        t.listing_id,
        t.buyer_hedera_account,
        t.seller_hedera_account,
        t.token_id,
        t.serial_numbers,
        t.quantity,
        t.price_per_nft,
        t.total_price,
        t.currency,
        t.status,
        t.transaction_type,
        t.created_at,
        t.completed_at,
        p.property_name,
        p.collection_symbol,
        p.city,
        p.country
      FROM marketplace_transactions t
      INNER JOIN properties p ON t.token_id = p.token_id
      WHERE (t.buyer_hedera_account = $1 OR t.seller_hedera_account = $1)
    `;

    const params: any[] = [investor.hedera_account_id];
    let paramCount = 1;

    if (transactionType) {
      paramCount++;
      queryText += ` AND t.transaction_type = $${paramCount}`;
      params.push(transactionType);
    }

    if (status) {
      paramCount++;
      queryText += ` AND t.status = $${paramCount}`;
      params.push(status);
    }

    queryText += ` ORDER BY t.created_at DESC`;

    paramCount++;
    queryText += ` LIMIT $${paramCount}`;
    params.push(parseInt(limit as string));

    paramCount++;
    queryText += ` OFFSET $${paramCount}`;
    params.push(parseInt(offset as string));

    const result = await query(queryText, params);

    // Format transactions
    const transactions = result.rows.map((tx: any) => ({
      transactionId: tx.transaction_id,
      listingId: tx.listing_id,
      propertyName: tx.property_name,
      collectionSymbol: tx.collection_symbol,
      tokenId: tx.token_id,
      serialNumbers: tx.serial_numbers,
      quantity: tx.quantity,
      pricePerNFT: parseFloat(tx.price_per_nft),
      totalPrice: parseFloat(tx.total_price),
      currency: tx.currency,
      transactionType: tx.transaction_type,
      role: tx.buyer_hedera_account === investor.hedera_account_id ? 'buyer' : 'seller',
      counterparty: tx.buyer_hedera_account === investor.hedera_account_id
        ? tx.seller_hedera_account
        : tx.buyer_hedera_account,
      status: tx.status,
      createdAt: tx.created_at,
      completedAt: tx.completed_at,
      location: `${tx.city}, ${tx.country}`,
    }));

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM marketplace_transactions t
      WHERE (t.buyer_hedera_account = $1 OR t.seller_hedera_account = $1)
      ${transactionType ? ` AND t.transaction_type = $2` : ''}
      ${status ? ` AND t.status = $${transactionType ? '3' : '2'}` : ''}
    `;

    const countParams = [investor.hedera_account_id];
    if (transactionType) countParams.push(transactionType);
    if (status) countParams.push(status);

    const countResult = await query(countQuery, countParams);
    const totalTransactions = parseInt(countResult.rows[0].total);

    res.json({
      success: true,
      data: {
        investorId: investor.id,
        investorName: investor.full_name,
        hederaAccountId: investor.hedera_account_id,
        transactions,
        pagination: {
          total: totalTransactions,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          hasMore: parseInt(offset as string) + transactions.length < totalTransactions,
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching investor transactions:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: error.message || 'Failed to fetch investor transactions',
      },
    });
  }
};

export default {
  registerInvestor,
  getInvestorProfile,
  submitKYC,
  getInvestorTransactions,
};
