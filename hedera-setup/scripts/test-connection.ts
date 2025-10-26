import { AccountBalanceQuery } from "@hashgraph/sdk";
import { createClient, getOperatorId } from "./utils/client";

/**
 * Simple test to verify Hedera testnet connection
 * and check operator account balance
 */
async function testConnection() {
  console.log("🔍 Testing Hedera Testnet Connection...\n");

  try {
    // Create client
    const client = createClient();
    const operatorId = getOperatorId();

    // Check balance
    console.log("\n💰 Checking account balance...");
    const balance = await new AccountBalanceQuery()
      .setAccountId(operatorId)
      .execute(client);

    console.log(`\n✅ Success!`);
    console.log(`   Account: ${operatorId}`);
    console.log(`   Balance: ${balance.hbars.toString()}`);
    console.log(`\n🎉 You're ready to build!\n`);

    client.close();
  } catch (error) {
    console.error("\n❌ Error:", error);
    process.exit(1);
  }
}

testConnection();
