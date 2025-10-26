'use client';

import { Shield, TrendingUp, Users, Zap } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import Box from '@/components/ui/box';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/common/header';
import { PropertyCard } from '@/features/home/property-card';
import { SearchBar } from '@/features/home/search-bar';

export default function HomePage() {
  return (
    <Box className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {/* Hero Section - 1inch inspired dark theme */}
        <Box
          as="section"
          className="relative py-16 md:py-24 overflow-hidden"
          style={{ background: 'linear-gradient(180deg, #1a1f2e 0%, #0d1117 100%)' }}
        >
          <Box className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10"></Box>
          <Box className="container mx-auto px-4 md:px-6 text-center relative z-10">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30 backdrop-blur-sm">
              🏠 Real Estate Tokenization Platform
            </Badge>
            <Box as="h1" className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-white">
              Invest in Real Estate
              <Box
                as="span"
                className="block mt-2"
                style={{
                  background: 'linear-gradient(135deg, #2B6AFF 0%, #6366f1 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Like Never Before
              </Box>
            </Box>
            <Box as="p" className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Fractional ownership of premium properties through blockchain technology. Secure,
              transparent, and accessible to everyone.
            </Box>
            <Box className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Box className="max-w-md w-full">
                <SearchBar />
              </Box>
              <Button
                size="lg"
                className="btn-gradient px-8 py-3 text-lg hover:scale-105 transition-transform"
              >
                Start Investing
              </Button>
            </Box>

            {/* Stats - 1inch style cards */}
            <Box className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
              <Box className="text-center p-4 rounded-xl glass backdrop-blur-md">
                <Box as="div" className="text-3xl font-bold text-white mb-2">
                  $2.5M+
                </Box>
                <Box as="p" className="text-slate-400 text-sm">
                  Total Value Locked
                </Box>
              </Box>
              <Box className="text-center p-4 rounded-xl glass backdrop-blur-md">
                <Box as="div" className="text-3xl font-bold text-white mb-2">
                  150+
                </Box>
                <Box as="p" className="text-slate-400 text-sm">
                  Properties Listed
                </Box>
              </Box>
              <Box className="text-center p-4 rounded-xl glass backdrop-blur-md">
                <Box as="div" className="text-3xl font-bold text-white mb-2">
                  2,500+
                </Box>
                <Box as="p" className="text-slate-400 text-sm">
                  Active Investors
                </Box>
              </Box>
              <Box className="text-center p-4 rounded-xl glass backdrop-blur-md">
                <Box as="div" className="text-3xl font-bold price-up mb-2">
                  12.5%
                </Box>
                <Box as="p" className="text-slate-400 text-sm">
                  Average Returns
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Features Section - 1inch style */}
        <Box as="section" className="py-16 md:py-24 bg-background">
          <Box className="container mx-auto px-4 md:px-6">
            <Box className="text-center mb-16">
              <Box as="h2" className="text-3xl md:text-4xl font-bold mb-4 text-white">
                Why Choose DeraLinks?
              </Box>
              <Box as="p" className="text-lg text-slate-400 max-w-2xl mx-auto">
                We combine cutting-edge blockchain technology with traditional real estate expertise
                to create the future of property investment.
              </Box>
            </Box>

            <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Box className="text-center p-6 card-elevated rounded-xl bg-card hover:bg-card/80 transition-all">
                <Box className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
                  <Shield className="w-7 h-7 text-white" />
                </Box>
                <Box as="h3" className="text-xl font-semibold mb-3 text-white">
                  Secure & Compliant
                </Box>
                <Box as="p" className="text-slate-400 text-sm leading-relaxed">
                  Full regulatory compliance with KYC/AML verification and licensed document
                  validation.
                </Box>
              </Box>

              <Box className="text-center p-6 card-elevated rounded-xl bg-card hover:bg-card/80 transition-all">
                <Box className="w-14 h-14 bg-gradient-secondary rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-accent/20">
                  <TrendingUp className="w-7 h-7 text-white" />
                </Box>
                <Box as="h3" className="text-xl font-semibold mb-3 text-white">
                  AI-Powered Analytics
                </Box>
                <Box as="p" className="text-slate-400 text-sm leading-relaxed">
                  Advanced valuation models and market insights powered by machine learning
                  algorithms.
                </Box>
              </Box>

              <Box className="text-center p-6 card-elevated rounded-xl bg-card hover:bg-card/80 transition-all">
                <Box className="w-14 h-14 bg-gradient-accent rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-accent/20">
                  <Users className="w-7 h-7 text-white" />
                </Box>
                <Box as="h3" className="text-xl font-semibold mb-3 text-white">
                  DAO Governance
                </Box>
                <Box as="p" className="text-slate-400 text-sm leading-relaxed">
                  Token holders participate in property management decisions through decentralized
                  governance.
                </Box>
              </Box>

              <Box className="text-center p-6 card-elevated rounded-xl bg-card hover:bg-card/80 transition-all">
                <Box className="w-14 h-14 bg-gradient-gold rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
                  <Zap className="w-7 h-7 text-white" />
                </Box>
                <Box as="h3" className="text-xl font-semibold mb-3 text-white">
                  Instant Liquidity
                </Box>
                <Box as="p" className="text-slate-400 text-sm leading-relaxed">
                  Trade your property tokens 24/7 on our decentralized marketplace with instant
                  settlements.
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Properties Section - 1inch style */}
        <Box as="section" className="py-16 md:py-24 bg-background">
          <Box className="container mx-auto px-4 md:px-6">
            <Box className="text-center mb-16">
              <Box as="h2" className="text-3xl md:text-4xl font-bold mb-4 text-white">
                Featured Properties
              </Box>
              <Box as="p" className="text-lg text-slate-400 max-w-2xl mx-auto">
                Discover premium real estate assets available for fractional ownership. Each
                property is professionally managed and AI-analyzed for optimal returns.
              </Box>
            </Box>

            <Box className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <PropertyCard />
              <PropertyCard />
              <PropertyCard />
              <PropertyCard />
              <PropertyCard />
              <PropertyCard />
              <PropertyCard />
              <PropertyCard />
            </Box>

            <Box className="text-center mt-12">
              <Button
                variant="outline"
                size="lg"
                className="px-8 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 transition-all"
              >
                View All Properties
              </Button>
            </Box>
          </Box>
        </Box>
      </main>
    </Box>
  );
}
