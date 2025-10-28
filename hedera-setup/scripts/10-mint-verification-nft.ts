import {
  TokenMintTransaction,
  TokenAssociateTransaction,
  TransferTransaction,
  PrivateKey,
  AccountId,
  TopicMessageSubmitTransaction,
  TokenGrantKycTransaction,
} from "@hashgraph/sdk";
import { createClient, getOperatorKey } from "./utils/client";
import { saveJSON, loadJSON, log } from "./utils/helpers";
import { uploadJSON } from "./utils/ipfs";
import crypto from "crypto";

/**
 * Phase 6B: Mint Verification NFT After KYC
 * Mints a Soulbound verification NFT to a user after KYC approval
 * This NFT serves as an on-chain proof of identity verification
 */

interface VerificationMetadata {
  name: string;
  description: string;
  image: string;
  verified: boolean;
  level: "basic" | "accredited" | "property-owner";
  jurisdiction: string;
  issuedDate: string;
  expiresDate: string;
  attributes: Array<{
    trait_type: string;
    value: string | boolean;
  }>;
}

interface MintedVerificationNFT {
  nftTokenId: string;
  serialNumber: number;
  hederaAccountId: string;
  kycLevel: string;
  jurisdiction: string;
  metadataCID: string;
  verificationHash: string;
  attestationMessageId: string;
  mintedAt: string;
  expiresAt: string;
}

