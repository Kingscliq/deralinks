'use client';

import { TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';

export default function PortfolioOverview() {
  const stats = [
    {
      label: 'Total Portfolio Value',
      value: '₦2,450,000',
      change: '+12.5%',
      isPositive: true,
      icon: <DollarSign className="w-5 h-5" />,
    },
    {
      label: 'NFT Holdings',
      value: '15',
      change: '+3',
      isPositive: true,
      icon: <PieChart className="w-5 h-5" />,
    },
    {
      label: 'Monthly Income',
      value: '₦48,200',
      change: '+8.2%',
      isPositive: true,
      icon: <TrendingUp className="w-5 h-5" />,
    },
    {
      label: 'Total Return',
      value: '+18.7%',
      change: '+2.1%',
      isPositive: true,
      icon: <TrendingUp className="w-5 h-5" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-400">
              {stat.icon}
            </div>
            <div className={`flex items-center gap-1 text-sm font-semibold ${stat.isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {stat.isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{stat.change}</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
          <div className="text-sm text-slate-400">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
