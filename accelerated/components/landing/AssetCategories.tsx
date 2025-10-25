'use client';

import { Building2, Gem, Palette, Car, Factory, TreePine, Landmark, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function AssetCategories() {
  const categories = [
    {
      title: 'Real Estate',
      description: 'Commercial properties, residential complexes, and premium land holdings',
      icon: <Building2 className="w-8 h-8" />,
      totalValue: '₦18.5B',
      assets: 542,
      avgReturn: '8.5%',
      gradient: 'from-blue-600 to-cyan-600',
    },
    {
      title: 'Commodities',
      description: 'Gold, silver, rare minerals with verifiable custody',
      icon: <Gem className="w-8 h-8" />,
      totalValue: '₦12.8B',
      assets: 210,
      avgReturn: '12.3%',
      gradient: 'from-amber-600 to-orange-600',
    },
    {
      title: 'Fine Art',
      description: 'Museum-quality artwork and collectibles',
      icon: <Palette className="w-8 h-8" />,
      totalValue: '₦6.2B',
      assets: 89,
      avgReturn: '15.7%',
      gradient: 'from-purple-600 to-pink-600',
    },
    {
      title: 'Luxury Vehicles',
      description: 'Classic cars and limited-edition supercars',
      icon: <Car className="w-8 h-8" />,
      totalValue: '₦3.1B',
      assets: 145,
      avgReturn: '9.2%',
      gradient: 'from-red-600 to-rose-600',
    },
    {
      title: 'Equipment',
      description: 'Industrial machinery and operational assets',
      icon: <Factory className="w-8 h-8" />,
      totalValue: '₦2.4B',
      assets: 134,
      avgReturn: '7.8%',
      gradient: 'from-slate-600 to-gray-600',
    },
    {
      title: 'Natural Resources',
      description: 'Timberland and renewable energy infrastructure',
      icon: <TreePine className="w-8 h-8" />,
      totalValue: '₦1.8B',
      assets: 78,
      avgReturn: '10.4%',
      gradient: 'from-green-600 to-emerald-600',
    },
    {
      title: 'Infrastructure',
      description: 'Transportation hubs and utility networks',
      icon: <Landmark className="w-8 h-8" />,
      totalValue: '₦1.2B',
      assets: 32,
      avgReturn: '6.9%',
      gradient: 'from-indigo-600 to-purple-600',
    },
    {
      title: 'Energy Assets',
      description: 'Solar farms and battery storage facilities',
      icon: <Zap className="w-8 h-8" />,
      totalValue: '₦920M',
      assets: 17,
      avgReturn: '11.2%',
      gradient: 'from-yellow-600 to-orange-600',
    },
  ];

  return (
    <section className="py-24 sm:py-32 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
            Diverse Asset Classes
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Access institutional-grade investments across eight major categories
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {categories.map((category, index) => (
            <Card
              key={index}
              className="group relative bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 overflow-hidden cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="relative p-6">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${category.gradient} flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {category.icon}
                </div>

                <h3 className="text-xl font-bold text-white mb-2">
                  {category.title}
                </h3>

                <p className="text-slate-400 mb-6 text-sm leading-relaxed">
                  {category.description}
                </p>

                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-700/50">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Value</div>
                    <div className="text-sm font-semibold text-white">{category.totalValue}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Assets</div>
                    <div className="text-sm font-semibold text-white">{category.assets}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Return</div>
                    <div className="text-sm font-semibold text-green-400">{category.avgReturn}</div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
