'use client';

import { PieChart, Shield, Vote, Zap, Lock, BarChart3, Globe, Bot } from 'lucide-react';

export default function FeaturesGrid() {
  const features = [
    {
      title: 'Fractional Ownership',
      description: 'Own portions of high-value assets starting from ₦10,000. Break down barriers to premium investments.',
      icon: <PieChart className="w-6 h-6" />,
    },
    {
      title: 'NFT-Based Proof',
      description: 'Each token is a unique NFT with immutable ownership records on Hedera blockchain.',
      icon: <Shield className="w-6 h-6" />,
    },
    {
      title: 'DAO Governance',
      description: 'Participate in asset management decisions through decentralized voting. Your voice matters.',
      icon: <Vote className="w-6 h-6" />,
    },
    {
      title: 'Instant Liquidity',
      description: 'Trade tokens 24/7 on secondary markets without traditional transaction delays.',
      icon: <Zap className="w-6 h-6" />,
    },
    {
      title: 'Bank-Grade Security',
      description: 'Multi-signature wallets and institutional-grade custody protect your investments.',
      icon: <Lock className="w-6 h-6" />,
    },
    {
      title: 'Real-Time Analytics',
      description: 'Track performance, income, and portfolio diversification with live dashboards.',
      icon: <BarChart3 className="w-6 h-6" />,
    },
    {
      title: 'Global Access',
      description: 'Invest in assets worldwide. KYC-compliant cross-border transactions.',
      icon: <Globe className="w-6 h-6" />,
    },
    {
      title: 'AI Valuation',
      description: 'Machine learning models provide accurate, real-time asset valuations.',
      icon: <Bot className="w-6 h-6" />,
    },
  ];

  return (
    <section className="py-24 sm:py-32 bg-slate-950 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
            Enterprise-Grade Platform
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Built for institutional investors with retail accessibility
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-blue-600/0 group-hover:from-blue-600/5 group-hover:to-blue-600/10 rounded-2xl transition-all duration-300"></div>

                <div className="relative">
                  <div className="w-12 h-12 rounded-lg bg-slate-800/80 flex items-center justify-center text-blue-400 mb-4 group-hover:bg-gradient-to-br group-hover:from-blue-600 group-hover:to-blue-700 group-hover:text-white transition-all duration-300 group-hover:scale-110">
                    {feature.icon}
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-2">
                    {feature.title}
                  </h3>

                  <p className="text-sm text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600/10 via-blue-600/5 to-blue-600/10 backdrop-blur-sm border border-blue-500/20 rounded-3xl p-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
              <div>
                <div className="text-4xl font-bold text-white mb-2">99.9%</div>
                <div className="text-sm text-slate-400">Platform Uptime</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white mb-2">&lt;2s</div>
                <div className="text-sm text-slate-400">Transaction Speed</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white mb-2">₦0.05</div>
                <div className="text-sm text-slate-400">Avg Gas Fee</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
