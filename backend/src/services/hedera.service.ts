/**
 * Hedera Blockchain Service
 * Handles all Hedera SDK operations
 */

import {
  Client,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenMintTransaction,
  PrivateKey,
  AccountId,
  TopicCreateTransaction,
  CustomRoyaltyFee,
  CustomFixedFee,
  Hbar,
} from '@hashgraph/sdk';

// Initialize Hedera client
export const createHederaClient = (): Client => {
  const operatorId = process.env.OPERATOR_ID;
  const operatorKey = process.env.OPERATOR_KEY;
  const network = process.env.HEDERA_NETWORK || 'testnet';

  if (!operatorId || !operatorKey) {
    throw new Error('OPERATOR_ID and OPERATOR_KEY must be set in environment');
  }

  const client = network === 'mainnet'
    ? Client.forMainnet()
    : Client.forTestnet();

  client.setOperator(
    AccountId.fromString(operatorId),
    PrivateKey.fromStringDer(operatorKey)
  );

  return client;
};

// Create property NFT collection
export const createPropertyCollection = async (params: {
  collectionName: string;
  collectionSymbol: string;
  treasuryAccount: string;
  feeCollectorAccount: string;
  royaltyPercentage: number;
  totalSupply: number;
}): Promise<{
  tokenId: string;
  hcsTopicId: string;
  transactionId: string;
  timestamp: string;
  supplyKey: string;
}> => {
  const client = createHederaClient();

  try {
    const treasuryId = AccountId.fromString(params.treasuryAccount);
    const feeCollectorId = AccountId.fromString(params.feeCollectorAccount);

    // Generate keys for token management
    const adminKey = PrivateKey.generateED25519();
    const supplyKey = PrivateKey.generateED25519();
    const kycKey = PrivateKey.generateED25519();
    const freezeKey = PrivateKey.generateED25519();
    const pauseKey = PrivateKey.generateED25519();
    const wipeKey = PrivateKey.generateED25519();

    // Create royalty fee
    const royaltyFee = new CustomRoyaltyFee()
      .setNumerator(params.royaltyPercentage)
      .setDenominator(100)
      .setFeeCollectorAccountId(feeCollectorId)
      .setFallbackFee(
        new CustomFixedFee().setHbarAmount(new Hbar(params.royaltyPercentage))
      );

    // Step 1: Create HCS Topic for property updates
    const topicTx = new TopicCreateTransaction()
      .setTopicMemo(`${params.collectionName} - Property Updates`)
      .freezeWith(client);

    const topicResponse = await topicTx.execute(client);
    const topicReceipt = await topicResponse.getReceipt(client);
    const hcsTopicId = topicReceipt.topicId!.toString();

    // Step 2: Create NFT Collection
    const tokenTx = new TokenCreateTransaction()
      .setTokenName(params.collectionName)
      .setTokenSymbol(params.collectionSymbol)
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
      .setTokenMemo(`${params.collectionName} - Fractional Ownership`)
      .freezeWith(client);

    // Sign with all keys
    const signedTx = await (await (await (await (
      await (await tokenTx.sign(adminKey)).sign(supplyKey)
    ).sign(kycKey)).sign(freezeKey)).sign(pauseKey)).sign(wipeKey);

    const tokenResponse = await signedTx.execute(client);
    const tokenReceipt = await tokenResponse.getReceipt(client);
    const tokenId = tokenReceipt.tokenId!.toString();

    // Store keys in database (you'll need to implement secure key storage)
    // For now, we'll log them (INSECURE - only for development)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔑 Token Keys (STORE SECURELY):');
      console.log('   Admin Key:', adminKey.toStringDer());
      console.log('   Supply Key:', supplyKey.toStringDer());
      console.log('   KYC Key:', kycKey.toStringDer());
      console.log('   Freeze Key:', freezeKey.toStringDer());
      console.log('   Pause Key:', pauseKey.toStringDer());
      console.log('   Wipe Key:', wipeKey.toStringDer());
    }

    return {
      tokenId,
      hcsTopicId,
      transactionId: tokenResponse.transactionId!.toString(),
      timestamp: new Date().toISOString(),
      supplyKey: supplyKey.toStringDer(), // Return supply key for minting
    };
  } finally {
    client.close();
  }
};

// Mint NFTs to treasury
export const mintNFTsToTreasury = async (params: {
  tokenId: string;
  supplyKey: string;
  quantity: number;
  metadataCIDs: string[];
}): Promise<{
  serialNumbers: number[];
  transactionId: string;
}> => {
  const client = createHederaClient();

  try {
    const supplyKey = PrivateKey.fromStringDer(params.supplyKey);

    // Mint NFTs with metadata
    const metadata = params.metadataCIDs.map(cid => Buffer.from(cid));

    const mintTx = new TokenMintTransaction()
      .setTokenId(params.tokenId)
      .setMetadata(metadata)
      .freezeWith(client);

    const signedMintTx = await mintTx.sign(supplyKey);
    const mintResponse = await signedMintTx.execute(client);
    const mintReceipt = await mintResponse.getReceipt(client);

    const serialNumbers = mintReceipt.serials.map(serial => serial.toNumber());

    return {
      serialNumbers,
      transactionId: mintResponse.transactionId!.toString(),
    };
  } finally {
    client.close();
  }
};

