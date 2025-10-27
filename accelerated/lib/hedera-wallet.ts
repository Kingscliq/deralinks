/**
 * Hedera Wallet Connection using WalletConnect
 * Supports HashPack, Blade, Kabila, and other Hedera wallets
 */

import {
  HederaSessionEvent,
  HederaJsonRpcMethod,
  DAppConnector,
  HederaChainId,
} from '@hashgraph/hedera-wallet-connect';
import { LedgerId } from '@hashgraph/sdk';
import { env } from './env';
import { logger } from './logger';

export interface HederaWalletState {
  accountId: string;
  network: 'testnet' | 'mainnet';
  topic: string;
}

/**
 * Hedera DApp Connector Singleton
 * Manages connection to Hedera wallets via WalletConnect
 */
class HederaWalletConnection {
  private dAppConnector: DAppConnector | null = null;
  private currentSession: HederaWalletState | null = null;

  /**
   * Application metadata for WalletConnect
   */
  private metadata = {
    name: 'RWA Platform',
    description: 'Real-World Asset Tokenization Platform on Hedera',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://localhost:3000',
    icons: [typeof window !== 'undefined' ? `${window.location.origin}/logo.png` : ''],
  };

  /**
   * Initialize the DApp connector
   * IMPORTANT: This must only be called in the browser (client-side)
   */
  async init(): Promise<DAppConnector> {
    // Guard against SSR
    if (typeof window === 'undefined') {
      throw new Error('DAppConnector can only be initialized in the browser');
    }

    if (this.dAppConnector) {
      return this.dAppConnector;
    }

    try {
      const projectId = env.walletProjectId;
      if (!projectId) {
        throw new Error('WalletConnect Project ID is required. Set NEXT_PUBLIC_WALLET_PROJECT_ID in .env.local');
      }

      // Clear any stale WalletConnect data that might cause resumeId errors
      try {
        // Clear WalletConnect v2 storage keys that might be corrupted
        const wc2Keys = Object.keys(localStorage).filter(key =>
          key.startsWith('wc@2') ||
          key.startsWith('@w3m') ||
          key.startsWith('W3M') ||
          key.startsWith('WALLETCONNECT')
        );
        if (wc2Keys.length > 0) {
          wc2Keys.forEach(key => {
            try {
              localStorage.removeItem(key);
            } catch (e) {
              // Ignore individual key errors
            }
          });
          logger.log('🧹 Cleared stale WalletConnect storage');
        }
      } catch (e) {
        logger.log('⚠️ Could not clear localStorage:', e);
      }

      const network = env.hederaNetwork === 'mainnet' ? LedgerId.MAINNET : LedgerId.TESTNET;
      const chains = env.hederaNetwork === 'mainnet'
        ? [HederaChainId.Mainnet]
        : [HederaChainId.Testnet];

      logger.log('🔧 Initializing Hedera DApp Connector...', {
        network: env.hederaNetwork,
        projectId: projectId.substring(0, 8) + '...',
      });

      this.dAppConnector = new DAppConnector(
        this.metadata,
        network,
        projectId,
        Object.values(HederaJsonRpcMethod),
        [HederaSessionEvent.ChainChanged, HederaSessionEvent.AccountsChanged],
        chains
      );

      // Initialize with error logging only and longer timeout
      await this.dAppConnector.init({
        logger: 'error',
      });

      // Set up event listeners
      this.setupEventListeners();

      logger.log('✅ Hedera DApp Connector initialized');
      return this.dAppConnector;
    } catch (error) {
      logger.error('❌ Failed to initialize DApp Connector:', error);
      // Reset the connector so it can be retried
      this.dAppConnector = null;
      throw error;
    }
  }

  /**
   * Set up event listeners for wallet events
   * Note: Event handling may be implemented via signers or session properties
   */
  private setupEventListeners() {
    if (!this.dAppConnector) return;

    // Event listeners can be added here if needed
    // The library handles session events internally
    logger.log('📡 Event listeners ready');
  }

  /**
   * Connect to a Hedera wallet
   * Opens WalletConnect modal for user to select wallet (HashPack, Blade, Kabila, etc.)
   */
  async connect(): Promise<HederaWalletState> {
    try {
      const connector = await this.init();

      logger.log('🔓 Opening wallet connection modal...');

      try {
        // Open the WalletConnect modal
        await connector.openModal();
      } catch (modalError: any) {
        logger.error('Modal opening error:', modalError);
        // If modal fails due to resumeId or session issues, try to disconnect and retry
        if (modalError?.message?.includes('resumeId') || modalError?.message?.includes('session')) {
          logger.log('Clearing stale session and retrying...');
          await connector.disconnectAll().catch(() => {});
          await connector.openModal();
        } else {
          throw modalError;
        }
      }

      // Wait for session to be established
      // The modal will close automatically when user approves
      const session = await this.waitForSession(connector);

      if (!session) {
        throw new Error('Failed to establish wallet session');
      }

      logger.log('✅ Wallet connected:', session);
      this.currentSession = session;

      return session;
    } catch (error) {
      logger.error('❌ Wallet connection error:', error);
      throw error;
    }
  }

  /**
   * Wait for wallet session to be established
   */
  private async waitForSession(connector: DAppConnector): Promise<HederaWalletState | null> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Wallet connection timeout - user did not approve'));
      }, 120000); // 2 minute timeout

      // Poll for signers (accounts)
      const checkInterval = setInterval(() => {
        const signers = connector.signers;

        if (signers && signers.length > 0) {
          clearTimeout(timeout);
          clearInterval(checkInterval);

          const accountId = signers[0].getAccountId().toString();

          resolve({
            accountId,
            network: env.hederaNetwork,
            topic: '', // Topic managed internally by DAppConnector
          });
        }
      }, 500); // Check every 500ms
    });
  }

  /**
   * Disconnect from the wallet
   */
  async disconnect(): Promise<void> {
    try {
      if (this.dAppConnector) {
        await this.dAppConnector.disconnectAll();
        logger.log('👋 Wallet disconnected');
      }
      this.currentSession = null;
    } catch (error) {
      logger.error('❌ Disconnect error:', error);
      throw error;
    }
  }

  /**
   * Get current session
   */
  getSession(): HederaWalletState | null {
    return this.currentSession;
  }

  /**
   * Check if wallet is connected
   */
  isConnected(): boolean {
    return this.currentSession !== null && this.dAppConnector !== null;
  }

  /**
   * Get the DAppConnector instance for advanced usage
   */
  getConnector(): DAppConnector | null {
    return this.dAppConnector;
  }
}

// Singleton instance
let hederaWalletInstance: HederaWalletConnection | null = null;

/**
 * Get the Hedera wallet connection instance
 */
export function getHederaWallet(): HederaWalletConnection {
  if (!hederaWalletInstance) {
    hederaWalletInstance = new HederaWalletConnection();
  }
  return hederaWalletInstance;
}

/**
 * Reset the instance (useful for testing or re-initialization)
 */
export function resetHederaWallet(): void {
  hederaWalletInstance = null;
}
