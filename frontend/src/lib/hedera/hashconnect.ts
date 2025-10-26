/**
 * HashConnect Wallet Connection Utilities
 * Handles HashPack wallet connection logic
 */

import { HashConnect } from 'hashconnect';

export interface SaveData {
  topic: string;
  pairingString: string;
  privateKey: string;
  pairedWalletData: unknown | null;
  pairedAccounts: string[];
}

export type WalletConnectionResult = [HashConnect, SaveData];

const appMetadata = {
  name: 'Deralinks - Real Estate Tokenization',
  description: 'Tokenize and trade real-world assets on Hedera',
  icon: 'https://raw.githubusercontent.com/ed-marquez/hedera-dapp-days/testing/src/assets/hederaLogo.png',
};

/**
 * Initialize and connect to HashPack wallet
 * @param network - The Hedera network to connect to ('testnet' | 'mainnet')
 * @returns Promise with hashconnect instance and save data
 */
export async function connectHashPackWallet(
  network: 'testnet' | 'mainnet' = 'testnet',
): Promise<WalletConnectionResult> {
  console.log(`\n=======================================`);
  console.log('- Connecting wallet...');

  const saveData: SaveData = {
    topic: '',
    pairingString: '',
    privateKey: '',
    pairedWalletData: null,
    pairedAccounts: [],
  };

  const hashconnect = new HashConnect();

  // First init and store the pairing private key (this is NOT your account private key)
  const initData = await hashconnect.init(appMetadata);
  saveData.privateKey = initData.privKey;
  console.log(`- Private key for pairing: ${saveData.privateKey}`);

  // Then connect, storing the new topic for later
  const state = await hashconnect.connect();
  saveData.topic = state.topic;
  console.log(`- Pairing topic is: ${saveData.topic}`);

  // Generate a pairing string, which you can display and generate a QR code from
  saveData.pairingString = hashconnect.generatePairingString(state, network, false);
  console.log(`- Pairing string generated`);

  // Find any supported local wallets
  hashconnect.findLocalWallets();
  hashconnect.connectToLocalWallet(saveData.pairingString);

  console.log('- Waiting for HashPack connection...');
  console.log('- Please approve the connection in HashPack');

  return [hashconnect, saveData];
}

/**
 * Setup pairing event listener for HashConnect
 * @param hashconnect - The HashConnect instance
 * @param onPaired - Callback function when wallet is paired
 * @param onTimeout - Optional callback for timeout
 * @param timeoutMs - Timeout duration in milliseconds (default: 60000 = 60 seconds)
 */
export function setupPairingListener(
  hashconnect: HashConnect,
  onPaired: (accountIds: string[], pairingData: unknown) => void,
  onTimeout?: () => void,
  timeoutMs: number = 60000,
): () => void {
  let timeoutId: NodeJS.Timeout | null = null;
  let hasResponded = false;

  // Set up pairing event listener
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (hashconnect as any).pairingEvent.once((pairingData: any) => {
    hasResponded = true;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    console.log('🎉 Pairing event received:', pairingData);

    if (pairingData.accountIds && pairingData.accountIds.length > 0) {
      onPaired(pairingData.accountIds, pairingData);
    }
  });

  // Set up timeout
  if (onTimeout) {
    timeoutId = setTimeout(() => {
      if (!hasResponded) {
        console.warn('⏰ HashPack connection timeout - user did not respond');
        onTimeout();
      }
    }, timeoutMs);
  }

  // Return cleanup function
  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };
}

/**
 * Disconnect from HashPack wallet
 * @param hashconnect - The HashConnect instance
 * @param topic - The pairing topic to disconnect
 */
export async function disconnectHashPackWallet(
  hashconnect: HashConnect,
  topic: string,
): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (hashconnect as any).disconnect(topic);
    console.log('✅ Disconnected from HashPack');
  } catch (error) {
    console.error('❌ Error disconnecting from HashPack:', error);
    throw error;
  }
}
