import React from 'react';

const ConnectPrompt = ({ open, onConnect, onClose }) => {
  if (!open) return null;
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <h3 className="modal-title">Connect your wallet</h3>
        <p className="modal-text">
          To continue, please connect your Hedera wallet.
        </p>
        <div className="modal-actions">
          <button className="disconnect-btn" onClick={onConnect}>
            Connect Wallet
          </button>
          <button className="account-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectPrompt;

