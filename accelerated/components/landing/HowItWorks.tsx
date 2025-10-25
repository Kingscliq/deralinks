'use client';

import { FileCheck, Coins, ShoppingCart, Vote } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Submit Asset',
      description: 'Upload documentation and property details. Our AI-powered system verifies authenticity and performs market valuation.',
      icon: <FileCheck className="w-7 h-7" />,
      gradient: 'from-blue-600 to-cyan-600',
    },
    {
      number: '02',
      title: 'NFT Minting',
      description: 'Asset is tokenized into fractional NFTs on Hedera blockchain. Each token represents verifiable ownership rights.',
      icon: <Coins className="w-7 h-7" />,
      gradient: 'from-purple-600 to-pink-600',
    },
    {
      number: '03',
      title: 'List & Trade',
      description: 'Tokens are listed on our marketplace. Investors can purchase fractions with instant liquidity and 24/7 trading.',
      icon: <ShoppingCart className="w-7 h-7" />,
      gradient: 'from-green-600 to-emerald-600',
    },
    {
      number: '04',
      title: 'Govern & Earn',
      description: 'Token holders vote on asset decisions through DAO governance and receive automated rental income distributions.',
      icon: <Vote className="w-7 h-7" />,
      gradient: 'from-orange-600 to-red-600',
    },
  ];

  return (
    <section className="py-24 sm:py-32 bg-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 opacity-50"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
            How It Works
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Transform any asset into a tradeable NFT in four simple steps
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="relative group">
                <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-8 h-full hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10">
                  <div className="absolute -top-5 -left-5 w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold text-xl shadow-xl">
                    {step.number}
                  </div>

                  <div className={`mt-6 mb-6 w-16 h-16 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {step.icon}
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-4">
                    {step.title}
                  </h3>

                  <p className="text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-20">
                    <div className="w-8 h-0.5 bg-gradient-to-r from-blue-600 to-transparent"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-blue-600/10 backdrop-blur-sm border border-blue-500/20">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
            <span className="text-sm text-slate-300">Average tokenization time: 48-72 hours</span>
          </div>
        </div>
      </div>
    </section>
  );
}
