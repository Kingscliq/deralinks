import React from 'react';

// Hero section inspired by aave.com with light theme
const Hero = ({ onPrimary }) => {
  return (
    <section className="hero" role="banner">
      <h1 className="hero-title">DeFi's largest lending network.</h1>
      <p className="hero-subtitle">
        Earn, borrow, save, and swap with millions of users.
      </p>
      <div style={{ marginTop: 24 }}>
        <button className="disconnect-btn" onClick={onPrimary}>
          Get Started
          <span aria-hidden>→</span>
        </button>
      </div>
    </section>
  );
};

export default Hero;
