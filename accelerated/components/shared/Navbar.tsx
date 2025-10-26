'use client';

import Link from 'next/link';
import { Building2, Menu } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { WalletButton } from './WalletButton';

interface NavbarProps {
  variant?: 'landing' | 'dashboard';
}

export default function Navbar({ variant = 'landing' }: NavbarProps) {
  if (variant === 'dashboard') {
    return (
      <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">RWA Platform</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-slate-300 hover:text-white" asChild>
              <Link href="/home">Dashboard</Link>
            </Button>
            <Button variant="ghost" className="text-slate-300 hover:text-white" asChild>
              <Link href="/marketplace">Marketplace</Link>
            </Button>
            <Button variant="ghost" className="text-slate-300 hover:text-white" asChild>
              <Link href="/governance">Governance</Link>
            </Button>
            <WalletButton />
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">RWA Platform</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-slate-300 hover:text-white transition-colors"
            >
              Features
            </a>
            <a
              href="#assets"
              className="text-slate-300 hover:text-white transition-colors"
            >
              Assets
            </a>
            <a
              href="#how-it-works"
              className="text-slate-300 hover:text-white transition-colors"
            >
              How It Works
            </a>
            <a
              href="#faq"
              className="text-slate-300 hover:text-white transition-colors"
            >
              FAQ
            </a>
          </div>

          <div className="flex items-center gap-4">
            <WalletButton />
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white"
            >
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
