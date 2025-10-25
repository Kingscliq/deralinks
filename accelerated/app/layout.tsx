import './globals.css';

import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import { WalletProvider } from '@/hooks/use-wallet';

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
    <html lang="en">
      <body className={inter.className}>
        <WalletProvider network="testnet">
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
