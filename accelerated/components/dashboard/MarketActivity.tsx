'use client';

import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

export default function MarketActivity() {
  const activities = [
    { asset: 'Ikoyi Luxury Apartments', type: 'Sale', amount: '₦2.5M', change: '+5.2%', time: '5 min ago', isPositive: true },
    { asset: 'Abuja Gold Reserve', type: 'Listing', amount: '₦1.8M', change: '+3.1%', time: '12 min ago', isPositive: true },
    { asset: 'Lagos Art Collection', type: 'Sale', amount: '₦950K', change: '-2.4%', time: '28 min ago', isPositive: false },
    { asset: 'Lekki Land Parcel', type: 'Listing', amount: '₦3.2M', change: '+8.7%', time: '1 hour ago', isPositive: true },
  ];

  return (
    <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <Activity className="w-5 h-5 text-blue-400" />
        <h2 className="text-xl font-bold text-white">Market Activity</h2>
      </div>

      <div className="space-y-3">
        {activities.map((activity, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 bg-slate-900/60 border border-slate-700/50 rounded-xl hover:border-blue-500/50 transition-all duration-300"
          >
            <div className="flex-1">
              <div className="font-semibold text-white mb-1">{activity.asset}</div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span>{activity.type}</span>
                <span>•</span>
                <span>{activity.time}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-white mb-1">{activity.amount}</div>
              <div className={`flex items-center justify-end gap-1 text-sm ${activity.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {activity.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>{activity.change}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
