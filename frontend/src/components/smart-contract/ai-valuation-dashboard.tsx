'use client';

import {
  AlertTriangle,
  BarChart3,
  Brain,
  Calendar,
  CheckCircle,
  Download,
  Eye,
  RefreshCw,
  Share2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';
import Box from '@/components/ui/box';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface ValuationData {
  propertyId: string;
  propertyTitle: string;
  currentValue: number;
  previousValue: number;
  valueChange: number;
  valueChangePercent: number;
  confidence: number;
  lastUpdated: string;
  nextUpdate: string;
  factors: {
    marketTrends: number;
    locationScore: number;
    propertyCondition: number;
    rentalYield: number;
    developmentPotential: number;
  };
  projections: {
    oneYear: number;
    threeYear: number;
    fiveYear: number;
  };
  alerts: Array<{
    type: 'positive' | 'negative' | 'neutral';
    message: string;
    impact: 'high' | 'medium' | 'low';
  }>;
}

interface AIValuationDashboardProps {
  propertyId?: string;
}

export function AIValuationDashboard({ propertyId: _propertyId }: AIValuationDashboardProps) {
  // propertyId available for future property-specific filtering
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [timeframe, setTimeframe] = useState<'1M' | '3M' | '1Y' | '3Y'>('1Y');

  // Mock valuation data
  const [valuationData, setValuationData] = useState<ValuationData[]>([
    {
      propertyId: 'prop-1',
      propertyTitle: 'Modern Apartment in Downtown Lagos',
      currentValue: 50000000,
      previousValue: 47500000,
      valueChange: 2500000,
      valueChangePercent: 5.26,
      confidence: 87,
      lastUpdated: '2024-01-15T10:30:00Z',
      nextUpdate: '2024-01-22T10:30:00Z',
      factors: {
        marketTrends: 8.5,
        locationScore: 9.2,
        propertyCondition: 7.8,
        rentalYield: 8.1,
        developmentPotential: 6.5,
      },
      projections: {
        oneYear: 52500000,
        threeYear: 58000000,
        fiveYear: 65000000,
      },
      alerts: [
        {
          type: 'positive',
          message: 'New metro line construction announced nearby',
          impact: 'high',
        },
        {
          type: 'neutral',
          message: 'Property tax assessment updated',
          impact: 'medium',
        },
      ],
    },
    {
      propertyId: 'prop-2',
      propertyTitle: 'Luxury Villa in Victoria Island',
      currentValue: 120000000,
      previousValue: 125000000,
      valueChange: -5000000,
      valueChangePercent: -4.0,
      confidence: 92,
      lastUpdated: '2024-01-15T10:30:00Z',
      nextUpdate: '2024-01-22T10:30:00Z',
      factors: {
        marketTrends: 7.2,
        locationScore: 9.8,
        propertyCondition: 9.5,
        rentalYield: 6.8,
        developmentPotential: 8.2,
      },
      projections: {
        oneYear: 115000000,
        threeYear: 130000000,
        fiveYear: 145000000,
      },
      alerts: [
        {
          type: 'negative',
          message: 'Interest rate increase affecting luxury market',
          impact: 'high',
        },
      ],
    },
  ]);

  const refreshValuation = async () => {
    setIsLoading(true);
    try {
      // Simulate AI model refresh
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Update valuation data with new calculations
      setValuationData(prev =>
        prev.map(property => ({
          ...property,
          currentValue: property.currentValue * (1 + (Math.random() - 0.5) * 0.02),
          confidence: Math.min(95, property.confidence + Math.random() * 5),
          lastUpdated: new Date().toISOString(),
          nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        })),
      );
    } catch {
      console.error('Failed to refresh valuation');
    } finally {
      setIsLoading(false);
    }
  };

  const getFactorColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'positive':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'negative':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Eye className="w-4 h-4 text-blue-600" />;
    }
  };

  const getAlertColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-700';
    }
  };

  const renderPropertyCard = (property: ValuationData) => (
    <Card key={property.propertyId} className="card-elevated">
      <CardHeader>
        <Box className="flex items-start justify-between">
          <Box className="flex-1">
            <CardTitle className="text-xl mb-2">{property.propertyTitle}</CardTitle>
            <Box className="flex items-center gap-4 text-sm text-muted-foreground">
              <Box className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Updated {new Date(property.lastUpdated).toLocaleDateString()}
              </Box>
              <Box className="flex items-center gap-1">
                <Brain className="w-4 h-4" />
                {property.confidence}% confidence
              </Box>
            </Box>
          </Box>
          <Badge className="bg-gradient-primary text-white">AI Powered</Badge>
        </Box>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Value */}
        <Box className="text-center p-4 bg-gradient-primary rounded-lg text-white">
          <Box className="text-sm opacity-90 mb-1">Current Valuation</Box>
          <Box className="text-3xl font-bold">₦{property.currentValue.toLocaleString()}</Box>
          <Box
            className={`flex items-center justify-center gap-1 mt-2 ${
              property.valueChangePercent >= 0 ? 'text-green-200' : 'text-red-200'
            }`}
          >
            {property.valueChangePercent >= 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            {Math.abs(property.valueChangePercent).toFixed(2)}% (
            {property.valueChange >= 0 ? '+' : ''}₦{Math.abs(property.valueChange).toLocaleString()}
            )
          </Box>
        </Box>

        {/* Valuation Factors */}
        <Box>
          <Box as="h4" className="font-semibold mb-4">
            Valuation Factors
          </Box>
          <Box className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(property.factors).map(([factor, score]) => (
              <Box key={factor} className="text-center p-3 bg-muted rounded-lg">
                <Box className={`text-lg font-bold ${getFactorColor(score)}`}>
                  {score.toFixed(1)}
                </Box>
                <Box className="text-xs text-muted-foreground capitalize">
                  {factor.replace(/([A-Z])/g, ' $1').trim()}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Projections */}
        <Box>
          <Box as="h4" className="font-semibold mb-4">
            AI Projections
          </Box>
          <Box className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Box className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <Box className="text-sm text-green-700 mb-1">1 Year</Box>
              <Box className="text-xl font-bold text-green-800">
                ₦{property.projections.oneYear.toLocaleString()}
              </Box>
              <Box className="text-xs text-green-600">
                {(
                  ((property.projections.oneYear - property.currentValue) / property.currentValue) *
                  100
                ).toFixed(1)}
                % growth
              </Box>
            </Box>
            <Box className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <Box className="text-sm text-blue-700 mb-1">3 Years</Box>
              <Box className="text-xl font-bold text-blue-800">
                ₦{property.projections.threeYear.toLocaleString()}
              </Box>
              <Box className="text-xs text-blue-600">
                {(
                  ((property.projections.threeYear - property.currentValue) /
                    property.currentValue) *
                  100
                ).toFixed(1)}
                % growth
              </Box>
            </Box>
            <Box className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <Box className="text-sm text-purple-700 mb-1">5 Years</Box>
              <Box className="text-xl font-bold text-purple-800">
                ₦{property.projections.fiveYear.toLocaleString()}
              </Box>
              <Box className="text-xs text-purple-600">
                {(
                  ((property.projections.fiveYear - property.currentValue) /
                    property.currentValue) *
                  100
                ).toFixed(1)}
                % growth
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Alerts */}
        {property.alerts.length > 0 && (
          <Box>
            <Box as="h4" className="font-semibold mb-4">
              AI Insights & Alerts
            </Box>
            <Box className="space-y-3">
              {property.alerts.map((alert, index) => (
                <Box key={index} className={`p-3 rounded-lg border ${getAlertColor(alert.impact)}`}>
                  <Box className="flex items-start gap-3">
                    {getAlertIcon(alert.type)}
                    <Box className="flex-1">
                      <Box className="font-medium">{alert.message}</Box>
                      <Box className="text-xs opacity-75 mt-1">
                        Impact: {alert.impact} • {alert.type}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Actions */}
        <Box className="flex gap-2 pt-4 border-t">
          <Button variant="outline" size="sm" className="flex-1">
            <BarChart3 className="w-4 h-4 mr-2" />
            Detailed Report
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box className="max-w-6xl mx-auto">
      {/* Header */}
      <Box className="mb-8">
        <Box className="flex items-center justify-between">
          <Box>
            <Box as="h1" className="text-3xl font-bold mb-2 flex items-center gap-2">
              <Brain className="w-8 h-8 text-gradient-primary" />
              AI Valuation Dashboard
            </Box>
            <Box as="p" className="text-muted-foreground">
              Real-time property valuations powered by advanced machine learning algorithms
            </Box>
          </Box>
          <Button onClick={refreshValuation} disabled={isLoading} className="btn-gradient">
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </Box>
      </Box>

      {/* Stats Overview */}
      <Box className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="card-elevated">
          <CardContent className="p-4 text-center">
            <Box className="text-2xl font-bold text-gradient-primary">
              ₦{valuationData.reduce((sum, p) => sum + p.currentValue, 0).toLocaleString()}
            </Box>
            <Box className="text-sm text-muted-foreground">Total Portfolio Value</Box>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="p-4 text-center">
            <Box className="text-2xl font-bold text-gradient-primary">
              {valuationData.reduce((sum, p) => sum + p.valueChangePercent, 0) /
                valuationData.length >
              0
                ? '+'
                : ''}
              {(
                valuationData.reduce((sum, p) => sum + p.valueChangePercent, 0) /
                valuationData.length
              ).toFixed(1)}
              %
            </Box>
            <Box className="text-sm text-muted-foreground">Average Change</Box>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="p-4 text-center">
            <Box className="text-2xl font-bold text-gradient-primary">
              {Math.round(
                valuationData.reduce((sum, p) => sum + p.confidence, 0) / valuationData.length,
              )}
              %
            </Box>
            <Box className="text-sm text-muted-foreground">Avg Confidence</Box>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="p-4 text-center">
            <Box className="text-2xl font-bold text-gradient-primary">
              {valuationData.reduce((sum, p) => sum + p.alerts.length, 0)}
            </Box>
            <Box className="text-sm text-muted-foreground">Active Alerts</Box>
          </CardContent>
        </Card>
      </Box>

      {/* Filters */}
      <Box className="flex items-center gap-4 mb-6">
        <Box className="flex items-center gap-2">
          <Box as="label" className="text-sm font-medium">
            Property:
          </Box>
          <Box
            as="select"
            className="p-2 border rounded-md"
            value={selectedProperty}
            onChange={e => setSelectedProperty(e.target.value)}
          >
            <option value="all">All Properties</option>
            {valuationData.map(property => (
              <option key={property.propertyId} value={property.propertyId}>
                {property.propertyTitle}
              </option>
            ))}
          </Box>
        </Box>
        <Box className="flex items-center gap-2">
          <Box as="label" className="text-sm font-medium">
            Timeframe:
          </Box>
          <Box className="flex gap-1">
            {(['1M', '3M', '1Y', '3Y'] as const).map(period => (
              <Button
                key={period}
                variant={timeframe === period ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeframe(period)}
                className={timeframe === period ? 'btn-gradient' : ''}
              >
                {period}
              </Button>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Properties */}
      <Box className="space-y-6">
        {selectedProperty === 'all'
          ? valuationData.map(renderPropertyCard)
          : valuationData.filter(p => p.propertyId === selectedProperty).map(renderPropertyCard)}
      </Box>

      {/* AI Model Info */}
      <Card className="card-elevated mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Model Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Box className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Box>
              <Box as="h4" className="font-semibold mb-2">
                Model Version
              </Box>
              <Box className="text-sm text-muted-foreground">v2.1.3 - Enhanced</Box>
            </Box>
            <Box>
              <Box as="h4" className="font-semibold mb-2">
                Last Training
              </Box>
              <Box className="text-sm text-muted-foreground">January 10, 2024</Box>
            </Box>
            <Box>
              <Box as="h4" className="font-semibold mb-2">
                Data Sources
              </Box>
              <Box className="text-sm text-muted-foreground">15+ external APIs</Box>
            </Box>
          </Box>
          <Box className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Box className="text-sm text-blue-700">
              <Box className="font-medium mb-1">Model Features:</Box>
              <Box as="ul" className="list-disc list-inside space-y-1">
                <Box as="li">Real-time market data integration</Box>
                <Box as="li">Satellite imagery analysis</Box>
                <Box as="li">Demographic trend analysis</Box>
                <Box as="li">Infrastructure development tracking</Box>
                <Box as="li">Economic indicator correlation</Box>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
