'use client';

import { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, Users, Building2, ArrowUp } from 'lucide-react';

export default function PlatformStats() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const stats = [
    {
      label: 'Total Value Locked',
      value: 45.2,
      suffix: 'B',
      prefix: '₦',
      icon: <DollarSign className="w-6 h-6" />,
      change: '+18.5%',
      gradient: 'from-blue-600 to-cyan-600',
    },
    {
      label: 'Assets Tokenized',
      value: 1247,
      suffix: '',
      prefix: '',
      icon: <Building2 className="w-6 h-6" />,
      change: '+142',
      gradient: 'from-purple-600 to-pink-600',
    },
    {
      label: 'Active Investors',
      value: 12.4,
      suffix: 'K',
      prefix: '',
      icon: <Users className="w-6 h-6" />,
      change: '+1.2K',
      gradient: 'from-green-600 to-emerald-600',
    },
    {
      label: 'Average Returns',
      value: 12.8,
      suffix: '%',
      prefix: '',
      icon: <TrendingUp className="w-6 h-6" />,
      change: '+2.3%',
      gradient: 'from-orange-600 to-red-600',
    },
  ];

  const AnimatedCounter = ({ value, suffix, prefix }: { value: number; suffix: string; prefix: string }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      if (!isVisible) return;

      const duration = 2000;
      const steps = 60;
      const increment = value / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(current);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }, [isVisible, value]);

    return (
      <span>
        {prefix}
        {count.toFixed(suffix === 'B' || suffix === 'K' || suffix === '%' ? 1 : 0)}
        {suffix}
      </span>
    );
  };

  return (
    <section className="py-24 sm:py-32 bg-slate-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
            Platform Performance
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Real-time metrics demonstrating our commitment to growth
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="relative group">
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300`}></div>

                <div className="relative bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-8 hover:border-blue-500/50 transition-all duration-300">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    {stat.icon}
                  </div>

                  <div className="mb-2">
                    <div className="text-4xl font-bold text-white">
                      <AnimatedCounter
                        value={stat.value}
                        suffix={stat.suffix}
                        prefix={stat.prefix}
                      />
                    </div>
                  </div>

                  <div className="text-sm font-medium text-slate-300 mb-2">
                    {stat.label}
                  </div>

                  <div className="flex items-center gap-1 text-xs text-green-400">
                    <ArrowUp className="w-3 h-3" />
                    <span>{stat.change} this month</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-8">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-400 mb-1">195+</div>
                <div className="text-sm text-slate-400">Countries</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-400 mb-1">24/7</div>
                <div className="text-sm text-slate-400">Trading</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-400 mb-1">₦10K</div>
                <div className="text-sm text-slate-400">Min Investment</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-400 mb-1">48h</div>
                <div className="text-sm text-slate-400">Tokenization</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-400 mb-1">₦8.2B</div>
                <div className="text-sm text-slate-400">Monthly Volume</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
