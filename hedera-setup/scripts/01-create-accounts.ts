import {
  AccountCreateTransaction,
  PrivateKey,
  Hbar,
  AccountInfoQuery,
} from "@hashgraph/sdk";
import { createClient } from "./utils/client";
import { saveJSON, log } from "./utils/helpers";

/**
 * Phase 3: Create Platform Accounts
 * Creates Treasury, Fee Collector, and Admin accounts on testnet
 */

interface AccountData {
  accountId: string;
  privateKey: string;
  publicKey: string;
  memo: string;
  initialBalance: string;
  purpose: string;
}

interface AccountsOutput {
  network: string;
  createdAt: string;
  treasury: AccountData;
  feeCollector: AccountData;
  admin: AccountData;
}

async function createAccount(
  name: string,
  memo: string,
  initialBalance: number,
  purpose: string
): Promise<AccountData> {
  log(`\n📝 Creating ${name} Account...`);

  const client = createClient();

  // Generate new ED25519 key pair
  const privateKey = PrivateKey.generateED25519();
  const publicKey = privateKey.publicKey;

  log(`   ✅ Generated key pair`);
  log(`   🔑 Public Key: ${publicKey.toString()}`);

  // Create account
  const transaction = new AccountCreateTransaction()
    .setKey(publicKey)
    .setInitialBalance(new Hbar(initialBalance))
    .setMaxAutomaticTokenAssociations(-1) // Unlimited token associations
    .setAccountMemo(memo);

  const txResponse = await transaction.execute(client);
  const receipt = await txResponse.getReceipt(client);
  const accountId = receipt.accountId;

  if (!accountId) {
    throw new Error(`Failed to create ${name} account`);
  }

  log(`   ✅ Account Created: ${accountId.toString()}`);
  log(`   💰 Initial Balance: ${initialBalance} HBAR`);
  log(`   📋 Memo: ${memo}`);

  // Verify account exists
  await new AccountInfoQuery()
    .setAccountId(accountId)
    .execute(client);

  log(`   ✅ Account verified on network`);
  log(`   🔗 View on HashScan: https://hashscan.io/testnet/account/${accountId.toString()}`);

  client.close();

  return {
    accountId: accountId.toString(),
    privateKey: privateKey.toString(),
    publicKey: publicKey.toString(),
    memo,
    initialBalance: `${initialBalance} HBAR`,
    purpose,
  };
}

async function main() {
  console.log("\n🚀 Phase 3: Creating Platform Accounts on Testnet\n");
  console.log("=" .repeat(60));

  try {
    // Create Treasury Account (reduced balance for testnet)
    const treasury = await createAccount(
      "Treasury",
      "DeraLinks - Treasury - TESTNET",
      20, // 20 HBAR (enough for testnet operations)
      "Holds all tokens initially, platform treasury"
    );

    // Create Fee Collector Account
    const feeCollector = await createAccount(
      "Fee Collector",
      "DeraLinks - Fee Collector - TESTNET",
      10, // 10 HBAR (enough to collect fees)
      "Receives all platform fees and royalties"
    );

    // Create Admin Account
    const admin = await createAccount(
      "Admin",
      "DeraLinks - Admin - TESTNET",
      20, // 20 HBAR (enough for admin operations)
      "Platform administrator, manages NFTs and topics"
    );

    // Save all accounts
    const accountsData: AccountsOutput = {
      network: "testnet",
      createdAt: new Date().toISOString(),
      treasury,
      feeCollector,
      admin,
    };

    saveJSON("accounts.json", accountsData);

    console.log("\n" + "=".repeat(60));
    console.log("\n✅ All Accounts Created Successfully!\n");
    console.log("📊 Summary:");
    console.log(`   Treasury:      ${treasury.accountId}`);
    console.log(`   Fee Collector: ${feeCollector.accountId}`);
    console.log(`   Admin:         ${admin.accountId}`);
    console.log("\n💾 Saved to: output/accounts.json");
    console.log("\n⚠️  SECURITY WARNING:");
    console.log("   Private keys are saved in output/accounts.json");
    console.log("   This file is gitignored. Keep it safe!");
    console.log("   Consider backing up to secure offline storage.\n");

  } catch (error) {
    console.error("\n❌ Error creating accounts:", error);
    process.exit(1);
  }
}

main();
