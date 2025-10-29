import { Bath, Bed, Calendar, MapPin, Square, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';
import Box from '@/components/ui/box';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface PropertyCardProps {
  property?: {
    id: string;
    title: string;
    location: string;
    price: number;
    pricePerToken: number;
    totalTokens: number;
    availableTokens: number;
    bedrooms: number;
    bathrooms: number;
    squareFeet: number;
    image: string;
    status: 'for-sale' | 'sold-out' | 'coming-soon';
    roi: number;
    tokenHolders: number;
    launchDate: string;
  };
}

export function PropertyCard({ property }: PropertyCardProps) {
  const defaultProperty = {
    id: '1',
    title: 'Modern Apartment in Downtown',
    location: 'Lagos, Nigeria',
    price: 500000,
    pricePerToken: 1000,
    totalTokens: 500,
    availableTokens: 150,
    bedrooms: 2,
    bathrooms: 2,
    squareFeet: 1200,
    image: '/placeholder.svg',
    status: 'for-sale' as const,
    roi: 12.5,
    tokenHolders: 45,
    launchDate: '2024-02-15',
  };

  const prop = property || defaultProperty;
  const progressPercentage = ((prop.totalTokens - prop.availableTokens) / prop.totalTokens) * 100;

  return (
    <Card className="card-elevated group overflow-hidden bg-card hover:bg-card/90 transition-all">
      <CardContent className="p-0">
        <Box className="relative">
          <Link href={`/properties/${prop.id}`} className="absolute inset-0 z-10" prefetch={false}>
            <Box as="span" className="sr-only">
              View property
            </Box>
          </Link>
          <Box
            as="img"
            src={prop.image}
            alt={prop.title}
            width={400}
            height={225}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
          />

          {/* Status Badge */}
          <Box className="absolute top-3 left-3">
            <Badge
              className={
                prop.status === 'for-sale'
                  ? 'bg-green-500/90 text-white backdrop-blur-sm'
                  : prop.status === 'sold-out'
                    ? 'bg-red-500/90 text-white backdrop-blur-sm'
                    : 'bg-yellow-500/90 text-white backdrop-blur-sm'
              }
            >
              {prop.status === 'for-sale'
                ? 'Available'
                : prop.status === 'sold-out'
                  ? 'Sold Out'
                  : 'Coming Soon'}
            </Badge>
          </Box>

          {/* ROI Badge */}
          <Box className="absolute top-3 right-3">
            <Badge className="bg-gradient-primary text-white backdrop-blur-sm shadow-lg shadow-primary/20">
              <TrendingUp className="w-3 h-3 mr-1" />
              {prop.roi}% ROI
            </Badge>
          </Box>
        </Box>

        <Box className="p-4">
          <Box className="grid gap-3">
            {/* Title and Location */}
            <Box>
              <Box
                as="h3"
                className="font-semibold text-lg mb-1 text-white group-hover:text-primary transition-colors"
              >
                <Link href={`/properties/${prop.id}`} prefetch={false}>
                  {prop.title}
                </Link>
              </Box>
              <Box className="flex items-center text-sm text-slate-400">
                <MapPin className="w-4 h-4 mr-1" />
                {prop.location}
              </Box>
            </Box>

            {/* Property Details */}
            <Box className="flex items-center gap-4 text-sm text-slate-400">
              <Box className="flex items-center">
                <Bed className="w-4 h-4 mr-1" />
                {prop.bedrooms}
              </Box>
              <Box className="flex items-center">
                <Bath className="w-4 h-4 mr-1" />
                {prop.bathrooms}
              </Box>
              <Box className="flex items-center">
                <Square className="w-4 h-4 mr-1" />
                {prop.squareFeet.toLocaleString()} sqft
              </Box>
            </Box>

            {/* Token Progress */}
            <Box className="space-y-2">
              <Box className="flex justify-between text-sm">
                <Box as="span" className="text-slate-400">
                  Tokens Sold
                </Box>
                <Box as="span" className="font-medium text-white">
                  {prop.totalTokens - prop.availableTokens}/{prop.totalTokens}
                </Box>
              </Box>
              <Box className="w-full bg-secondary rounded-full h-2.5">
                <Box
                  className="bg-gradient-primary h-2.5 rounded-full transition-all duration-300 shadow-sm shadow-primary/50"
                  style={{ width: `${progressPercentage}%` }}
                />
              </Box>
            </Box>

            {/* Price and Token Info */}
            <Box className="space-y-2">
              <Box className="flex items-center justify-between">
                <Box
                  className="text-2xl font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #2B6AFF 0%, #6366f1 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  ₦{prop.price.toLocaleString()}
                </Box>
                <Box className="text-right">
                  <Box className="text-sm text-slate-400">Per Token</Box>
                  <Box className="font-semibold text-white">
                    ₦{prop.pricePerToken.toLocaleString()}
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Token Holders and Launch Date */}
            <Box className="flex items-center justify-between text-sm text-slate-400">
              <Box className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {prop.tokenHolders} holders
              </Box>
              <Box className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(prop.launchDate).toLocaleDateString()}
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box className="flex gap-2 pt-2">
              <Button
                className="flex-1 btn-gradient shadow-lg shadow-primary/20"
                disabled={prop.status !== 'for-sale'}
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Handle buy tokens action
                }}
              >
                {prop.status === 'for-sale'
                  ? 'Buy Tokens'
                  : prop.status === 'sold-out'
                    ? 'Sold Out'
                    : 'Coming Soon'}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="border-border/50 hover:border-primary/50 text-slate-300 hover:text-primary"
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Handle favorite action
                }}
              >
                ♥
              </Button>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
