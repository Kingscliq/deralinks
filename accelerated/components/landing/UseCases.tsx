'use client';

import { TrendingUp, Home, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function UseCases() {
  const investorBenefits = [
    'Access premium assets with low minimum investment',
    'Instant liquidity through 24/7 secondary markets',
    'Automated income distributions to your wallet',
    'Vote on asset management decisions',
    'Diversify across multiple asset classes',
    'Transparent blockchain-based ownership records',
  ];

  const ownerBenefits = [
    'Unlock liquidity from illiquid assets',
    'Maintain partial ownership and control',
    'Access global investor pool instantly',
    'Reduce management overhead costs',
    'Transparent governance and decision-making',
    'Instant settlement and fund access',
  ];

  return (
    <section className="py-24 sm:py-32 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
            Built For Everyone
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Whether you're investing or tokenizing, we've got you covered
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-blue-900/20 to-slate-900/40 backdrop-blur-sm border border-blue-500/20 rounded-3xl p-8 sm:p-10 hover:border-blue-500/40 transition-all duration-300">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white mb-6 shadow-xl">
              <TrendingUp className="w-8 h-8" />
            </div>

            <h3 className="text-3xl font-bold text-white mb-4">
              For Investors
            </h3>

            <p className="text-slate-400 mb-8 text-lg">
              Start building a diversified portfolio of real-world assets with fractional ownership.
            </p>

            <ul className="space-y-4 mb-8">
              {investorBenefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  </div>
                  <span className="text-slate-300">{benefit}</span>
                </li>
              ))}
            </ul>

            <Button
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-6 rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/40"
            >
              Start Investing
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>

          <div className="bg-gradient-to-br from-purple-900/20 to-slate-900/40 backdrop-blur-sm border border-purple-500/20 rounded-3xl p-8 sm:p-10 hover:border-purple-500/40 transition-all duration-300">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white mb-6 shadow-xl">
              <Home className="w-8 h-8" />
            </div>

            <h3 className="text-3xl font-bold text-white mb-4">
              For Asset Owners
            </h3>

            <p className="text-slate-400 mb-8 text-lg">
              Transform your physical assets into liquid, tradeable NFT securities.
            </p>

            <ul className="space-y-4 mb-8">
              {ownerBenefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                  </div>
                  <span className="text-slate-300">{benefit}</span>
                </li>
              ))}
            </ul>

            <Button
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-6 rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/40"
            >
              Tokenize Your Asset
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
