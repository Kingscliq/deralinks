'use client';

import { AlertCircle, Check, ChevronDown, Copy, LogOut, Wallet } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { useWallet } from '@/hooks/use-wallet';

interface WalletOption {
  type: 'hashpack' | 'metamask';
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
    pairingString,
  } = useWallet();
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);
  const [installedWallets, setInstalledWallets] = useState<Record<string, boolean>>({
    hashpack: false,
    metamask: false,
  });

  // Detect installed wallets (simplified - no HashConnect initialization)
  useEffect(() => {
    const detectWallets = () => {
      const wallets = {
        hashpack: false,
        metamask: false,
      };

      // Detect MetaMask via window.ethereum
      if (typeof window !== 'undefined' && window.ethereum) {
        if (window.ethereum.providers && Array.isArray(window.ethereum.providers)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          window.ethereum.providers.forEach((provider: any) => {
            if (provider.isMetaMask) {
              wallets.metamask = true;
              console.log('✅ MetaMask detected in providers array');
            }
          });
        } else if (window.ethereum.isMetaMask) {
          wallets.metamask = true;
          console.log('✅ MetaMask detected on window.ethereum');
        }
      }

      // For HashPack: assume installed and let connection handle detection
      // This avoids creating multiple HashConnect instances that cause decryption errors
      // The actual foundExtensionEvent will be handled during connection
      wallets.hashpack = true; // Optimistically show as available

      console.log('🔍 Wallet detection result:', wallets);
      return wallets;
    };

    // Run detection
    setInstalledWallets(detectWallets());

    // Retry after delays to catch late-loading MetaMask
    const timers = [
      setTimeout(() => setInstalledWallets(detectWallets()), 500),
      setTimeout(() => setInstalledWallets(detectWallets()), 1500),
    ];

    return () => timers.forEach(timer => clearTimeout(timer));
  }, []);

  const formatAddress = (addr: string | null) => {
    if (!addr) return '';
    if (addr.startsWith('0.0.')) return addr; // Hedera account ID
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`; // ETH address
  };

  const copyAddress = () => {
    const addressToCopy = account || accountId;
    if (addressToCopy) {
      navigator.clipboard.writeText(addressToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyPairingString = () => {
    if (pairingString) {
      navigator.clipboard.writeText(pairingString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWalletSelect = async (type: WalletOption['type']) => {
    console.log('🔌 Wallet select:', type);
    await connect(type);
  };

  // Auto-close dropdown when connected
  useEffect(() => {
    if (isConnected) {
      console.log('✅ Wallet connected, closing dropdown');
      setShowDropdown(false);
    }
  }, [isConnected]);

  // Debug state
  useEffect(() => {
    console.log('🔍 WalletButton state:', {
      isConnected,
      isConnecting,
      walletType,
      account,
      accountId,
      hasAccount: !!(account || accountId),
    });
  }, [isConnected, isConnecting, walletType, account, accountId]);

  // Connected state
  if (isConnected && !isConnecting) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
        >
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="font-medium">{formatAddress(account || accountId)}</span>
          <ChevronDown className="w-4 h-4" />
        </button>

        {showDropdown && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
              <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-600 font-medium capitalize">{walletType}</span>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    <span className="text-xs text-green-600">Connected</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono">{formatAddress(account || accountId)}</span>
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
        <span className="font-medium">{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {showDropdown && !isConnecting && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
            <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Select Wallet</h3>
              <p className="text-xs text-gray-600 mt-1">Choose your preferred wallet</p>
            </div>

            <div className="p-2">
              {WALLETS.map(wallet => {
                const isInstalled = installedWallets[wallet.type];

                return (
                  <button
                    key={wallet.type}
                    onClick={() => handleWalletSelect(wallet.type)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors group ${wallet.hoverColor}`}
                  >
                    <div
                      className={`w-10 h-10 bg-gradient-to-br ${wallet.color} rounded-lg flex items-center justify-center flex-shrink-0`}
                    >
                      <Wallet className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800">{wallet.name}</span>
                        {wallet.recommended && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                            Recommended
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">{wallet.description}</div>
                      {isInstalled && (
                        <div className="text-xs text-green-600 mt-0.5">✓ Installed</div>
                      )}
                      {!isInstalled && (
                        <div className="text-xs text-gray-400 mt-0.5">Not installed</div>
                      )}
                    </div>
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
                <strong>Note:</strong>
              </p>
              <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
                <li>HashPack: Connection will verify installation</li>
                <li>MetaMask: EVM compatible operations</li>
              </ul>
            </div>
          </div>
        </>
      )}

      {/* Show pairing info when connecting to HashPack */}
      {isConnecting && pairingString && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
          <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-2">Connecting to HashPack</h3>
            <p className="text-xs text-gray-600">
              Please approve the connection request in your HashPack wallet
            </p>
          </div>

          <div className="p-4">
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-gray-700">Pairing String</label>
                <button
                  onClick={copyPairingString}
                  className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <div className="p-2 bg-gray-50 rounded border border-gray-200 text-xs font-mono break-all max-h-20 overflow-y-auto">
                {pairingString}
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
              <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-800">
                <p className="font-semibold mb-1">Connection Steps:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>HashPack extension should open automatically</li>
                  <li>Review the connection request</li>
                  <li>Click &ldquo;Approve&rdquo; to connect</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Show connecting state without pairing string (MetaMask) */}
      {isConnecting && !pairingString && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
          <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-2">Connecting to MetaMask</h3>
            <p className="text-xs text-gray-600">Please approve the connection in MetaMask popup</p>
          </div>
          {error && (
            <div className="p-3 bg-red-50 border-t border-red-100 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
