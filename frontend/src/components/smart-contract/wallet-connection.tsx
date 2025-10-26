'use client';

import { AlertCircle, CheckCircle, Copy, ExternalLink, Image, Wallet } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';
import Box from '@/components/ui/box';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface NFTHolding {
  id: string;
  collectionId: string;
  propertyTitle: string;
  serialNumber: number;
}

interface WalletConnectionProps {
  onConnect?: (address: string) => void;
  onDisconnect?: () => void;
}

export function WalletConnection({ onConnect, onDisconnect }: WalletConnectionProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState('0');
  const [nftHoldings, setNftHoldings] = useState<NFTHolding[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');

  // Simulate wallet connection
  const connectWallet = async () => {
    setIsConnecting(true);
    setError('');

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock wallet connection
      const mockAddress = '0.0.1234567';
      const mockBalance = '1,250.50';
      const mockNFTs: NFTHolding[] = [
        {
          id: 'NFT-1001',
          collectionId: '0.0.8001',
          propertyTitle: 'Modern Apartment Lagos',
          serialNumber: 1,
        },
        {
          id: 'NFT-1002',
          collectionId: '0.0.8001',
          propertyTitle: 'Modern Apartment Lagos',
          serialNumber: 2,
        },
        {
          id: 'NFT-2001',
          collectionId: '0.0.8002',
          propertyTitle: 'Luxury Villa Victoria Island',
          serialNumber: 1,
        },
      ];

      setAddress(mockAddress);
      setBalance(mockBalance);
      setNftHoldings(mockNFTs);
      setIsConnected(true);
      onConnect?.(mockAddress);
    } catch {
      setError('Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAddress('');
    setBalance('0');
    setNftHoldings([]);
    onDisconnect?.();
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    // Could add toast notification here
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 8)}...${addr.slice(-8)}`;
  };

  if (!isConnected) {
    return (
      <Card className="card-elevated">
        <CardContent className="p-6 text-center">
          <Box className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-white" />
          </Box>
          <Box as="h3" className="text-xl font-semibold mb-2">
            Connect Your Wallet
          </Box>
          <Box as="p" className="text-muted-foreground mb-6">
            Connect your Hedera wallet to start investing in NFT-based tokenized real estate
            properties.
          </Box>

          {error && (
            <Box className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-4 h-4" />
              {error}
            </Box>
          )}

          <Button onClick={connectWallet} disabled={isConnecting} className="btn-gradient w-full">
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </Button>

          <Box className="mt-4 text-sm text-muted-foreground">
            Supported wallets: HashPack, Blade, Yamgo
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-elevated">
      <CardContent className="p-6">
        <Box className="flex items-center justify-between mb-4">
          <Box className="flex items-center gap-3">
            <Box className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </Box>
            <Box>
              <Box as="h3" className="font-semibold">
                Wallet Connected
              </Box>
              <Box className="text-sm text-muted-foreground">Hedera Testnet</Box>
            </Box>
          </Box>
          <Button variant="outline" size="sm" onClick={disconnectWallet}>
            Disconnect
          </Button>
        </Box>

        <Box className="space-y-4">
          {/* Address */}
          <Box className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <Box className="text-sm text-muted-foreground mb-1">Wallet Address</Box>
            <Box className="flex items-center justify-between">
              <Box className="font-mono text-sm font-medium">{formatAddress(address)}</Box>
              <Box className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={copyAddress}>
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </Box>
            </Box>
          </Box>

          {/* Balances Grid */}
          <Box className="grid grid-cols-2 gap-3">
            {/* HBAR Balance */}
            <Box className="p-3 bg-muted rounded-lg">
              <Box className="text-xs text-muted-foreground mb-1">HBAR Balance</Box>
              <Box className="text-lg font-bold">{balance}</Box>
            </Box>

            {/* NFT Count */}
            <Box className="p-3 bg-gradient-primary rounded-lg text-white">
              <Box className="text-xs opacity-90 mb-1">NFTs Owned</Box>
              <Box className="text-lg font-bold">{nftHoldings.length}</Box>
            </Box>
          </Box>

          {/* NFT Holdings */}
          {nftHoldings.length > 0 && (
            <Box className="space-y-2">
              <Box className="flex items-center justify-between">
                <Box className="text-sm font-semibold">Your NFT Holdings</Box>
                <Badge className="bg-purple-100 text-purple-700">{nftHoldings.length} NFTs</Badge>
              </Box>
              <Box className="max-h-48 overflow-y-auto space-y-2">
                {nftHoldings.map(nft => (
                  <Box
                    key={nft.id}
                    className="flex items-center gap-3 p-3 bg-white border rounded-lg hover:border-purple-300 transition-colors"
                  >
                    <Box className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg flex items-center justify-center">
                      <Image className="w-5 h-5 text-white" aria-label="NFT icon" />
                    </Box>
                    <Box className="flex-1">
                      <Box className="text-sm font-medium">{nft.propertyTitle}</Box>
                      <Box className="text-xs text-muted-foreground">#{nft.serialNumber}</Box>
                    </Box>
                    <Box className="text-xs font-mono text-muted-foreground">{nft.id}</Box>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Network Status */}
          <Box className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
            <Box className="flex items-center gap-2">
              <Box className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></Box>
              <Box className="text-sm font-medium text-green-700">Connected to Hedera</Box>
            </Box>
            <Badge className="bg-green-100 text-green-700">Mainnet</Badge>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
