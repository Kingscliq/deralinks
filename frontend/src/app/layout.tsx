import './globals.css';

import { Geist, Geist_Mono } from 'next/font/google';

import { AppProvider } from '@/lib/providers';
import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { WalletProvider } from '@/hooks/use-wallet';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Mentor Hub',
  description: 'A web-based mentorship platform for reasearch students',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <WalletProvider>
          <AppProvider>
            {children}
            <Toaster />
          </AppProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
