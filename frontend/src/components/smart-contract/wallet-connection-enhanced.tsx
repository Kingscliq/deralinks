'use client';

import { AlertCircle, CheckCircle, Copy, ExternalLink, RefreshCw, Wallet } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { WalletType, useMultiWallet } from '@/hooks/use-multi-wallet';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import Box from '@/components/ui/box';
import { Button } from '@/components/ui/button';
import { WalletSelectorModal } from '@/components/modals/wallet-selector-modal';

interface NFTHolding {
  id: string;
  collectionId: string;
  propertyTitle: string;
  serialNumber: number;
}

interface WalletConnectionEnhancedProps {
  onConnect?: (address: string) => void;
  onDisconnect?: () => void;
}

export function WalletConnectionEnhanced({
  onConnect,
  onDisconnect,
}: WalletConnectionEnhancedProps) {
  const { status, account, walletType, error, connect, disconnect, provider, signer } =
    useMultiWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nftHoldings, setNftHoldings] = useState<NFTHolding[]>([]);
  const [isLoadingNFTs, setIsLoadingNFTs] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';

  // Load NFTs when wallet connects
  useEffect(() => {
    if (isConnected && account) {
      loadNFTHoldings();
      onConnect?.(account.address);
    }
  }, [isConnected, account]);

  const loadNFTHoldings = async () => {
    setIsLoadingNFTs(true);
    try {
      // Simulate loading NFTs
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock NFT data - In production, fetch from Hedera Mirror Node or your backend
      const mockNFTs: NFTHolding[] = [
        {
          id: 'NFT-1001',
          collectionId: '0.0.8001',
          propertyTitle: 'Modern Apartment Lagos',
          serialNumber: 1,
        },
        {
          id: 'NFT-1002',
          collectionId: '0.0.8002',
          propertyTitle: 'Luxury Villa Abuja',
          serialNumber: 3,
        },
        {
          id: 'NFT-1003',
          collectionId: '0.0.8003',
          propertyTitle: 'Commercial Space Port Harcourt',
          serialNumber: 7,
        },
      ];

      setNftHoldings(mockNFTs);
    } catch (err) {
      console.error('Error loading NFTs:', err);
    } finally {
      setIsLoadingNFTs(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setNftHoldings([]);
    onDisconnect?.();
  };

  const copyAddress = async () => {
    if (account) {
      await navigator.clipboard.writeText(account.address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const getWalletName = (type: WalletType): string => {
    switch (type) {
      case 'hashpack':
        return 'HashPack';
      case 'metamask':
        return 'MetaMask';
      case 'coinbase':
        return 'Coinbase Wallet';
      case 'walletconnect':
        return 'WalletConnect';
      default:
        return 'Unknown Wallet';
    }
  };

  const getExplorerUrl = (address: string): string => {
    // Hedera account ID format
    if (address.includes('.')) {
      return `https://hashscan.io/testnet/account/${address}`;
    }
    // Ethereum address format
    return `https://hashscan.io/testnet/address/${address}`;
  };

  return (
    <Box className="space-y-6">
      {/* Connection Status Card */}
      <Card className="card-elevated">
        <CardContent className="p-6">
          <Box className="flex items-center justify-between mb-4">
            <Box as="h3" className="text-xl font-semibold flex items-center gap-2">
              <Wallet className="w-6 h-6 text-primary" />
              Wallet Connection
            </Box>
            {isConnected && (
              <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                <CheckCircle className="w-3 h-3 mr-1" />
                Connected
              </Badge>
            )}
          </Box>

          {!isConnected ? (
            <Box className="space-y-4">
              <Box as="p" className="text-muted-foreground">
                Connect your wallet to access NFT-based property ownership features, DAO governance,
                and marketplace trading.
              </Box>

              {error && (
                <Box className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <Box>
                    <Box className="font-medium text-destructive">Connection Error</Box>
                    <Box className="text-sm text-destructive/80 mt-1">{error}</Box>
                  </Box>
                </Box>
              )}

              <Button
                onClick={() => setIsModalOpen(true)}
                className="w-full btn-gradient flex items-center justify-center gap-2"
                disabled={isConnecting}
              >
                <Wallet className="w-5 h-5" />
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </Button>

              <Box className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
                <Box className="text-center">
                  <Box className="text-2xl font-bold text-primary">4</Box>
                  <Box className="text-xs text-muted-foreground mt-1">Supported Wallets</Box>
                </Box>
                <Box className="text-center">
                  <Box className="text-2xl font-bold text-accent">100%</Box>
                  <Box className="text-xs text-muted-foreground mt-1">Secure</Box>
                </Box>
                <Box className="text-center">
                  <Box className="text-2xl font-bold text-green-500">24/7</Box>
                  <Box className="text-xs text-muted-foreground mt-1">Available</Box>
                </Box>
              </Box>
            </Box>
          ) : (
            <Box className="space-y-4">
              {/* Wallet Info */}
              <Box className="p-4 bg-muted/30 rounded-lg space-y-3">
                <Box className="flex items-center justify-between">
                  <Box className="text-sm text-muted-foreground">Wallet Type</Box>
                  <Badge variant="outline" className="border-primary/30 text-primary">
                    {getWalletName(walletType)}
                  </Badge>
                </Box>

                <Box className="flex items-center justify-between">
                  <Box className="text-sm text-muted-foreground">Address</Box>
                  <Box className="flex items-center gap-2">
                    <Box className="font-mono text-sm">{account?.address}</Box>
                    <Button variant="ghost" size="sm" onClick={copyAddress} className="h-6 w-6 p-0">
                      {copiedAddress ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                    <a
                      href={getExplorerUrl(account?.address || '')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-6 w-6 flex items-center justify-center hover:text-primary"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Box>
                </Box>

                <Box className="flex items-center justify-between">
                  <Box className="text-sm text-muted-foreground">Balance</Box>
                  <Box className="font-semibold">
                    {account?.balance} {walletType === 'hashpack' ? 'ℏ' : 'HBAR'}
                  </Box>
                </Box>

                <Box className="flex items-center justify-between">
                  <Box className="text-sm text-muted-foreground">Network</Box>
                  <Badge variant="outline">{account?.network}</Badge>
                </Box>
              </Box>

              {/* Action Buttons */}
              <Box className="flex gap-3">
                <Button
                  onClick={loadNFTHoldings}
                  variant="outline"
                  className="flex-1"
                  disabled={isLoadingNFTs}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingNFTs ? 'animate-spin' : ''}`} />
                  Refresh NFTs
                </Button>
                <Button
                  onClick={handleDisconnect}
                  variant="outline"
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  Disconnect
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* NFT Holdings */}
      {isConnected && (
        <Card className="card-elevated">
          <CardContent className="p-6">
            <Box className="flex items-center justify-between mb-4">
              <Box as="h3" className="text-lg font-semibold">
                Property NFT Holdings
              </Box>
              <Badge variant="outline">{nftHoldings.length} NFTs</Badge>
            </Box>

            {isLoadingNFTs ? (
              <Box className="py-8 text-center">
                <Box className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <Box className="text-sm text-muted-foreground">Loading NFTs...</Box>
              </Box>
            ) : nftHoldings.length === 0 ? (
              <Box className="py-8 text-center text-muted-foreground">
                <Box className="mb-2">No NFTs found in this wallet</Box>
                <Box className="text-sm">Purchase property tokens to get started</Box>
              </Box>
            ) : (
              <Box className="space-y-3">
                {nftHoldings.map(nft => (
                  <Box
                    key={nft.id}
                    className="p-4 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <Box className="flex items-center justify-between">
                      <Box className="flex-1">
                        <Box className="font-medium mb-1">{nft.propertyTitle}</Box>
                        <Box className="text-sm text-muted-foreground">
                          Collection: {nft.collectionId} • Serial: #{nft.serialNumber}
                        </Box>
                      </Box>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Wallet Selector Modal */}
      <WalletSelectorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </Box>
  );
}
