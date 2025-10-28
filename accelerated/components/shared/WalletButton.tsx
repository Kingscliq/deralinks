'use client';

import {
  AlertCircle,
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  LogOut,
  Wallet,
  User,
  Settings,
  FileText,
  TrendingUp,
  History,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

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
    hoverColor: 'hover:bg-purple-50 dark:hover:bg-slate-800',
    recommended: true,
  },
  {
    type: 'blade',
    name: 'Blade',
    description: 'Hedera Native Wallet',
    color: 'from-blue-500 to-blue-600',
    hoverColor: 'hover:bg-blue-50 dark:hover:bg-slate-800',
  },
  {
    type: 'kabila',
    name: 'Kabila',
    description: 'Hedera Native Wallet',
    color: 'from-green-500 to-green-600',
    hoverColor: 'hover:bg-green-50 dark:hover:bg-slate-800',
  },
  {
    type: 'metamask',
    name: 'MetaMask',
    description: 'EVM Compatible',
    color: 'from-orange-500 to-orange-600',
    hoverColor: 'hover:bg-orange-50 dark:hover:bg-slate-800',
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
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-lg transition-all duration-200 shadow-sm"
        >
          <div className="w-2 h-2 bg-green-400 rounded-full" />
          <span className="font-medium text-sm">
            {formatAddress(account || accountId)}
          </span>
          <ChevronDown className="w-4 h-4 opacity-70" />
        </button>

        {showDropdown && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowDropdown(false)}
            />
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
              {/* Account Info Header */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium uppercase tracking-wide">
                    {walletType}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                      Connected
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono text-slate-900 dark:text-white font-medium">
                    {formatAddress(account || accountId)}
                  </span>
                  <button
                    onClick={copyAddress}
                    className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                    title="Copy address"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="p-2">
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 px-3 py-2 uppercase tracking-wide">
                  Quick Actions
                </div>
                <Link
                  href="/home"
                  onClick={() => setShowDropdown(false)}
                  className="w-full px-3 py-2.5 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-3 rounded-lg group"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                    <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="font-medium">Dashboard</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      View your portfolio
                    </div>
                  </div>
                </Link>

                <Link
                  href="/home?tab=transactions"
                  onClick={() => setShowDropdown(false)}
                  className="w-full px-3 py-2.5 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-3 rounded-lg group"
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                    <History className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <div className="font-medium">Transactions</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      View history
                    </div>
                  </div>
                </Link>

                <Link
                  href="/home?tab=assets"
                  onClick={() => setShowDropdown(false)}
                  className="w-full px-3 py-2.5 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-3 rounded-lg group"
                >
                  <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                    <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="font-medium">My Assets</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Manage holdings
                    </div>
                  </div>
                </Link>

                <Link
                  href="/home?tab=settings"
                  onClick={() => setShowDropdown(false)}
                  className="w-full px-3 py-2.5 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-3 rounded-lg group"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
                    <Settings className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div>
                    <div className="font-medium">Settings</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Preferences
                    </div>
                  </div>
                </Link>
              </div>

              {/* View on Explorer */}
              <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700">
                <a
                  href={`https://hashscan.io/testnet/account/${
                    accountId || account
                  }`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View on HashScan Explorer</span>
                </a>
              </div>

              {/* Disconnect Button */}
              <div className="p-2 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <button
                  onClick={() => {
                    disconnect();
                    setShowDropdown(false);
                  }}
                  className="w-full px-3 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-3 rounded-lg font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Disconnect Wallet</span>
                </button>
              </div>
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
        className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
      >
        <Wallet className="w-4 h-4" />
        <span className="font-medium text-sm">
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </span>
        {!isConnecting && <ChevronDown className="w-4 h-4 opacity-70" />}
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Connect Wallet
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Choose your preferred wallet to get started
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
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group relative ${
                      isDisabled
                        ? 'opacity-50 cursor-not-allowed'
                        : wallet.hoverColor
                    }`}
                  >
                    <div
                      className={`w-12 h-12 bg-gradient-to-br ${wallet.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}
                    >
                      <Wallet className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {wallet.name}
                        </span>
                        {wallet.recommended && (
                          <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-0.5 rounded-md font-medium">
                            Recommended
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        {wallet.description}
                      </div>
                      {isInstalled && (
                        <div className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">
                          ✓ Installed
                        </div>
                      )}
                      {!isInstalled && wallet.type !== 'hashpack' && (
                        <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                          Not installed
                        </div>
                      )}
                    </div>
                    {!isDisabled && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronDown className="w-5 h-5 text-slate-400 dark:text-slate-500 rotate-[-90deg]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border-t border-red-100 dark:border-red-900/30 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-700 dark:text-red-300">
                  {error}
                </p>
              </div>
            )}

            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                <strong className="font-semibold">Note:</strong> HashPack uses
                WalletConnect for secure connection.
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500">
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
