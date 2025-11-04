import React, { useEffect, useState } from 'react';
import { ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import '../../styles/LandingHero.css';

// Modern landing hero with animations and gradients
const LandingHero = ({ onPrimary }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="modern-hero" role="banner">
      <div className="modern-hero-background">
        <div className="hero-gradient-orb hero-gradient-orb-1"></div>
        <div className="hero-gradient-orb hero-gradient-orb-2"></div>
        <div className="hero-gradient-orb hero-gradient-orb-3"></div>
      </div>
      
      <div className={`modern-hero-content ${isVisible ? 'fade-in' : ''}`}>
        <div className="modern-hero-badge">
          <Sparkles size={14} />
          <span>Powered by Hedera Hashgraph</span>
        </div>
        
        <h1 className="modern-hero-title">
          <span className="gradient-text-animated">Tokenize</span> Real-World Assets
          <br />
          <span className="gradient-text-animated-2">Own the Future</span>
        </h1>
        
        <p className="modern-hero-subtitle">
          Invest in premium real estate, commodities, and fine art from as low as ₦10,000.
          <br />
          Fractional ownership backed by blockchain technology.
        </p>
        
        <div className="modern-hero-cta-group">
          <button className="modern-cta-primary" onClick={onPrimary}>
            Get Started
            <ArrowRight size={18} style={{ marginLeft: 8 }} />
          </button>
          <button className="modern-cta-secondary" onClick={onPrimary}>
            Explore Marketplace
          </button>
        </div>

        <div className="modern-hero-stats">
          <div className="modern-stat-item">
            <div className="modern-stat-value">₦45.2B+</div>
            <div className="modern-stat-label">Total Value Locked</div>
          </div>
          <div className="modern-stat-divider"></div>
          <div className="modern-stat-item">
            <div className="modern-stat-value">1,247</div>
            <div className="modern-stat-label">Assets Tokenized</div>
          </div>
          <div className="modern-stat-divider"></div>
          <div className="modern-stat-item">
            <div className="modern-stat-value">12.4K</div>
            <div className="modern-stat-label">Active Investors</div>
          </div>
        </div>
      </div>

      <div className="modern-trust-badge">
        <ShieldCheck size={16} />
        <span>
          <strong>≤2s</strong> finality • <strong>Low fees</strong> • <strong>99.9%</strong> uptime
        </span>
      </div>
    </section>
  );
};

export default LandingHero;
