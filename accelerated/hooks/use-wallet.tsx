'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

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
  network = 'testnet',
  projectId = 'e49a89cf70b773fc85b4837ce47ff416', // Demo project ID - replace with yours
}) => {
  const [walletType, setWalletType] = useState<WalletType>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Connect to HashPack
  const connectHashPack = useCallback(async () => {
    try {
      setIsConnecting(true);
      setError(null);

      console.log('🔍 Starting HashPack detection...');
      console.log('window.ethereum exists:', !!window.ethereum);

      if (typeof window === 'undefined' || !window.ethereum) {
        console.error('❌ No window.ethereum found');
        throw new Error(
          'HashPack not found. Please install it from https://www.hashpack.app/download'
        );
      }

      let hashpackProvider = window.ethereum;

      // Handle multiple wallet providers
      if (
        window.ethereum.providers &&
        Array.isArray(window.ethereum.providers)
      ) {
        console.log(
          '📦 Multiple providers detected:',
          window.ethereum.providers.length
        );

        // Log each provider's properties
        window.ethereum.providers.forEach((p: any, i: number) => {
          console.log(`Provider ${i}:`, {
            isHashPack: p.isHashPack,
            isHashpack: p.isHashpack,
            isBlade: p.isBlade,
            isMetaMask: p.isMetaMask,
            constructor: p.constructor?.name,
          });
        });

        const foundProvider = window.ethereum.providers.find(
          (provider: any) => provider.isHashPack || provider.isHashpack
        );

        if (foundProvider) {
          hashpackProvider = foundProvider;
          console.log('✅ Found HashPack in providers array');
        } else {
          console.error('❌ HashPack not found in providers array');
          console.error(
            '💡 Tip: Make sure HashPack extension is enabled in chrome://extensions/'
          );
          throw new Error(
            'HashPack not detected. Please install it from https://www.hashpack.app/download'
          );
        }
      } else {
        console.log('📦 Single provider detected');
        console.log('Provider properties:', {
          isHashPack: window.ethereum.isHashPack,
          isHashpack: window.ethereum.isHashpack,
          isBlade: window.ethereum.isBlade,
          isMetaMask: window.ethereum.isMetaMask,
        });

        const isHashPack =
          window.ethereum.isHashPack || window.ethereum.isHashpack;
        if (!isHashPack) {
          console.error('❌ HashPack properties not found on provider');
          console.error('💡 Detected wallet:', {
            isMetaMask: window.ethereum.isMetaMask,
            isBlade: window.ethereum.isBlade,
          });
          throw new Error(
            'HashPack not detected. Please install it from https://www.hashpack.app/download'
          );
        }
        console.log('✅ HashPack properties found on single provider');
      }

      const accounts = (await (hashpackProvider as any).request({
        method: 'eth_requestAccounts',
      })) as string[];

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found in HashPack');
      }

      const address = accounts[0];
      setAccount(address);
      setAccountId(address); // HashPack returns Hedera account ID format
      setWalletType('hashpack');

      localStorage.setItem('selectedWallet', 'hashpack');
      localStorage.setItem('walletAddress', address);

      console.log('✅ HashPack connected successfully:', address);
    } catch (err: any) {
      let errorMessage = 'Failed to connect to HashPack';

      if (err?.message) {
        errorMessage = err.message;
      } else if (err?.code === 4001) {
        errorMessage = 'Connection rejected by user';
      } else if (err?.code === -32002) {
        errorMessage =
          'Connection request already pending. Please check HashPack popup.';
      }

      setError(errorMessage);
      console.error('❌ HashPack connection error:', err);
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

      let bladeProvider = window.ethereum;

      // Handle multiple wallet providers
      if (
        window.ethereum.providers &&
        Array.isArray(window.ethereum.providers)
      ) {
        const foundProvider = window.ethereum.providers.find(
          (provider: any) => provider.isBlade
        );

        if (foundProvider) {
          bladeProvider = foundProvider;
          console.log('Found Blade in providers array');
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

      const accounts = (await (bladeProvider as any).request({
        method: 'eth_requestAccounts',
      })) as string[];

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found in Blade Wallet');
      }

      const address = accounts[0];
      setAccount(address);
      setAccountId(address);
      setWalletType('blade');

      localStorage.setItem('selectedWallet', 'blade');
      localStorage.setItem('walletAddress', address);

      console.log('✅ Blade connected successfully:', address);
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
      console.error('❌ Blade connection error:', err);
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

      let kabilaProvider = window.ethereum;

      // Handle multiple wallet providers
      if (
        window.ethereum.providers &&
        Array.isArray(window.ethereum.providers)
      ) {
        const foundProvider = window.ethereum.providers.find(
          (provider: any) => provider.isKabila
        );

        if (foundProvider) {
          kabilaProvider = foundProvider;
          console.log('Found Kabila in providers array');
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

      const accounts = (await (kabilaProvider as any).request({
        method: 'eth_requestAccounts',
      })) as string[];

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found in Kabila Wallet');
      }

      const address = accounts[0];
      setAccount(address);
      setAccountId(address);
      setWalletType('kabila');

      localStorage.setItem('selectedWallet', 'kabila');
      localStorage.setItem('walletAddress', address);

      console.log('✅ Kabila connected successfully:', address);
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
      console.error('❌ Kabila connection error:', err);
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

      let metamaskProvider = window.ethereum;

      // Handle multiple wallet providers
      if (
        window.ethereum.providers &&
        Array.isArray(window.ethereum.providers)
      ) {
        const foundProvider = window.ethereum.providers.find(
          (provider: any) => provider.isMetaMask
        );

        if (foundProvider) {
          metamaskProvider = foundProvider;
          console.log('Found MetaMask in providers array');
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

      const accounts = (await (metamaskProvider as any).request({
        method: 'eth_requestAccounts',
      })) as string[];

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found in MetaMask');
      }

      const address = accounts[0];
      setAccount(address);
      setWalletType('metamask');

      localStorage.setItem('selectedWallet', 'metamask');
      localStorage.setItem('walletAddress', address);

      console.log('✅ MetaMask connected successfully:', address);
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
      console.error('❌ MetaMask connection error:', err);
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
      setWalletType(null);
      setAccount(null);
      setAccountId(null);
      setError(null);

      localStorage.removeItem('selectedWallet');
      localStorage.removeItem('walletAddress');

      console.log('✅ Wallet disconnected');
    } catch (err: any) {
      console.error('❌ Disconnect error:', err);
    }
  }, []);

  // Auto-reconnect on page load
  useEffect(() => {
    const savedWallet = localStorage.getItem('selectedWallet') as WalletType;
    const savedAddress = localStorage.getItem('walletAddress');

    if (savedWallet && savedAddress) {
      // Attempt to reconnect silently
      connect(savedWallet).catch(() => {
        // Clear saved data if reconnection fails
        localStorage.removeItem('selectedWallet');
        localStorage.removeItem('walletAddress');
      });
    }
  }, []);

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

// Type declarations for ethereum provider
declare global {
  interface Window {
    ethereum?: any;
  }
}
