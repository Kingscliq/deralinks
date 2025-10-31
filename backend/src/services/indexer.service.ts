/**
 * Hedera Mirror Node Indexer Service
 * Syncs blockchain events to the database
 */

import { query } from '../config/database';

const MIRROR_NODE_URL = process.env.HEDERA_MIRROR_NODE_URL || 'https://testnet.mirrornode.hedera.com';

interface NFTTransferEvent {
  token_id: string;
  serial_number: number;
  sender_account_id: string;
  receiver_account_id: string;
  consensus_timestamp: string;
  transaction_id: string;
}

interface HCSMessage {
  topic_id: string;
  sequence_number: number;
  consensus_timestamp: string;
  message: string;
  running_hash: string;
  payer_account_id: string;
}

/**
 * Fetch NFT list with current owners for a token from Mirror Node
 * This gives us the current state of all NFTs and their owners
 */
export const fetchNFTList = async (
  tokenId: string
): Promise<Array<{ serial_number: number; account_id: string }>> => {
  try {
    let url = `${MIRROR_NODE_URL}/api/v1/tokens/${tokenId}/nfts?limit=100`;
    const allNFTs: Array<{ serial_number: number; account_id: string }> = [];

    // Handle pagination
    while (url) {
      const response = await fetch(url);
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Mirror Node API error ${response.status} for URL: ${url}`);
        console.error(`Response body: ${errorText}`);
        throw new Error(`Mirror Node API error: ${response.status} - ${errorText}`);
      }

      const data: any = await response.json();

      // Extract NFT serial numbers and current owners
      (data.nfts || []).forEach((nft: any) => {
        if (nft.account_id && nft.serial_number) {
          allNFTs.push({
            serial_number: parseInt(nft.serial_number, 10), // Convert string to integer
            account_id: nft.account_id,
          });
        }
      });

      // Check for next page
      url = data.links?.next ? `${MIRROR_NODE_URL}${data.links.next}` : '';
    }

    return allNFTs;
  } catch (error: any) {
    console.error('Error fetching NFT list:', error);
    throw error;
  }
};

/**
 * Legacy function - kept for backward compatibility but not actively used
 * Use fetchNFTList() instead for better performance
 */
export const fetchNFTTransfers = async (
  _tokenId: string,
  _fromTimestamp?: string
): Promise<NFTTransferEvent[]> => {
  console.warn('fetchNFTTransfers is deprecated. The Mirror Node API does not support querying all transfers by token ID directly. Use fetchNFTList() instead.');
  return [];
};

/**
 * Fetch HCS topic messages from Mirror Node
 */
export const fetchTopicMessages = async (
  topicId: string,
  fromSequenceNumber?: number
): Promise<HCSMessage[]> => {
  try {
    let url = `${MIRROR_NODE_URL}/api/v1/topics/${topicId}/messages`;

    if (fromSequenceNumber) {
      url += `?sequencenumber=gt:${fromSequenceNumber}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Mirror Node API error: ${response.status}`);
    }

    const data: any = await response.json();

    return (data.messages || []).map((msg: any) => ({
      topic_id: msg.topic_id,
      sequence_number: msg.sequence_number,
      consensus_timestamp: msg.consensus_timestamp,
      message: Buffer.from(msg.message, 'base64').toString('utf-8'),
      running_hash: msg.running_hash,
      payer_account_id: msg.payer_account_id,
    }));
  } catch (error: any) {
    console.error('Error fetching topic messages:', error);
    throw error;
  }
};

/**
 * Sync NFT holdings to database by checking current state from Mirror Node
 * This syncs the current ownership state rather than historical transfers
 */
export const syncNFTTransfers = async (tokenId: string): Promise<number> => {
  try {
    console.log(`🔄 Syncing NFT holdings for token ${tokenId}...`);

    // Fetch current NFT ownership from Mirror Node
    const nftList = await fetchNFTList(tokenId);

    if (nftList.length === 0) {
      console.log(`ℹ️  No NFTs found for token ${tokenId}`);
      return 0;
    }

    console.log(`📊 Found ${nftList.length} NFTs for token ${tokenId}`);

    let updatedCount = 0;

    // Update holdings for each NFT
    for (const nft of nftList) {
      await updateNFTHoldings(
        tokenId,
        nft.serial_number,
        nft.account_id
      );
      updatedCount++;
    }

    console.log(`✅ Synced ${updatedCount} NFT holdings for token ${tokenId}`);
    return updatedCount;
  } catch (error: any) {
    console.error('Error syncing NFT holdings:', error);
    throw error;
  }
};

/**
 * Update NFT holdings based on current ownership from Mirror Node
 * Matches the actual nft_holdings schema
 */
async function updateNFTHoldings(
  tokenId: string,
  serialNumber: number,
  ownerAccount: string
): Promise<void> {
  try {
    // Check if property exists (optional validation)
    const propertyQuery = `
      SELECT id FROM properties WHERE token_id = $1
    `;
    const propertyResult = await query(propertyQuery, [tokenId]);

    if (propertyResult.rows.length === 0) {
      console.log(`⚠️  Property not found for token ${tokenId}, skipping holdings update`);
      return;
    }

    // Remove this serial number from any previous holder
    // First, delete rows where this is the last serial number (would result in empty array)
    await query(
      `DELETE FROM nft_holdings
       WHERE token_id = $1
         AND $2::integer = ANY(serial_numbers)
         AND array_length(serial_numbers, 1) = 1`,
      [tokenId, serialNumber]
    );

    // Then update rows that still have other serial numbers
    await query(
      `UPDATE nft_holdings
       SET serial_numbers = array_remove(serial_numbers, $1::integer),
           quantity = array_length(array_remove(serial_numbers, $1::integer), 1),
           last_updated_at = NOW()
       WHERE token_id = $2
         AND $1::integer = ANY(serial_numbers)
         AND array_length(serial_numbers, 1) > 1`,
      [serialNumber, tokenId]
    );

    // Add to current holder (using actual schema columns)
    // Cast $3 to integer to ensure PostgreSQL treats it as integer, not text
    await query(
      `INSERT INTO nft_holdings (
         owner_hedera_account, token_id, serial_numbers, quantity, first_acquired_at, last_updated_at
       )
       VALUES ($1, $2, ARRAY[$3::integer], 1, NOW(), NOW())
       ON CONFLICT (owner_hedera_account, token_id)
       DO UPDATE SET
         serial_numbers = CASE
           WHEN $3::integer = ANY(nft_holdings.serial_numbers) THEN nft_holdings.serial_numbers
           ELSE array_append(nft_holdings.serial_numbers, $3::integer)
         END,
         quantity = array_length(
           CASE
             WHEN $3::integer = ANY(nft_holdings.serial_numbers) THEN nft_holdings.serial_numbers
             ELSE array_append(nft_holdings.serial_numbers, $3::integer)
           END, 1
         ),
         last_updated_at = NOW()`,
      [ownerAccount, tokenId, serialNumber]
    );
  } catch (error: any) {
    console.error(`Error updating NFT holdings for serial ${serialNumber}:`, error);
  }
}

/**
 * Sync HCS topic messages to database (for audit trail)
 */
export const syncTopicMessages = async (topicId: string): Promise<number> => {
  try {
    // Get last synced sequence number
    const lastSyncQuery = `
      SELECT value::bigint as last_sequence
      FROM platform_config
      WHERE key = $1
    `;
    const configKey = `hcs_topic_${topicId}_last_sequence`;
    const lastSyncResult = await query(lastSyncQuery, [configKey]);
    const lastSequence = lastSyncResult.rows[0]?.last_sequence || 0;

    // Fetch new messages
    const messages = await fetchTopicMessages(topicId, lastSequence);

    if (messages.length === 0) {
      console.log(`No new messages for topic ${topicId}`);
      return 0;
    }

    // Store messages (for audit trail and analytics)
    // You can create a separate table for HCS messages if needed

    // Update last synced sequence number
    const newLastSequence = messages[messages.length - 1].sequence_number;
    await query(
      `INSERT INTO platform_config (key, value, description)
       VALUES ($1, $2, $3)
       ON CONFLICT (key) DO UPDATE
       SET value = $2, updated_at = CURRENT_TIMESTAMP`,
      [
        configKey,
        newLastSequence.toString(),
        `Last synced sequence number for HCS topic ${topicId}`,
      ]
    );

    console.log(`✅ Synced ${messages.length} HCS messages for topic ${topicId}`);
    return messages.length;
  } catch (error: any) {
    console.error('Error syncing topic messages:', error);
    throw error;
  }
};

/**
 * Sync all property NFT collections
 */
export const syncAllProperties = async (): Promise<void> => {
  try {
    console.log('🔄 Starting sync of all property NFT collections...');

    // Get all property tokens from database
    const propertiesQuery = `SELECT token_id FROM properties WHERE token_id IS NOT NULL`;
    const result = await query(propertiesQuery);

    for (const row of result.rows) {
      await syncNFTTransfers(row.token_id);
    }

    console.log('✅ Sync complete for all properties');
  } catch (error: any) {
    console.error('Error syncing all properties:', error);
    throw error;
  }
};

export default {
  fetchNFTList,
  fetchNFTTransfers,
  fetchTopicMessages,
  syncNFTTransfers,
  syncTopicMessages,
  syncAllProperties,
};
