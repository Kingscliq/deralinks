import {
  TokenMintTransaction,
  PrivateKey,
  TopicMessageSubmitTransaction,
} from "@hashgraph/sdk";
import { createClient } from "./utils/client";
import { saveJSON, loadJSON, log } from "./utils/helpers";

/**
 * Phase 6: Mint Sample NFTs on Testnet
 * Mints sample NFTs for each collection with metadata
 * Keep it simple!
 */

interface PropertyMetadata {
  propertyId: string;
  name: string;
  description: string;
  type: string;
  location: string;
  totalShares: number;
  pricePerShare: string;
  images: string[]; // IPFS CIDs
  documents: string[]; // IPFS CIDs
  coordinates?: {
    lat: number;
    lng: number;
  };
  details: any;
}

interface MintedNFT {
  collectionId: string;
  serialNumbers: number[];
  metadata: PropertyMetadata;
  metadataSubmitted: boolean;
  hcsMessageId?: string;
}

interface NFTsOutput {
  network: string;
  createdAt: string;
  realEstate: MintedNFT[];
  agriculture: MintedNFT[];
  properties: MintedNFT[];
}

/**
 * Submit metadata to HCS topic
 */
async function submitMetadataToTopic(
  client: any,
  topicId: string,
  metadata: PropertyMetadata
): Promise<string> {
  const message = JSON.stringify(metadata, null, 2);
  const transaction = new TopicMessageSubmitTransaction()
    .setTopicId(topicId)
    .setMessage(message);

  const txResponse = await transaction.execute(client);
  const receipt = await txResponse.getReceipt(client);

  return `${topicId}@${receipt.topicSequenceNumber}`;
}

/**
 * Mint NFTs for a property
 */
async function mintNFTs(
  client: any,
  collectionId: string,
  supplyKey: string,
  metadata: PropertyMetadata,
  quantity: number,
  metadataTopicId: string
): Promise<MintedNFT> {
  log(`\n📝 Minting ${quantity} NFTs for: ${metadata.name}`);

  // For NFTs, metadata should be a CID (IPFS hash) reference
  // In simplified version, we'll use a placeholder CID
  const metadataBytes: Uint8Array[] = [];

  // Create metadata for each NFT (just the CID reference)
  for (let i = 0; i < quantity; i++) {
    // Simplified: Just use property ID + serial number as metadata
    // In production: This would be an IPFS CID like "QmXxxx..."
    const metadataCID = `${metadata.propertyId}-${i + 1}`;
    metadataBytes.push(Buffer.from(metadataCID));
  }

  // Mint NFTs
  const supplyPrivateKey = PrivateKey.fromString(supplyKey);

  const transaction = new TokenMintTransaction()
    .setTokenId(collectionId)
    .setMetadata(metadataBytes)
    .freezeWith(client);

  const signedTx = await transaction.sign(supplyPrivateKey);
  const txResponse = await signedTx.execute(client);
  const receipt = await txResponse.getReceipt(client);

  const serialNumbers = receipt.serials.map((serial) => serial.toNumber());

  log(`   ✅ Minted ${serialNumbers.length} NFTs`);
  log(`   🔢 Serial Numbers: ${serialNumbers.join(", ")}`);
  log(`   🔗 View on HashScan: https://hashscan.io/testnet/token/${collectionId}`);

  // Submit metadata to HCS topic
  log(`   📤 Submitting metadata to HCS topic ${metadataTopicId}...`);
  const messageId = await submitMetadataToTopic(client, metadataTopicId, metadata);
  log(`   ✅ Metadata submitted: ${messageId}`);

  return {
    collectionId,
    serialNumbers,
    metadata,
    metadataSubmitted: true,
    hcsMessageId: messageId,
  };
}

