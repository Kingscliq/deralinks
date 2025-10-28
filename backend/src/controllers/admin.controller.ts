/**
 * Admin Controller
 * Handles admin operations for KYC/verification approvals
 */

import { Request, Response } from 'express';
import { query } from '../config/database';
import { mintVerificationNFT } from '../services/hedera.service';

// POST /api/v1/admin/investors/:id/approve-kyc - Approve investor KYC
export const approveInvestorKYC = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;
    const { notes, verificationType = 'investor' } = req.body;

    // Get investor details
    const investorQuery = `
      SELECT id, hedera_account_id, full_name, email, kyc_status
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

    // Update KYC submission status
    await query(
      `UPDATE kyc_submissions
       SET status = 'approved', reviewed_at = NOW(), admin_notes = $1
       WHERE investor_id = $2 AND status = 'pending'`,
      [notes || 'KYC approved by admin', investor.id]
    );

    // Mint verification NFT
    console.log(`🪙 Minting verification NFT for investor ${investor.hedera_account_id}...`);

    const verificationNFT = await mintVerificationNFT({
      verificationType,
      recipientAccountId: investor.hedera_account_id,
      metadata: {
        name: `${verificationType} Verification`,
        type: 'verification',
        holder: investor.full_name,
        verifiedAt: new Date().toISOString(),
      },
    });

    // Update investor status
    await query(
      `UPDATE investors
       SET kyc_status = 'verified',
           kyc_verified_at = NOW(),
           verification_nft_token_id = $1,
           verification_nft_serial = $2,
           updated_at = NOW()
       WHERE id = $3`,
      [verificationNFT.tokenId, verificationNFT.serialNumber, investor.id]
    );

    res.json({
      success: true,
      message: 'Investor KYC approved successfully',
      data: {
        investorId: investor.id,
        investorName: investor.full_name,
        hederaAccountId: investor.hedera_account_id,
        kycStatus: 'verified',
        verificationNFT: {
          tokenId: verificationNFT.tokenId,
          serialNumber: verificationNFT.serialNumber,
          transactionId: verificationNFT.transactionId,
        },
        approvedAt: new Date(),
      },
    });
  } catch (error: any) {
    console.error('Error approving investor KYC:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'APPROVAL_ERROR',
        message: error.message || 'Failed to approve investor KYC',
      },
    });
  }
};

// POST /api/v1/admin/investors/:id/reject-kyc - Reject investor KYC
export const rejectInvestorKYC = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Rejection reason is required',
        },
      });
    }

    // Get investor details
    const investorQuery = `
      SELECT id, full_name, email FROM investors
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

    // Update KYC submission status
    await query(
      `UPDATE kyc_submissions
       SET status = 'rejected', reviewed_at = NOW(), rejection_reason = $1
       WHERE investor_id = $2 AND status = 'pending'`,
      [reason, investor.id]
    );

    // Update investor status
    await query(
      `UPDATE investors
       SET kyc_status = 'rejected', updated_at = NOW()
       WHERE id = $1`,
      [investor.id]
    );

    res.json({
      success: true,
      message: 'Investor KYC rejected',
      data: {
        investorId: investor.id,
        investorName: investor.full_name,
        kycStatus: 'rejected',
        rejectionReason: reason,
        rejectedAt: new Date(),
      },
    });
  } catch (error: any) {
    console.error('Error rejecting investor KYC:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REJECTION_ERROR',
        message: error.message || 'Failed to reject investor KYC',
      },
    });
  }
};

