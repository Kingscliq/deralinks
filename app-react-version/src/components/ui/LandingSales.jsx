import {
  Activity,
  BrainCircuit,
  Building2,
  FileCheck,
  Globe2,
  Image as ImageIcon,
  LineChart,
  Lock,
  Medal,
  Package2,
  ShieldCheck,
  ShoppingCart,
  Upload,
  Vote,
  Zap,
} from 'lucide-react';

import React from 'react';

const Section = ({ id, kicker, title, subtitle, children }) => (
  <section id={id} className="sales-section">
    {kicker ? <div className="section-kicker">{kicker}</div> : null}
    {title ? <h2 className="section-title">{title}</h2> : null}
    {subtitle ? (
      <p className="section-subtitle" style={{ marginBottom: 24 }}>
        {subtitle}
      </p>
    ) : null}
    {children}
  </section>
);

const StatCard = ({ label, value, note }) => (
  <div className="stat-card">
    <div className="stat-value">{value}</div>
    <div className="stat-label">{label}</div>
    {note ? <div className="stat-note">{note}</div> : null}
  </div>
);

const Feature = ({ icon: Icon, color = '#EAEFFB', title, desc }) => (
  <div className="feature-card">
    <div className="icon-badge" style={{ background: color }} aria-hidden>
      <Icon size={18} color="#1e1e1e" />
    </div>
    <div className="feature-title">{title}</div>
    <div className="feature-desc">{desc}</div>
  </div>
);

