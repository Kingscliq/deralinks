import './globals.css';

import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import { ClientProviders } from '@/components/shared/ClientProviders';
import { WalletConnectCleanup } from '@/components/shared/WalletConnectCleanup';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RWA Platform - Real World Assets on Hedera',
  description: 'Tokenize and trade real-world assets on the Hedera network',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <WalletConnectCleanup />
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