async function main() {
  console.log("\n🚀 Phase 6B: Minting Verification NFT\n");
  console.log("=".repeat(60));

  // Get recipient account ID from command line or environment
  const recipientAccountId = process.env.RECIPIENT_ACCOUNT_ID || process.argv[2];
  const kycLevel = (process.argv[3] || "basic") as "basic" | "accredited" | "property-owner";
  const jurisdiction = process.argv[4] || "US";

  if (!recipientAccountId) {
    console.error("\n❌ Error: No recipient account provided");
    console.log("\nUsage:");
    console.log("  ts-node scripts/10-mint-verification-nft.ts <account-id> [level] [jurisdiction]");
    console.log("\nVerification Levels:");
    console.log("  basic          - Basic KYC for investors (default)");
    console.log("  accredited     - Accredited investor verification");
    console.log("  property-owner - Property owner/tokenizer (required to create NFTs)");
    console.log("\nExamples:");
    console.log("  ts-node scripts/10-mint-verification-nft.ts 0.0.1234567 basic US");
    console.log("  ts-node scripts/10-mint-verification-nft.ts 0.0.1234567 accredited US");
    console.log("  ts-node scripts/10-mint-verification-nft.ts 0.0.1234567 property-owner US");
    console.log("\nOr set RECIPIENT_ACCOUNT_ID in .env file\n");
    process.exit(1);
  }

  const client = createClient();

  try {
    // Load required files
    const accounts = loadJSON("accounts.json");
    const verificationCollection = loadJSON("verification-collection.json");

    if (!accounts || !verificationCollection) {
      throw new Error("Missing required files. Run previous phases first.");
    }

    const treasuryId = AccountId.fromString(accounts.treasury.accountId);
    const treasuryKey = PrivateKey.fromString(accounts.treasury.privateKey);
    const recipientId = AccountId.fromString(recipientAccountId);
    const operatorId = AccountId.fromString(process.env.OPERATOR_ID || "");

    const tokenId = verificationCollection.verification.tokenId;
    const supplyKey = PrivateKey.fromString(verificationCollection.verification.supplyKey);
    const attestationTopicId = verificationCollection.verification.attestationTopicId;

    console.log("\n📋 Verification Details:");
    console.log(`   Recipient: ${recipientId.toString()}`);
    console.log(`   KYC Level: ${kycLevel}`);
    console.log(`   Jurisdiction: ${jurisdiction}`);
    console.log(`   Token ID: ${tokenId}`);

    // Check if recipient is the operator (we have their key)
    const isOperatorRecipient = recipientId.toString() === operatorId.toString();

    // Step 1: Create verification metadata (NO PERSONAL DATA)
    console.log("\n📝 Step 1: Creating Verification Metadata...");

    const issuedDate = new Date();
    const expiresDate = new Date(issuedDate.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year

    const levelDisplay =
      kycLevel === "property-owner" ? "Property Owner / Tokenizer" :
      kycLevel === "accredited" ? "Accredited Investor" :
      "Basic KYC";

    const metadata: VerificationMetadata = {
      name: "DeraLinks Verified User",
      description: `Identity verification badge for DeraLinks platform. Holder has completed ${kycLevel} KYC verification.`,
      image: "ipfs://bafkreidrqxfz3bxkj3dpfm5zjrqeiwxvz34wzxrwdwq4grxtvbhqsxb4eq", // Generic verification badge image
      verified: true,
      level: kycLevel,
      jurisdiction: jurisdiction,
      issuedDate: issuedDate.toISOString(),
      expiresDate: expiresDate.toISOString(),
      attributes: [
        {
          trait_type: "Verification Level",
          value: levelDisplay,
        },
        {
          trait_type: "Jurisdiction",
          value: jurisdiction,
        },
        {
          trait_type: "Verified",
          value: true,
        },
        {
          trait_type: "Issued Date",
          value: issuedDate.toISOString().split("T")[0],
        },
        {
          trait_type: "Expires Date",
          value: expiresDate.toISOString().split("T")[0],
        },
      ],
    };

    log(`   ✅ Metadata created (Level: ${kycLevel})`);

    // Step 2: Upload metadata to IPFS
    console.log("\n📤 Step 2: Uploading Metadata to IPFS...");

    const metadataCID = await uploadJSON(metadata);
    log(`   ✅ Uploaded to IPFS: ${metadataCID}`);
    log(`   🔗 https://gateway.pinata.cloud/ipfs/${metadataCID}`);

    // Step 3: Create verification hash for HCS attestation
    console.log("\n🔐 Step 3: Creating Verification Hash...");

    const verificationData = {
      accountId: recipientId.toString(),
      verified: true,
      level: kycLevel,
      jurisdiction: jurisdiction,
      timestamp: issuedDate.getTime(),
      metadataCID: metadataCID,
    };

    const verificationHash = crypto
      .createHash("sha256")
      .update(JSON.stringify(verificationData))
      .digest("hex");

    log(`   ✅ Hash: ${verificationHash.substring(0, 16)}...`);

    // Step 4: Submit attestation to HCS
    console.log("\n📋 Step 4: Submitting Attestation to HCS...");

    const attestationMessage = JSON.stringify({
      type: "verification-issued",
      accountId: recipientId.toString(),
      verificationHash: verificationHash,
      level: kycLevel,
      jurisdiction: jurisdiction,
      timestamp: issuedDate.toISOString(),
    });

    const topicTx = new TopicMessageSubmitTransaction()
      .setTopicId(attestationTopicId)
      .setMessage(attestationMessage)
      .freezeWith(client);

    const signedTopicTx = await topicTx.sign(treasuryKey);
    const topicResponse = await signedTopicTx.execute(client);
    const topicReceipt = await topicResponse.getReceipt(client);

    log(`   ✅ Attestation submitted to topic ${attestationTopicId}`);
    log(`   📊 Status: ${topicReceipt.status.toString()}`);

    // Step 5: Mint the NFT
    console.log("\n🎨 Step 5: Minting Verification NFT...");

    const mintTx = new TokenMintTransaction()
      .setTokenId(tokenId)
      .setMetadata([Buffer.from(metadataCID)])
      .freezeWith(client);

    const signedMintTx = await mintTx.sign(supplyKey);
    const mintResponse = await signedMintTx.execute(client);
    const mintReceipt = await mintResponse.getReceipt(client);

    const serialNumber = mintReceipt.serials[0].toNumber();

    log(`   ✅ NFT Minted!`);
    log(`   🎫 Serial Number: ${serialNumber}`);
    log(`   📊 Status: ${mintReceipt.status.toString()}`);

    // Step 6: Associate recipient account with token (if operator)
    console.log("\n📎 Step 6: Token Association...");

    if (isOperatorRecipient) {
      try {
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
        if (error.status && error.status._code === 194) {
          // TOKEN_ALREADY_ASSOCIATED_TO_ACCOUNT
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

    // Step 7: Transfer the NFT to recipient
    console.log("\n📤 Step 7: Transferring NFT to Recipient...");

    const transferTx = new TransferTransaction()
      .addNftTransfer(tokenId, serialNumber, treasuryId, recipientId)
      .freezeWith(client);

    const signedTransferTx = await transferTx.sign(treasuryKey);
    const transferResponse = await signedTransferTx.execute(client);
    const transferReceipt = await transferResponse.getReceipt(client);

    log(`   ✅ Transfer successful!`);
    log(`   📜 Transaction ID: ${transferResponse.transactionId.toString()}`);
    log(`   📊 Status: ${transferReceipt.status.toString()}`);

    // Save minted NFT record
    console.log("\n💾 Step 8: Saving Verification Record...");

    const mintedNFT: MintedVerificationNFT = {
      nftTokenId: tokenId,
      serialNumber: serialNumber,
      hederaAccountId: recipientId.toString(),
      kycLevel: kycLevel,
      jurisdiction: jurisdiction,
      metadataCID: metadataCID,
      verificationHash: verificationHash,
      attestationMessageId: topicResponse.transactionId?.toString() || "",
      mintedAt: issuedDate.toISOString(),
      expiresAt: expiresDate.toISOString(),
    };

    // Load existing verifications or create new array
    const existingData = loadJSON("verification-nfts.json") || { nfts: [] };
    existingData.nfts.push(mintedNFT);
    saveJSON("verification-nfts.json", existingData);

    log(`   ✅ Saved to verification-nfts.json`);

    console.log("\n" + "=".repeat(60));
    console.log("\n✅ Verification NFT Successfully Minted and Transferred!\n");
    console.log("🔗 View on HashScan:");
    console.log(`   Token: https://hashscan.io/testnet/token/${tokenId}`);
    console.log(`   NFT: https://hashscan.io/testnet/token/${tokenId}/${serialNumber}`);
    console.log(`   Recipient Account: https://hashscan.io/testnet/account/${recipientId.toString()}`);
    console.log(`   Transaction: https://hashscan.io/testnet/transaction/${transferResponse.transactionId.toString()}`);
    console.log(`   Attestation Topic: https://hashscan.io/testnet/topic/${attestationTopicId}`);
    console.log("\n📊 Verification Summary:");
    console.log(`   Account: ${recipientId.toString()}`);
    console.log(`   Level: ${kycLevel}`);
    console.log(`   Serial #: ${serialNumber}`);
    console.log(`   Expires: ${expiresDate.toLocaleDateString()}`);
    console.log(`   Hash: ${verificationHash.substring(0, 32)}...`);
    console.log("\n✅ User can now access platform features!");
    console.log("   Middleware will check for this NFT before allowing operations\n");

  } catch (error: any) {
    console.error("\n❌ Error minting verification NFT:", error.message || error);

    if (error.status) {
      console.log(`\nError code: ${error.status._code}`);
      console.log("\nCommon errors:");
      console.log("  7 - INVALID_SIGNATURE: Can't sign for external account");
      console.log("  11 - INVALID_ACCOUNT_ID: Check the recipient account ID");
      console.log("  25 - TOKEN_NOT_ASSOCIATED_TO_ACCOUNT: Recipient must associate token first");
      console.log("  167 - INSUFFICIENT_TOKEN_BALANCE: Treasury doesn't have NFT to transfer");
    }

    process.exit(1);
  } finally {
    client.close();
  }
}

main();
