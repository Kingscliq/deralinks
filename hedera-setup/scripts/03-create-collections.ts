import {
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  PrivateKey,
  CustomRoyaltyFee,
  CustomFixedFee,
  Hbar,
} from "@hashgraph/sdk";
import { createClient } from "./utils/client";
import { saveJSON, loadJSON, log } from "./utils/helpers";

/**
 * Phase 5: Create NFT Collections on Testnet
 * Creates 3 NFT collections for fractional ownership
 * Keep it simple!
 */

interface CollectionData {
  tokenId: string;
  name: string;
  symbol: string;
  type: string;
  supplyType: string;
  adminKey: string;
  supplyKey: string;
  kycKey: string;
  freezeKey: string;
  pauseKey: string;
  wipeKey: string;
  royaltyPercent: number;
  metadataTopicId: string;
  memo: string;
}

interface CollectionsOutput {
  network: string;
  createdAt: string;
  realEstate: CollectionData;
  agriculture: CollectionData;
  properties: CollectionData;
}

async function createNFTCollection(
  name: string,
  symbol: string,
  royaltyPercent: number,
  metadataTopicId: string,
  memo: string
): Promise<CollectionData> {
  log(`\n📝 Creating ${name} Collection...`);

  const client = createClient();

  // Load accounts from Phase 3
  const accounts = loadJSON("accounts.json");
  if (!accounts) {
    throw new Error("accounts.json not found. Run Phase 3 first.");
  }

  const treasuryId = accounts.treasury.accountId;
  const feeCollectorId = accounts.feeCollector.accountId;

  log(`   💰 Treasury: ${treasuryId}`);
  log(`   💵 Fee Collector: ${feeCollectorId}`);

  // Generate keys for token management
  const adminKey = PrivateKey.generateED25519();
  const supplyKey = PrivateKey.generateED25519();
  const kycKey = PrivateKey.generateED25519();
  const freezeKey = PrivateKey.generateED25519();
  const pauseKey = PrivateKey.generateED25519();
  const wipeKey = PrivateKey.generateED25519();

  log(`   ✅ Generated management keys`);

  // Create royalty fee (percentage of sale price)
  const royaltyFee = new CustomRoyaltyFee()
    .setNumerator(royaltyPercent) // e.g., 5 for 5%
    .setDenominator(100)
    .setFeeCollectorAccountId(feeCollectorId)
    .setFallbackFee(
      new CustomFixedFee().setHbarAmount(new Hbar(royaltyPercent)) // Fallback fee in HBAR
    );

  log(`   💎 Royalty: ${royaltyPercent}% to fee collector`);

  // Create NFT collection
  const transaction = new TokenCreateTransaction()
    .setTokenName(name)
    .setTokenSymbol(symbol)
    .setTokenType(TokenType.NonFungibleUnique)
    .setSupplyType(TokenSupplyType.Infinite)
    .setTreasuryAccountId(treasuryId)
    .setAdminKey(adminKey.publicKey)
    .setSupplyKey(supplyKey.publicKey)
    .setKycKey(kycKey.publicKey)
    .setFreezeKey(freezeKey.publicKey)
    .setPauseKey(pauseKey.publicKey)
    .setWipeKey(wipeKey.publicKey)
    .setCustomFees([royaltyFee])
    .setTokenMemo(memo)
    .freezeWith(client);

  // Sign with treasury key (from accounts.json)
  const treasuryKey = PrivateKey.fromString(accounts.treasury.privateKey);
  const signedTx = await transaction.sign(treasuryKey);

  // Sign with all the new keys
  const multiSignedTx = await (
    await (
      await (
        await (
          await (await signedTx.sign(adminKey)).sign(supplyKey)
        ).sign(kycKey)
      ).sign(freezeKey)
    ).sign(pauseKey)
  ).sign(wipeKey);

  const txResponse = await multiSignedTx.execute(client);
  const receipt = await txResponse.getReceipt(client);
  const tokenId = receipt.tokenId;

  if (!tokenId) {
    throw new Error(`Failed to create ${name} collection`);
  }

  log(`   ✅ Collection Created: ${tokenId.toString()}`);
  log(`   🔗 View on HashScan: https://hashscan.io/testnet/token/${tokenId.toString()}`);

  client.close();

  return {
    tokenId: tokenId.toString(),
    name,
    symbol,
    type: "NON_FUNGIBLE_UNIQUE",
    supplyType: "INFINITE",
    adminKey: adminKey.toString(),
    supplyKey: supplyKey.toString(),
    kycKey: kycKey.toString(),
    freezeKey: freezeKey.toString(),
    pauseKey: pauseKey.toString(),
    wipeKey: wipeKey.toString(),
    royaltyPercent,
    metadataTopicId,
    memo,
  };
}

async function main() {
  console.log("\n🚀 Phase 5: Creating NFT Collections on Testnet\n");
  console.log("=".repeat(60));

  try {
    // Load topics from Phase 4
    const topics = loadJSON("topics.json");
    if (!topics) {
      throw new Error("topics.json not found. Run Phase 4 first.");
    }

    const collections: CollectionsOutput = {
      network: "testnet",
      createdAt: new Date().toISOString(),
      realEstate: {} as CollectionData,
      agriculture: {} as CollectionData,
      properties: {} as CollectionData,
    };

    // Create Real Estate NFT Collection
    console.log("\n🏠 Real Estate NFT Collection:");
    collections.realEstate = await createNFTCollection(
      "Real Estate NFTs",
      "REALESTATE",
      5, // 5% royalty
      topics.realEstate[0].topicId, // Metadata topic
      "DeraLinks - Real Estate NFTs - Fractional Ownership"
    );

    // Create Agriculture NFT Collection
    console.log("\n🌾 Agriculture NFT Collection:");
    collections.agriculture = await createNFTCollection(
      "Agriculture NFTs",
      "AGRINFT",
      3, // 3% royalty
      topics.agriculture[0].topicId, // Metadata topic
      "DeraLinks - Agriculture NFTs - Fractional Ownership"
    );

    // Create Properties NFT Collection
    console.log("\n🏢 Properties NFT Collection:");
    collections.properties = await createNFTCollection(
      "Properties NFTs",
      "PROPNFT",
      4, // 4% royalty
      topics.properties[0].topicId, // Metadata topic
      "DeraLinks - Properties NFTs - Fractional Ownership"
    );

    // Save collections
    saveJSON("collections.json", collections);

    console.log("\n" + "=".repeat(60));
    console.log("\n✅ All 3 NFT Collections Created!\n");
    console.log("📊 Summary:");
    console.log(`   Real Estate: ${collections.realEstate.tokenId} (${collections.realEstate.royaltyPercent}% royalty)`);
    console.log(`   Agriculture: ${collections.agriculture.tokenId} (${collections.agriculture.royaltyPercent}% royalty)`);
    console.log(`   Properties:  ${collections.properties.tokenId} (${collections.properties.royaltyPercent}% royalty)`);
    console.log("\n💾 Saved to: output/collections.json");
    console.log("\n⚠️  SECURITY WARNING:");
    console.log("   Collection management keys are saved in output/collections.json");
    console.log("   This file is gitignored. Keep it safe!");
    console.log("   You'll need these keys to mint NFTs in Phase 6.\\n");

  } catch (error) {
    console.error("\n❌ Error creating collections:", error);
    process.exit(1);
  }
}

main();
