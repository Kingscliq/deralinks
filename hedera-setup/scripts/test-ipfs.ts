import { testConnection, uploadJSON } from "./utils/ipfs";
import dotenv from "dotenv";

/**
 * Test IPFS/Pinata Connection
 * Verifies that Pinata credentials are working
 */

dotenv.config();

async function main() {
  console.log("\n🧪 Testing IPFS/Pinata Connection\n");
  console.log("=".repeat(60));

  try {
    // Test authentication
    console.log("\n📡 Testing Pinata authentication...");
    const isConnected = await testConnection();

    if (!isConnected) {
      console.error("\n❌ Pinata connection failed!");
      console.log("\n📝 Setup Instructions:");
      console.log("1. Go to: https://app.pinata.cloud/developers/api-keys");
      console.log("2. Sign up for a free account if you don't have one");
      console.log("3. Click 'New Key' button");
      console.log("4. Enable these permissions:");
      console.log("   - pinFileToIPFS");
      console.log("   - pinJSONToIPFS");
      console.log("5. Give it a name like 'DeraLinks Dev'");
      console.log("6. Click 'Create Key'");
      console.log("7. Copy the JWT token (long string)");
      console.log("8. Add to your .env file:");
      console.log("   PINATA_JWT=your_jwt_here\n");
      process.exit(1);
    }

    // Test uploading JSON
    console.log("\n📤 Testing JSON upload...");
    const testData = {
      name: "Test NFT",
      description: "This is a test upload to verify Pinata integration",
      timestamp: new Date().toISOString(),
    };

    const cid = await uploadJSON(testData);

    console.log("\n" + "=".repeat(60));
    console.log("\n✅ IPFS/Pinata Integration Working!");
    console.log("\n📊 Test Upload:");
    console.log(`   CID: ${cid}`);
    console.log(`   View at: https://gateway.pinata.cloud/ipfs/${cid}`);
    console.log("\n✨ You're ready to upload NFT images and metadata!\n");

  } catch (error: any) {
    console.error("\n❌ Error:", error.message);
    console.log("\nMake sure:");
    console.log("1. You have a Pinata account");
    console.log("2. PINATA_JWT is set in your .env file");
    console.log("3. The JWT token is valid");
    process.exit(1);
  }
}

main();
