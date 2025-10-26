'use client';

import Link from 'next/link';
import { ArrowRight, Shield, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvZz48L3N2Zz4=')] opacity-20"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-20 pb-32">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 backdrop-blur-sm border border-blue-500/20 mb-8 animate-fade-in">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-300">
              Secured by Hedera Hashgraph
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-tight">
            Own Fractions of
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">
              Real-World Assets
            </span>
          </h1>

          <p className="text-xl sm:text-2xl text-slate-400 mb-12 max-w-4xl mx-auto leading-relaxed">
            Transform physical assets into NFT-backed securities. Invest in real
            estate, art, commodities, and more with blockchain-powered
            fractional ownership.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-10 py-7 text-lg rounded-xl shadow-xl shadow-blue-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/50 hover:scale-105"
              asChild
            >
              <Link href="/home">
                Start Investing
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 bg-transparent border-white/20 text-white  px-10 py-7 text-lg rounded-xl backdrop-blur-sm transition-all duration-300 hover:border-white/40"
              asChild
            >
              <Link href="/marketplace">Explore Platform</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center mb-4 mx-auto">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <div className="text-4xl font-bold text-white mb-2">₦45.2B</div>
              <div className="text-sm text-slate-400">Total Value Locked</div>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center mb-4 mx-auto">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div className="text-4xl font-bold text-white mb-2">1,247</div>
              <div className="text-sm text-slate-400">Assets Tokenized</div>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center mb-4 mx-auto">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div className="text-4xl font-bold text-white mb-2">12.4K</div>
              <div className="text-sm text-slate-400">Active Investors</div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-slate-950 to-transparent"></div>
    </section>
  );
}
