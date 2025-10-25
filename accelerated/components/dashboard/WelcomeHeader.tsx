'use client';

import { Wallet, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WelcomeHeaderProps {
  walletAddress?: string;
  userName?: string;
}

export default function WelcomeHeader({ walletAddress = '0x742d...35a4', userName }: WelcomeHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 px-6 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back{userName ? `, ${userName}` : ''}!
            </h1>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/60 rounded-xl border border-slate-700/50">
                <Wallet className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-slate-300 font-mono">{walletAddress}</span>
              </div>
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-sm text-slate-400">Connected</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="lg"
              className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                3
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
