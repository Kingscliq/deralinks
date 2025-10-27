'use client';

import Link from 'next/link';
import Navbar from '@/components/shared/Navbar';
import WelcomeHeader from '@/components/dashboard/WelcomeHeader';
import PortfolioOverview from '@/components/dashboard/PortfolioOverview';
import QuickActions from '@/components/dashboard/QuickActions';
import NFTHoldings from '@/components/dashboard/NFTHoldings';
import ActiveProposals from '@/components/dashboard/ActiveProposals';
import MarketActivity from '@/components/dashboard/MarketActivity';

export default function DashboardHomePage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar variant="dashboard" />
      <WelcomeHeader walletAddress="0x742d...35a4" userName="Adewale" />

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <PortfolioOverview />

        <QuickActions />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <NFTHoldings />
          </div>
          <div>
            <MarketActivity />
          </div>
        </div>

        <ActiveProposals />

        <div className="bg-gradient-to-r from-blue-600/10 via-blue-600/5 to-blue-600/10 backdrop-blur-sm border border-blue-500/20 rounded-3xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-3">
            Discover More Opportunities
          </h3>
          <p className="text-slate-400 mb-6">
            Explore our marketplace to find premium assets matching your investment goals
          </p>
          <Link
            href="/marketplace"
            className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/40"
          >
            Browse Marketplace
          </Link>
        </div>
      </div>
    </div>
  );
}
