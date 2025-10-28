/**
 * Background Job Scheduler
 * Manages periodic blockchain event syncing
 */

import { syncAllProperties, syncTopicMessages } from './indexer.service';

// Job intervals (in milliseconds)
const NFT_SYNC_INTERVAL = 60 * 1000; // 1 minute
const HCS_SYNC_INTERVAL = 30 * 1000; // 30 seconds

// Job timers
let nftSyncTimer: NodeJS.Timeout | null = null;
let hcsSyncTimer: NodeJS.Timeout | null = null;

/**
 * Start NFT transfer sync job
 */
export const startNFTSync = (): void => {
  if (nftSyncTimer) {
    console.log('⚠️  NFT sync job already running');
    return;
  }

  console.log('🚀 Starting NFT transfer sync job (every 1 minute)...');

  // Run immediately on start
  syncAllProperties().catch((error) => {
    console.error('❌ NFT sync job failed:', error);
  });

  // Then run periodically
  nftSyncTimer = setInterval(async () => {
    try {
      await syncAllProperties();
    } catch (error) {
      console.error('❌ NFT sync job failed:', error);
    }
  }, NFT_SYNC_INTERVAL);
};

/**
 * Start HCS topic message sync job
 */
export const startHCSSync = (topicId?: string): void => {
  if (hcsSyncTimer) {
    console.log('⚠️  HCS sync job already running');
    return;
  }

  // Use topic ID from environment if not provided
  const hcsTopicId = topicId || process.env.HCS_TOPIC_ID;

  if (!hcsTopicId) {
    console.log('⚠️  No HCS topic ID configured, skipping HCS sync');
    return;
  }

  console.log(`🚀 Starting HCS message sync job for topic ${hcsTopicId} (every 30 seconds)...`);

  // Run immediately on start
  syncTopicMessages(hcsTopicId).catch((error) => {
    console.error('❌ HCS sync job failed:', error);
  });

  // Then run periodically
  hcsSyncTimer = setInterval(async () => {
    try {
      await syncTopicMessages(hcsTopicId);
    } catch (error) {
      console.error('❌ HCS sync job failed:', error);
    }
  }, HCS_SYNC_INTERVAL);
};

/**
 * Stop all sync jobs
 */
export const stopAllSync = (): void => {
  console.log('🛑 Stopping all sync jobs...');

  if (nftSyncTimer) {
    clearInterval(nftSyncTimer);
    nftSyncTimer = null;
    console.log('✅ NFT sync job stopped');
  }

  if (hcsSyncTimer) {
    clearInterval(hcsSyncTimer);
    hcsSyncTimer = null;
    console.log('✅ HCS sync job stopped');
  }
};

/**
 * Start all background jobs
 */
export const startAllJobs = (): void => {
  console.log('🔄 Initializing background sync jobs...');
  startNFTSync();
  startHCSSync();
};

/**
 * Graceful shutdown handler
 */
export const gracefulShutdown = async (): Promise<void> => {
  console.log('⏸️  Gracefully shutting down scheduler...');
  stopAllSync();
};

export default {
  startNFTSync,
  startHCSSync,
  stopAllSync,
  startAllJobs,
  gracefulShutdown,
};
