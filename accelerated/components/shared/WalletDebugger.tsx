'use client';

import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface ProviderInfo {
  name: string;
  isHashPack?: boolean;
  isHashpack?: boolean;
  isBlade?: boolean;
  isKabila?: boolean;
  isMetaMask?: boolean;
}

interface WalletDetectionState {
  hasEthereum: boolean;
  hasProviders: boolean;
  providersCount: number;
  providersInfo: ProviderInfo[];
  singleProvider: {
    isHashPack?: boolean;
    isHashpack?: boolean;
    isBlade?: boolean;
    isKabila?: boolean;
    isMetaMask?: boolean;
  };
}

// Wallet injection delays in milliseconds
// Wallets inject at different times, so we retry detection multiple times
const WALLET_DETECTION_DELAYS_MS = [500, 1000, 2000, 3000] as const;

export const WalletDebugger: React.FC = () => {
  const [state, setState] = useState<WalletDetectionState>({
    hasEthereum: false,
    hasProviders: false,
    providersCount: 0,
    providersInfo: [],
    singleProvider: {},
  });

  const detectWallets = () => {
    if (typeof window === 'undefined') {
      return;
    }

    const newState: WalletDetectionState = {
      hasEthereum: !!window.ethereum,
      hasProviders: !!(
        window.ethereum?.providers && Array.isArray(window.ethereum.providers)
      ),
      providersCount: 0,
      providersInfo: [],
      singleProvider: {},
    };

    if (window.ethereum) {
      // Check if providers array exists
      if (
        window.ethereum.providers &&
        Array.isArray(window.ethereum.providers)
      ) {
        newState.providersCount = window.ethereum.providers.length;
        newState.providersInfo = window.ethereum.providers.map(
          (provider: any): ProviderInfo => ({
            name: provider.constructor?.name || 'Unknown',
            isHashPack: provider.isHashPack,
            isHashpack: provider.isHashpack,
            isBlade: provider.isBlade,
            isKabila: provider.isKabila,
            isMetaMask: provider.isMetaMask,
          })
        );
      } else {
        // Single provider
        newState.singleProvider = {
          isHashPack: window.ethereum.isHashPack as boolean | undefined,
          isHashpack: window.ethereum.isHashpack as boolean | undefined,
          isBlade: window.ethereum.isBlade as boolean | undefined,
          isKabila: window.ethereum.isKabila as boolean | undefined,
          isMetaMask: window.ethereum.isMetaMask as boolean | undefined,
        };
      }
    }

    setState(newState);
  };

  useEffect(() => {
    // Initial detection
    detectWallets();

    // Re-detect after delays (wallets inject at different times)
    const timers = WALLET_DETECTION_DELAYS_MS.map(delay =>
      setTimeout(detectWallets, delay)
    );

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, []);

  const getWalletName = (info: ProviderInfo): string => {
    if (info.isHashPack || info.isHashpack) return 'HashPack';
    if (info.isBlade) return 'Blade';
    if (info.isKabila) return 'Kabila';
    if (info.isMetaMask) return 'MetaMask';
    return 'Unknown';
  };

  const getProviderId = (info: ProviderInfo, index: number): string => {
    return `${getWalletName(info)}-${index}-${info.name}`;
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-2xl border-2 border-gray-200 p-4 z-50 max-h-[80vh] overflow-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">
          Wallet Detection Debug
        </h3>
        <button
          onClick={detectWallets}
          className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>

      {/* Ethereum Detection */}
      <div className="mb-4 p-3 bg-gray-50 rounded">
        <div className="flex items-center gap-2 mb-2">
          {state.hasEthereum ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600" />
          )}
          <span className="font-semibold">window.ethereum</span>
        </div>
        <p className="text-xs text-gray-600">
          {state.hasEthereum
            ? '✓ Found - At least one wallet is installed'
            : '✗ Not found - No wallet extensions detected'}
        </p>
      </div>

      {/* Multiple Providers */}
      {state.hasProviders && (
        <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            <span className="font-semibold">Multiple Wallets Detected</span>
          </div>
          <p className="text-xs text-gray-600 mb-3">
            Found {state.providersCount} wallet provider(s)
          </p>

          {state.providersInfo.map((info, idx) => (
            <div
              key={getProviderId(info, idx)}
              className="mb-3 p-2 bg-white rounded border border-gray-200"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-gray-900">
                  Provider {idx + 1}
                </span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                  {getWalletName(info)}
                </span>
              </div>
              <div className="text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">isHashPack:</span>
                  <span
                    className={
                      info.isHashPack ? 'text-green-600' : 'text-gray-400'
                    }
                  >
                    {String(info.isHashPack || false)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">isHashpack:</span>
                  <span
                    className={
                      info.isHashpack ? 'text-green-600' : 'text-gray-400'
                    }
                  >
                    {String(info.isHashpack || false)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">isBlade:</span>
                  <span
                    className={
                      info.isBlade ? 'text-green-600' : 'text-gray-400'
                    }
                  >
                    {String(info.isBlade || false)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">isKabila:</span>
                  <span
                    className={
                      info.isKabila ? 'text-green-600' : 'text-gray-400'
                    }
                  >
                    {String(info.isKabila || false)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">isMetaMask:</span>
                  <span
                    className={
                      info.isMetaMask ? 'text-green-600' : 'text-gray-400'
                    }
                  >
                    {String(info.isMetaMask || false)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Single Provider */}
      {state.hasEthereum && !state.hasProviders && (
        <div className="mb-4 p-3 bg-green-50 rounded border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-semibold">Single Wallet Detected</span>
          </div>
          <div className="text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">isHashPack:</span>
              <span
                className={
                  state.singleProvider.isHashPack
                    ? 'text-green-600 font-bold'
                    : 'text-gray-400'
                }
              >
                {String(state.singleProvider.isHashPack || false)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">isHashpack:</span>
              <span
                className={
                  state.singleProvider.isHashpack
                    ? 'text-green-600 font-bold'
                    : 'text-gray-400'
                }
              >
                {String(state.singleProvider.isHashpack || false)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">isBlade:</span>
              <span
                className={
                  state.singleProvider.isBlade
                    ? 'text-green-600 font-bold'
                    : 'text-gray-400'
                }
              >
                {String(state.singleProvider.isBlade || false)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">isKabila:</span>
              <span
                className={
                  state.singleProvider.isKabila
                    ? 'text-green-600 font-bold'
                    : 'text-gray-400'
                }
              >
                {String(state.singleProvider.isKabila || false)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">isMetaMask:</span>
              <span
                className={
                  state.singleProvider.isMetaMask
                    ? 'text-green-600 font-bold'
                    : 'text-gray-400'
                }
              >
                {String(state.singleProvider.isMetaMask || false)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 p-3 bg-yellow-50 rounded border border-yellow-200">
        <p className="text-xs text-gray-700 font-semibold mb-2">
          Troubleshooting:
        </p>
        <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
          <li>If no wallets detected: Install wallet extension</li>
          <li>If wallet installed but not detected: Refresh page</li>
          <li>Wait 3-5 seconds after page load for injection</li>
          <li>Check that extension is enabled in browser</li>
          <li>Try restarting your browser</li>
        </ul>
      </div>

      <div className="mt-3 text-xs text-gray-500 text-center">
        Auto-refreshing every few seconds...
      </div>
    </div>
  );
};
