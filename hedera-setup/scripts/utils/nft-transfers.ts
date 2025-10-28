import {
  Client,
  TransferTransaction,
  TokenAssociateTransaction,
  TokenGrantKycTransaction,
  PrivateKey,
  AccountId,
  Hbar,
  TransactionReceipt,
} from "@hashgraph/sdk";

/**
 * NFT Transfer Utilities
 *
 * Reusable functions for transferring NFTs on Hedera.
 * These utilities can be used in:
 * - Backend API endpoints
 * - Marketplace purchase flows
 * - Admin scripts
 * - Testing
 */

export interface NFTTransferResult {
  success: boolean;
  transactionId: string;
  serialNumbers: number[];
  receipt?: TransactionReceipt;
  error?: string;
}

export interface BatchTransferOptions {
  tokenId: string;
  serialNumbers: number[];
  fromAccountId: string;
  toAccountId: string;
  fromPrivateKey: PrivateKey;
  priceInHbar?: number; // Optional: Total price for all NFTs
}

export interface SingleTransferOptions {
  tokenId: string;
  serialNumber: number;
  fromAccountId: string;
  toAccountId: string;
  fromPrivateKey: PrivateKey;
  priceInHbar?: number;
}

/**
 * Associate an account with a token
 * Handles TOKEN_ALREADY_ASSOCIATED error gracefully
 */
export async function associateToken(
  client: Client,
  accountId: AccountId | string,
  tokenId: string,
  accountPrivateKey: PrivateKey
): Promise<boolean> {
  try {
    const accountIdObj = typeof accountId === "string"
      ? AccountId.fromString(accountId)
      : accountId;

    const associateTx = new TokenAssociateTransaction()
      .setAccountId(accountIdObj)
      .setTokenIds([tokenId])
      .freezeWith(client);

    const signedTx = await associateTx.sign(accountPrivateKey);
    const response = await signedTx.execute(client);
    await response.getReceipt(client);

    return true;
  } catch (error: any) {
    // Code 194: TOKEN_ALREADY_ASSOCIATED_TO_ACCOUNT (not an error)
    if (error.status && error.status._code === 194) {
      return true;
    }
    throw error;
  }
}

/**
 * Grant KYC to an account for a token
 * Handles ACCOUNT_KYC_ALREADY_GRANTED error gracefully
 */
export async function grantKYC(
  client: Client,
  accountId: AccountId | string,
  tokenId: string,
  kycPrivateKey: PrivateKey
): Promise<boolean> {
  try {
    const accountIdObj = typeof accountId === "string"
      ? AccountId.fromString(accountId)
      : accountId;

    const kycTx = new TokenGrantKycTransaction()
      .setAccountId(accountIdObj)
      .setTokenId(tokenId)
      .freezeWith(client);

    const signedTx = await kycTx.sign(kycPrivateKey);
    const response = await signedTx.execute(client);
    await response.getReceipt(client);

    return true;
  } catch (error: any) {
    // Code 179: ACCOUNT_KYC_ALREADY_GRANTED (not an error)
    if (error.status && error.status._code === 179) {
      return true;
    }
    throw error;
  }
}

/**
 * Transfer a single NFT from one account to another
 *
 * @param client - Hedera client instance
 * @param options - Transfer options
 * @returns Transfer result with transaction details
 */
export async function transferSingleNFT(
  client: Client,
  options: SingleTransferOptions
): Promise<NFTTransferResult> {
  try {
    const {
      tokenId,
      serialNumber,
      fromAccountId,
      toAccountId,
      fromPrivateKey,
      priceInHbar,
    } = options;

    // Create transfer transaction
    const transferTx = new TransferTransaction()
      .addNftTransfer(tokenId, serialNumber, fromAccountId, toAccountId);

    // Add HBAR payment if specified
    if (priceInHbar && priceInHbar > 0) {
      const price = new Hbar(priceInHbar);
      transferTx.addHbarTransfer(toAccountId, price.negated());
      transferTx.addHbarTransfer(fromAccountId, price);
    }

    // Freeze, sign, and execute
    const frozenTx = transferTx.freezeWith(client);
    const signedTx = await frozenTx.sign(fromPrivateKey);
    const response = await signedTx.execute(client);
    const receipt = await response.getReceipt(client);

    return {
      success: true,
      transactionId: response.transactionId.toString(),
      serialNumbers: [serialNumber],
      receipt,
    };
  } catch (error: any) {
    return {
      success: false,
      transactionId: "",
      serialNumbers: [options.serialNumber],
      error: error.message || "Transfer failed",
    };
  }
}

