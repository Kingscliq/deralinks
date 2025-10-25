'use client';

import { Plus, Search, Vote, Wallet, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function QuickActions() {
  const actions = [
    {
      icon: <Plus className="w-5 h-5" />,
      label: 'Tokenize Asset',
      description: 'List your property',
      gradient: 'from-blue-600 to-cyan-600',
      href: '#',
    },
    {
      icon: <Search className="w-5 h-5" />,
      label: 'Browse Market',
      description: 'Find opportunities',
      gradient: 'from-purple-600 to-pink-600',
      href: '#',
    },
    {
      icon: <Vote className="w-5 h-5" />,
      label: 'Active Votes',
      description: '3 pending',
      gradient: 'from-green-600 to-emerald-600',
      href: '#',
    },
    {
      icon: <Wallet className="w-5 h-5" />,
      label: 'My Portfolio',
      description: 'View holdings',
      gradient: 'from-orange-600 to-red-600',
      href: '#',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action, index) => (
        <Button
          key={index}
          variant="outline"
          className="h-auto p-6 border-slate-700/50 hover:border-blue-500/50 bg-slate-800/40 hover:bg-slate-800/60 transition-all duration-300 group"
        >
          <div className="flex items-center gap-4 w-full">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
              {action.icon}
            </div>
            <div className="text-left flex-1">
              <div className="font-semibold text-white mb-0.5">{action.label}</div>
              <div className="text-xs text-slate-400">{action.description}</div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors duration-300" />
          </div>
        </Button>
      ))}
    </div>
  );
}
