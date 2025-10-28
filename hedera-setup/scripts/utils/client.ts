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

  // Handle different key formats
  let privateKey: PrivateKey;
  if (operatorKey.startsWith("302e020100")) {
    privateKey = PrivateKey.fromStringDer(operatorKey);
  } else {
    privateKey = PrivateKey.fromStringED25519(operatorKey);
  }

  // Set operator
  client.setOperator(AccountId.fromString(operatorId), privateKey);

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

  // Handle different key formats
  // DER-encoded keys start with "302e020100"
  // Raw hex keys are 64 characters
  if (key.startsWith("302e020100")) {
    return PrivateKey.fromStringDer(key);
  } else {
    // For raw hex keys, use ED25519 (Hedera's default)
    return PrivateKey.fromStringED25519(key);
  }
}