/**
 * Transfer multiple NFTs in a single atomic transaction
 * This is the RECOMMENDED approach for marketplace purchases
 *
 * Benefits:
 * - Single transaction fee (cheaper)
 * - Atomic operation (all or nothing)
 * - Faster execution
 *
 * @param client - Hedera client instance
 * @param options - Batch transfer options
 * @returns Transfer result with transaction details
 */
export async function batchTransferNFTs(
  client: Client,
  options: BatchTransferOptions
): Promise<NFTTransferResult> {
  try {
    const {
      tokenId,
      serialNumbers,
      fromAccountId,
      toAccountId,
      fromPrivateKey,
      priceInHbar,
    } = options;

    if (serialNumbers.length === 0) {
      throw new Error("Serial numbers array cannot be empty");
    }

    // Create batch transfer transaction
    const transferTx = new TransferTransaction();

    // Add each NFT transfer
    serialNumbers.forEach((serial) => {
      transferTx.addNftTransfer(tokenId, serial, fromAccountId, toAccountId);
    });

    // Add HBAR payment if specified
    if (priceInHbar && priceInHbar > 0) {
      const price = new Hbar(priceInHbar);
      transferTx.addHbarTransfer(toAccountId, price.negated());
      transferTx.addHbarTransfer(fromAccountId, price);
    }

    // Freeze, sign, and execute
    const frozenTx = transferTx.freezeWith(client);
    const signedTx = await frozenTx.sign(fromPrivateKey);
    const response = await signedTx.execute(client);
    const receipt = await response.getReceipt(client);

    return {
      success: true,
      transactionId: response.transactionId.toString(),
      serialNumbers,
      receipt,
    };
  } catch (error: any) {
    return {
      success: false,
      transactionId: "",
      serialNumbers: options.serialNumbers,
      error: error.message || "Batch transfer failed",
    };
  }
}

/**
 * Get available NFT serials for a token from treasury
 * In production, this would query the Mirror Node API
 *
 * @param tokenId - Token/Collection ID
 * @param quantity - Number of NFTs needed
 * @returns Array of available serial numbers
 */
export async function getAvailableNFTSerials(
  tokenId: string,
  quantity: number
): Promise<number[]> {
  // TODO: Implement Mirror Node API call to get available serials
  // For now, return sequential serials
  // In production, query: GET /api/v1/tokens/${tokenId}/nfts?account.id=${treasuryId}

  return Array.from({ length: quantity }, (_, i) => i + 1);
}

/**
 * Calculate total price for multiple NFTs
 *
 * @param pricePerNFT - Price per NFT in HBAR
 * @param quantity - Number of NFTs
 * @returns Total price in HBAR
 */
export function calculateTotalPrice(
  pricePerNFT: number,
  quantity: number
): number {
  return pricePerNFT * quantity;
}

/**
 * Complete purchase flow: Associate, Grant KYC, Transfer
 * This is the full flow for marketplace purchases
 *
 * @param client - Hedera client instance
 * @param buyerAccountId - Buyer's account ID
 * @param buyerPrivateKey - Buyer's private key (for association)
 * @param tokenId - Token/Collection ID
 * @param kycPrivateKey - KYC key for the collection
 * @param transferOptions - Transfer options
 * @returns Transfer result
 */
export async function completePurchaseFlow(
  client: Client,
  buyerAccountId: string,
  buyerPrivateKey: PrivateKey,
  tokenId: string,
  kycPrivateKey: PrivateKey,
  transferOptions: BatchTransferOptions
): Promise<NFTTransferResult> {
  try {
    // Step 1: Associate buyer with token
    await associateToken(client, buyerAccountId, tokenId, buyerPrivateKey);

    // Step 2: Grant KYC to buyer
    await grantKYC(client, buyerAccountId, tokenId, kycPrivateKey);

    // Step 3: Transfer NFTs
    const result = await batchTransferNFTs(client, transferOptions);

    return result;
  } catch (error: any) {
    return {
      success: false,
      transactionId: "",
      serialNumbers: transferOptions.serialNumbers,
      error: error.message || "Purchase flow failed",
    };
  }
}
