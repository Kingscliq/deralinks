'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { logger } from '@/lib/logger';
import type { EthereumProvider } from '@/types/ethereum';
import { getHederaWallet } from '@/lib/hedera-wallet';

// Wallet types
export type WalletType = 'hashpack' | 'blade' | 'kabila' | 'metamask' | null;

export interface AccountInfo {
  address: string;
  balance?: string;
}

export interface WalletContextType {
  walletType: WalletType;
  account: string | null;
  accountId: string | null;
  isConnecting: boolean;
  error: string | null;
  connect: (type: WalletType) => Promise<void>;
  disconnect: () => Promise<void>;
  isConnected: boolean;
}

export interface WalletProviderProps {
  children: React.ReactNode;
  network?: 'testnet' | 'mainnet';
  projectId?: string;
}

const WalletContext = createContext<WalletContextType | null>(null);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};

export const WalletProvider: React.FC<WalletProviderProps> = ({
  children,
  network = (process.env.NEXT_PUBLIC_HEDERA_NETWORK as 'testnet' | 'mainnet') || 'testnet',
  projectId = process.env.NEXT_PUBLIC_WALLET_PROJECT_ID || '',
}) => {
  const [walletType, setWalletType] = useState<WalletType>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Connect to HashPack (and other Hedera wallets via WalletConnect)
  const connectHashPack = useCallback(async () => {
    // Guard against SSR
    if (typeof window === 'undefined') {
      logger.error('Cannot connect wallet during SSR');
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);

      logger.log('🔍 Connecting to Hedera wallet via WalletConnect...');

      // Use the Hedera WalletConnect integration
      const hederaWallet = getHederaWallet();
      const session = await hederaWallet.connect();

      if (!session || !session.accountId) {
        throw new Error('Failed to connect to Hedera wallet');
      }

      // Set the connected account
      setAccount(session.accountId);
      setAccountId(session.accountId);
      setWalletType('hashpack');

      // Save to localStorage
      try {
        localStorage.setItem('selectedWallet', 'hashpack');
        localStorage.setItem('walletAddress', session.accountId);
      } catch (storageError) {
        logger.log('⚠️ Could not save to localStorage:', storageError);
      }

      logger.log('✅ Hedera wallet connected successfully:', session.accountId);
    } catch (err: any) {
      let errorMessage = 'Failed to connect to Hedera wallet';

      if (err?.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      logger.error('❌ Hedera wallet connection error:', err);
      // Don't re-throw - let the error state handle it
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Connect to Blade
  const connectBlade = useCallback(async () => {
    try {
      setIsConnecting(true);
      setError(null);

      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error(
          'Blade Wallet not found. Please install it from https://bladewallet.io'
        );
      }

      let bladeProvider: EthereumProvider = window.ethereum as any;

      // Handle multiple wallet providers
      if (
        window.ethereum.providers &&
        Array.isArray(window.ethereum.providers)
      ) {
        const foundProvider = window.ethereum.providers.find(
          (provider: EthereumProvider) => provider.isBlade
        );

        if (foundProvider) {
          bladeProvider = foundProvider;
          logger.log('Found Blade in providers array');
        } else {
          throw new Error(
            'Blade Wallet not detected. Please install it from https://bladewallet.io'
          );
        }
      } else if (!window.ethereum.isBlade) {
        throw new Error(
          'Blade Wallet not detected. Please install it from https://bladewallet.io'
        );
      }

      const accounts = (await bladeProvider.request({
        method: 'eth_requestAccounts',
      })) as string[];

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found in Blade Wallet');
      }

      const address = accounts[0];
      setAccount(address);
      setAccountId(address);
      setWalletType('blade');

      if (typeof window !== 'undefined') {
        localStorage.setItem('selectedWallet', 'blade');
        localStorage.setItem('walletAddress', address);
      }

      logger.log('✅ Blade connected successfully:', address);
    } catch (err: any) {
      let errorMessage = 'Failed to connect to Blade Wallet';

      if (err?.message) {
        errorMessage = err.message;
      } else if (err?.code === 4001) {
        errorMessage = 'Connection rejected by user';
      } else if (err?.code === -32002) {
        errorMessage =
          'Connection request already pending. Please check Blade popup.';
      }

      setError(errorMessage);
      logger.error('❌ Blade connection error:', err);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Connect to Kabila
  const connectKabila = useCallback(async () => {
    try {
      setIsConnecting(true);
      setError(null);

      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error(
          'Kabila Wallet not found. Please install it from https://kabila.app'
        );
      }

      let kabilaProvider: EthereumProvider = window.ethereum as any;

      // Handle multiple wallet providers
      if (
        window.ethereum.providers &&
        Array.isArray(window.ethereum.providers)
      ) {
        const foundProvider = window.ethereum.providers.find(
          (provider: EthereumProvider) => provider.isKabila
        );

        if (foundProvider) {
          kabilaProvider = foundProvider;
          logger.log('Found Kabila in providers array');
        } else {
          throw new Error(
            'Kabila Wallet not detected. Please install it from https://kabila.app'
          );
        }
      } else if (!window.ethereum.isKabila) {
        throw new Error(
          'Kabila Wallet not detected. Please install it from https://kabila.app'
        );
      }

      const accounts = (await kabilaProvider.request({
        method: 'eth_requestAccounts',
      })) as string[];

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found in Kabila Wallet');
      }

      const address = accounts[0];
      setAccount(address);
      setAccountId(address);
      setWalletType('kabila');

      if (typeof window !== 'undefined') {
        localStorage.setItem('selectedWallet', 'kabila');
        localStorage.setItem('walletAddress', address);
      }

      logger.log('✅ Kabila connected successfully:', address);
    } catch (err: any) {
      let errorMessage = 'Failed to connect to Kabila Wallet';

      if (err?.message) {
        errorMessage = err.message;
      } else if (err?.code === 4001) {
        errorMessage = 'Connection rejected by user';
      } else if (err?.code === -32002) {
        errorMessage =
          'Connection request already pending. Please check Kabila popup.';
      }

      setError(errorMessage);
      logger.error('❌ Kabila connection error:', err);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Connect to MetaMask
  const connectMetaMask = useCallback(async () => {
    try {
      setIsConnecting(true);
      setError(null);

      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error(
          'MetaMask not found. Please install it from https://metamask.io'
        );
      }

      let metamaskProvider: EthereumProvider = window.ethereum as any;

      // Handle multiple wallet providers
      if (
        window.ethereum.providers &&
        Array.isArray(window.ethereum.providers)
      ) {
        const foundProvider = window.ethereum.providers.find(
          (provider: EthereumProvider) => provider.isMetaMask
        );

        if (foundProvider) {
          metamaskProvider = foundProvider;
          logger.log('Found MetaMask in providers array');
        } else {
          throw new Error(
            'MetaMask not detected. Please install it from https://metamask.io'
          );
        }
      } else if (!window.ethereum.isMetaMask) {
        throw new Error(
          'MetaMask not detected. Please install it from https://metamask.io'
        );
      }

      const accounts = (await metamaskProvider.request({
        method: 'eth_requestAccounts',
      })) as string[];

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found in MetaMask');
      }

      const address = accounts[0];
      setAccount(address);
      setWalletType('metamask');

      if (typeof window !== 'undefined') {
        localStorage.setItem('selectedWallet', 'metamask');
        localStorage.setItem('walletAddress', address);
      }

      logger.log('✅ MetaMask connected successfully:', address);
    } catch (err: any) {
      let errorMessage = 'Failed to connect to MetaMask';

      if (err?.message) {
        errorMessage = err.message;
      } else if (err?.code === 4001) {
        errorMessage = 'Connection rejected by user';
      } else if (err?.code === -32002) {
        errorMessage =
          'Connection request already pending. Please check MetaMask popup.';
      }

      setError(errorMessage);
      logger.error('❌ MetaMask connection error:', err);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Generic connect function
  const connect = useCallback(
    async (type: WalletType) => {
      setError(null);

      switch (type) {
        case 'hashpack':
          await connectHashPack();
          break;
        case 'blade':
          await connectBlade();
          break;
        case 'kabila':
          await connectKabila();
          break;
        case 'metamask':
          await connectMetaMask();
          break;
        default:
          setError('Unsupported wallet type');
      }
    },
    [connectHashPack, connectBlade, connectKabila, connectMetaMask]
  );

  // Disconnect wallet
  const disconnect = useCallback(async () => {
    try {
      // If connected via Hedera WalletConnect, disconnect properly
      if (walletType === 'hashpack') {
        const hederaWallet = getHederaWallet();
        await hederaWallet.disconnect();
      }

      setWalletType(null);
      setAccount(null);
      setAccountId(null);
      setError(null);

      if (typeof window !== 'undefined') {
        localStorage.removeItem('selectedWallet');
        localStorage.removeItem('walletAddress');
      }

      logger.log('✅ Wallet disconnected');
    } catch (err: any) {
      logger.error('❌ Disconnect error:', err);
    }
  }, [walletType]);

  // Auto-reconnect on page load
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedWallet = localStorage.getItem('selectedWallet') as WalletType;
    const savedAddress = localStorage.getItem('walletAddress');

    if (savedWallet && savedAddress) {
      // Attempt to reconnect silently
      connect(savedWallet).catch((err) => {
        // Clear saved data if reconnection fails
        logger.warn('Auto-reconnect failed:', err);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('selectedWallet');
          localStorage.removeItem('walletAddress');
        }
      });
    }
  }, [connect]);

  const value: WalletContextType = {
    walletType,
    account,
    accountId,
    isConnecting,
    error,
    connect,
    disconnect,
    isConnected: !!(account || accountId),
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};
