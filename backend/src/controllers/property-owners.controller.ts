/**
 * Property Owners Controller
 * Handles property owner registration and verification
 */

import { Request, Response } from 'express';
import { query } from '../config/database';

// POST /api/v1/property-owners/register - Register as property owner
export const registerPropertyOwner = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const {
      hederaAccountId,
      email,
      fullName,
      country,
      ownerType = 'individual',
      companyName,
      companyRegistrationNumber,
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

    // Check if property owner already exists
    const existingQuery = `
      SELECT id, hedera_account_id, email FROM property_owners
      WHERE hedera_account_id = $1 OR email = $2
    `;

    const existingResult = await query(existingQuery, [hederaAccountId, email]);

    if (existingResult.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'OWNER_EXISTS',
          message: 'Property owner already registered with this Hedera account or email',
          data: {
            existingAccount: existingResult.rows[0].hedera_account_id,
          },
        },
      });
    }

    // Insert new property owner
    console.log('🏠 Registering new property owner...');
    const insertQuery = `
      INSERT INTO property_owners (
        hedera_account_id, email, full_name, country,
        owner_type, company_name, company_registration_number,
        verification_status, registered_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, hedera_account_id, email, full_name, country,
                owner_type, company_name, verification_status, registered_at
    `;

    const result = await query(insertQuery, [
      hederaAccountId,
      email,
      fullName,
      country,
      ownerType,
      companyName || null,
      companyRegistrationNumber || null,
      'pending',
      new Date(),
    ]);

    const owner = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Property owner registered successfully',
      data: {
        ownerId: owner.id,
        hederaAccountId: owner.hedera_account_id,
        email: owner.email,
        fullName: owner.full_name,
        country: owner.country,
        ownerType: owner.owner_type,
        companyName: owner.company_name,
        verificationStatus: owner.verification_status,
        registeredAt: owner.registered_at,
        nextSteps: {
          step1: 'Submit KYC and property ownership documents',
          step2: 'Wait for admin verification',
          step3: 'Receive property-owner verification NFT',
          step4: 'Start minting property NFTs',
        },
      },
    });
  } catch (error: any) {
    console.error('Error registering property owner:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REGISTRATION_ERROR',
        message: error.message || 'Failed to register property owner',
      },
    });
  }
};

