'use client';

import {
  AIValuationDashboard,
  DAOGovernance,
  KYCCompliance,
  MarketplaceTrading,
  PropertyTokenization,
  WalletConnection,
} from '@/components/smart-contract';
import {
  Brain,
  Building2,
  ChevronRight,
  Home,
  Menu,
  Shield,
  TrendingUp,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

import Box from '@/components/ui/box';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/common/header';
import { useState } from 'react';

export default function SmartContractDemo() {
  const [activeDemo, setActiveDemo] = useState<string>('overview');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  // const [walletAddress, setWalletAddress] = useState(''); // Available for future use

  const menuItems = [
    {
      id: 'overview',
      title: 'Overview',
      icon: Home,
      color: 'text-blue-500',
    },
    {
      id: 'wallet',
      title: 'Wallet Connection',
      icon: Wallet,
      color: 'text-blue-600',
    },
    {
      id: 'kyc',
      title: 'KYC & Compliance',
      icon: Shield,
      color: 'text-green-600',
    },
    {
      id: 'tokenization',
      title: 'Property Tokenization',
      icon: Building2,
      color: 'text-purple-600',
    },
    {
      id: 'dao',
      title: 'DAO Governance',
      icon: Users,
      color: 'text-orange-600',
    },
    {
      id: 'marketplace',
      title: 'NFT Marketplace',
      icon: TrendingUp,
      color: 'text-red-600',
    },
    {
      id: 'ai-valuation',
      title: 'AI Valuation',
      icon: Brain,
      color: 'text-indigo-600',
    },
  ];

  const handleWalletConnect = (address: string) => {
    setIsWalletConnected(true);
    console.log('Wallet connected:', address);
  };

  const handleWalletDisconnect = () => {
    setIsWalletConnected(false);
    console.log('Wallet disconnected');
  };

  const renderOverview = () => (
    <Box className="space-y-6">
      <Box>
        <Box as="h2" className="text-3xl font-bold mb-2">
          Welcome to DeraLinks Dashboard
        </Box>
        <Box as="p" className="text-muted-foreground">
          Your comprehensive platform for NFT-based real estate investment and management
        </Box>
      </Box>

      {/* Platform Stats */}
      <Box className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-elevated">
          <CardContent className="p-6 text-center">
            <Box className="text-3xl font-bold text-gradient-primary mb-2">6</Box>
            <Box className="text-sm text-muted-foreground">Smart Contract Features</Box>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="p-6 text-center">
            <Box className="text-3xl font-bold text-gradient-primary mb-2">100%</Box>
            <Box className="text-sm text-muted-foreground">Hedera Compatible</Box>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="p-6 text-center">
            <Box className="text-3xl font-bold text-gradient-primary mb-2">24/7</Box>
            <Box className="text-sm text-muted-foreground">AI Monitoring</Box>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="p-6 text-center">
            <Box className="text-3xl font-bold text-gradient-primary mb-2">NFT</Box>
            <Box className="text-sm text-muted-foreground">Based Ownership</Box>
          </CardContent>
        </Card>
      </Box>

      {/* Quick Actions */}
      <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.slice(1).map(item => {
          const IconComponent = item.icon;
          return (
            <Card
              key={item.id}
              className="card-elevated group cursor-pointer hover:shadow-lg transition-all"
              onClick={() => setActiveDemo(item.id)}
            >
              <CardContent className="p-6">
                <Box className="flex items-center gap-4">
                  <Box
                    className={`w-12 h-12 ${item.color} bg-opacity-10 rounded-lg flex items-center justify-center`}
                  >
                    <IconComponent className={`w-6 h-6 ${item.color}`} />
                  </Box>
                  <Box className="flex-1">
                    <Box as="h3" className="font-semibold mb-1">
                      {item.title}
                    </Box>
                  </Box>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* Status Indicators */}
      <Card className="card-elevated">
        <CardContent className="p-6">
          <Box as="h3" className="font-semibold mb-4">
            System Status
          </Box>
          <Box className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Box className="flex items-center gap-3">
              <Box
                className={`w-3 h-3 rounded-full ${isWalletConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}
              />
              <Box className="text-sm">
                Wallet {isWalletConnected ? 'Connected' : 'Disconnected'}
              </Box>
            </Box>
            <Box className="flex items-center gap-3">
              <Box className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <Box className="text-sm">Hedera Mainnet Live</Box>
            </Box>
            <Box className="flex items-center gap-3">
              <Box className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <Box className="text-sm">AI Models Active</Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );

  const renderContent = () => {
    switch (activeDemo) {
      case 'overview':
        return renderOverview();
      case 'wallet':
        return (
          <WalletConnection onConnect={handleWalletConnect} onDisconnect={handleWalletDisconnect} />
        );
      case 'kyc':
        return <KYCCompliance onComplete={data => console.log('KYC completed:', data)} />;
      case 'tokenization':
        return (
          <PropertyTokenization onTokenize={data => console.log('Property tokenized:', data)} />
        );
      case 'dao':
        return <DAOGovernance propertyId="prop-1" userNFTCount={5} totalNFTs={500} />;
      case 'marketplace':
        return <MarketplaceTrading userNFTCount={5} userBalance={250000} />;
      case 'ai-valuation':
        return <AIValuationDashboard />;
      default:
        return renderOverview();
    }
  };

  return (
    <Box className="min-h-screen bg-background">
      <Header />

      <Box className="flex">
        {/* Sidebar */}
        <Box
          className={`fixed lg:sticky top-0 left-0 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 z-40 ${
            isSidebarOpen ? 'w-64' : 'w-0 lg:w-20'
          } overflow-hidden`}
        >
          {/* Sidebar Header */}
          <Box className="p-4 border-b border-sidebar-border flex items-center justify-between">
            {isSidebarOpen && (
              <Box as="h2" className="font-bold text-lg text-gradient-primary">
                Dashboard
              </Box>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </Box>

          {/* Navigation Menu */}
          <Box className="p-3 space-y-2">
            {menuItems.map(item => {
              const IconComponent = item.icon;
              const isActive = activeDemo === item.id;

              return (
                <Button
                  key={item.id}
                  variant={isActive ? 'default' : 'ghost'}
                  className={`w-full justify-start gap-3 py-3 px-4 h-auto ${
                    isActive
                      ? 'bg-gradient-primary text-white'
                      : 'hover:bg-sidebar-accent text-muted-foreground hover:text-sidebar-foreground'
                  } ${!isSidebarOpen && 'lg:justify-center'}`}
                  onClick={() => setActiveDemo(item.id)}
                >
                  <IconComponent
                    className={`w-5 h-5 ${isActive ? 'text-white' : 'text-muted-foreground'}`}
                  />
                  {isSidebarOpen && (
                    <Box className="flex-1 text-left">
                      <Box className="text-sm font-medium">{item.title}</Box>
                    </Box>
                  )}
                  {isSidebarOpen && isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Button>
              );
            })}
          </Box>

          {/* Sidebar Footer */}
          {isSidebarOpen && (
            <Box className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border">
              <Box className="flex items-center gap-2 text-xs text-muted-foreground">
                <Box
                  className={`w-2 h-2 rounded-full ${isWalletConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}
                />
                <Box>{isWalletConnected ? 'Wallet Connected' : 'Connect Wallet'}</Box>
              </Box>
            </Box>
          )}
        </Box>

        {/* Main Content Area */}
        <Box className={`flex-1 transition-all duration-300 ${isSidebarOpen ? '' : 'lg:ml-20'}`}>
          {/* Mobile Menu Button */}
          <Box className="lg:hidden p-4 border-b border-sidebar-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSidebarOpen(true)}
              className="gap-2"
            >
              <Menu className="w-4 h-4" />
              Menu
            </Button>
          </Box>

          {/* Page Content */}
          <main className="p-4 lg:p-8">{renderContent()}</main>
        </Box>
      </Box>
    </Box>
  );
}
