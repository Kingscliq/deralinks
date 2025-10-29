'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

// Dynamically import HashConnect only on client side
let HashConnect: typeof import('hashconnect').HashConnect | null = null;

if (typeof window !== 'undefined') {
  try {
    // Try to import hashconnect if available
    import('hashconnect')
      .then(module => {
        HashConnect = module.HashConnect;
      })
      .catch(() => {
        console.warn('HashConnect not available - please install hashconnect@0.1.7');
      });
  } catch (err) {
    console.warn('HashConnect not available:', err);
  }
}

// Wallet types
export type WalletType = 'hashpack' | 'metamask' | null;

export interface SaveData {
  topic: string;
  pairingString: string;
  privateKey: string;
  pairedWalletData: unknown | null;
  pairedAccounts: string[];
}

export interface WalletContextType {
  walletType: WalletType;
  accountId: string | null;
  account: string | null;
  isConnecting: boolean;
  error: string | null;
  hashconnect: unknown | null;
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

const appMetadata = {
  name: 'Deralinks - Real Estate Tokenization',
  description: 'Tokenize and trade real-world assets on Hedera',
  icon: 'https://raw.githubusercontent.com/ed-marquez/hedera-dapp-days/testing/src/assets/hederaLogo.png',
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
  const [hashconnect, setHashconnect] = useState<unknown | null>(null);
  const [saveData, setSaveData] = useState<SaveData | null>(null);
  const [pairingString, setPairingString] = useState<string | null>(null);

  // Connect to HashPack wallet using HashConnect
  const connectHashPack = useCallback(async () => {
    try {
      setIsConnecting(true);
      setError(null);

      // Check if already connected
      if (accountId && walletType === 'hashpack') {
        console.log(`✅ Account ${accountId} already connected`);
        setIsConnecting(false);
        return;
      }

      if (!HashConnect) {
        throw new Error('HashConnect library not loaded. Please install hashconnect@0.1.7');
      }

      console.log(`\n=======================================`);
      console.log('- Connecting wallet...');

      // Create save data structure
      const data: SaveData = {
        topic: '',
        pairingString: '',
        privateKey: '',
        pairedWalletData: null,
        pairedAccounts: [],
      };

      // Create HashConnect instance
      const hc = new HashConnect();

      // First init and store the pairing private key
      const initData = await hc.init(appMetadata);
      data.privateKey = initData.privKey;
      console.log(`- Private key for pairing: ${data.privateKey}`);

      // Then connect, storing the new topic
      const state = await hc.connect();
      data.topic = state.topic;
      console.log(`- Pairing topic is: ${data.topic}`);

      // Generate a pairing string
      data.pairingString = hc.generatePairingString(state, network, false);
      console.log(`- Pairing string generated`);

      // Store the instance and data immediately
      setHashconnect(hc);
      setSaveData(data);
      setPairingString(data.pairingString);

      // Set up pairing event listener BEFORE connecting to local wallet
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (hc as any).pairingEvent.once((pairingData: any) => {
        console.log('🎉 Pairing event received:', pairingData);

        pairingData.accountIds.forEach((id: string) => {
          setAccountId(id);
          setAccount(id);
          setWalletType('hashpack');
          console.log(`- Paired account id: ${id}`);

          // Update save data
          const updatedData = {
            ...data,
            pairedWalletData: pairingData,
            pairedAccounts: pairingData.accountIds,
          };
          setSaveData(updatedData);

          // Store in localStorage
          localStorage.setItem('wallet_type', 'hashpack');
          localStorage.setItem('hashconnect_accountId', id);
          localStorage.setItem('hashconnect_saveData', JSON.stringify(updatedData));

          console.log(`✅ Account ${id} connected ⚡ ✅`);
          setIsConnecting(false);
          setError(null);
        });
      });

      // Find any supported local wallets
      hc.findLocalWallets();
      hc.connectToLocalWallet(data.pairingString);

      console.log('- Waiting for HashPack connection...');
      console.log('- Please approve the connection in HashPack');
    } catch (err) {
      const error = err as Error;
      let errorMessage = 'Failed to connect to HashPack';

      if (error?.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      console.error('❌ HashPack connection error:', error);
      setIsConnecting(false);
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (hashconnect as any).disconnect(saveData.topic);
        console.log('✅ Disconnected from HashPack');
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
