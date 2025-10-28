import {
  Client,
  TransferTransaction,
  TokenAssociateTransaction,
  TokenGrantKycTransaction,
  PrivateKey,
  AccountId,
  Hbar,
} from "@hashgraph/sdk";
import { createClient } from "./utils/client";
import { log } from "./utils/helpers";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

/**
 * Batch NFT Transfer Script
 *
 * Transfers multiple NFTs from one account to another in a SINGLE transaction.
 * This is the recommended approach for marketplace purchases where users buy
 * multiple shares of a property at once.
 *
 * Benefits:
 * - Single transaction fee (cheaper than multiple individual transfers)
 * - Atomic operation (all NFTs transfer or none)
 * - Faster execution
 * - Better user experience
 *
 * Usage:
 * npm run batch:transfer <recipient_account_id> <quantity>
 *
 * Example:
 * npm run batch:transfer 0.0.7125108 3
 * This will transfer 3 NFTs (serials 1, 2, 3) from treasury to the recipient
 */

dotenv.config();

interface BatchTransferParams {
  tokenId: string;
  collectionName: string;
  propertyName: string;
  serialNumbers: number[];
  fromAccountId: string;
  toAccountId: string;
  fromPrivateKey: PrivateKey; // Private key of the from account
  pricePerNFT?: number; // Optional: Price in HBAR per NFT
}

/**
 * Get operator private key
 */
function getOperatorKey(): PrivateKey {
  const operatorKey = process.env.OPERATOR_KEY;
  if (!operatorKey) {
    throw new Error("OPERATOR_KEY not found in .env");
  }
  return PrivateKey.fromString(operatorKey);
}

/**
 * Associate account with token if needed
 */
async function ensureTokenAssociation(
  client: Client,
  accountId: AccountId,
  tokenId: string,
  accountKey: PrivateKey
): Promise<void> {
  try {
    const associateTx = new TokenAssociateTransaction()
      .setAccountId(accountId)
      .setTokenIds([tokenId])
      .freezeWith(client);

    const signedAssociateTx = await associateTx.sign(accountKey);
    const associateResponse = await signedAssociateTx.execute(client);
    await associateResponse.getReceipt(client);

    log(`   ✅ Token associated!`);
  } catch (error: any) {
    if (error.status && (error.status._code === 194 || error.status._code === 25)) {
      // Code 194: TOKEN_ALREADY_ASSOCIATED_TO_ACCOUNT
      // Code 25: TOKEN_NOT_ASSOCIATED_TO_ACCOUNT (shouldn't happen but handle anyway)
      log("   ✅ Token already associated!");
    } else {
      throw error;
    }
  }
}

/**
 * Grant KYC to account if needed
 */
async function ensureKYCGranted(
  client: Client,
  accountId: AccountId,
  tokenId: string,
  kycKey: PrivateKey
): Promise<void> {
  try {
    const kycTx = new TokenGrantKycTransaction()
      .setAccountId(accountId)
      .setTokenId(tokenId)
      .freezeWith(client);

    const signedKycTx = await kycTx.sign(kycKey);
    const kycResponse = await signedKycTx.execute(client);
    await kycResponse.getReceipt(client);

    log(`   ✅ KYC granted!`);
  } catch (error: any) {
    if (error.status && error.status._code === 179) {
      // Code 179: ACCOUNT_KYC_ALREADY_GRANTED
      log("   ✅ KYC already granted!");
    } else {
      throw error;
    }
  }
}

/**
 * Batch transfer multiple NFTs in a single transaction
 */
async function batchTransferNFTs(
  client: Client,
  params: BatchTransferParams
): Promise<void> {
  const {
    tokenId,
    collectionName,
    propertyName,
    serialNumbers,
    fromAccountId,
    toAccountId,
    pricePerNFT,
  } = params;

  console.log(`\n📦 Batch Transfer Details:`);
  console.log(`   Collection: ${collectionName}`);
  console.log(`   Property: ${propertyName}`);
  console.log(`   Token ID: ${tokenId}`);
  console.log(`   Serial Numbers: [${serialNumbers.join(", ")}]`);
  console.log(`   Quantity: ${serialNumbers.length} NFTs`);
  console.log(`   From: ${fromAccountId}`);
  console.log(`   To: ${toAccountId}`);

  if (pricePerNFT) {
    const totalPrice = pricePerNFT * serialNumbers.length;
    console.log(`   Price per NFT: ${pricePerNFT} HBAR`);
    console.log(`   Total Price: ${totalPrice} HBAR`);
  }

  // Create the batch transfer transaction
  console.log("\n📤 Creating batch transfer transaction...");
  const transferTx = new TransferTransaction();

  // Add each NFT transfer
  serialNumbers.forEach((serial) => {
    transferTx.addNftTransfer(tokenId, serial, fromAccountId, toAccountId);
  });

  // Add HBAR payment if price is specified
  if (pricePerNFT) {
    const totalPrice = new Hbar(pricePerNFT * serialNumbers.length);
    transferTx.addHbarTransfer(toAccountId, totalPrice.negated());
    transferTx.addHbarTransfer(fromAccountId, totalPrice);
  }

  // Freeze and sign the transaction
  const frozenTx = transferTx.freezeWith(client);

  // Sign with the from account's private key
  const signedTx = await frozenTx.sign(params.fromPrivateKey);

  // Execute the transaction
  console.log("\n⏳ Executing batch transfer...");
  const transferResponse = await signedTx.execute(client);
  const transferReceipt = await transferResponse.getReceipt(client);

  console.log("\n✅ Batch Transfer Successful!");
  log(`   📊 Status: ${transferReceipt.status.toString()}`);
  log(`   🔗 Transaction ID: ${transferResponse.transactionId.toString()}`);
  console.log(
    `   🔍 View on HashScan: https://hashscan.io/testnet/transaction/${transferResponse.transactionId.toString()}`
  );

  // Display transferred NFTs
  console.log(`\n📋 Transferred NFTs:`);
  serialNumbers.forEach((serial) => {
    console.log(`   • Serial #${serial} → ${toAccountId}`);
  });

  console.log(
    `\n💼 Check recipient's portfolio: https://hashscan.io/testnet/account/${toAccountId}`
  );
}

