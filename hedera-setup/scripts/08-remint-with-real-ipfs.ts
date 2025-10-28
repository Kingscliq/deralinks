import {
  Client,
  TokenMintTransaction,
  PrivateKey,
} from "@hashgraph/sdk";
import { createClient } from "./utils/client";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

/**
 * Re-mint NFTs with Real IPFS CIDs
 *
 * This script mints new NFTs using the real IPFS metadata CIDs
 * that were uploaded in Phase 6.6.
 *
 * The metadata CIDs point to proper JSON files with:
 * - Property name and description
 * - Real IPFS image URLs
 * - Attributes (bedrooms, value, location, etc.)
 * - Additional properties
 *
 * These new NFTs will display correctly on HashScan and in wallets!
 */

dotenv.config();

interface MintResult {
  collectionId: string;
  collectionName: string;
  property: {
    id: string;
    name: string;
  };
  serialNumbers: number[];
  metadataCID: string;
  imageCID: string;
}

/**
 * Mint NFTs for a collection using real IPFS metadata
 */
async function mintNFTsWithIPFS(
  client: Client,
  collectionId: string,
  supplyKey: PrivateKey,
  metadataCID: string
): Promise<number[]> {
  // Create metadata bytes from IPFS CID
  // Store as UTF-8 encoded string
  const metadataBytes = Buffer.from(metadataCID, "utf-8");

  // Create mint transaction
  const mintTx = new TokenMintTransaction()
    .setTokenId(collectionId)
    .setMetadata([metadataBytes]); // Mint 1 NFT with this metadata

  // Freeze and sign with supply key
  const frozenTx = mintTx.freezeWith(client);
  const signedTx = await frozenTx.sign(supplyKey);

  // Execute
  const mintResponse = await signedTx.execute(client);
  const mintReceipt = await mintResponse.getReceipt(client);

  // Get serial numbers
  const serials = mintReceipt.serials.map((s) => Number(s));

  return serials;
}

