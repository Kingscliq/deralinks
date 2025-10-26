import { Client, AccountId, PrivateKey } from "@hashgraph/sdk";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

/**
 * Creates a Hedera client for testnet
 * Keep it simple!
 */
export function createClient(): Client {
  const operatorId = process.env.OPERATOR_ID;
  const operatorKey = process.env.OPERATOR_KEY;

  if (!operatorId || !operatorKey) {
    throw new Error("Missing OPERATOR_ID or OPERATOR_KEY in .env");
  }

  // Create testnet client
  const client = Client.forTestnet();

  // Set operator
  client.setOperator(
    AccountId.fromString(operatorId),
    PrivateKey.fromString(operatorKey)
  );

  console.log(`✅ Connected to Hedera Testnet`);
  console.log(`📋 Operator: ${operatorId}`);

  return client;
}

/**
 * Get operator account ID
 */
export function getOperatorId(): AccountId {
  const id = process.env.OPERATOR_ID;
  if (!id) throw new Error("OPERATOR_ID not set");
  return AccountId.fromString(id);
}

/**
 * Get operator private key
 */
export function getOperatorKey(): PrivateKey {
  const key = process.env.OPERATOR_KEY;
  if (!key) throw new Error("OPERATOR_KEY not set");
  return PrivateKey.fromString(key);
}