const LandingSales = () => {
  const clickConnect = () => {
    const btn = document.querySelector('.disconnect-btn');
    if (btn) btn.click();
  };

  return (
    <div className="sales-wrap">
      {/* Key metrics */}
      <Section id="metrics" kicker="Platform Metrics">
        <div className="sales-grid cols-3">
          <StatCard label="Total Value Locked" value="₦45.2B" />
          <StatCard label="Assets Tokenized" value="1,247" />
          <StatCard label="Active Investors" value="12.4K" />
        </div>
      </Section>

      {/* How it works */}
      <Section
        id="how"
        kicker="How It Works"
        title="Tokenize any asset in four simple steps"
      >
        <div className="sales-grid cols-4">
          <Feature
            icon={Upload}
            color="#EAF3FF"
            title="Submit Asset"
            desc="Upload documentation and details. We verify authenticity and run market valuation."
          />
          <Feature
            icon={Package2}
            color="#E9FBF7"
            title="Mint Tokens"
            desc="Asset is tokenized on Hedera; fractions represent verifiable ownership."
          />
          <Feature
            icon={ShoppingCart}
            color="#FEF4E6"
            title="List & Trade"
            desc="List on the marketplace. Investors can buy fractions 24/7."
          />
          <Feature
            icon={Vote}
            color="#F4EAFE"
            title="Govern & Earn"
            desc="Holders vote on decisions and receive automated income distributions."
          />
        </div>
        <p className="section-footnote">
          Average tokenization time: 48–72 hours
        </p>
      </Section>

      {/* Diverse classes */}
      <Section
        id="classes"
        kicker="Diverse Asset Classes"
        title="Access institutional‑grade opportunities"
      >
        <div className="sales-grid cols-3">
          <Feature
            icon={Building2}
            color="#EAF3FF"
            title="Real Estate"
            desc="Commercial, residential, premium land."
          />
          <Feature
            icon={Medal}
            color="#FEF4E6"
            title="Commodities"
            desc="Gold, silver, rare minerals with custody."
          />
          <Feature
            icon={ImageIcon}
            color="#F4EAFE"
            title="Fine Art"
            desc="Museum‑quality artwork and collectibles."
          />
        </div>
      </Section>

      {/* Enterprise grade */}
      <Section
        id="enterprise"
        kicker="Enterprise‑Grade Platform"
        subtitle="Built for institutions with retail accessibility"
      >
        <div className="sales-grid cols-4">
          <Feature
            icon={Package2}
            color="#EAF3FF"
            title="Fractional Ownership"
            desc="Start from ₦10,000; break down barriers to premium investments."
          />
          <Feature
            icon={ShieldCheck}
            color="#E9FBF7"
            title="NFT Proof"
            desc="Immutable ownership on Hedera Hashgraph."
          />
          <Feature
            icon={Vote}
            color="#F4EAFE"
            title="DAO Governance"
            desc="Participate in key decisions transparently."
          />
          <Feature
            icon={Zap}
            color="#FEF4E6"
            title="Instant Liquidity"
            desc="24/7 secondary market trading."
          />
          <Feature
            icon={ShieldCheck}
            color="#EAF3FF"
            title="Bank‑Grade Security"
            desc="Multi‑sig wallets and institutional custody."
          />
          <Feature
            icon={LineChart}
            color="#FEF4E6"
            title="Real‑Time Analytics"
            desc="Live performance and income tracking."
          />
          <Feature
            icon={Globe2}
            color="#E9FBF7"
            title="Global Access"
            desc="KYC‑compliant cross‑border investing."
          />
          <Feature
            icon={BrainCircuit}
            color="#F4EAFE"
            title="AI Valuation"
            desc="Accurate, real‑time price models."
          />
        </div>
        <div className="sales-grid cols-3" style={{ marginTop: 16 }}>
          <StatCard label="Platform uptime" value="99.9%" />
          <StatCard label="Txn speed" value="<2s" />
          <StatCard label="Avg gas fee" value="₦0.05" />
        </div>
      </Section>

      {/* Built for everyone */}
      <Section id="personas" kicker="Built For Everyone">
        <div className="sales-grid cols-2">
          <div className="persona-card">
            <div className="persona-title">For Investors</div>
            <ul className="persona-list">
              <li>Access premium assets with low minimums</li>
              <li>Instant liquidity on a 24/7 market</li>
              <li>Automated income distributions</li>
              <li>Vote on asset management decisions</li>
              <li>Diversify across asset classes</li>
              <li>Transparent blockchain ownership</li>
            </ul>
            <button className="cta-inline" onClick={clickConnect}>
              Start Investing
            </button>
          </div>
          <div className="persona-card">
            <div className="persona-title">For Asset Owners</div>
            <ul className="persona-list">
              <li>Unlock liquidity from illiquid assets</li>
              <li>Maintain partial ownership & control</li>
              <li>Access a global investor pool</li>
              <li>Reduce management overhead</li>
              <li>Transparent on‑chain governance</li>
              <li>Instant settlement and access to funds</li>
            </ul>
            <button className="cta-inline" onClick={clickConnect}>
              Tokenize your asset
            </button>
          </div>
        </div>
      </Section>

      {/* Security & Compliance */}
      <Section
        id="security"
        kicker="Security & Compliance"
        subtitle="Enterprise‑grade security meets regulatory compliance"
      >
        <div className="sales-grid cols-4">
          <Feature
            icon={Lock}
            color="#EAF3FF"
            title="Multi‑Sig Custody"
            desc="Bank‑grade multi‑sig with institutional partners."
          />
          <Feature
            icon={ShieldCheck}
            color="#E9FBF7"
            title="End‑to‑End Encryption"
            desc="AES‑256 for all sensitive data and communication."
          />
          <Feature
            icon={FileCheck}
            color="#F4EAFE"
            title="KYC/AML"
            desc="Full compliance with Nigerian SEC and global standards."
          />
          <Feature
            icon={Activity}
            color="#FEF4E6"
            title="Real‑Time Monitoring"
            desc="24/7 fraud detection and anomaly monitoring."
          />
        </div>
      </Section>

      {/* FAQ (native details) */}
      <Section
        id="faq"
        kicker="Frequently Asked Questions"
        subtitle="Everything you need to know about RWA tokenization"
      >
        <div className="faq-list">
          <details>
            <summary>What is RWA tokenization?</summary>
            <p>
              Tokenization converts real‑world assets into on‑chain tokens that
              represent provable ownership, enabling fractional investment,
              instant settlement and transparent governance.
            </p>
          </details>
          <details>
            <summary>What is the minimum investment amount?</summary>
            <p>
              Invest from as low as ₦10,000 depending on the asset and its
              fractional configuration.
            </p>
          </details>
          <details>
            <summary>How secure is my investment?</summary>
            <p>
              Custody is secured with multi‑sig wallets, KYC/AML controls and
              continuous monitoring. Ownership is immutable on Hedera.
            </p>
          </details>
          <details>
            <summary>Can I sell my tokens anytime?</summary>
            <p>
              Yes. Our marketplace supports 24/7 secondary trading subject to
              network availability.
            </p>
          </details>
        </div>
      </Section>
    </div>
  );
};

export default LandingSales;
