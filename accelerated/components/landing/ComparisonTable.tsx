'use client';

import { Check, X } from 'lucide-react';

export default function ComparisonTable() {
  const features = [
    { feature: 'Minimum Investment', traditional: '₦50M+', tokenized: '₦10K' },
    { feature: 'Liquidity', traditional: 'Months to Years', tokenized: 'Instant (24/7)' },
    { feature: 'Fractional Ownership', traditional: false, tokenized: true },
    { feature: 'Transaction Costs', traditional: '5-8%', tokenized: '<0.5%' },
    { feature: 'Settlement Time', traditional: '30-90 days', tokenized: '<2 seconds' },
    { feature: 'Global Access', traditional: false, tokenized: true },
    { feature: 'Transparency', traditional: 'Limited', tokenized: 'Full (Blockchain)' },
    { feature: 'Governance Rights', traditional: 'Complex', tokenized: 'DAO Voting' },
  ];

  return (
    <section className="py-24 sm:py-32 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
            Traditional vs Tokenized
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            See why tokenization is the future of asset ownership
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-3xl overflow-hidden">
            <div className="grid grid-cols-3 bg-slate-800/60 border-b border-slate-700">
              <div className="p-6"></div>
              <div className="p-6 text-center border-x border-slate-700">
                <h3 className="text-lg font-semibold text-slate-400">Traditional</h3>
              </div>
              <div className="p-6 text-center bg-gradient-to-r from-blue-600/10 to-purple-600/10">
                <h3 className="text-lg font-semibold text-white">Tokenized</h3>
              </div>
            </div>

            {features.map((item, index) => (
              <div
                key={index}
                className={`grid grid-cols-3 ${index !== features.length - 1 ? 'border-b border-slate-700' : ''}`}
              >
                <div className="p-6 font-medium text-white">{item.feature}</div>
                <div className="p-6 text-center border-x border-slate-700">
                  {typeof item.traditional === 'boolean' ? (
                    item.traditional ? (
                      <Check className="w-5 h-5 text-green-400 mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-red-400 mx-auto" />
                    )
                  ) : (
                    <span className="text-slate-400">{item.traditional}</span>
                  )}
                </div>
                <div className="p-6 text-center bg-gradient-to-r from-blue-600/5 to-purple-600/5">
                  {typeof item.tokenized === 'boolean' ? (
                    item.tokenized ? (
                      <Check className="w-5 h-5 text-green-400 mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-red-400 mx-auto" />
                    )
                  ) : (
                    <span className="text-white font-semibold">{item.tokenized}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
