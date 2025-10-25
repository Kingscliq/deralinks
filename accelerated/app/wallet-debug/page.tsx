'use client';

import { WalletButton } from '@/components/shared/WalletButton';
import { WalletDebugger } from '@/components/shared/WalletDebugger';

export default function WalletDebugPage() {
  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-4">
          Wallet Debug Page
        </h1>
        <p className="text-gray-400 mb-8">
          This page helps you debug wallet detection issues.
        </p>

        <div className="bg-slate-900 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Test Connection
          </h2>
          <WalletButton />
        </div>

        <div className="bg-slate-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Instructions
          </h2>
          <ol className="text-gray-400 space-y-2 list-decimal list-inside">
            <li>Check the debug panel in the bottom-right corner</li>
            <li>Verify that your wallet is detected</li>
            <li>
              If HashPack shows "false" for all properties, it's not detected
            </li>
            <li>Try refreshing the page</li>
            <li>Make sure HashPack extension is enabled in your browser</li>
            <li>Check browser console for any errors</li>
          </ol>
        </div>
      </div>

      {/* Debug panel - fixed bottom right */}
      <WalletDebugger />
    </div>
  );
}
