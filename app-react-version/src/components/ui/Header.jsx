import React, { useState } from 'react';

import { Copy } from 'lucide-react';

// Light, professional header inspired by Aave
// Uses existing CSS utility classes from styles/marketplace.css
const Header = ({
  isConnected,
  accountId,
  onDisconnect,
  onNavigate,
  onOpenApp,
  showBrand = true,
  buttonLabel = 'Open App',
  brandText = 'DeraLinks',
}) => {
  const [copied, setCopied] = useState(false);
  const shortId = accountId
    ? `${accountId.slice(0, 7)}...${accountId.slice(-4)}`
    : 'Not Connected';

  return (
    <header className="app-header">
      <div className="header-left">
        {showBrand ? <h1 className="app-title">{brandText}</h1> : null}
      </div>
      <div className="header-right">
        {isConnected ? (
          <>
            <div className="tooltip-wrapper">
              <button
                className="account-btn"
                onClick={() => {
                  if (accountId) {
                    navigator.clipboard.writeText(accountId);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1200);
                  }
                }}
                title="Copy address"
              >
                <Copy size={16} style={{ marginRight: 8 }} />
                {shortId}
              </button>
              {copied && (
                <span
                  className="tooltip-bubble"
                  role="status"
                  aria-live="polite"
                >
                  Copied
                </span>
              )}
            </div>
            <button className="disconnect-btn" onClick={onDisconnect}>
              Disconnect
            </button>
          </>
        ) : (
          <button className="disconnect-btn" onClick={onOpenApp}>
            {buttonLabel}
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
