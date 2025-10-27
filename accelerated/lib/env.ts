/**
 * Environment variables configuration
 * Provides type-safe access to environment variables
 *
 * Note: This module can be used in both server and client components.
 * Only NEXT_PUBLIC_* variables are available in the browser.
 */

export const env = {
  // WalletConnect Project ID
  walletProjectId: process.env.NEXT_PUBLIC_WALLET_PROJECT_ID || '',

  // Hedera Network (testnet or mainnet)
  hederaNetwork: (process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet') as 'testnet' | 'mainnet',

  // Application Environment
  nodeEnv: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',

  // Optional: Supabase Configuration
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },

  // Optional: Analytics
  analytics: {
    googleAnalyticsId: process.env.NEXT_PUBLIC_GA_TRACKING_ID || '',
    sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
  },
} as const;

/**
 * Validates that all required environment variables are set
 * Call this at app startup to fail fast if config is missing
 */
export function validateEnv(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!env.walletProjectId) {
    errors.push('NEXT_PUBLIC_WALLET_PROJECT_ID is not set. Get one from https://cloud.walletconnect.com/');
  }

  if (!['testnet', 'mainnet'].includes(env.hederaNetwork)) {
    errors.push('NEXT_PUBLIC_HEDERA_NETWORK must be either "testnet" or "mainnet"');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Helper to check if app is in development mode
 */
export const isDev = env.isDevelopment;

/**
 * Helper to check if app is in production mode
 */
export const isProd = env.isProduction;
