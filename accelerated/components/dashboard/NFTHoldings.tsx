'use client';

import { Building2, TrendingUp, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NFTHoldings() {
  const holdings = [
    {
      id: 'RWA-001',
      name: 'Victoria Island Office Complex',
      type: 'Commercial Real Estate',
      ownership: '2.5%',
      value: '₦625,000',
      change: '+5.2%',
      income: '₦12,500/mo',
      image: 'bg-gradient-to-br from-blue-600 to-cyan-600',
    },
    {
      id: 'RWA-042',
      name: 'Lekki Residential Estate',
      type: 'Residential Real Estate',
      ownership: '5.0%',
      value: '₦450,000',
      change: '+3.8%',
      income: '₦9,000/mo',
      image: 'bg-gradient-to-br from-purple-600 to-pink-600',
    },
    {
      id: 'RWA-087',
      name: 'Abuja Shopping Mall',
      type: 'Commercial Real Estate',
      ownership: '1.8%',
      value: '₦380,000',
      change: '+7.1%',
      income: '₦7,600/mo',
      image: 'bg-gradient-to-br from-green-600 to-emerald-600',
    },
  ];

  return (
    <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">My NFT Holdings</h2>
        <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-800">
          View All (15)
        </Button>
      </div>

      <div className="space-y-4">
        {holdings.map((holding) => (
          <div
            key={holding.id}
            className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-4 hover:border-blue-500/50 transition-all duration-300 group"
          >
            <div className="flex items-start gap-4">
              <div className={`w-20 h-20 rounded-lg ${holding.image} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                <Building2 className="w-8 h-8 text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-semibold text-white mb-1">{holding.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <span>{holding.type}</span>
                      <span>•</span>
                      <span className="font-mono text-blue-400">{holding.id}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Ownership</div>
                    <div className="text-sm font-semibold text-white">{holding.ownership}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Value</div>
                    <div className="text-sm font-semibold text-white">{holding.value}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Change</div>
                    <div className="text-sm font-semibold text-green-400 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {holding.change}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Income</div>
                    <div className="text-sm font-semibold text-white">{holding.income}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
