'use client';

import Script from 'next/script';

export function WalletConnectCleanup() {
  return (
    <Script
      id="clear-wc-storage"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            if (typeof window === 'undefined') return;

            // Immediately clear all WalletConnect storage
            try {
              if (typeof localStorage !== 'undefined') {
                const keys = Object.keys(localStorage);
                const wcKeys = keys.filter(function(k) {
                  return k.startsWith('wc@2') ||
                         k.startsWith('@w3m') ||
                         k.startsWith('W3M') ||
                         k.startsWith('WALLETCONNECT') ||
                         k.includes('walletconnect') ||
                         k.includes('resume');
                });

                wcKeys.forEach(function(k) {
                  try {
                    localStorage.removeItem(k);
                  } catch(e) {}
                });

                if (wcKeys.length > 0) {
                  console.log('[WC Cleanup] Removed ' + wcKeys.length + ' stale WalletConnect keys');
                }
              }
            } catch(e) {
              console.error('[WC Cleanup] Error:', e);
            }

            // Also clear sessionStorage
            try {
              if (typeof sessionStorage !== 'undefined') {
                const sKeys = Object.keys(sessionStorage);
                const wcSKeys = sKeys.filter(function(k) {
                  return k.includes('walletconnect') || k.includes('w3m') || k.includes('wc@2');
                });
                wcSKeys.forEach(function(k) {
                  try {
                    sessionStorage.removeItem(k);
                  } catch(e) {}
                });
              }
            } catch(e) {}
          })();
        `,
      }}
    />
  );
}
