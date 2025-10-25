'use client';

import { Star, Quote } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function Testimonials() {
  const testimonials = [
    {
      name: 'Adewale Ogunleye',
      role: 'Real Estate Investor',
      company: 'Lagos Properties Ltd',
      content: 'Tokenization unlocked liquidity in my commercial properties. I can now diversify without selling entire assets.',
      rating: 5,
      initials: 'AO',
    },
    {
      name: 'Chiamaka Eze',
      role: 'Portfolio Manager',
      company: 'Zenith Investments',
      content: 'The fractional ownership model transformed how we build client portfolios. Access to premium assets at scale.',
      rating: 5,
      initials: 'CE',
    },
    {
      name: 'Ibrahim Mohammed',
      role: 'Tech Entrepreneur',
      company: 'Innovation Hub NG',
      content: 'Finally, a platform that brings institutional-grade infrastructure to Nigerian RWA tokenization. Game changer.',
      rating: 5,
      initials: 'IM',
    },
  ];

  return (
    <section className="py-24 sm:py-32 bg-slate-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
            Trusted By Investors
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Hear from users transforming their investment strategies
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-8 hover:border-blue-500/50 transition-all duration-300"
            >
              <div className="absolute top-8 right-8 text-slate-700/30">
                <Quote className="w-10 h-10" />
              </div>

              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              <p className="text-slate-300 leading-relaxed mb-8">
                "{testimonial.content}"
              </p>

              <div className="flex items-center gap-4">
                <Avatar className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700">
                  <AvatarFallback className="text-white font-semibold bg-transparent text-lg">
                    {testimonial.initials}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <div className="font-semibold text-white text-lg">{testimonial.name}</div>
                  <div className="text-sm text-slate-400">{testimonial.role}</div>
                  <div className="text-xs text-slate-500">{testimonial.company}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
