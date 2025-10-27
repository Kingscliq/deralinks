'use client';

import { Building2, Twitter, Linkedin, Github, Mail } from 'lucide-react';

export default function LandingFooter() {
  const socialLinks = [
    { id: 'twitter', icon: <Twitter className="w-5 h-5" />, href: '#', label: 'Twitter' },
    { id: 'linkedin', icon: <Linkedin className="w-5 h-5" />, href: '#', label: 'LinkedIn' },
    { id: 'github', icon: <Github className="w-5 h-5" />, href: '#', label: 'GitHub' },
    { id: 'email', icon: <Mail className="w-5 h-5" />, href: '#', label: 'Email' },
  ];

  const links = {
    platform: [
      { label: 'Browse Assets', href: '#' },
      { label: 'How It Works', href: '#' },
      { label: 'Pricing', href: '#' },
      { label: 'API Documentation', href: '#' },
    ],
    company: [
      { label: 'About Us', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Press Kit', href: '#' },
    ],
    resources: [
      { label: 'Help Center', href: '#' },
      { label: 'Community', href: '#' },
      { label: 'Whitepaper', href: '#' },
      { label: 'Security', href: '#' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Compliance', href: '#' },
      { label: 'Risk Disclosure', href: '#' },
    ],
  };

  return (
    <footer className="bg-slate-950 border-t border-slate-800 pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">RWA Platform</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Democratizing access to real-world assets through blockchain-powered NFT tokenization on Hedera Hashgraph.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.id}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-lg bg-slate-800/50 border border-slate-700/50 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 hover:border-blue-500/50 transition-all duration-300"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {Object.entries(links).map(([category, categoryLinks]) => (
            <div key={category}>
              <h3 className="text-white font-semibold mb-4 capitalize">{category}</h3>
              <ul className="space-y-3">
                {categoryLinks.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-slate-400 hover:text-white text-sm transition-colors duration-200">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-slate-800">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-500">
            <div>© 2025 RWA Platform. All rights reserved.</div>
            <div className="flex items-center gap-6">
              <span>Secured by Hedera</span>
              <span>•</span>
              <span>SOC 2 Certified</span>
              <span>•</span>
              <span>KYC/AML Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
