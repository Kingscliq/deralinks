'use client';

import { Check, ChevronDown, Copy, LogOut, Wallet } from 'lucide-react';
import React, { useState } from 'react';
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
  const { walletType, account, accountId, isConnecting, connect, disconnect } = useWallet();
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);

  const isConnected = !!(account || accountId);
  const displayAddress = account || accountId || '';
  const walletName = walletType === 'hashpack' ? 'HashPack' : walletType === 'metamask' ? 'MetaMask' : null;

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    if (addr.startsWith('0.0.')) return addr; // Hedera account ID
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`; // ETH address
  };

  const copyAddress = () => {
    if (displayAddress) {
      navigator.clipboard.writeText(displayAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWalletSelect = async (wallet: WalletOption) => {
    try {
      await connect(wallet.type);
      setShowDropdown(false);
    } catch (error) {
      console.error('Wallet connection error:', error);
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
    setShowDropdown(false);
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
          <span className="font-medium">{formatAddress(displayAddress)}</span>
          <ChevronDown className="w-4 h-4" />
        </button>

        {showDropdown && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
              <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-600 font-medium">{walletName}</span>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    <span className="text-xs text-green-600">Connected</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono">{formatAddress(displayAddress)}</span>
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
                onClick={handleDisconnect}
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
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
            <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Select Wallet</h3>
              <p className="text-xs text-gray-600 mt-1">Choose your preferred wallet</p>
            </div>

            <div className="p-2">
              {WALLETS.map(wallet => (
                <button
                  key={wallet.name}
                  onClick={() => handleWalletSelect(wallet)}
                  disabled={isConnecting}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors group ${wallet.hoverColor} disabled:opacity-50 disabled:cursor-not-allowed`}
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
                  </div>
                </button>
              ))}
            </div>

            <div className="p-3 bg-gray-50 border-t border-gray-200">
              <p className="text-xs text-gray-600 mb-2">
                <strong>Note:</strong>
              </p>
              <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
                <li>HashPack: Native Hedera wallet</li>
                <li>MetaMask: EVM compatible operations</li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