// POST /api/v1/admin/property-owners/:id/approve - Approve property owner verification
export const approvePropertyOwner = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    // Get property owner details
    const ownerQuery = `
      SELECT id, hedera_account_id, full_name, email, verification_status
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

    // Update verification submission status
    await query(
      `UPDATE property_owner_verifications
       SET status = 'approved', reviewed_at = NOW(), admin_notes = $1
       WHERE owner_id = $2 AND status = 'pending'`,
      [notes || 'Verification approved by admin', owner.id]
    );

    // Mint property-owner verification NFT
    console.log(`🏠 Minting property-owner verification NFT for ${owner.hedera_account_id}...`);

    const verificationNFT = await mintVerificationNFT({
      verificationType: 'property-owner',
      recipientAccountId: owner.hedera_account_id,
      metadata: {
        name: 'Property Owner Verification',
        type: 'verification',
        holder: owner.full_name,
        verifiedAt: new Date().toISOString(),
      },
    });

    // Update property owner status
    await query(
      `UPDATE property_owners
       SET verification_status = 'verified',
           verified_at = NOW(),
           verification_nft_token_id = $1,
           verification_nft_serial = $2,
           updated_at = NOW()
       WHERE id = $3`,
      [verificationNFT.tokenId, verificationNFT.serialNumber, owner.id]
    );

    res.json({
      success: true,
      message: 'Property owner verification approved successfully',
      data: {
        ownerId: owner.id,
        ownerName: owner.full_name,
        hederaAccountId: owner.hedera_account_id,
        verificationStatus: 'verified',
        canMintProperties: true,
        verificationNFT: {
          tokenId: verificationNFT.tokenId,
          serialNumber: verificationNFT.serialNumber,
          transactionId: verificationNFT.transactionId,
        },
        approvedAt: new Date(),
      },
    });
  } catch (error: any) {
    console.error('Error approving property owner:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'APPROVAL_ERROR',
        message: error.message || 'Failed to approve property owner verification',
      },
    });
  }
};

// POST /api/v1/admin/property-owners/:id/reject - Reject property owner verification
export const rejectPropertyOwner = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Rejection reason is required',
        },
      });
    }

    // Get property owner details
    const ownerQuery = `
      SELECT id, full_name, email FROM property_owners
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

    // Update verification submission status
    await query(
      `UPDATE property_owner_verifications
       SET status = 'rejected', reviewed_at = NOW(), rejection_reason = $1
       WHERE owner_id = $2 AND status = 'pending'`,
      [reason, owner.id]
    );

    // Update property owner status
    await query(
      `UPDATE property_owners
       SET verification_status = 'rejected', updated_at = NOW()
       WHERE id = $1`,
      [owner.id]
    );

    res.json({
      success: true,
      message: 'Property owner verification rejected',
      data: {
        ownerId: owner.id,
        ownerName: owner.full_name,
        verificationStatus: 'rejected',
        rejectionReason: reason,
        rejectedAt: new Date(),
      },
    });
  } catch (error: any) {
    console.error('Error rejecting property owner:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REJECTION_ERROR',
        message: error.message || 'Failed to reject property owner verification',
      },
    });
  }
};

// GET /api/v1/admin/pending-verifications - Get all pending verifications
export const getPendingVerifications = async (
  _req: Request,
  res: Response
): Promise<any> => {
  try {
    // Get pending investor KYC submissions
    const investorsQuery = `
      SELECT
        i.id as investor_id,
        i.hedera_account_id,
        i.full_name,
        i.email,
        i.country,
        k.id as submission_id,
        k.document_type,
        k.document_cid,
        k.submitted_at,
        'investor' as verification_type
      FROM investors i
      INNER JOIN kyc_submissions k ON i.id = k.investor_id
      WHERE k.status = 'pending'
      ORDER BY k.submitted_at ASC
    `;

    const investorsResult = await query(investorsQuery);

    // Get pending property owner verifications
    const ownersQuery = `
      SELECT
        po.id as owner_id,
        po.hedera_account_id,
        po.full_name,
        po.email,
        po.country,
        pov.id as verification_id,
        pov.property_address,
        pov.property_value,
        pov.title_deed_cid,
        pov.submitted_at,
        'property-owner' as verification_type
      FROM property_owners po
      INNER JOIN property_owner_verifications pov ON po.id = pov.owner_id
      WHERE pov.status = 'pending'
      ORDER BY pov.submitted_at ASC
    `;

    const ownersResult = await query(ownersQuery);

    res.json({
      success: true,
      data: {
        pendingInvestors: investorsResult.rows,
        pendingPropertyOwners: ownersResult.rows,
        totalPending: investorsResult.rows.length + ownersResult.rows.length,
      },
    });
  } catch (error: any) {
    console.error('Error getting pending verifications:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: error.message || 'Failed to get pending verifications',
      },
    });
  }
};

export default {
  approveInvestorKYC,
  rejectInvestorKYC,
  approvePropertyOwner,
  rejectPropertyOwner,
  getPendingVerifications,
};
