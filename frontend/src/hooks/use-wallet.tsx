'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  connectHashPackWallet,
  disconnectHashPackWallet,
  type SaveData,
} from '@/lib/hedera/hashconnect';
import type { HashConnect } from 'hashconnect';

// Wallet types
export type WalletType = 'hashpack' | 'metamask' | null;

export interface WalletContextType {
  walletType: WalletType;
  accountId: string | null;
  account: string | null;
  isConnecting: boolean;
  error: string | null;
  hashconnect: HashConnect | null;
  saveData: SaveData | null;
  connect: (type: WalletType) => Promise<void>;
  disconnect: () => Promise<void>;
  isConnected: boolean;
  pairingString: string | null;
}

export interface WalletProviderProps {
  children: React.ReactNode;
  network?: 'testnet' | 'mainnet';
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
  network = 'testnet',
}) => {
  const [walletType, setWalletType] = useState<WalletType>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hashconnect, setHashconnect] = useState<HashConnect | null>(null);
  const [saveData, setSaveData] = useState<SaveData | null>(null);
  const [pairingString, setPairingString] = useState<string | null>(null);

  console.log('hashconnect::::', hashconnect);
  console.log('saveData::::', saveData);
  console.log('accountId::::', saveData);

  // Connect to HashPack wallet using HashConnect
  const connectHashPack = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    // Check if already connected
    if (accountId && walletType === 'hashpack') {
      console.log(`✅ Account ${accountId} already connected`);
      setIsConnecting(false);
      return;
    }

    // Clear any old connection data to prevent decryption errors
    localStorage.removeItem('hashconnect_accountId');
    localStorage.removeItem('hashconnect_saveData');
    console.log('🧹 Cleared old connection data');

    // Suppress ALL console errors during HashConnect initialization
    // to prevent decryption errors from showing
    const originalConsoleError = console.error;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.error = (...args: any[]) => {
      const msg = String(args[0] || '');
      // Suppress these specific HashConnect errors
      if (
        msg.includes('Invalid encrypted text') ||
        msg.includes('Decryption halted') ||
        msg.includes('SimpleCrypto')
      ) {
        return;
      }
      originalConsoleError.apply(console, args);
    };

    try {
      const wData = await connectHashPackWallet(network);

      console.log('✅ Wallet connection initiated');
      console.log('📦 wData[0] (hashconnect):', typeof wData[0]);
      console.log('📦 wData[1] (saveData):', wData[1]);

      // Store the instance and data immediately
      setHashconnect(wData[0]);
      setSaveData(wData[1]);
      setPairingString(wData[1].pairingString);

      console.log('🔌 Setting up pairing event listener...');

      // Set up pairing event listener - exactly like reference implementation
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (wData[0] as any).pairingEvent.once((pairingData: any) => {
        console.log('🎉🎉🎉 PAIRING EVENT FIRED! 🎉🎉🎉');
        console.log('pairingData:', pairingData);

        if (pairingData && pairingData.accountIds) {
          console.log('accountIds:', pairingData.accountIds);

          pairingData.accountIds.forEach((id: string) => {
            console.log(`✅ Paired account id: ${id}`);

            setAccountId(id);
            setAccount(id);
            setWalletType('hashpack');

            // Update save data with pairing info
            const updatedData = {
              ...wData[1],
              pairedWalletData: pairingData,
              pairedAccounts: pairingData.accountIds,
            };
            setSaveData(updatedData);

            // Store in localStorage to persist connection
            localStorage.setItem('wallet_type', 'hashpack');
            localStorage.setItem('hashconnect_accountId', id);
            localStorage.setItem('hashconnect_saveData', JSON.stringify(updatedData));

            console.log(`✅ Account ${id} connected ⚡ ✅`);
            setIsConnecting(false);
            setError(null);
          });
        } else {
          console.error('❌ No accountIds in pairingData');
          setIsConnecting(false);
        }
      });

      console.log('✅ Event listener attached, waiting for user to approve in HashPack...');
    } catch (err) {
      console.error('❌ Connection error:', err);
      setError('Failed to connect wallet');
      setIsConnecting(false);
    } finally {
      // Restore console.error after a delay to catch all initialization errors
      setTimeout(() => {
        console.error = originalConsoleError;
      }, 5000);
    }
  }, [accountId, walletType, network]);

  // Connect to MetaMask
  const connectMetaMask = useCallback(async () => {
    try {
      setIsConnecting(true);
      setError(null);

      console.log('🔍 Starting MetaMask detection...');

      if (typeof window === 'undefined' || !window.ethereum) {
        console.error('❌ No window.ethereum found');
        throw new Error('MetaMask not found. Please install it from https://metamask.io');
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let metamaskProvider: any = window.ethereum;

      // Handle multiple wallet providers
      if (window.ethereum.providers && Array.isArray(window.ethereum.providers)) {
        console.log('📦 Multiple providers detected:', window.ethereum.providers.length);

        const foundProvider = window.ethereum.providers.find(provider => provider.isMetaMask);

        if (foundProvider) {
          metamaskProvider = foundProvider;
          console.log('✅ Found MetaMask in providers array');
        } else {
          console.error('❌ MetaMask not found in providers array');
          throw new Error('MetaMask not detected. Please install it from https://metamask.io');
        }
      } else if (!window.ethereum.isMetaMask) {
        console.error('❌ MetaMask properties not found on provider');
        throw new Error('MetaMask not detected. Please install it from https://metamask.io');
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const accounts = (await (metamaskProvider as any).request({
        method: 'eth_requestAccounts',
      })) as string[];

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found in MetaMask');
      }

      const address = accounts[0];
      setAccount(address);
      setAccountId(null);
      setWalletType('metamask');

      localStorage.setItem('wallet_type', 'metamask');
      localStorage.setItem('metamask_address', address);

      console.log('✅ MetaMask connected successfully:', address);
    } catch (err) {
      const error = err as Error & { code?: number };
      let errorMessage = 'Failed to connect to MetaMask';

      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.code === 4001) {
        errorMessage = 'Connection rejected by user';
      } else if (error?.code === -32002) {
        errorMessage = 'Connection request already pending. Please check MetaMask popup.';
      }

      setError(errorMessage);
      console.error('❌ MetaMask connection error:', error);
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
        case 'metamask':
          await connectMetaMask();
          break;
        default:
          setError('Unsupported wallet type');
      }
    },
    [connectHashPack, connectMetaMask],
  );

  // Disconnect wallet
  const disconnect = useCallback(async () => {
    try {
      if (hashconnect && saveData?.topic && walletType === 'hashpack') {
        await disconnectHashPackWallet(hashconnect, saveData.topic);
      }

      setWalletType(null);
      setAccountId(null);
      setAccount(null);
      setHashconnect(null);
      setSaveData(null);
      setPairingString(null);
      setError(null);

      localStorage.removeItem('wallet_type');
      localStorage.removeItem('hashconnect_accountId');
      localStorage.removeItem('hashconnect_saveData');
      localStorage.removeItem('metamask_address');

      console.log('✅ Wallet disconnected');
    } catch (err) {
      const error = err as Error;
      console.error('❌ Disconnect error:', error);
    }
  }, [hashconnect, saveData, walletType]);

  // Auto-reconnect on page load
  useEffect(() => {
    const savedWalletType = localStorage.getItem('wallet_type') as WalletType;

    if (savedWalletType === 'hashpack') {
      const savedAccountId = localStorage.getItem('hashconnect_accountId');
      if (savedAccountId) {
        setAccountId(savedAccountId);
        setAccount(savedAccountId);
        setWalletType('hashpack');
        console.log('✅ Auto-reconnected to HashPack:', savedAccountId);
        // Note: Don't reinitialize HashConnect on reload, just restore the account ID
      }
    } else if (savedWalletType === 'metamask') {
      const savedAddress = localStorage.getItem('metamask_address');
      if (savedAddress) {
        setAccount(savedAddress);
        setWalletType('metamask');
        console.log('✅ Auto-reconnected to MetaMask:', savedAddress);
      }
    }
  }, []);

  const value: WalletContextType = {
    walletType,
    accountId,
    account,
    isConnecting,
    error,
    hashconnect,
    saveData,
    connect,
    disconnect,
    isConnected: !!(accountId || account),
    pairingString,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

// Type declarations for ethereum provider
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      isHashPack?: boolean;
      isHashpack?: boolean;
      providers?: Array<{
        isMetaMask?: boolean;
        isHashPack?: boolean;
        isHashpack?: boolean;
        request?: (args: never) => Promise<unknown>;
      }>;
      request?: (args: never) => Promise<unknown>;
    };
  }
}
