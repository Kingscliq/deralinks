'use client';

import {
  AlertCircle,
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  LogOut,
  Wallet,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { useWallet } from '../../hooks/use-wallet';

interface WalletOption {
  type: 'hashpack' | 'blade' | 'kabila' | 'metamask';
  name: string;
  description: string;
  color: string;
  hoverColor: string;
  recommended?: boolean;
}

const WALLETS: WalletOption[] = [
  {
    type: 'hashpack',
    name: 'HashPack',
    description: 'Recommended for Hedera',
    color: 'from-purple-500 to-purple-600',
    hoverColor: 'hover:bg-purple-50',
    recommended: true,
  },
  {
    type: 'blade',
    name: 'Blade',
    description: 'Hedera Native Wallet',
    color: 'from-blue-500 to-blue-600',
    hoverColor: 'hover:bg-blue-50',
  },
  {
    type: 'kabila',
    name: 'Kabila',
    description: 'Hedera Native Wallet',
    color: 'from-green-500 to-green-600',
    hoverColor: 'hover:bg-green-50',
  },
  {
    type: 'metamask',
    name: 'MetaMask',
    description: 'EVM Compatible',
    color: 'from-orange-500 to-orange-600',
    hoverColor: 'hover:bg-orange-50',
  },
];

export const WalletButton: React.FC = () => {
  const {
    connect,
    disconnect,
    account,
    accountId,
    isConnecting,
    error,
    walletType,
    isConnected,
  } = useWallet();
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);
  const [installedWallets, setInstalledWallets] = useState<
    Record<string, boolean>
  >({});

  // Detect installed wallets
  useEffect(() => {
    const detectWallets = () => {
      const wallets = {
        hashpack: true, // Always available via WalletConnect - doesn't require window.ethereum
        blade: false,
        kabila: false,
        metamask: false,
      };

      // Detect Ethereum-compatible wallets (Blade, Kabila, MetaMask)
      if (typeof window !== 'undefined' && window.ethereum) {
        // Check for multiple providers
        if (
          window.ethereum.providers &&
          Array.isArray(window.ethereum.providers)
        ) {
          window.ethereum.providers.forEach((provider: any) => {
            if (provider.isBlade) wallets.blade = true;
            if (provider.isKabila) wallets.kabila = true;
            if (provider.isMetaMask) wallets.metamask = true;
          });
        } else {
          // Single provider
          if (window.ethereum.isBlade) wallets.blade = true;
          if (window.ethereum.isKabila) wallets.kabila = true;
          if (window.ethereum.isMetaMask) wallets.metamask = true;
        }
      }

      return wallets;
    };

    // Initial detection
    setInstalledWallets(detectWallets());

    // Re-detect after a delay (for late wallet injection)
    const timer = setTimeout(() => {
      setInstalledWallets(detectWallets());
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const formatAddress = (addr: string | null) => {
    if (!addr) return '';
    if (addr.startsWith('0.0.')) return addr; // Hedera account ID
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const copyAddress = () => {
    const addressToCopy = account || accountId;
    if (addressToCopy) {
      navigator.clipboard.writeText(addressToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWalletSelect = async (type: WalletOption['type']) => {
    setShowDropdown(false);
    await connect(type);
  };

  // Connected state
  if (isConnected) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
        >
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="font-medium">
            {formatAddress(account || accountId)}
          </span>
          <ChevronDown className="w-4 h-4" />
        </button>

        {showDropdown && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowDropdown(false)}
            />
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
              <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-600 font-medium capitalize">
                    {walletType}
                  </span>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    <span className="text-xs text-green-600">Connected</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono">
                    {formatAddress(account || accountId)}
                  </span>
                  <button
                    onClick={copyAddress}
                    className="p-1 hover:bg-white rounded transition-colors"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  disconnect();
                  setShowDropdown(false);
                }}
                className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Disconnect</span>
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // Disconnected state
  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={isConnecting}
        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
      >
        <Wallet className="w-5 h-5" />
        <span className="font-medium">
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
            <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Select Wallet</h3>
              <p className="text-xs text-gray-600 mt-1">
                Choose your preferred wallet
              </p>
            </div>

            <div className="p-2 max-h-96 overflow-y-auto">
              {WALLETS.map(wallet => {
                const isInstalled = installedWallets[wallet.type];
                const isDisabled =
                  wallet.type !== 'hashpack' &&
                  wallet.type !== 'metamask' &&
                  !isInstalled;

                return (
                  <button
                    key={wallet.type}
                    onClick={() => handleWalletSelect(wallet.type)}
                    disabled={isDisabled}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors group relative ${
                      isDisabled
                        ? 'opacity-50 cursor-not-allowed'
                        : wallet.hoverColor
                    }`}
                  >
                    <div
                      className={`w-10 h-10 bg-gradient-to-br ${wallet.color} rounded-lg flex items-center justify-center flex-shrink-0`}
                    >
                      <Wallet className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800">
                          {wallet.name}
                        </span>
                        {wallet.recommended && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                            Recommended
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {wallet.description}
                      </div>
                      {isInstalled && (
                        <div className="text-xs text-green-600 mt-0.5">
                          ✓ Installed
                        </div>
                      )}
                      {!isInstalled && wallet.type !== 'hashpack' && (
                        <div className="text-xs text-gray-400 mt-0.5">
                          Not installed
                        </div>
                      )}
                    </div>
                    {!isDisabled && (
                      <div
                        className={`w-2 h-2 bg-gradient-to-br ${wallet.color} rounded-full opacity-0 group-hover:opacity-100 transition-opacity`}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {error && (
              <div className="p-3 bg-red-50 border-t border-red-100 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            <div className="p-3 bg-gray-50 border-t border-gray-200">
              <p className="text-xs text-gray-600 mb-2">
                <strong>Note:</strong> HashPack uses WalletConnect for
                connection.
              </p>
              <p className="text-xs text-gray-500">
                MetaMask will prompt you to switch to Hedera network when
                needed.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
