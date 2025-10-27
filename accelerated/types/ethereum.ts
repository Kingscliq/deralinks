/**
 * TypeScript type definitions for Ethereum wallet providers
 * Provides type safety for window.ethereum and wallet integrations
 */

export interface EthereumProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on?: (event: string, handler: (...args: any[]) => void) => void;
  removeListener?: (event: string, handler: (...args: any[]) => void) => void;

  // Wallet-specific flags
  isHashPack?: boolean;
  isHashpack?: boolean;
  isBlade?: boolean;
  isKabila?: boolean;
  isMetaMask?: boolean;
}

export interface WindowEthereum extends EthereumProvider {
  providers?: EthereumProvider[];
}

// Note: window.ethereum is already declared by other libraries (wagmi, viem)
// We export WindowEthereum type for casting when needed: window.ethereum as WindowEthereum
