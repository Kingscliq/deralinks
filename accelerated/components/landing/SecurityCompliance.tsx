'use client';

import { Shield, Lock, FileCheck, AlertCircle } from 'lucide-react';

export default function SecurityCompliance() {
  const securityFeatures = [
    {
      icon: <Shield className="w-7 h-7" />,
      title: 'Multi-Signature Custody',
      description: 'Bank-grade multi-sig wallets with institutional custody partners',
    },
    {
      icon: <Lock className="w-7 h-7" />,
      title: 'End-to-End Encryption',
      description: 'AES-256 encryption for all sensitive data and communications',
    },
    {
      icon: <FileCheck className="w-7 h-7" />,
      title: 'KYC/AML Compliance',
      description: 'Full regulatory compliance with Nigerian SEC and global standards',
    },
    {
      icon: <AlertCircle className="w-7 h-7" />,
      title: 'Real-Time Monitoring',
      description: '24/7 fraud detection and anomaly monitoring systems',
    },
  ];

  return (
    <section className="py-24 sm:py-32 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
            Security & Compliance
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Enterprise-grade security meets regulatory compliance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {securityFeatures.map((feature, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 text-center hover:border-blue-500/50 transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white mb-6 mx-auto shadow-lg">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-sm text-slate-400">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-6 bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-full px-8 py-4">
            <span className="text-slate-400 text-sm">Certified By:</span>
            <span className="text-white font-semibold">SOC 2 Type II</span>
            <span className="w-px h-6 bg-slate-700"></span>
            <span className="text-white font-semibold">ISO 27001</span>
            <span className="w-px h-6 bg-slate-700"></span>
            <span className="text-white font-semibold">PCI DSS</span>
          </div>
        </div>
      </div>
    </section>
  );
}
