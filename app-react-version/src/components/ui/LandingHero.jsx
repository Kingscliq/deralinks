import React from 'react';
import { ShieldCheck } from 'lucide-react';

// Minimal landing hero for DeraLinks (from context.txt)
// Light, professional tone with a refined animated CTA
const LandingHero = ({ onPrimary }) => {
  return (
    <section className="hero" role="banner">
      <div>
        <div className="hero-badge">
          <ShieldCheck size={16} />
          <span>Secured by Hedera Hashgraph</span>
        </div>
        <h1 className="hero-title">Own real‑world assets. On Hedera.</h1>
        <p className="hero-subtitle">
          Invest from ₦10,000 in tokenized Real Estate, Commodities, Fine Art
          and more — secured by Hedera Hashgraph.
        </p>
        <div style={{ textAlign: 'center' }}>
          <button className="cta-animated" onClick={onPrimary}>
            Start Investing
            <span aria-hidden>→</span>
          </button>
        </div>
      </div>

      <div className="trust-note">
        <span className="shield" aria-hidden>
          🛡️
        </span>
        <span className="trust-text">
          <strong>
            <span>\u2264</span>2s
          </strong>{' '}
          finality • <strong>Low fees</strong> • <strong>99.9% uptime</strong>
        </span>
      </div>
    </section>
  );
};

export default LandingHero;
