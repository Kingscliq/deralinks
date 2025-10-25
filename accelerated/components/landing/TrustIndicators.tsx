'use client';

import { Shield, CheckCircle, Award, Lock } from 'lucide-react';

export default function TrustIndicators() {
  const certifications = [
    { icon: <Shield className="w-6 h-6" />, label: 'SOC 2 Type II', color: 'from-blue-600 to-cyan-600' },
    { icon: <CheckCircle className="w-6 h-6" />, label: 'KYC/AML Compliant', color: 'from-green-600 to-emerald-600' },
    { icon: <Award className="w-6 h-6" />, label: 'ISO 27001 Certified', color: 'from-purple-600 to-pink-600' },
    { icon: <Lock className="w-6 h-6" />, label: 'Bank-Grade Security', color: 'from-orange-600 to-red-600' },
  ];

  const partners = [
    'Hedera Hashgraph',
    'Fireblocks',
    'Chainalysis',
    'CertiK',
    'PwC Advisory',
    'Deloitte',
  ];

  return (
    <section className="py-16 bg-slate-900/50 border-y border-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-slate-400 text-sm uppercase tracking-wider mb-4">Trusted By Industry Leaders</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 max-w-5xl mx-auto">
          {certifications.map((cert, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-3 p-6 bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl hover:border-blue-500/50 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${cert.color} flex items-center justify-center text-white`}>
                {cert.icon}
              </div>
              <span className="text-sm text-slate-300 text-center font-medium">{cert.label}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-center items-center gap-8 max-w-6xl mx-auto">
          {partners.map((partner, index) => (
            <div
              key={index}
              className="text-slate-500 hover:text-slate-300 transition-colors duration-200 font-semibold text-lg"
            >
              {partner}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
