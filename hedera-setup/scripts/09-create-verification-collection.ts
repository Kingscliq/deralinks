import {
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  PrivateKey,
  TopicCreateTransaction,
} from "@hashgraph/sdk";
import { createClient } from "./utils/client";
import { saveJSON, loadJSON, log } from "./utils/helpers";

/**
 * Phase 6B: Create Verification NFT Collection
 * Creates a Soulbound (non-transferable) NFT collection for KYC verification badges
 * Each verified user gets one NFT as proof of identity verification
 */

interface VerificationCollectionData {
  tokenId: string;
  name: string;
  symbol: string;
  type: string;
  supplyType: string;
  adminKey: string;
  supplyKey: string;
  freezeKey: string;
  wipeKey: string;
  attestationTopicId: string;
  memo: string;
  isSoulbound: boolean;
}

interface VerificationOutput {
  network: string;
  createdAt: string;
  propertyOwnerVerification: VerificationCollectionData;
  investorVerification: VerificationCollectionData;
  accreditedInvestorVerification: VerificationCollectionData;
}

async function main() {
  console.log("\n🚀 Phase 6B: Creating Verification NFT Collections\n");
  console.log("=".repeat(60));

  const client = createClient();

  try {
    // Load accounts from Phase 3
    const accounts = loadJSON("accounts.json");
    if (!accounts) {
      throw new Error("accounts.json not found. Run Phase 3 first.");
    }

    const treasuryId = accounts.treasury.accountId;
    const treasuryKey = PrivateKey.fromString(accounts.treasury.privateKey);

    log(`\n💰 Treasury: ${treasuryId}`);

    // Helper function to create a verification collection
    async function createVerificationCollection(
      name: string,
      symbol: string,
      memo: string,
      topicMemo: string
    ): Promise<VerificationCollectionData> {
      console.log(`\n🎫 Creating ${name}...`);

      // Create HCS Topic for attestations
      const topicTx = new TopicCreateTransaction()
        .setTopicMemo(topicMemo)
        .setAdminKey(treasuryKey.publicKey)
        .setSubmitKey(treasuryKey.publicKey)
        .freezeWith(client);

      const signedTopicTx = await topicTx.sign(treasuryKey);
      const topicResponse = await signedTopicTx.execute(client);
      const topicReceipt = await topicResponse.getReceipt(client);
      const attestationTopicId = topicReceipt.topicId;

      if (!attestationTopicId) {
        throw new Error(`Failed to create attestation topic for ${name}`);
      }

      log(`   ✅ Topic Created: ${attestationTopicId.toString()}`);

      // Generate keys for token management
      const adminKey = PrivateKey.generateED25519();
      const supplyKey = PrivateKey.generateED25519();
      const freezeKey = PrivateKey.generateED25519();
      const wipeKey = PrivateKey.generateED25519();

      log(`   ✅ Generated management keys`);

      // Create NFT collection with Soulbound properties
      const tokenTx = new TokenCreateTransaction()
        .setTokenName(name)
        .setTokenSymbol(symbol)
        .setTokenType(TokenType.NonFungibleUnique)
        .setSupplyType(TokenSupplyType.Infinite)
        .setTreasuryAccountId(treasuryId)
        .setAdminKey(adminKey.publicKey)
        .setSupplyKey(supplyKey.publicKey)
        .setFreezeKey(freezeKey.publicKey)
        .setWipeKey(wipeKey.publicKey)
        .setFreezeDefault(false)
        .setTokenMemo(memo)
        .freezeWith(client);

      // Sign with treasury key
      const signedTokenTx = await tokenTx.sign(treasuryKey);

      // Sign with all the new keys
      const multiSignedTx = await (
        await (
          await (
            await signedTokenTx.sign(adminKey)
          ).sign(supplyKey)
        ).sign(freezeKey)
      ).sign(wipeKey);

      const txResponse = await multiSignedTx.execute(client);
      const receipt = await txResponse.getReceipt(client);
      const tokenId = receipt.tokenId;

      if (!tokenId) {
        throw new Error(`Failed to create ${name}`);
      }

      log(`   ✅ Collection Created: ${tokenId.toString()}`);
      log(`   🔗 View on HashScan: https://hashscan.io/testnet/token/${tokenId.toString()}`);

      return {
        tokenId: tokenId.toString(),
        name,
        symbol,
        type: "NON_FUNGIBLE_UNIQUE",
        supplyType: "INFINITE",
        adminKey: adminKey.toString(),
        supplyKey: supplyKey.toString(),
        freezeKey: freezeKey.toString(),
        wipeKey: wipeKey.toString(),
        attestationTopicId: attestationTopicId.toString(),
        memo,
        isSoulbound: true,
      };
    }

    // Create all three verification collections
    console.log("\n📋 Step 1: Creating Property Owner Verification Collection...");
    const propertyOwnerVerification = await createVerificationCollection(
      "DeraLinks Property Owner Verification",
      "DLPOWNER",
      "DeraLinks - Property Owner Verification - Soulbound Token",
      "DeraLinks - Property Owner Attestations"
    );

    console.log("\n📋 Step 2: Creating Investor Verification Collection...");
    const investorVerification = await createVerificationCollection(
      "DeraLinks Investor Verification",
      "DLINVEST",
      "DeraLinks - Investor Verification - Soulbound Token",
      "DeraLinks - Investor KYC Attestations"
    );

    console.log("\n📋 Step 3: Creating Accredited Investor Verification Collection...");
    const accreditedInvestorVerification = await createVerificationCollection(
      "DeraLinks Accredited Investor",
      "DLACCRED",
      "DeraLinks - Accredited Investor Verification - Soulbound Token",
      "DeraLinks - Accredited Investor Attestations"
    );

    // Prepare output
    const output: VerificationOutput = {
      network: "testnet",
      createdAt: new Date().toISOString(),
      propertyOwnerVerification,
      investorVerification,
      accreditedInvestorVerification,
    };

    // Save to file
    saveJSON("verification-collection.json", output);

    console.log("\n" + "=".repeat(60));
    console.log("\n✅ All Verification NFT Collections Created!\n");
    console.log("📊 Summary:");
    console.log(`\n🏠 Property Owner Verification:`);
    console.log(`   Token ID: ${propertyOwnerVerification.tokenId}`);
    console.log(`   Symbol: ${propertyOwnerVerification.symbol}`);
    console.log(`\n💰 Investor Verification:`);
    console.log(`   Token ID: ${investorVerification.tokenId}`);
    console.log(`   Symbol: ${investorVerification.symbol}`);
    console.log(`\n⭐ Accredited Investor Verification:`);
    console.log(`   Token ID: ${accreditedInvestorVerification.tokenId}`);
    console.log(`   Symbol: ${accreditedInvestorVerification.symbol}`);
    console.log("\n💾 Saved to: output/verification-collection.json");
    console.log("\n⚠️  SECURITY WARNING:");
    console.log("   Collection management keys are saved in output/verification-collection.json");
    console.log("   This file is gitignored. Keep it safe!");
    console.log("   You'll need these keys to:");
    console.log("   - Mint verification NFTs (supplyKey)");
    console.log("   - Revoke/freeze accounts (freezeKey)");
    console.log("   - Wipe NFTs for compliance (wipeKey)");
    console.log("\n📝 Next Steps:");
    console.log("   1. Update backend .env with these token IDs");
    console.log("   2. Update database platform_config table");
    console.log("   3. Run script 10 to mint verification NFTs after KYC");
    console.log("\n🔐 How Soulbound Works:");
    console.log("   - NFTs start in treasury (freezeDefault=false)");
    console.log("   - After transfer to user, they cannot transfer it further");
    console.log("   - Only platform can revoke (wipe) or freeze the NFT");
    console.log("   - This ensures verification badges stay with the verified user\n");

  } catch (error: any) {
    console.error("\n❌ Error creating verification collection:", error.message || error);
    process.exit(1);
  } finally {
    client.close();
  }
}

main();
