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
 * Fetch NFT transfers for a specific token from Mirror Node
 */
export const fetchNFTTransfers = async (
  tokenId: string,
  fromTimestamp?: string
): Promise<NFTTransferEvent[]> => {
  try {
    // Correct Hedera Mirror Node API endpoint for token transactions
    let url = `${MIRROR_NODE_URL}/api/v1/transactions?token.id=${tokenId}&type=CRYPTOTRANSFER&order=asc&limit=100`;

    if (fromTimestamp) {
      url += `&timestamp=gt:${fromTimestamp}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Mirror Node API error: ${response.status}`);
    }

    const data: any = await response.json();
    const transfers: NFTTransferEvent[] = [];

    // Parse transactions for NFT transfers
    (data.transactions || []).forEach((tx: any) => {
      (tx.nft_transfers || []).forEach((transfer: any) => {
        if (transfer.token_id === tokenId) {
          transfers.push({
            token_id: transfer.token_id,
            serial_number: transfer.serial_number,
            sender_account_id: transfer.sender_account_id,
            receiver_account_id: transfer.receiver_account_id,
            consensus_timestamp: tx.consensus_timestamp,
            transaction_id: tx.transaction_id,
          });
        }
      });
    });

    return transfers;
  } catch (error: any) {
    console.error('Error fetching NFT transfers:', error);
    throw error;
  }
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
 * Sync NFT transfers to database
 */
export const syncNFTTransfers = async (tokenId: string): Promise<number> => {
  try {
    // Get last synced timestamp from database
    const lastSyncQuery = `
      SELECT MAX(hedera_timestamp) as last_timestamp
      FROM nft_transfers
      WHERE token_id = $1
    `;
    const lastSyncResult = await query(lastSyncQuery, [tokenId]);
    const lastTimestamp = lastSyncResult.rows[0]?.last_timestamp;

    // Fetch new transfers from Mirror Node
    const transfers = await fetchNFTTransfers(tokenId, lastTimestamp);

    if (transfers.length === 0) {
      console.log(`No new transfers for token ${tokenId}`);
      return 0;
    }

    // Insert transfers into database
    for (const transfer of transfers) {
      await query(
        `INSERT INTO nft_transfers (
          token_id, from_account, to_account, serial_numbers,
          quantity, status, hedera_transaction_id, hedera_timestamp, completed_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (hedera_transaction_id) DO NOTHING`,
        [
          transfer.token_id,
          transfer.sender_account_id,
          transfer.receiver_account_id,
          [transfer.serial_number],
          1,
          'completed',
          transfer.transaction_id,
          transfer.consensus_timestamp,
          new Date(parseFloat(transfer.consensus_timestamp) * 1000),
        ]
      );

      // Update nft_holdings
      await updateNFTHoldings(
        transfer.token_id,
        transfer.serial_number,
        transfer.receiver_account_id
      );
    }

    console.log(`✅ Synced ${transfers.length} NFT transfers for token ${tokenId}`);
    return transfers.length;
  } catch (error: any) {
    console.error('Error syncing NFT transfers:', error);
    throw error;
  }
};

/**
 * Update NFT holdings based on transfer
 */
async function updateNFTHoldings(
  tokenId: string,
  serialNumber: number,
  newOwner: string
): Promise<void> {
  try {
    // Get property ID from token
    const propertyQuery = `
      SELECT id FROM properties WHERE token_id = $1
    `;
    const propertyResult = await query(propertyQuery, [tokenId]);
    const propertyId = propertyResult.rows[0]?.id;

    if (!propertyId) {
      console.log(`Property not found for token ${tokenId}`);
      return;
    }

    // Remove from previous holder
    await query(
      `UPDATE nft_holdings
       SET nft_serial_numbers = array_remove(nft_serial_numbers, $1),
           quantity = quantity - 1
       WHERE property_id = $2 AND $1 = ANY(nft_serial_numbers)`,
      [serialNumber, propertyId]
    );

    // Add to new holder
    await query(
      `INSERT INTO nft_holdings (user_id, property_id, nft_serial_numbers, quantity, acquired_at)
       VALUES (
         (SELECT id FROM users WHERE account_id = $1),
         $2, ARRAY[$3], 1, NOW()
       )
       ON CONFLICT (user_id, property_id) DO UPDATE
       SET nft_serial_numbers = array_append(nft_holdings.nft_serial_numbers, $3),
           quantity = nft_holdings.quantity + 1`,
      [newOwner, propertyId, serialNumber]
    );
  } catch (error: any) {
    console.error('Error updating NFT holdings:', error);
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
  fetchNFTTransfers,
  fetchTopicMessages,
  syncNFTTransfers,
  syncTopicMessages,
  syncAllProperties,
};
