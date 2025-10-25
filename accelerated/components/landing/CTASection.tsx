'use client';

import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function CTASection() {
  return (
    <section className="py-24 sm:py-32 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-blue-600/10 via-transparent to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5"></div>

            <div className="relative p-8 sm:p-12 lg:p-16">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 backdrop-blur-sm border border-blue-500/20 mb-8">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-blue-300">Start Your Journey Today</span>
                </div>

                <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-8">
                  Ready to Tokenize?
                </h2>

                <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-10">
                  Join thousands of investors accessing institutional-grade real-world assets.
                  Zero platform fees for your first 3 months.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12 max-w-3xl mx-auto">
                  <div className="flex items-center justify-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <span className="text-sm">No credit card required</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <span className="text-sm">3-month free trial</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <span className="text-sm">Setup in 5 minutes</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-xl mx-auto mb-10">
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 h-14 px-6 text-lg"
                  />
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-10 h-14 rounded-xl shadow-xl shadow-blue-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/50 whitespace-nowrap text-lg"
                  >
                    Get Started
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>

                <p className="text-sm text-slate-500">
                  By signing up, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
