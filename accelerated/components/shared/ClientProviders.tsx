'use client';

import React from 'react';
import { WalletProvider } from '@/hooks/use-wallet';
import { ErrorBoundary } from './ErrorBoundary';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <WalletProvider network="testnet">
        {children}
      </WalletProvider>
    </ErrorBoundary>
  );
}
