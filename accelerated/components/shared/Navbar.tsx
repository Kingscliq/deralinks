'use client';

import Link from 'next/link';
import { Building2, Menu } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { WalletButton } from './WalletButton';

interface NavbarProps {
  variant?: 'landing' | 'dashboard';
}

const handleSmoothScroll = (
  e: React.MouseEvent<HTMLAnchorElement>,
  targetId: string
) => {
  e.preventDefault();
  const element = document.getElementById(targetId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

export default function Navbar({ variant = 'landing' }: NavbarProps) {
  if (variant === 'dashboard') {
    return (
      <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">RWA Platform</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="text-slate-300 hover:text-white"
              asChild
            >
              <Link href="/home">Dashboard</Link>
            </Button>
            <Button
              variant="ghost"
              className="text-slate-300 hover:text-white"
              asChild
            >
              <Link href="/marketplace">Marketplace</Link>
            </Button>
            <Button
              variant="ghost"
              className="text-slate-300 hover:text-white"
              asChild
            >
              <Link href="/governance">Governance</Link>
            </Button>
            <WalletButton />
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-lg border-b border-slate-800/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="flex items-center gap-2.5 hover:opacity-90 transition-opacity"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              RWA Platform
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <a
              href="#features"
              onClick={e => handleSmoothScroll(e, 'features')}
              className="px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all cursor-pointer"
            >
              Features
            </a>
            <a
              href="#assets"
              onClick={e => handleSmoothScroll(e, 'assets')}
              className="px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all cursor-pointer"
            >
              Assets
            </a>
            <a
              href="#how-it-works"
              onClick={e => handleSmoothScroll(e, 'how-it-works')}
              className="px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all cursor-pointer"
            >
              How It Works
            </a>
            <a
              href="#faq"
              onClick={e => handleSmoothScroll(e, 'faq')}
              className="px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all cursor-pointer"
            >
              FAQ
            </a>
          </div>

          <div className="flex items-center gap-3">
            <WalletButton />
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
