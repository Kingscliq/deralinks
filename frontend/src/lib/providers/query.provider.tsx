'use client';
import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppStoreProvider } from '@/lib/providers';

interface IAppQueryProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<IAppQueryProviderProps> = ({
  children,
}: IAppQueryProviderProps) => {
  const queryConfig = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 3,
        staleTime: 1 * 60 * 60 * 1000,
        refetchInterval: 1800000,
      },
    },
  });

  return (
    <AppStoreProvider>
      <QueryClientProvider client={queryConfig}>{children}</QueryClientProvider>
    </AppStoreProvider>
  );
};
