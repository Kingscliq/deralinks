import { TopicCreateTransaction } from "@hashgraph/sdk";
import { createClient } from "./utils/client";
import { saveJSON, log } from "./utils/helpers";

/**
 * Phase 4: Create HCS Topics
 * Creates all topics for metadata, events, and governance
 * Keep it simple!
 */

interface TopicData {
  topicId: string;
  memo: string;
  category: string;
}

interface TopicsOutput {
  network: string;
  createdAt: string;
  global: TopicData[];
  realEstate: TopicData[];
  agriculture: TopicData[];
  properties: TopicData[];
  marketplace: TopicData[];
}

async function createTopic(memo: string): Promise<string> {
  const client = createClient();

  // Simple topic creation - operator can submit messages
  const transaction = new TopicCreateTransaction().setTopicMemo(memo);

  const txResponse = await transaction.execute(client);
  const receipt = await txResponse.getReceipt(client);
  const topicId = receipt.topicId;

  if (!topicId) {
    throw new Error(`Failed to create topic: ${memo}`);
  }

  log(`   ✅ ${topicId.toString()}`);
  client.close();

  return topicId.toString();
}

async function main() {
  console.log("\n🚀 Phase 4: Creating HCS Topics on Testnet\n");
  console.log("=".repeat(60));

  try {
    const topics: TopicsOutput = {
      network: "testnet",
      createdAt: new Date().toISOString(),
      global: [],
      realEstate: [],
      agriculture: [],
      properties: [],
      marketplace: [],
    };

    // Global Topics (4)
    console.log("\n📋 Global Topics:");
    topics.global.push({ topicId: await createTopic("DeraLinks - User Profiles & KYC"), memo: "DeraLinks - User Profiles & KYC", category: "global" });
    topics.global.push({ topicId: await createTopic("DeraLinks - System Audit Trail"), memo: "DeraLinks - System Audit Trail", category: "global" });
    topics.global.push({ topicId: await createTopic("DeraLinks - Document Registry"), memo: "DeraLinks - Document Registry", category: "global" });
    topics.global.push({ topicId: await createTopic("DeraLinks - Platform Notifications"), memo: "DeraLinks - Platform Notifications", category: "global" });

    // Real Estate Topics (6)
    console.log("\n🏠 Real Estate Topics:");
    topics.realEstate.push({ topicId: await createTopic("DeraLinks - Real Estate - NFT Metadata"), memo: "DeraLinks - Real Estate - NFT Metadata", category: "realEstate" });
    topics.realEstate.push({ topicId: await createTopic("DeraLinks - Real Estate - Property Events"), memo: "DeraLinks - Real Estate - Property Events", category: "realEstate" });
    topics.realEstate.push({ topicId: await createTopic("DeraLinks - Real Estate - Financial Data"), memo: "DeraLinks - Real Estate - Financial Data", category: "realEstate" });
    topics.realEstate.push({ topicId: await createTopic("DeraLinks - Real Estate - Rental Income"), memo: "DeraLinks - Real Estate - Rental Income", category: "realEstate" });
    topics.realEstate.push({ topicId: await createTopic("DeraLinks - Real Estate - Distributions"), memo: "DeraLinks - Real Estate - Distributions", category: "realEstate" });
    topics.realEstate.push({ topicId: await createTopic("DeraLinks - Real Estate - Maintenance"), memo: "DeraLinks - Real Estate - Maintenance", category: "realEstate" });

    // Agriculture Topics (6)
    console.log("\n🌾 Agriculture Topics:");
    topics.agriculture.push({ topicId: await createTopic("DeraLinks - Agriculture - NFT Metadata"), memo: "DeraLinks - Agriculture - NFT Metadata", category: "agriculture" });
    topics.agriculture.push({ topicId: await createTopic("DeraLinks - Agriculture - Harvest Records"), memo: "DeraLinks - Agriculture - Harvest Records", category: "agriculture" });
    topics.agriculture.push({ topicId: await createTopic("DeraLinks - Agriculture - Crop Health"), memo: "DeraLinks - Agriculture - Crop Health", category: "agriculture" });
    topics.agriculture.push({ topicId: await createTopic("DeraLinks - Agriculture - Weather Data"), memo: "DeraLinks - Agriculture - Weather Data", category: "agriculture" });
    topics.agriculture.push({ topicId: await createTopic("DeraLinks - Agriculture - Revenue Distribution"), memo: "DeraLinks - Agriculture - Revenue Distribution", category: "agriculture" });
    topics.agriculture.push({ topicId: await createTopic("DeraLinks - Agriculture - Certifications"), memo: "DeraLinks - Agriculture - Certifications", category: "agriculture" });

    // Properties Topics (6)
    console.log("\n🏢 Properties Topics:");
    topics.properties.push({ topicId: await createTopic("DeraLinks - Properties - NFT Metadata"), memo: "DeraLinks - Properties - NFT Metadata", category: "properties" });
    topics.properties.push({ topicId: await createTopic("DeraLinks - Properties - Asset Events"), memo: "DeraLinks - Properties - Asset Events", category: "properties" });
    topics.properties.push({ topicId: await createTopic("DeraLinks - Properties - Valuations"), memo: "DeraLinks - Properties - Valuations", category: "properties" });
    topics.properties.push({ topicId: await createTopic("DeraLinks - Properties - Ownership Transfers"), memo: "DeraLinks - Properties - Ownership Transfers", category: "properties" });
    topics.properties.push({ topicId: await createTopic("DeraLinks - Properties - Legal Documents"), memo: "DeraLinks - Properties - Legal Documents", category: "properties" });
    topics.properties.push({ topicId: await createTopic("DeraLinks - Properties - Income Tracking"), memo: "DeraLinks - Properties - Income Tracking", category: "properties" });

    // Marketplace Topics (4)
    console.log("\n🛒 Marketplace Topics:");
    topics.marketplace.push({ topicId: await createTopic("DeraLinks - Marketplace - Listings"), memo: "DeraLinks - Marketplace - Listings", category: "marketplace" });
    topics.marketplace.push({ topicId: await createTopic("DeraLinks - Marketplace - Offers"), memo: "DeraLinks - Marketplace - Offers", category: "marketplace" });
    topics.marketplace.push({ topicId: await createTopic("DeraLinks - Marketplace - Transactions"), memo: "DeraLinks - Marketplace - Transactions", category: "marketplace" });
    topics.marketplace.push({ topicId: await createTopic("DeraLinks - Marketplace - Price History"), memo: "DeraLinks - Marketplace - Price History", category: "marketplace" });

    // Save
    saveJSON("topics.json", topics);

    console.log("\n" + "=".repeat(60));
    console.log("\n✅ All 26 Topics Created!\n");
    console.log("📊 Summary:");
    console.log(`   Global:      ${topics.global.length} topics`);
    console.log(`   Real Estate: ${topics.realEstate.length} topics`);
    console.log(`   Agriculture: ${topics.agriculture.length} topics`);
    console.log(`   Properties:  ${topics.properties.length} topics`);
    console.log(`   Marketplace: ${topics.marketplace.length} topics`);
    console.log("\n💾 Saved to: output/topics.json\n");

  } catch (error) {
    console.error("\n❌ Error:", error);
    process.exit(1);
  }
}

main();