async function main() {
  console.log("\n🚀 Batch NFT Transfer\n");
  console.log("=".repeat(60));

  // Get command line arguments
  const recipientArg = process.argv[2];
  const quantityArg = process.argv[3];

  if (!recipientArg || !quantityArg) {
    console.log("\n❌ Error: Missing arguments\n");
    console.log("Usage: npm run batch:transfer <recipient_account_id> <quantity>\n");
    console.log("Example: npm run batch:transfer 0.0.7125108 3\n");
    console.log("This will transfer 3 NFTs to the specified account.\n");
    process.exit(1);
  }

  const quantity = parseInt(quantityArg);
  if (isNaN(quantity) || quantity < 1) {
    console.log("\n❌ Error: Quantity must be a positive number\n");
    process.exit(1);
  }

  try {
    const client = createClient();

    const recipientId = AccountId.fromString(recipientArg);

    // Load collections data
    const collectionsPath = path.join(process.cwd(), "output", "collections.json");
    if (!fs.existsSync(collectionsPath)) {
      throw new Error("Collections file not found. Run setup:collections first.");
    }
    const collections = JSON.parse(fs.readFileSync(collectionsPath, "utf-8"));

    // Load accounts data
    const accountsPath = path.join(process.cwd(), "output", "accounts.json");
    if (!fs.existsSync(accountsPath)) {
      throw new Error("Accounts file not found. Run setup:accounts first.");
    }
    const accounts = JSON.parse(fs.readFileSync(accountsPath, "utf-8"));

    // For this example, we'll use the Agriculture collection
    const tokenId = collections.agriculture.tokenId;
    const treasuryId = accounts.treasury.accountId;
    const treasuryKey = PrivateKey.fromString(accounts.treasury.privateKey);
    const kycKey = PrivateKey.fromString(collections.agriculture.kycKey);

    // Generate serial numbers to transfer (1, 2, 3, ...)
    const serialNumbers = Array.from({ length: quantity }, (_, i) => i + 1);

    // Step 1: Associate recipient with token
    console.log("📎 Step 1: Ensuring token association...");
    const recipientKey = getOperatorKey(); // In production, recipient signs this
    await ensureTokenAssociation(client, recipientId, tokenId, recipientKey);

    // Step 2: Grant KYC to recipient
    console.log("\n✅ Step 2: Ensuring KYC is granted...");
    await ensureKYCGranted(client, recipientId, tokenId, kycKey);

    // Step 3: Batch transfer NFTs
    console.log("\n📦 Step 3: Batch transferring NFTs...");
    await batchTransferNFTs(client, {
      tokenId,
      collectionName: "Agriculture NFTs",
      propertyName: "Organic Coffee Farm, Yirgacheffe",
      serialNumbers,
      fromAccountId: treasuryId,
      toAccountId: recipientId.toString(),
      fromPrivateKey: treasuryKey,
      pricePerNFT: 5, // 5 HBAR per NFT (example price)
    });

    console.log("\n" + "=".repeat(60));
    console.log("\n✨ Batch transfer complete!\n");
    console.log(`💡 The recipient now owns ${quantity} NFT(s) from the same property.`);
    console.log(`   Each NFT represents 1 share of ownership.\n`);
    console.log(`📊 Portfolio Value:`);
    console.log(`   ${quantity} shares × $200/share = $${quantity * 200}`);
    console.log(`   Ownership: ${((quantity / 5000) * 100).toFixed(3)}% of property\n`);

  } catch (error: any) {
    console.error("\n❌ Error during batch transfer:", error.message);
    if (error.status) {
      console.log(`\nError code: ${error.status._code}`);
      console.log("Common errors:");
      console.log("  11 - INVALID_ACCOUNT_ID: Check the recipient account ID");
      console.log("  167 - INSUFFICIENT_TOKEN_BALANCE: Treasury doesn't own these NFTs");
      console.log("  194 - TOKEN_ALREADY_ASSOCIATED_TO_ACCOUNT: Token already associated (not an error)");
    }
    process.exit(1);
  }
}

main();
