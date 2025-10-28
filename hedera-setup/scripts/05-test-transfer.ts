import {
  TransferTransaction,
  PrivateKey,
  AccountId,
  TokenGrantKycTransaction,
  TokenAssociateTransaction,
} from "@hashgraph/sdk";
import { createClient, getOperatorKey } from "./utils/client";
import { loadJSON, log } from "./utils/helpers";

/**
 * Phase 6.5: Test NFT Transfer
 * Tests transferring an NFT from treasury to another account
 * Keep it simple!
 */

async function main() {
  console.log("\n🚀 Testing NFT Transfer\n");
  console.log("=".repeat(60));

  // Get recipient account ID from command line or prompt
  const recipientAccountId = process.env.TEST_WALLET_ID || process.argv[2];

  if (!recipientAccountId) {
    console.error("\n❌ Error: No recipient account provided");
    console.log("\nUsage:");
    console.log("  npm run test:transfer <account-id>");
    console.log("\nExample:");
    console.log("  npm run test:transfer 0.0.1234567");
    console.log("\nOr set TEST_WALLET_ID in .env file\n");
    process.exit(1);
  }

  const client = createClient();

  try {
    // Load accounts and NFTs
    const accounts = loadJSON("accounts.json");
    const nfts = loadJSON("nfts.json");
    const collections = loadJSON("collections.json");

    if (!accounts || !nfts || !collections) {
      throw new Error("Missing required files. Run previous phases first.");
    }

    const treasuryId = AccountId.fromString(accounts.treasury.accountId);
    const treasuryKey = PrivateKey.fromStringDer(accounts.treasury.privateKey);
    const recipientId = AccountId.fromString(recipientAccountId);
    const operatorId = AccountId.fromString(process.env.OPERATOR_ID || "");

    // Let's transfer the first Agriculture NFT (serial #1)
    const tokenId = collections.realEstate.tokenId;
    const serialNumber = 24;
    const propertyName = nfts.realEstate[0].metadata.name;

    console.log("\n📋 Transfer Details:");
    console.log(`   NFT Collection: ${tokenId} (Real Estate)`);
    console.log(`   Property: ${propertyName}`);
    console.log(`   Serial Number: ${serialNumber}`);
    console.log(`   From: ${treasuryId.toString()} (Treasury)`);
    console.log(`   To: ${recipientId.toString()}`);

    // Check if recipient is the operator (we have their key)
    const isOperatorRecipient = recipientId.toString() === operatorId.toString();

    // Step 1: Associate the recipient account with the token
    console.log("\n📎 Step 1: Token Association");

    if (isOperatorRecipient) {
      try {
        // Try to associate - will use operator key if recipient is operator
        const operatorKey = getOperatorKey();

        const associateTx = new TokenAssociateTransaction()
          .setAccountId(recipientId)
          .setTokenIds([tokenId])
          .freezeWith(client);

        const signedAssociateTx = await associateTx.sign(operatorKey);
        const associateResponse = await signedAssociateTx.execute(client);
        const associateReceipt = await associateResponse.getReceipt(client);

        log(`   ✅ Token associated!`);
        log(`   📊 Status: ${associateReceipt.status.toString()}`);
      } catch (error: any) {
        if (error.status && (error.status._code === 25 || error.status._code === 194)) {
          // Code 25: TOKEN_NOT_ASSOCIATED_TO_ACCOUNT (shouldn't happen)
          // Code 194: TOKEN_ALREADY_ASSOCIATED_TO_ACCOUNT (this is fine!)
          log("   ✅ Token already associated!");
        } else {
          throw error;
        }
      }
    } else {
      console.log("   ⚠️  Recipient is an external account (not operator)");
      console.log("   ℹ️  The recipient must associate with the token manually");
      console.log("\n   📝 Instructions for recipient:");
      console.log(`      1. Go to: https://hashscan.io/testnet/token/${tokenId}`);
      console.log("      2. Click 'Associate' button");
      console.log("      3. Sign with your wallet");
      console.log("\n   ⏸️  Skipping association (assuming already done)...");
    }

    // Step 2: Grant KYC to the recipient
    console.log("\n✅ Step 2: Granting KYC to recipient...");

    // Determine which collection we're using
    const collectionKey = tokenId === collections.realEstate.tokenId ? 'realEstate' :
                          tokenId === collections.agriculture.tokenId ? 'agriculture' : 'properties';
    const kycKey = PrivateKey.fromStringDer(collections[collectionKey].kycKey);

    const kycTx = new TokenGrantKycTransaction()
      .setAccountId(recipientId)
      .setTokenId(tokenId)
      .freezeWith(client);

    const signedKycTx = await kycTx.sign(kycKey);
    const kycResponse = await signedKycTx.execute(client);
    const kycReceipt = await kycResponse.getReceipt(client);

    log(`   ✅ KYC granted!`);
    log(`   📊 Status: ${kycReceipt.status.toString()}`);

    // Step 3: Transfer the NFT
    console.log("\n📤 Step 3: Transferring NFT...");

    const transferTx = new TransferTransaction()
      .addNftTransfer(tokenId, serialNumber, treasuryId, recipientId)
      .freezeWith(client);

    // Sign with treasury key (sender)
    const signedTx = await transferTx.sign(treasuryKey);
    const txResponse = await signedTx.execute(client);
    const receipt = await txResponse.getReceipt(client);

    log(`   ✅ Transfer successful!`);
    log(`   📜 Transaction ID: ${txResponse.transactionId.toString()}`);
    log(`   📊 Status: ${receipt.status.toString()}`);

    console.log("\n" + "=".repeat(60));
    console.log("\n✅ NFT Transfer Test Complete!\n");
    console.log("🔗 View on HashScan:");
    console.log(`   Token: https://hashscan.io/testnet/token/${tokenId}`);
    console.log(`   Recipient Account: https://hashscan.io/testnet/account/${recipientId.toString()}`);
    console.log(`   Transaction: https://hashscan.io/testnet/transaction/${txResponse.transactionId.toString()}`);

    console.log("\n📊 What to verify:");
    console.log("   1. Check recipient account now owns NFT serial #" + serialNumber);
    console.log("   2. Check treasury no longer owns this serial number");
    console.log("   3. NFT metadata should be visible on HashScan\n");

  } catch (error: any) {
    console.error("\n❌ Error during transfer:", error.message || error);

    if (error.status) {
      console.log(`\nError code: ${error.status._code}`);
      console.log("\nCommon errors:");
      console.log("  7 - INVALID_SIGNATURE: Can't sign for external account (recipient must associate manually)");
      console.log("  11 - INVALID_ACCOUNT_ID: Check the recipient account ID");
      console.log("  25 - TOKEN_NOT_ASSOCIATED_TO_ACCOUNT: Recipient must associate token first");
      console.log("  155 - ACCOUNT_FROZEN_FOR_TOKEN: Account might be frozen");
      console.log("  167 - INSUFFICIENT_TOKEN_BALANCE: Treasury doesn't own this NFT");
      console.log("  176 - ACCOUNT_KYC_NOT_GRANTED_FOR_TOKEN: KYC grant failed");

      if (error.status._code === 7 || error.status._code === 25) {
        // Load collections to get token ID
        const collections = loadJSON("collections.json");
        const tokenId = collections?.agriculture?.tokenId || "TOKEN_ID";

        console.log("\n💡 Solution: The recipient must manually associate with the token:");
        console.log(`   1. Visit: https://hashscan.io/testnet/token/${tokenId}`);
        console.log("   2. Click 'Associate' and sign with their wallet");
        console.log("   3. Re-run this transfer script");
      }
    }

    process.exit(1);
  } finally {
    client.close();
  }
}

main();