async function main() {
  console.log("\n🔄 Re-minting NFTs with Real IPFS CIDs\n");
  console.log("=".repeat(60));

  try {
    const client = createClient();

    // Load IPFS CIDs
    const ipfsPath = path.join(process.cwd(), "output", "ipfs-cids.json");
    if (!fs.existsSync(ipfsPath)) {
      throw new Error(
        "IPFS CIDs file not found. Run 'npm run upload:ipfs' first."
      );
    }
    const ipfsCIDs = JSON.parse(fs.readFileSync(ipfsPath, "utf-8"));

    // Load collections
    const collectionsPath = path.join(
      process.cwd(),
      "output",
      "collections.json"
    );
    if (!fs.existsSync(collectionsPath)) {
      throw new Error(
        "Collections file not found. Run 'npm run setup:collections' first."
      );
    }
    const collections = JSON.parse(
      fs.readFileSync(collectionsPath, "utf-8")
    );

    const results: MintResult[] = [];

    // Mint Real Estate NFTs
    console.log("\n🏠 Minting Real Estate NFTs with real IPFS...\n");
    for (const property of ipfsCIDs.realEstate) {
      console.log(`   Minting: ${property.name}`);
      console.log(`   Metadata CID: ${property.metadataCID}`);
      console.log(`   Image CID: ${property.imageCID}`);

      const supplyKey = PrivateKey.fromString(
        collections.realEstate.supplyKey
      );

      // Mint 5 NFTs (can be adjusted)
      const quantity = 5;
      const allSerials: number[] = [];

      for (let i = 0; i < quantity; i++) {
        const serials = await mintNFTsWithIPFS(
          client,
          collections.realEstate.tokenId,
          supplyKey,
          property.metadataCID
        );
        allSerials.push(...serials);
        console.log(`   ✅ Minted serial #${serials[0]}`);
      }

      results.push({
        collectionId: collections.realEstate.tokenId,
        collectionName: "Real Estate NFTs",
        property: {
          id: property.propertyId,
          name: property.name,
        },
        serialNumbers: allSerials,
        metadataCID: property.metadataCID,
        imageCID: property.imageCID,
      });

      console.log(
        `   🎉 Minted ${quantity} NFTs for ${property.name} (serials: ${allSerials.join(", ")})\n`
      );
    }

    // Mint Agriculture NFTs
    console.log("\n🌾 Minting Agriculture NFTs with real IPFS...\n");
    for (const property of ipfsCIDs.agriculture) {
      console.log(`   Minting: ${property.name}`);
      console.log(`   Metadata CID: ${property.metadataCID}`);
      console.log(`   Image CID: ${property.imageCID}`);

      const supplyKey = PrivateKey.fromString(
        collections.agriculture.supplyKey
      );

      const quantity = 5;
      const allSerials: number[] = [];

      for (let i = 0; i < quantity; i++) {
        const serials = await mintNFTsWithIPFS(
          client,
          collections.agriculture.tokenId,
          supplyKey,
          property.metadataCID
        );
        allSerials.push(...serials);
        console.log(`   ✅ Minted serial #${serials[0]}`);
      }

      results.push({
        collectionId: collections.agriculture.tokenId,
        collectionName: "Agriculture NFTs",
        property: {
          id: property.propertyId,
          name: property.name,
        },
        serialNumbers: allSerials,
        metadataCID: property.metadataCID,
        imageCID: property.imageCID,
      });

      console.log(
        `   🎉 Minted ${quantity} NFTs for ${property.name} (serials: ${allSerials.join(", ")})\n`
      );
    }

    // Mint Properties NFTs
    console.log("\n🏭 Minting Properties NFTs with real IPFS...\n");
    for (const property of ipfsCIDs.properties) {
      console.log(`   Minting: ${property.name}`);
      console.log(`   Metadata CID: ${property.metadataCID}`);
      console.log(`   Image CID: ${property.imageCID}`);

      const supplyKey = PrivateKey.fromString(
        collections.properties.supplyKey
      );

      const quantity = 5;
      const allSerials: number[] = [];

      for (let i = 0; i < quantity; i++) {
        const serials = await mintNFTsWithIPFS(
          client,
          collections.properties.tokenId,
          supplyKey,
          property.metadataCID
        );
        allSerials.push(...serials);
        console.log(`   ✅ Minted serial #${serials[0]}`);
      }

      results.push({
        collectionId: collections.properties.tokenId,
        collectionName: "Properties NFTs",
        property: {
          id: property.propertyId,
          name: property.name,
        },
        serialNumbers: allSerials,
        metadataCID: property.metadataCID,
        imageCID: property.imageCID,
      });

      console.log(
        `   🎉 Minted ${quantity} NFTs for ${property.name} (serials: ${allSerials.join(", ")})\n`
      );
    }

    // Save results
    const outputPath = path.join(
      process.cwd(),
      "output",
      "nfts-with-ipfs.json"
    );
    fs.writeFileSync(
      outputPath,
      JSON.stringify(
        {
          network: "testnet",
          createdAt: new Date().toISOString(),
          note: "These NFTs have real IPFS metadata and will display images correctly",
          results,
        },
        null,
        2
      )
    );

    console.log("=".repeat(60));
    console.log("\n✅ Re-minting Complete!\n");
    console.log(`📄 Results saved to: ${outputPath}\n`);
    console.log(`📊 Summary:`);
    console.log(`   Total NFTs minted: ${results.reduce((sum, r) => sum + r.serialNumbers.length, 0)}`);
    console.log(`   Real Estate: ${results.filter((r) => r.collectionName === "Real Estate NFTs").length} properties`);
    console.log(`   Agriculture: ${results.filter((r) => r.collectionName === "Agriculture NFTs").length} properties`);
    console.log(`   Properties: ${results.filter((r) => r.collectionName === "Properties NFTs").length} properties`);
    console.log(`\n🎨 These NFTs have real IPFS metadata!`);
    console.log(`   Images will display correctly on HashScan and in wallets.\n`);
    console.log(`🔍 View collections on HashScan:`);
    console.log(`   Real Estate: https://hashscan.io/testnet/token/${collections.realEstate.tokenId}`);
    console.log(`   Agriculture: https://hashscan.io/testnet/token/${collections.agriculture.tokenId}`);
    console.log(`   Properties: https://hashscan.io/testnet/token/${collections.properties.tokenId}\n`);

    client.close();
  } catch (error: any) {
    console.error("\n❌ Error during minting:", error.message);
    if (error.status) {
      console.log(`\nError code: ${error.status._code}`);
    }
    process.exit(1);
  }
}

main();
