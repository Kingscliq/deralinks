import {
  TokenWipeTransaction,
  TokenFreezeTransaction,
  PrivateKey,
  AccountId,
  TopicMessageSubmitTransaction,
} from "@hashgraph/sdk";
import { createClient } from "./utils/client";
import { loadJSON, saveJSON, log } from "./utils/helpers";

/**
 * Phase 6B: Revoke or Freeze Verification NFT
 * Used for compliance when accounts need to be sanctioned or suspended
 *
 * Two actions available:
 * 1. FREEZE - Temporary suspension (reversible)
 * 2. WIPE - Permanent revocation (removes NFT from account)
 */

type RevocationAction = "freeze" | "wipe";

interface RevocationRecord {
  accountId: string;
  serialNumber: number;
  action: RevocationAction;
  reason: string;
  revokedAt: string;
  revokedBy: string;
  transactionId: string;
  attestationMessageId: string;
}

async function main() {
  console.log("\n🚀 Phase 6B: Revoke/Freeze Verification NFT\n");
  console.log("=".repeat(60));

  // Get parameters from command line
  const targetAccountId = process.argv[2];
  const action = (process.argv[3] || "freeze") as RevocationAction;
  const reason = process.argv.slice(4).join(" ") || "Compliance requirement";

  if (!targetAccountId) {
    console.error("\n❌ Error: No target account provided");
    console.log("\nUsage:");
    console.log("  ts-node scripts/11-revoke-verification.ts <account-id> <action> <reason>");
    console.log("\nActions:");
    console.log("  freeze - Temporary suspension (reversible)");
    console.log("  wipe   - Permanent revocation (removes NFT)");
    console.log("\nExamples:");
    console.log("  ts-node scripts/11-revoke-verification.ts 0.0.1234567 freeze Suspicious activity detected");
    console.log("  ts-node scripts/11-revoke-verification.ts 0.0.1234567 wipe OFAC sanctions list match");
    console.log("\nCommon reasons:");
    console.log("  - Suspicious activity detected");
    console.log("  - OFAC sanctions list match");
    console.log("  - Terms of service violation");
    console.log("  - Failed reverification");
    console.log("  - Regulatory requirement\n");
    process.exit(1);
  }

  if (action !== "freeze" && action !== "wipe") {
    console.error("\n❌ Error: Invalid action. Must be 'freeze' or 'wipe'\n");
    process.exit(1);
  }

  const client = createClient();

  try {
    // Load required files
    const accounts = loadJSON("accounts.json");
    const verificationCollection = loadJSON("verification-collection.json");
    const verificationData = loadJSON("verification-nfts.json");

    if (!accounts || !verificationCollection || !verificationData) {
      throw new Error("Missing required files. Run previous phases first.");
    }

    const treasuryKey = PrivateKey.fromString(accounts.treasury.privateKey);
    const targetId = AccountId.fromString(targetAccountId);

    const tokenId = verificationCollection.verification.tokenId;
    const freezeKey = PrivateKey.fromString(verificationCollection.verification.freezeKey);
    const wipeKey = PrivateKey.fromString(verificationCollection.verification.wipeKey);
    const attestationTopicId = verificationCollection.verification.attestationTopicId;

    console.log("\n📋 Revocation Details:");
    console.log(`   Target Account: ${targetId.toString()}`);
    console.log(`   Action: ${action.toUpperCase()}`);
    console.log(`   Reason: ${reason}`);
    console.log(`   Token ID: ${tokenId}`);

    // Find the verification record
    const verificationRecord = verificationData.nfts.find(
      (record: any) => record.hederaAccountId === targetAccountId
    );

    if (!verificationRecord) {
      console.error(`\n❌ Error: No verification NFT found for account ${targetAccountId}`);
      console.log("\nPossible reasons:");
      console.log("  - Account has not been verified");
      console.log("  - NFT has already been revoked");
      console.log("  - Incorrect account ID");
      process.exit(1);
    }

    const serialNumber = verificationRecord.serialNumber;

    console.log(`   Serial Number: ${serialNumber}`);
    console.log(`   Current Level: ${verificationRecord.kycLevel}`);

    // Confirm action
    console.log("\n⚠️  WARNING:");
    if (action === "freeze") {
      console.log("   This will FREEZE the account's verification NFT.");
      console.log("   The user will be unable to access platform features.");
      console.log("   This action can be reversed by unfreezing.");
    } else {
      console.log("   This will PERMANENTLY REMOVE the verification NFT.");
      console.log("   The user will need to complete KYC again to regain access.");
      console.log("   This action CANNOT be undone!");
    }

    console.log("\n⏱️  Proceeding in 3 seconds...");
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Step 1: Submit attestation to HCS
    console.log(`\n📋 Step 1: Submitting ${action} attestation to HCS...`);

    const attestationMessage = JSON.stringify({
      type: `verification-${action}d`,
      accountId: targetAccountId,
      serialNumber: serialNumber,
      reason: reason,
      timestamp: new Date().toISOString(),
      actionBy: "platform-admin",
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

    // Step 2: Execute freeze or wipe
    let txResponse;
    let receipt;

    if (action === "freeze") {
      console.log("\n🧊 Step 2: Freezing Verification NFT...");

      const freezeTx = new TokenFreezeTransaction()
        .setAccountId(targetId)
        .setTokenId(tokenId)
        .freezeWith(client);

      const signedFreezeTx = await freezeTx.sign(freezeKey);
      txResponse = await signedFreezeTx.execute(client);
      receipt = await txResponse.getReceipt(client);

      log(`   ✅ Account frozen!`);
      log(`   📜 Transaction ID: ${txResponse.transactionId.toString()}`);
      log(`   📊 Status: ${receipt.status.toString()}`);
    } else {
      console.log("\n🗑️  Step 2: Wiping Verification NFT...");

      const wipeTx = new TokenWipeTransaction()
        .setAccountId(targetId)
        .setTokenId(tokenId)
        .setSerialNumbers([serialNumber])
        .freezeWith(client);

      const signedWipeTx = await wipeTx.sign(wipeKey);
      txResponse = await signedWipeTx.execute(client);
      receipt = await txResponse.getReceipt(client);

      log(`   ✅ NFT wiped from account!`);
      log(`   📜 Transaction ID: ${txResponse.transactionId.toString()}`);
      log(`   📊 Status: ${receipt.status.toString()}`);
    }

    // Step 3: Save revocation record
    console.log("\n💾 Step 3: Saving Revocation Record...");

    const revocationRecord: RevocationRecord = {
      accountId: targetAccountId,
      serialNumber: serialNumber,
      action: action,
      reason: reason,
      revokedAt: new Date().toISOString(),
      revokedBy: "platform-admin", // In production, this would be the admin's ID
      transactionId: txResponse.transactionId?.toString() || "",
      attestationMessageId: topicResponse.transactionId?.toString() || "",
    };

    // Load or create revocations file
    const revocationsData = loadJSON("verification-revocations.json") || {
      revocations: [],
    };
    revocationsData.revocations.push(revocationRecord);
    saveJSON("verification-revocations.json", revocationsData);

    log(`   ✅ Saved to verification-revocations.json`);

    // Step 4: Update verification NFT record status
    if (action === "wipe") {
      console.log("\n📝 Step 4: Updating Verification Records...");

      verificationData.nfts = verificationData.nfts.filter(
        (record: any) => record.hederaAccountId !== targetAccountId
      );
      saveJSON("verification-nfts.json", verificationData);

      log(`   ✅ Removed verification record`);
    }

    console.log("\n" + "=".repeat(60));
    console.log(`\n✅ Verification NFT ${action === "freeze" ? "Frozen" : "Revoked"}!\n`);
    console.log("🔗 View on HashScan:");
    console.log(`   Token: https://hashscan.io/testnet/token/${tokenId}`);
    console.log(`   Account: https://hashscan.io/testnet/account/${targetId.toString()}`);
    console.log(`   Transaction: https://hashscan.io/testnet/transaction/${txResponse.transactionId.toString()}`);
    console.log(`   Attestation Topic: https://hashscan.io/testnet/topic/${attestationTopicId}`);
    console.log("\n📊 Revocation Summary:");
    console.log(`   Account: ${targetAccountId}`);
    console.log(`   Action: ${action.toUpperCase()}`);
    console.log(`   Reason: ${reason}`);
    console.log(`   Serial #: ${serialNumber}`);
    console.log(`   Time: ${new Date().toLocaleString()}`);

    if (action === "freeze") {
      console.log("\n💡 To reverse this freeze:");
      console.log("   Create script 12-unfreeze-verification.ts with TokenUnfreezeTransaction");
      console.log("   This will restore the user's access");
    } else {
      console.log("\n⚠️  This revocation is permanent.");
      console.log("   User must complete KYC again to regain access.");
    }

    console.log("\n✅ Compliance action completed successfully\n");

  } catch (error: any) {
    console.error("\n❌ Error revoking verification:", error.message || error);

    if (error.status) {
      console.log(`\nError code: ${error.status._code}`);
      console.log("\nCommon errors:");
      console.log("  11 - INVALID_ACCOUNT_ID: Check the account ID");
      console.log("  155 - ACCOUNT_FROZEN_FOR_TOKEN: Account already frozen");
      console.log("  167 - INSUFFICIENT_TOKEN_BALANCE: Account doesn't own NFT");
      console.log("  273 - ACCOUNT_DOES_NOT_OWN_WIPED_NFT: Cannot wipe NFT not owned");
    }

    process.exit(1);
  } finally {
    client.close();
  }
}

main();