// Query Mirror Node for account NFTs
export const getAccountNFTs = async (
  accountId: string,
  tokenId?: string
): Promise<any[]> => {
  const network = process.env.HEDERA_NETWORK || 'testnet';
  const mirrorNodeUrl = network === 'mainnet'
    ? 'https://mainnet-public.mirrornode.hedera.com'
    : 'https://testnet.mirrornode.hedera.com';

  let url = `${mirrorNodeUrl}/api/v1/accounts/${accountId}/nfts`;
  if (tokenId) {
    url += `?token.id=${tokenId}`;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Mirror Node API error: ${response.status}`);
    }

    const data: any = await response.json();
    return data.nfts || [];
  } catch (error) {
    console.error('Error fetching NFTs from Mirror Node:', error);
    throw error;
  }
};

// Get token information
export const getTokenInfo = async (tokenId: string): Promise<any> => {
  const network = process.env.HEDERA_NETWORK || 'testnet';
  const mirrorNodeUrl = network === 'mainnet'
    ? 'https://mainnet-public.mirrornode.hedera.com'
    : 'https://testnet.mirrornode.hedera.com';

  try {
    const response = await fetch(`${mirrorNodeUrl}/api/v1/tokens/${tokenId}`);
    if (!response.ok) {
      throw new Error(`Mirror Node API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching token info from Mirror Node:', error);
    throw error;
  }
};

// Get NFT metadata from IPFS
export const getNFTMetadata = async (metadataCID: string): Promise<any> => {
  const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${metadataCID}`;

  try {
    const response = await fetch(gatewayUrl);
    if (!response.ok) {
      throw new Error(`IPFS fetch error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching metadata from IPFS:', error);
    throw error;
  }
};

// Get token holders
export const getTokenHolders = async (tokenId: string): Promise<any[]> => {
  const network = process.env.HEDERA_NETWORK || 'testnet';
  const mirrorNodeUrl = network === 'mainnet'
    ? 'https://mainnet-public.mirrornode.hedera.com'
    : 'https://testnet.mirrornode.hedera.com';

  try {
    const response = await fetch(`${mirrorNodeUrl}/api/v1/tokens/${tokenId}/nfts`);
    if (!response.ok) {
      throw new Error(`Mirror Node API error: ${response.status}`);
    }

    const data: any = await response.json();
    const nfts = data.nfts || [];

    // Group by account to get holder counts
    const holderMap = new Map<string, { accountId: string; serialNumbers: number[]; quantity: number }>();

    nfts.forEach((nft: any) => {
      const accountId = nft.account_id;
      if (!holderMap.has(accountId)) {
        holderMap.set(accountId, {
          accountId,
          serialNumbers: [],
          quantity: 0,
        });
      }

      const holder = holderMap.get(accountId)!;
      holder.serialNumbers.push(parseInt(nft.serial_number));
      holder.quantity++;
    });

    return Array.from(holderMap.values());
  } catch (error) {
    console.error('Error fetching token holders from Mirror Node:', error);
    throw error;
  }
};

// Mint verification NFT
export const mintVerificationNFT = async (params: {
  verificationType: string;
  recipientAccountId: string;
  metadata: any;
}): Promise<{
  tokenId: string;
  serialNumber: number;
  transactionId: string;
}> => {
  const client = createHederaClient();

  try {
    // Get verification token ID from environment
    const tokenId = process.env[`VERIFICATION_TOKEN_${params.verificationType.toUpperCase().replace(/-/g, '_')}`];

    if (!tokenId) {
      throw new Error(`Verification token not configured for type: ${params.verificationType}`);
    }

    // Get supply key from environment (try token-specific key first, then fall back to general key)
    const supplyKeyEnvVar = `VERIFICATION_SUPPLY_KEY_${params.verificationType.toUpperCase().replace(/-/g, '_')}`;
    const supplyKeyString = process.env[supplyKeyEnvVar] || process.env.VERIFICATION_SUPPLY_KEY || process.env.OPERATOR_KEY;

    if (!supplyKeyString) {
      throw new Error(`Supply key not found. Set ${supplyKeyEnvVar}, VERIFICATION_SUPPLY_KEY, or OPERATOR_KEY`);
    }

    const supplyKey = PrivateKey.fromStringDer(supplyKeyString);

    // Create metadata buffer
    const metadataBuffer = Buffer.from(JSON.stringify(params.metadata));

    // Mint verification NFT
    const mintTx = new TokenMintTransaction()
      .setTokenId(tokenId)
      .setMetadata([metadataBuffer])
      .freezeWith(client);

    const signedMintTx = await mintTx.sign(supplyKey);
    const mintResponse = await signedMintTx.execute(client);
    const mintReceipt = await mintResponse.getReceipt(client);

    const serialNumber = mintReceipt.serials[0].toNumber();

    console.log(`✅ Verification NFT minted: ${tokenId} #${serialNumber}`);

    return {
      tokenId,
      serialNumber,
      transactionId: mintResponse.transactionId!.toString(),
    };
  } finally {
    client.close();
  }
};

export default {
  createHederaClient,
  createPropertyCollection,
  mintNFTsToTreasury,
  getAccountNFTs,
  getTokenInfo,
  getNFTMetadata,
  getTokenHolders,
  mintVerificationNFT,
};
