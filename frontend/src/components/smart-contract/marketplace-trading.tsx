'use client';

import {
  AlertCircle,
  ArrowUpDown,
  Building2,
  Clock,
  Eye,
  Share2,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';
import Box from '@/components/ui/box';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface NFTListing {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage: string;
  nftPrice: number;
  nftIds: string[]; // Array of NFT IDs being sold
  seller: string;
  listingType: 'buy' | 'sell';
  status: 'active' | 'filled' | 'cancelled';
  createdAt: string;
  expiresAt?: string;
  totalValue: number;
}

interface MarketplaceTradingProps {
  userNFTCount: number;
  userBalance: number;
}

export function MarketplaceTrading({ userNFTCount, userBalance }: MarketplaceTradingProps) {
  const [activeTab, setActiveTab] = useState<'market' | 'portfolio' | 'orders'>('market');
  const [isTrading, setIsTrading] = useState(false);
  const [error, setError] = useState('');
  const [selectedListing, setSelectedListing] = useState<NFTListing | null>(null);
  const [selectedNFTIds, setSelectedNFTIds] = useState<string[]>([]);
  const [tradePrice, setTradePrice] = useState('');

  // Mock market data with NFTs
  const [listings, setListings] = useState<NFTListing[]>([
    {
      id: '1',
      propertyId: 'prop-1',
      propertyTitle: 'Modern Apartment in Downtown Lagos',
      propertyImage: '/placeholder.svg',
      nftPrice: 50000,
      nftIds: ['NFT-1001', 'NFT-1002', 'NFT-1003'],
      seller: '0x1234...5678',
      listingType: 'sell',
      status: 'active',
      createdAt: '2024-01-15T10:00:00Z',
      totalValue: 150000,
    },
    {
      id: '2',
      propertyId: 'prop-2',
      propertyTitle: 'Luxury Villa in Victoria Island',
      propertyImage: '/placeholder.svg',
      nftPrice: 125000,
      nftIds: ['NFT-2001', 'NFT-2002'],
      seller: '0x9876...5432',
      listingType: 'sell',
      status: 'active',
      createdAt: '2024-01-14T15:30:00Z',
      totalValue: 250000,
    },
    {
      id: '3',
      propertyId: 'prop-1',
      propertyTitle: 'Modern Apartment in Downtown Lagos',
      propertyImage: '/placeholder.svg',
      nftPrice: 48000,
      nftIds: ['NFT-1004'],
      seller: '0x4567...8901',
      listingType: 'buy',
      status: 'active',
      createdAt: '2024-01-13T09:15:00Z',
      totalValue: 48000,
    },
  ]);

  const [userOrders, setUserOrders] = useState<NFTListing[]>([
    {
      id: 'user-1',
      propertyId: 'prop-1',
      propertyTitle: 'Modern Apartment in Downtown Lagos',
      propertyImage: '/placeholder.svg',
      nftPrice: 52000,
      nftIds: ['NFT-USER-1', 'NFT-USER-2'],
      seller: '0x1234...5678',
      listingType: 'sell',
      status: 'active',
      createdAt: '2024-01-12T14:20:00Z',
      totalValue: 104000,
    },
  ]);

  const [userPortfolio, setUserPortfolio] = useState([
    {
      propertyId: 'prop-1',
      propertyTitle: 'Modern Apartment in Downtown Lagos',
      propertyImage: '/placeholder.svg',
      nftIds: ['NFT-OWN-1', 'NFT-OWN-2', 'NFT-OWN-3'],
      nftsOwned: 3,
      totalValue: 150000,
      currentPrice: 50000,
      priceChange: 5.2,
      priceChangeType: 'up' as 'up' | 'down',
    },
    {
      propertyId: 'prop-3',
      propertyTitle: 'Commercial Building in Ikoyi',
      propertyImage: '/placeholder.svg',
      nftIds: ['NFT-COM-1', 'NFT-COM-2'],
      nftsOwned: 2,
      totalValue: 300000,
      currentPrice: 150000,
      priceChange: -2.1,
      priceChangeType: 'down' as 'up' | 'down',
    },
  ]);

  const executeTrade = async (listing: NFTListing, isBuy: boolean) => {
    setIsTrading(true);
    setError('');

    try {
      // Simulate NFT transfer execution
      await new Promise(resolve => setTimeout(resolve, 3000));

      if (isBuy) {
        // Update user portfolio with purchased NFTs
        setUserPortfolio(prev => {
          const existing = prev.find(p => p.propertyId === listing.propertyId);
          if (existing) {
            return prev.map(p =>
              p.propertyId === listing.propertyId
                ? {
                    ...p,
                    nftIds: [...p.nftIds, ...selectedNFTIds],
                    nftsOwned: p.nftsOwned + selectedNFTIds.length,
                  }
                : p,
            );
          } else {
            return [
              ...prev,
              {
                propertyId: listing.propertyId,
                propertyTitle: listing.propertyTitle,
                propertyImage: listing.propertyImage,
                nftIds: selectedNFTIds,
                nftsOwned: selectedNFTIds.length,
                totalValue: selectedNFTIds.length * listing.nftPrice,
                currentPrice: listing.nftPrice,
                priceChange: 0,
                priceChangeType: 'up' as const,
              },
            ];
          }
        });
      } else {
        // Update user portfolio (selling NFTs)
        setUserPortfolio(prev =>
          prev.map(p =>
            p.propertyId === listing.propertyId
              ? {
                  ...p,
                  nftIds: p.nftIds.filter(id => !selectedNFTIds.includes(id)),
                  nftsOwned: p.nftsOwned - selectedNFTIds.length,
                }
              : p,
          ),
        );
      }

      // Remove filled listing
      setListings(prev => prev.filter(l => l.id !== listing.id));
      setSelectedListing(null);
      setSelectedNFTIds([]);
    } catch {
      setError('NFT transfer failed. Please try again.');
    } finally {
      setIsTrading(false);
    }
  };

  const createOrder = async (isBuyOrder: boolean) => {
    setIsTrading(true);
    setError('');

    try {
      // Simulate NFT listing creation
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newOrder: NFTListing = {
        id: `user-${Date.now()}`,
        propertyId: selectedListing?.propertyId || 'prop-1',
        propertyTitle: selectedListing?.propertyTitle || 'Property',
        propertyImage: selectedListing?.propertyImage || '/placeholder.svg',
        nftPrice: parseFloat(tradePrice),
        nftIds: selectedNFTIds,
        seller: '0x1234...5678', // Current user
        listingType: isBuyOrder ? 'buy' : 'sell',
        status: 'active',
        createdAt: new Date().toISOString(),
        totalValue: selectedNFTIds.length * parseFloat(tradePrice),
      };

      setUserOrders(prev => [newOrder, ...prev]);
      setSelectedListing(null);
      setSelectedNFTIds([]);
      setTradePrice('');
    } catch {
      setError('Failed to create NFT listing. Please try again.');
    } finally {
      setIsTrading(false);
    }
  };

  const renderMarket = () => (
    <Box className="space-y-6">
      <Box className="flex items-center justify-between">
        <Box as="h2" className="text-2xl font-bold">
          NFT Marketplace
        </Box>
        <Box className="flex gap-2">
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            Watchlist
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </Box>
      </Box>

      {/* Market Stats */}
      <Box className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-elevated">
          <CardContent className="p-4">
            <Box className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <Box className="text-sm text-muted-foreground">24h Volume</Box>
            </Box>
            <Box className="text-xl font-bold">₦2.5M</Box>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="p-4">
            <Box className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-blue-600" />
              <Box className="text-sm text-muted-foreground">Active Traders</Box>
            </Box>
            <Box className="text-xl font-bold">1,247</Box>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="p-4">
            <Box className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-purple-600" />
              <Box className="text-sm text-muted-foreground">Listed Properties</Box>
            </Box>
            <Box className="text-xl font-bold">45</Box>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="p-4">
            <Box className="flex items-center gap-2 mb-2">
              <ArrowUpDown className="w-4 h-4 text-orange-600" />
              <Box className="text-sm text-muted-foreground">Active Orders</Box>
            </Box>
            <Box className="text-xl font-bold">892</Box>
          </CardContent>
        </Card>
      </Box>

      {/* Listings */}
      <Box className="space-y-4">
        <Box as="h3" className="text-lg font-semibold">
          Available Orders
        </Box>
        {listings.map(listing => (
          <Card key={listing.id} className="card-elevated">
            <CardContent className="p-4">
              <Box className="flex items-center justify-between">
                <Box className="flex items-center gap-4 flex-1">
                  <Box
                    as="img"
                    src={listing.propertyImage}
                    alt={listing.propertyTitle}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <Box className="flex-1">
                    <Box as="h4" className="font-semibold mb-1">
                      {listing.propertyTitle}
                    </Box>
                    <Box className="text-sm text-muted-foreground">
                      {listing.nftIds.length} NFT{listing.nftIds.length > 1 ? 's' : ''} •{' '}
                      {listing.seller}
                    </Box>
                  </Box>
                </Box>

                <Box className="text-right">
                  <Box className="text-xl font-bold">₦{listing.nftPrice.toLocaleString()}</Box>
                  <Box className="text-sm text-muted-foreground">per NFT</Box>
                </Box>

                <Box className="flex items-center gap-2 ml-4">
                  <Badge
                    className={
                      listing.listingType === 'buy'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }
                  >
                    {listing.listingType === 'buy' ? 'Buy Order' : 'Sell Order'}
                  </Badge>
                  <Button
                    size="sm"
                    onClick={() => setSelectedListing(listing)}
                    className="btn-gradient"
                  >
                    {listing.listingType === 'buy' ? 'Sell to' : 'Buy from'}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );

  const renderPortfolio = () => (
    <Box className="space-y-6">
      <Box as="h2" className="text-2xl font-bold">
        Your Portfolio
      </Box>

      <Box className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="card-elevated">
          <CardContent className="p-4 text-center">
            <Box className="text-2xl font-bold text-gradient-primary">{userNFTCount}</Box>
            <Box className="text-sm text-muted-foreground">Total NFTs Owned</Box>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="p-4 text-center">
            <Box className="text-2xl font-bold text-gradient-primary">
              ₦{userBalance.toLocaleString()}
            </Box>
            <Box className="text-sm text-muted-foreground">Available Balance</Box>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="p-4 text-center">
            <Box className="text-2xl font-bold text-gradient-primary">
              ₦{userPortfolio.reduce((sum, p) => sum + p.totalValue, 0).toLocaleString()}
            </Box>
            <Box className="text-sm text-muted-foreground">Portfolio Value</Box>
          </CardContent>
        </Card>
      </Box>

      <Box className="space-y-4">
        {userPortfolio.map(property => (
          <Card key={property.propertyId} className="card-elevated">
            <CardContent className="p-4">
              <Box className="flex items-center justify-between">
                <Box className="flex items-center gap-4 flex-1">
                  <Box
                    as="img"
                    src={property.propertyImage}
                    alt={property.propertyTitle}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <Box className="flex-1">
                    <Box as="h4" className="font-semibold mb-1">
                      {property.propertyTitle}
                    </Box>
                    <Box className="text-sm text-muted-foreground">
                      {property.nftsOwned} NFT{property.nftsOwned > 1 ? 's' : ''} owned
                    </Box>
                  </Box>
                </Box>

                <Box className="text-right">
                  <Box className="text-xl font-bold">₦{property.currentPrice.toLocaleString()}</Box>
                  <Box
                    className={`text-sm flex items-center gap-1 ${
                      property.priceChangeType === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {property.priceChangeType === 'up' ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {Math.abs(property.priceChange)}%
                  </Box>
                </Box>

                <Box className="flex items-center gap-2 ml-4">
                  <Box className="text-right">
                    <Box className="text-lg font-semibold">
                      ₦{property.totalValue.toLocaleString()}
                    </Box>
                    <Box className="text-sm text-muted-foreground">Total Value</Box>
                  </Box>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedListing({
                        id: 'sell',
                        propertyId: property.propertyId,
                        propertyTitle: property.propertyTitle,
                        propertyImage: property.propertyImage,
                        nftPrice: property.currentPrice,
                        nftIds: property.nftIds,
                        seller: '0x1234...5678',
                        listingType: 'sell',
                        status: 'active',
                        createdAt: new Date().toISOString(),
                        totalValue: property.totalValue,
                      });
                    }}
                  >
                    Sell
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );

  const renderOrders = () => (
    <Box className="space-y-6">
      <Box as="h2" className="text-2xl font-bold">
        Your Orders
      </Box>

      <Box className="space-y-4">
        {userOrders.map(order => (
          <Card key={order.id} className="card-elevated">
            <CardContent className="p-4">
              <Box className="flex items-center justify-between">
                <Box className="flex items-center gap-4 flex-1">
                  <Box
                    as="img"
                    src={order.propertyImage}
                    alt={order.propertyTitle}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <Box className="flex-1">
                    <Box as="h4" className="font-semibold mb-1">
                      {order.propertyTitle}
                    </Box>
                    <Box className="text-sm text-muted-foreground">
                      {order.nftIds.length} NFT{order.nftIds.length > 1 ? 's' : ''} • Created{' '}
                      {new Date(order.createdAt).toLocaleDateString()}
                    </Box>
                  </Box>
                </Box>

                <Box className="text-right">
                  <Box className="text-xl font-bold">₦{order.nftPrice.toLocaleString()}</Box>
                  <Box className="text-sm text-muted-foreground">per NFT</Box>
                </Box>

                <Box className="flex items-center gap-2 ml-4">
                  <Badge
                    className={
                      order.listingType === 'buy'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }
                  >
                    {order.listingType === 'buy' ? 'Buy Order' : 'Sell Order'}
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-700">{order.status}</Badge>
                  <Button size="sm" variant="outline">
                    Cancel
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );

  const renderTradeModal = () => {
    if (!selectedListing) return null;

    const isBuying = selectedListing.listingType === 'sell';
    const maxNFTs = isBuying
      ? Math.floor(userBalance / selectedListing.nftPrice)
      : selectedListing.nftIds.length;
    const availableNFTs = isBuying ? selectedListing.nftIds : selectedListing.nftIds;

    return (
      <Box className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="card-elevated w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isBuying ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              {isBuying ? 'Purchase NFTs' : 'List NFTs for Sale'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Box className="p-3 bg-muted rounded-lg">
              <Box className="text-sm text-muted-foreground mb-1">Property</Box>
              <Box className="font-medium">{selectedListing.propertyTitle}</Box>
            </Box>

            <Box className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
              <Box className="text-sm text-muted-foreground mb-1">Price per NFT</Box>
              <Box className="font-semibold text-lg">
                ₦{selectedListing.nftPrice.toLocaleString()}
              </Box>
            </Box>

            <Box>
              <Box as="label" className="text-sm font-medium mb-2 block">
                Available NFTs ({availableNFTs.length})
              </Box>
              <Box className="max-h-32 overflow-y-auto space-y-2 p-2 border rounded-lg bg-muted/30">
                {availableNFTs.slice(0, Math.min(maxNFTs, availableNFTs.length)).map(nftId => (
                  <Box
                    key={nftId}
                    className={`p-2 rounded cursor-pointer transition-colors ${
                      selectedNFTIds.includes(nftId)
                        ? 'bg-gradient-primary text-white'
                        : 'bg-white hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setSelectedNFTIds(prev =>
                        prev.includes(nftId) ? prev.filter(id => id !== nftId) : [...prev, nftId],
                      );
                    }}
                  >
                    <Box className="text-xs font-mono">{nftId}</Box>
                  </Box>
                ))}
              </Box>
              <Box className="text-xs text-muted-foreground mt-1">
                Selected: {selectedNFTIds.length} NFT{selectedNFTIds.length !== 1 ? 's' : ''}
              </Box>
            </Box>

            {!isBuying && (
              <Box>
                <Box as="label" className="text-sm font-medium mb-2 block">
                  List Price (per NFT)
                </Box>
                <Input
                  type="number"
                  placeholder="0"
                  value={tradePrice}
                  onChange={e => setTradePrice(e.target.value)}
                />
              </Box>
            )}

            <Box className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Box className="text-sm text-blue-700 font-medium">
                {isBuying ? 'Total Cost' : 'Estimated Proceeds'}: ₦
                {isBuying
                  ? (selectedNFTIds.length * selectedListing.nftPrice).toLocaleString()
                  : (selectedNFTIds.length * parseFloat(tradePrice || '0')).toLocaleString()}
              </Box>
            </Box>

            <Box className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedListing(null);
                  setSelectedNFTIds([]);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() =>
                  isBuying ? executeTrade(selectedListing, true) : createOrder(false)
                }
                disabled={selectedNFTIds.length === 0 || isTrading || (!isBuying && !tradePrice)}
                className="flex-1 btn-gradient"
              >
                {isTrading ? 'Processing...' : isBuying ? 'Purchase NFTs' : 'Create Listing'}
              </Button>
            </Box>

            {error && (
              <Box className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle className="w-4 h-4" />
                {error}
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    );
  };

  return (
    <Box className="max-w-6xl mx-auto">
      {/* Header */}
      <Box className="mb-8">
        <Box as="h1" className="text-3xl font-bold mb-2">
          Marketplace Trading
        </Box>
        <Box as="p" className="text-muted-foreground">
          Trade property NFTs on our decentralized marketplace with instant settlement
        </Box>
      </Box>

      {/* Tabs */}
      <Box className="flex gap-2 mb-6">
        <Button
          variant={activeTab === 'market' ? 'default' : 'outline'}
          onClick={() => setActiveTab('market')}
          className="btn-gradient"
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Market
        </Button>
        <Button
          variant={activeTab === 'portfolio' ? 'default' : 'outline'}
          onClick={() => setActiveTab('portfolio')}
        >
          <Building2 className="w-4 h-4 mr-2" />
          Portfolio
        </Button>
        <Button
          variant={activeTab === 'orders' ? 'default' : 'outline'}
          onClick={() => setActiveTab('orders')}
        >
          <Clock className="w-4 h-4 mr-2" />
          Orders
        </Button>
      </Box>

      {/* Content */}
      {activeTab === 'market' && renderMarket()}
      {activeTab === 'portfolio' && renderPortfolio()}
      {activeTab === 'orders' && renderOrders()}

      {/* Trade Modal */}
      {renderTradeModal()}
    </Box>
  );
}
