// Clear stale WalletConnect storage immediately on page load
// This must run BEFORE any React code or WalletConnect libraries load
(function() {
  'use strict';

  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return;
  }

  try {
    // Get all localStorage keys
    const keys = Object.keys(localStorage);

    // Find all WalletConnect related keys
    const wcKeys = keys.filter(function(key) {
      return key.startsWith('wc@2') ||
             key.startsWith('@w3m') ||
             key.startsWith('W3M') ||
             key.startsWith('WALLETCONNECT') ||
             key.includes('walletconnect');
    });

    // Remove them
    if (wcKeys.length > 0) {
      wcKeys.forEach(function(key) {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          // Ignore individual errors
        }
      });
      console.log('[WC Cleanup] Cleared ' + wcKeys.length + ' stale WalletConnect storage keys');
    }
  } catch (e) {
    console.error('[WC Cleanup] Error clearing storage:', e);
  }
})();
