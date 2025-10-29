'use client';

import {
  Building2,
  FileText,
  LogOut,
  Menu,
  Settings,
  Star,
  TrendingUp,
  User,
  Users,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

import Box from '@/components/ui/box';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { WalletButton } from '@/components/wallet/WalletButton';
import { useState } from 'react';
import { useWallet } from '@/hooks/use-wallet';

export function Header() {
  const { isConnected, accountId, disconnect } = useWallet();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const isWalletConnected = isConnected;
  const walletAddress = accountId || '';

  const formatAddress = (address: string): string => {
    if (!address) return '';
    // For Hedera account IDs (e.g., 0.0.123456)
    return address;
  };

  return (
    <Box
      as="header"
      className="sticky top-0 z-50 w-full border-b border-border/50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80"
    >
      <Box className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2" prefetch={false}>
          <Box className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/30">
            <Building2 className="w-5 h-5 text-white" />
          </Box>
          <Box as="span" className="font-bold text-xl text-white">
            Dera
            <Box as="span" className="text-primary">
              Links
            </Box>
          </Box>
        </Link>

        {/* Desktop Navigation */}
        <Box as="nav" className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link
            href="/"
            className="group relative text-white/90 hover:text-white transition-all duration-300 flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-primary/10"
            prefetch={false}
          >
            <Building2 className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
            <span className="relative">
              Properties
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-300 group-hover:w-full"></span>
            </span>
          </Link>
          <Link
            href="/dashboard"
            className="group relative text-white/90 hover:text-white transition-all duration-300 flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-primary/10"
            prefetch={false}
          >
            <TrendingUp className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
            <span className="relative">
              Dashboard
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-300 group-hover:w-full"></span>
            </span>
          </Link>
          <Link
            href="/dao"
            className="group relative text-white/90 hover:text-white transition-all duration-300 flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-primary/10"
            prefetch={false}
          >
            <Users className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
            <span className="relative">
              DAO
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-300 group-hover:w-full"></span>
            </span>
          </Link>
          <Link
            href="/admin"
            className="group relative text-white/90 hover:text-white transition-all duration-300 flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-primary/10"
            prefetch={false}
          >
            <FileText className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
            <span className="relative">
              Admin
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-300 group-hover:w-full"></span>
            </span>
          </Link>
          <Link
            href="/demo"
            className="group relative text-white/90 hover:text-white transition-all duration-300 flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-primary/10"
            prefetch={false}
          >
            <Star className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
            <span className="relative">
              Demo
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-300 group-hover:w-full"></span>
            </span>
          </Link>
        </Box>

        {/* Wallet Connection & Mobile Menu */}
        <Box className="flex items-center gap-4">
          {/* Desktop Wallet Button */}
          <Box className="hidden md:block">
            <WalletButton />
          </Box>

          {/* Mobile Menu */}
          <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <Box as="span" className="sr-only">
                  Toggle navigation menu
                </Box>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-80 border-l border-sidebar-border !bg-sidebar"
              style={{ backgroundColor: '#161b26' }}
            >
              <Box className="grid gap-6 p-4 pt-12">
                {/* Mobile Navigation */}
                <Box className="space-y-3">
                  <Box
                    as="h3"
                    className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-4"
                  >
                    Navigation
                  </Box>
                  <Box className="grid gap-2">
                    <Link
                      href="/"
                      className="group relative flex items-center gap-3 p-3 rounded-lg transition-all duration-300 hover:bg-sidebar-accent border border-transparent hover:border-sidebar-primary/30 hover:shadow-lg hover:shadow-sidebar-primary/10 overflow-hidden"
                      prefetch={false}
                    >
                      <Box className="absolute inset-0 bg-gradient-to-r from-sidebar-primary/0 via-sidebar-primary/5 to-sidebar-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></Box>
                      <Building2 className="w-5 h-5 text-muted-foreground group-hover:text-sidebar-primary transition-all duration-300 group-hover:scale-110 z-10" />
                      <span className="text-muted-foreground group-hover:text-sidebar-foreground font-medium transition-colors duration-300 z-10">
                        Properties
                      </span>
                    </Link>
                    <Link
                      href="/dashboard"
                      className="group relative flex items-center gap-3 p-3 rounded-lg transition-all duration-300 hover:bg-sidebar-accent border border-transparent hover:border-sidebar-primary/30 hover:shadow-lg hover:shadow-sidebar-primary/10 overflow-hidden"
                      prefetch={false}
                    >
                      <Box className="absolute inset-0 bg-gradient-to-r from-sidebar-primary/0 via-sidebar-primary/5 to-sidebar-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></Box>
                      <TrendingUp className="w-5 h-5 text-muted-foreground group-hover:text-sidebar-primary transition-all duration-300 group-hover:scale-110 z-10" />
                      <span className="text-muted-foreground group-hover:text-sidebar-foreground font-medium transition-colors duration-300 z-10">
                        Dashboard
                      </span>
                    </Link>
                    <Link
                      href="/dao"
                      className="group relative flex items-center gap-3 p-3 rounded-lg transition-all duration-300 hover:bg-sidebar-accent border border-transparent hover:border-sidebar-primary/30 hover:shadow-lg hover:shadow-sidebar-primary/10 overflow-hidden"
                      prefetch={false}
                    >
                      <Box className="absolute inset-0 bg-gradient-to-r from-sidebar-primary/0 via-sidebar-primary/5 to-sidebar-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></Box>
                      <Users className="w-5 h-5 text-muted-foreground group-hover:text-sidebar-primary transition-all duration-300 group-hover:scale-110 z-10" />
                      <span className="text-muted-foreground group-hover:text-sidebar-foreground font-medium transition-colors duration-300 z-10">
                        DAO
                      </span>
                    </Link>
                    <Link
                      href="/admin"
                      className="group relative flex items-center gap-3 p-3 rounded-lg transition-all duration-300 hover:bg-sidebar-accent border border-transparent hover:border-sidebar-primary/30 hover:shadow-lg hover:shadow-sidebar-primary/10 overflow-hidden"
                      prefetch={false}
                    >
                      <Box className="absolute inset-0 bg-gradient-to-r from-sidebar-primary/0 via-sidebar-primary/5 to-sidebar-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></Box>
                      <FileText className="w-5 h-5 text-muted-foreground group-hover:text-sidebar-primary transition-all duration-300 group-hover:scale-110 z-10" />
                      <span className="text-muted-foreground group-hover:text-sidebar-foreground font-medium transition-colors duration-300 z-10">
                        Admin
                      </span>
                    </Link>
                    <Link
                      href="/demo"
                      className="group relative flex items-center gap-3 p-3 rounded-lg transition-all duration-300 hover:bg-sidebar-accent border border-transparent hover:border-sidebar-primary/30 hover:shadow-lg hover:shadow-sidebar-primary/10 overflow-hidden"
                      prefetch={false}
                    >
                      <Box className="absolute inset-0 bg-gradient-to-r from-sidebar-primary/0 via-sidebar-primary/5 to-sidebar-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></Box>
                      <Star className="w-5 h-5 text-muted-foreground group-hover:text-sidebar-primary transition-all duration-300 group-hover:scale-110 z-10" />
                      <span className="text-muted-foreground group-hover:text-sidebar-foreground font-medium transition-colors duration-300 z-10">
                        Demo
                      </span>
                    </Link>
                  </Box>
                </Box>

                {/* Wallet Section */}
                <Box className="space-y-3">
                  <Box
                    as="h3"
                    className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-3"
                  >
                    Wallet
                  </Box>
                  {isWalletConnected ? (
                    <Box className="space-y-3">
                      <Box className="p-4 bg-gradient-to-br from-sidebar-primary/10 to-accent/5 border border-sidebar-primary/20 rounded-lg">
                        <Box className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wide">
                          Connected Address
                        </Box>
                        <Box className="font-mono text-sm text-sidebar-foreground">
                          {formatAddress(walletAddress)}
                        </Box>
                        {account?.balance && (
                          <Box className="text-xs text-muted-foreground mt-2">
                            Balance: {account.balance} HBAR
                          </Box>
                        )}
                      </Box>
                      <Button
                        variant="outline"
                        onClick={() => {
                          disconnect();
                          setIsMobileSidebarOpen(false);
                        }}
                        className="w-full flex items-center gap-2 border-sidebar-border hover:border-red-500/50 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all duration-300"
                      >
                        <LogOut className="w-4 h-4" />
                        Disconnect
                      </Button>
                    </Box>
                  ) : (
                    <Box className="w-full">
                      <WalletButton />
                    </Box>
                  )}
                </Box>

                {/* User Actions */}
                <Box className="space-y-3 border-t border-sidebar-border pt-6">
                  <Box
                    as="h3"
                    className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-3"
                  >
                    Account
                  </Box>
                  <Box className="grid gap-2">
                    <Button
                      variant="outline"
                      className="justify-start gap-3 border-sidebar-border hover:border-sidebar-primary/30 text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-300"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start gap-3 border-sidebar-border hover:border-sidebar-primary/30 text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-300"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Button>
                  </Box>
                </Box>
              </Box>
            </SheetContent>
          </Sheet>
        </Box>
      </Box>
    </Box>
  );
}