// POST /api/v1/property-owners/:id/verification - Submit verification documents
export const submitVerificationDocuments = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;
    const {
      // KYC documents
      governmentIdCID,
      proofOfAddressCID,
      selfieWithIdCID,

      // Property documents
      titleDeedCID,
      propertyAppraisalCID,
      propertyPhotosCIDs,
      taxReceiptCID,
      mortgageDocumentCID,

      // Property details
      propertyAddress,
      propertyCity,
      propertyCountry,
      propertyValue,
      propertyType,
      additionalNotes,
    } = req.body;

    // Validation
    if (!id || !governmentIdCID || !proofOfAddressCID || !titleDeedCID || !propertyAddress) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Missing required fields: governmentIdCID, proofOfAddressCID, titleDeedCID, propertyAddress',
        },
      });
    }

    // Check if property owner exists
    const ownerQuery = `
      SELECT id, hedera_account_id, email, full_name, verification_status
      FROM property_owners
      WHERE id = $1 OR hedera_account_id = $1
    `;

    const ownerResult = await query(ownerQuery, [id]);

    if (ownerResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'OWNER_NOT_FOUND',
          message: 'Property owner not found',
        },
      });
    }

    const owner = ownerResult.rows[0];

    // Insert verification submission
    console.log('📝 Submitting property owner verification documents...');
    const insertQuery = `
      INSERT INTO property_owner_verifications (
        owner_id, government_id_cid, proof_of_address_cid, selfie_with_id_cid,
        title_deed_cid, property_appraisal_cid, property_photos_cids,
        tax_receipt_cid, mortgage_document_cid,
        property_address, property_city, property_country,
        property_value, property_type, additional_notes,
        status, submitted_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING id, owner_id, property_address, property_value, status, submitted_at
    `;

    const result = await query(insertQuery, [
      owner.id,
      governmentIdCID,
      proofOfAddressCID,
      selfieWithIdCID || null,
      titleDeedCID,
      propertyAppraisalCID || null,
      propertyPhotosCIDs || [],
      taxReceiptCID || null,
      mortgageDocumentCID || null,
      propertyAddress,
      propertyCity || null,
      propertyCountry || null,
      propertyValue || null,
      propertyType || null,
      additionalNotes || null,
      'pending',
      new Date(),
    ]);

    const verification = result.rows[0];

    // Update property owner status
    await query(
      `UPDATE property_owners SET verification_status = 'pending', updated_at = NOW() WHERE id = $1`,
      [owner.id]
    );

    res.status(201).json({
      success: true,
      message: 'Verification documents submitted successfully',
      data: {
        verificationId: verification.id,
        ownerId: verification.owner_id,
        ownerName: owner.full_name,
        propertyAddress: verification.property_address,
        propertyValue: verification.property_value,
        status: verification.status,
        submittedAt: verification.submitted_at,
        documents: {
          governmentId: `https://gateway.pinata.cloud/ipfs/${governmentIdCID}`,
          proofOfAddress: `https://gateway.pinata.cloud/ipfs/${proofOfAddressCID}`,
          titleDeed: `https://gateway.pinata.cloud/ipfs/${titleDeedCID}`,
        },
        nextSteps: {
          step1: 'Documents will be reviewed by compliance team',
          step2: 'Review typically takes 2-5 business days',
          step3: 'You will be notified via email once verification is complete',
          step4: 'Upon approval, you will receive a property-owner verification NFT',
        },
      },
    });
  } catch (error: any) {
    console.error('Error submitting verification documents:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SUBMISSION_ERROR',
        message: error.message || 'Failed to submit verification documents',
      },
    });
  }
};

// GET /api/v1/property-owners/:id/verification-status - Check verification status
export const getVerificationStatus = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;

    // Get property owner details
    const ownerQuery = `
      SELECT
        id, hedera_account_id, email, full_name,
        verification_status, verification_nft_token_id,
        verification_nft_serial, verified_at, registered_at
      FROM property_owners
      WHERE id = $1 OR hedera_account_id = $1
    `;

    const ownerResult = await query(ownerQuery, [id]);

    if (ownerResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'OWNER_NOT_FOUND',
          message: 'Property owner not found',
        },
      });
    }

    const owner = ownerResult.rows[0];

    // Get latest verification submission
    const verificationQuery = `
      SELECT
        id, property_address, property_value, status,
        submitted_at, reviewed_at, rejection_reason
      FROM property_owner_verifications
      WHERE owner_id = $1
      ORDER BY submitted_at DESC
      LIMIT 1
    `;

    const verificationResult = await query(verificationQuery, [owner.id]);
    const verification = verificationResult.rows[0] || null;

    const hasVerificationNFT = owner.verification_status === 'verified' && owner.verification_nft_token_id;

    res.json({
      success: true,
      data: {
        ownerId: owner.id,
        hederaAccountId: owner.hedera_account_id,
        fullName: owner.full_name,
        verificationStatus: owner.verification_status,
        hasVerificationNFT,
        canMintProperties: hasVerificationNFT,
        verificationNFT: hasVerificationNFT ? {
          tokenId: owner.verification_nft_token_id,
          serialNumber: owner.verification_nft_serial,
          verifiedAt: owner.verified_at,
        } : null,
        latestSubmission: verification ? {
          verificationId: verification.id,
          propertyAddress: verification.property_address,
          propertyValue: verification.property_value,
          status: verification.status,
          submittedAt: verification.submitted_at,
          reviewedAt: verification.reviewed_at,
          rejectionReason: verification.rejection_reason,
        } : null,
        registeredAt: owner.registered_at,
      },
    });
  } catch (error: any) {
    console.error('Error getting verification status:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: error.message || 'Failed to get verification status',
      },
    });
  }
};

export default {
  registerPropertyOwner,
  submitVerificationDocuments,
  getVerificationStatus,
};
