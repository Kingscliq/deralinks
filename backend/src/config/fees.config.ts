/**
 * Platform Fees Configuration
 * All percentages and fixed fees for revenue generation
 *
 * Fees can be configured via environment variables:
 * - MINTING_BASE_FEE: Base minting fee in USD (default: 50)
 * - MINTING_PER_NFT_FEE: Per-NFT minting fee in USD (default: 0.5)
 * - PRIMARY_SALE_COMMISSION: Primary sale commission % (default: 10)
 * - PLATFORM_TRANSACTION_FEE: Platform transaction fee % (default: 2.5)
 * - LISTING_FEE_STANDARD: Standard listing fee in USD (default: 25)
 * - LISTING_FEE_PREMIUM: Premium listing fee in USD (default: 100)
 * - LISTING_FEE_DURATION: Listing duration in days (default: 90)
 * - ROYALTY_FEE: NFT royalty fee % (default: 5)
 */

export const PLATFORM_FEES = {
  // Phase 1: Minting Fees (Upfront Revenue)
  MINTING_FEE: {
    BASE_FEE: parseFloat(process.env.MINTING_BASE_FEE || '50'), // $50 base fee in USD
    PER_NFT_FEE: parseFloat(process.env.MINTING_PER_NFT_FEE || '0.5'), // $0.50 per NFT
    CALCULATION: (totalSupply: number) => {
      // Base fee + per NFT fee
      return PLATFORM_FEES.MINTING_FEE.BASE_FEE + (totalSupply * PLATFORM_FEES.MINTING_FEE.PER_NFT_FEE);
    }
  },

  // Phase 1: Primary Sale Commission (First Sale Revenue)
  PRIMARY_SALE_COMMISSION: parseFloat(process.env.PRIMARY_SALE_COMMISSION || '10'), // 10% commission on first sale from treasury

  // Phase 2: Platform Transaction Fee (Marketplace Sales)
  PLATFORM_TRANSACTION_FEE: parseFloat(process.env.PLATFORM_TRANSACTION_FEE || '2.5'), // 2.5% fee on all platform transactions

  // Phase 2: Listing Fees
  LISTING_FEE: {
    STANDARD: parseFloat(process.env.LISTING_FEE_STANDARD || '25'), // $25 to list on marketplace
    PREMIUM: parseFloat(process.env.LISTING_FEE_PREMIUM || '100'), // $100 for premium listing (featured)
    DURATION_DAYS: parseInt(process.env.LISTING_FEE_DURATION || '90'), // Standard listing duration
  },

  // Existing: Royalty Fee (Secondary Sales - built into NFT)
  ROYALTY_FEE: parseFloat(process.env.ROYALTY_FEE || '5'), // 5% on all secondary sales (enforced by Hedera)

  // Fee Collection Account
  FEE_COLLECTOR_ACCOUNT: process.env.FEE_COLLECTOR_ACCOUNT_ID || process.env.OPERATOR_ID,
};

/**
 * Calculate minting fee in USD
 */
export function calculateMintingFee(totalSupply: number): number {
  return PLATFORM_FEES.MINTING_FEE.CALCULATION(totalSupply);
}

/**
 * Calculate primary sale commission in USD
 */
export function calculatePrimarySaleCommission(salePrice: number): number {
  return (salePrice * PLATFORM_FEES.PRIMARY_SALE_COMMISSION) / 100;
}

/**
 * Calculate platform transaction fee in USD
 */
export function calculatePlatformTransactionFee(transactionAmount: number): number {
  return (transactionAmount * PLATFORM_FEES.PLATFORM_TRANSACTION_FEE) / 100;
}

/**
 * Calculate total fees for property owner
 */
export function calculateTotalPropertyOwnerFees(totalSupply: number, tokenPrice: number, quantity: number): {
  mintingFee: number;
  primarySaleCommission: number;
  totalUpfrontFee: number;
  netRevenueFromSale: number;
  grossRevenue: number;
} {
  const mintingFee = calculateMintingFee(totalSupply);
  const grossRevenue = tokenPrice * quantity;
  const primarySaleCommission = calculatePrimarySaleCommission(grossRevenue);
  const totalUpfrontFee = mintingFee;
  const netRevenueFromSale = grossRevenue - primarySaleCommission;

  return {
    mintingFee,
    primarySaleCommission,
    totalUpfrontFee,
    netRevenueFromSale,
    grossRevenue,
  };
}

export default PLATFORM_FEES;