async function main() {
  console.log("\n🚀 Phase 6: Minting Sample NFTs on Testnet\n");
  console.log("=".repeat(60));

  // Create ONE client for all operations
  const client = createClient();

  try {
    // Load collections from Phase 5
    const collections = loadJSON("collections.json");
    if (!collections) {
      throw new Error("collections.json not found. Run Phase 5 first.");
    }

    // Load topics from Phase 4
    const topics = loadJSON("topics.json");
    if (!topics) {
      throw new Error("topics.json not found. Run Phase 4 first.");
    }

    const nfts: NFTsOutput = {
      network: "testnet",
      createdAt: new Date().toISOString(),
      realEstate: [],
      agriculture: [],
      properties: [],
    };

    // ========================================
    // Real Estate NFTs
    // ========================================
    console.log("\n🏠 Minting Real Estate NFTs:");
    console.log("─".repeat(60));

    // Sample Property 1: Residential Home in Lagos
    const lagosHome: PropertyMetadata = {
      propertyId: "RE-001",
      name: "Luxury Villa in Lekki, Lagos",
      description: "Modern 4-bedroom luxury villa in premium Lekki Phase 1 location",
      type: "Residential",
      location: "Lekki Phase 1, Lagos, Nigeria",
      totalShares: 10000,
      pricePerShare: "50 USD",
      images: [
        "QmXxxx...placeholder1", // Placeholder IPFS CID
        "QmXxxx...placeholder2",
      ],
      documents: [
        "QmDxxx...deed", // Property deed
        "QmDxxx...title", // Title document
      ],
      coordinates: {
        lat: 6.4474,
        lng: 3.5406,
      },
      details: {
        bedrooms: 4,
        bathrooms: 3,
        squareFeet: 3200,
        yearBuilt: 2020,
        monthlyRent: "2500 USD",
        estimatedValue: "500000 USD",
      },
    };

    nfts.realEstate.push(
      await mintNFTs(
        client,
        collections.realEstate.tokenId,
        collections.realEstate.supplyKey,
        lagosHome,
        5, // Mint 5 NFTs (shares) for testing
        topics.realEstate[0].topicId // Metadata topic
      )
    );

    // Sample Property 2: Commercial Building in Accra
    const accraBuilding: PropertyMetadata = {
      propertyId: "RE-002",
      name: "Commercial Office Building, Accra",
      description: "5-story commercial office building in central Accra business district",
      type: "Commercial",
      location: "Airport Residential Area, Accra, Ghana",
      totalShares: 50000,
      pricePerShare: "100 USD",
      images: ["QmYxxx...placeholder3", "QmYxxx...placeholder4"],
      documents: ["QmDxxx...commercial_deed", "QmDxxx...lease_agreements"],
      coordinates: {
        lat: 5.6037,
        lng: -0.187,
      },
      details: {
        floors: 5,
        totalArea: 12000,
        yearBuilt: 2018,
        monthlyRentalIncome: "15000 USD",
        estimatedValue: "5000000 USD",
        tenants: 8,
      },
    };

    nfts.realEstate.push(
      await mintNFTs(
        client,
        collections.realEstate.tokenId,
        collections.realEstate.supplyKey,
        accraBuilding,
        5, // Mint 5 NFTs (shares) for testing
        topics.realEstate[0].topicId
      )
    );

    // ========================================
    // Agriculture NFTs
    // ========================================
    console.log("\n🌾 Minting Agriculture NFTs:");
    console.log("─".repeat(60));

    // Sample Farm 1: Coffee Farm in Ethiopia
    const coffeeFarm: PropertyMetadata = {
      propertyId: "AG-001",
      name: "Organic Coffee Farm, Yirgacheffe",
      description: "Premium organic coffee farm in the renowned Yirgacheffe region",
      type: "Coffee Plantation",
      location: "Yirgacheffe, Sidama, Ethiopia",
      totalShares: 5000,
      pricePerShare: "200 USD",
      images: ["QmZxxx...coffee1", "QmZxxx...coffee2"],
      documents: ["QmDxxx...organic_cert", "QmDxxx...land_lease"],
      coordinates: {
        lat: 6.1631,
        lng: 38.2151,
      },
      details: {
        acres: 50,
        cropType: "Arabica Coffee",
        certifications: ["Organic", "Fair Trade"],
        annualYield: "25000 kg",
        expectedRevenue: "150000 USD/year",
        harvestSeason: "November - January",
      },
    };

    nfts.agriculture.push(
      await mintNFTs(
        client,
        collections.agriculture.tokenId,
        collections.agriculture.supplyKey,
        coffeeFarm,
        5, // Mint 5 NFTs (shares)
        topics.agriculture[0].topicId
      )
    );

    // Sample Farm 2: Cocoa Plantation in Ghana
    const cocoaPlantation: PropertyMetadata = {
      propertyId: "AG-002",
      name: "Cocoa Plantation, Ashanti Region",
      description: "Established cocoa plantation with premium quality beans",
      type: "Cocoa Plantation",
      location: "Ashanti Region, Ghana",
      totalShares: 8000,
      pricePerShare: "125 USD",
      images: ["QmAxxx...cocoa1", "QmAxxx...cocoa2"],
      documents: ["QmDxxx...cocoa_cert", "QmDxxx...land_title"],
      coordinates: {
        lat: 6.6885,
        lng: -1.6244,
      },
      details: {
        acres: 100,
        cropType: "Premium Cocoa",
        certifications: ["Rainforest Alliance"],
        annualYield: "40000 kg",
        expectedRevenue: "200000 USD/year",
        harvestSeason: "October - March",
      },
    };

    nfts.agriculture.push(
      await mintNFTs(
        client,
        collections.agriculture.tokenId,
        collections.agriculture.supplyKey,
        cocoaPlantation,
        5, // Mint 5 NFTs (shares)
        topics.agriculture[0].topicId
      )
    );

    // ========================================
    // Properties NFTs
    // ========================================
    console.log("\n🏢 Minting Properties NFTs:");
    console.log("─".repeat(60));

    // Sample Property 1: Warehouse in Durban
    const durbanWarehouse: PropertyMetadata = {
      propertyId: "PROP-001",
      name: "Logistics Warehouse, Durban Port",
      description: "Modern warehouse facility near Durban port with excellent logistics access",
      type: "Industrial Warehouse",
      location: "Port of Durban, KwaZulu-Natal, South Africa",
      totalShares: 25000,
      pricePerShare: "80 USD",
      images: ["QmWxxx...warehouse1", "QmWxxx...warehouse2"],
      documents: ["QmDxxx...warehouse_lease", "QmDxxx...permits"],
      coordinates: {
        lat: -29.8587,
        lng: 31.0218,
      },
      details: {
        totalArea: 50000,
        type: "Warehouse",
        yearBuilt: 2019,
        monthlyRentalIncome: "12000 USD",
        estimatedValue: "2000000 USD",
        tenants: 3,
      },
    };

    nfts.properties.push(
      await mintNFTs(
        client,
        collections.properties.tokenId,
        collections.properties.supplyKey,
        durbanWarehouse,
        5, // Mint 5 NFTs (shares)
        topics.properties[0].topicId
      )
    );

    // Sample Property 2: Parking Garage in Cape Town
    const capeTownParking: PropertyMetadata = {
      propertyId: "PROP-002",
      name: "Multi-level Parking Garage, Cape Town CBD",
      description: "5-level automated parking facility in central business district",
      type: "Parking Facility",
      location: "Cape Town CBD, Western Cape, South Africa",
      totalShares: 15000,
      pricePerShare: "100 USD",
      images: ["QmPxxx...parking1", "QmPxxx...parking2"],
      documents: ["QmDxxx...parking_license", "QmDxxx...building_permit"],
      coordinates: {
        lat: -33.9249,
        lng: 18.4241,
      },
      details: {
        levels: 5,
        capacity: 500,
        type: "Automated Parking",
        yearBuilt: 2021,
        monthlyRevenue: "8000 USD",
        estimatedValue: "1500000 USD",
        operatingHours: "24/7",
      },
    };

    nfts.properties.push(
      await mintNFTs(
        client,
        collections.properties.tokenId,
        collections.properties.supplyKey,
        capeTownParking,
        5, // Mint 5 NFTs (shares)
        topics.properties[0].topicId
      )
    );

    // Save all NFTs
    saveJSON("nfts.json", nfts);

    console.log("\n" + "=".repeat(60));
    console.log("\n✅ All Sample NFTs Minted Successfully!\n");
    console.log("📊 Summary:");
    console.log(`   Real Estate:  ${nfts.realEstate.length} properties (${nfts.realEstate.reduce((sum, nft) => sum + nft.serialNumbers.length, 0)} NFTs)`);
    console.log(`   Agriculture:  ${nfts.agriculture.length} farms (${nfts.agriculture.reduce((sum, nft) => sum + nft.serialNumbers.length, 0)} NFTs)`);
    console.log(`   Properties:   ${nfts.properties.length} properties (${nfts.properties.reduce((sum, nft) => sum + nft.serialNumbers.length, 0)} NFTs)`);
    console.log("\n💾 Saved to: output/nfts.json");
    console.log("\n📝 Note:");
    console.log("   - IPFS CIDs are placeholders (integrate real IPFS in production)");
    console.log("   - Metadata submitted to HCS topics for transparency");
    console.log("   - Each NFT represents one share of the property");
    console.log("   - All NFTs are minted to treasury account\\n");

  } catch (error) {
    console.error("\n❌ Error minting NFTs:", error);
    process.exit(1);
  } finally {
    // Close the client once at the end
    client.close();
  }
}

main();
