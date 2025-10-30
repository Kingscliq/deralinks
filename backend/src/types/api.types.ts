/**
 * ============================================
 * DeraLinks API Types & Schemas
 * Complete type definitions for all API endpoints
 * ============================================
 */

// ============================================
// ENDPOINT 1: POST /api/v1/properties/mint
// Mint new NFT collection for a property
// ============================================

export interface MintPropertyRequest {
  // Property Owner (must have property-owner verification)
  ownerHederaAccount: string; // e.g., "0.0.1234567"

  // Property Basic Info
  propertyName: string; // e.g., "Sunset Villa Estate"
  collectionName: string; // e.g., "Sunset Villa Estate NFTs"
  collectionSymbol: string; // e.g., "SUNSET" (max 10 chars)

  // Property Type & Category
  propertyType: 'real_estate' | 'agriculture' | 'commercial' | 'industrial' | 'mixed_use';
  category?: string; // e.g., "residential", "farmland", "office", "warehouse"

  // Location
  address: string; // Full street address
  city: string;
  state?: string;
  country: string;
  zipCode?: string;
  latitude?: number; // Decimal degrees
  longitude?: number; // Decimal degrees

  // Financial Details
  totalValue: number; // Total property valuation in USD
  totalSupply: number; // Number of NFTs to mint (e.g., 1000 shares)
  tokenPrice: number; // Price per NFT in USD

  // Revenue Projections
  expectedAnnualReturn?: number; // Expected return % (e.g., 8.5)
  rentalYield?: number; // Annual rental yield % (e.g., 6.2)
  distributionFrequency?: 'monthly' | 'quarterly' | 'annually';

  // Property Description
  description: string; // Detailed property description

  // Features (customizable per property type)
  features?: {
    // Real Estate
    bedrooms?: number;
    bathrooms?: number;
    squareFeet?: number;
    lotSize?: number;
    yearBuilt?: number;
    parking?: number;
    floors?: number;

    // Agriculture
    acreage?: number;
    soilType?: string;
    waterAccess?: boolean;
    irrigation?: string;
    zoning?: string;

    // Commercial
    officeSpace?: number;
    retailSpace?: number;
    warehouseSpace?: number;
    loadingDocks?: number;

    // Custom fields
    [key: string]: any;
  };

  // Amenities
  amenities?: string[]; // e.g., ["pool", "gym", "parking", "security"]

  // Media (IPFS CIDs or URLs)
  images?: string[]; // Array of image CIDs/URLs
  documents?: Array<{
    name: string; // e.g., "Title Deed"
    cid: string; // IPFS CID
    type: string; // e.g., "pdf", "document"
  }>;

  // Blockchain Settings
  royaltyPercentage?: number; // Royalty on secondary sales (default: 5%)
  kycRequired?: boolean; // Require KYC for purchases (default: false)
}

export interface MintPropertyResponse {
  success: boolean;
  message: string;
  data: {
    propertyId: string; // UUID
    tokenId: string; // Hedera token ID (e.g., "0.0.7128093")
    collectionName: string;
    collectionSymbol: string;
    totalSupply: number;
    tokenPrice: number;
    hcsTopicId: string; // HCS topic for property updates
    metadata: {
      metadataCID: string; // IPFS CID for full metadata
      metadataUrl: string; // IPFS gateway URL
    };
    media: {
      images: string[]; // Array of IPFS gateway URLs for images
      documents: string[]; // Array of IPFS gateway URLs for documents
    };
    hedera: {
      transactionId: string; // Hedera transaction ID
      timestamp: string; // ISO timestamp
      explorerUrl: string; // HashScan URL
    };
  };
}

// ============================================
// ENDPOINT 2: GET /api/v1/users/:accountId/assets
// Get all NFTs owned by a user
// ============================================

export interface UserAssetsResponse {
  success: boolean;
  data: {
    accountId: string; // Hedera account ID
    totalProperties: number; // Number of different properties owned
    totalNFTs: number; // Total NFT count across all properties
    totalInvested: number; // Total amount invested (USD)
    currentValue: number; // Current portfolio value (USD)
    totalDividends: number; // Total dividends received (USD)
    roi: number; // Return on investment %

    // Holdings grouped by property
    holdings: Array<{
      // Property Info
      propertyId: string; // UUID
      tokenId: string; // Hedera token ID
      propertyName: string;
      collectionSymbol: string;
      propertyType: string;

      // Location
      city: string;
      country: string;

      // Ownership Details
      serialNumbers: number[]; // NFT serial numbers owned
      quantity: number; // Number of NFTs owned
      ownershipPercentage: number; // % of total supply owned

      // Financial Details
      invested: number; // Amount invested in this property
      currentValue: number; // Current value of holdings
      tokenPrice: number; // Current price per NFT

      // Revenue
      dividendsReceived: number; // Total dividends from this property
      expectedAnnualReturn: number; // Expected return %
      rentalYield: number; // Rental yield %

      // Property Details
      totalValue: number; // Total property valuation
      totalSupply: number; // Total NFT supply
      description: string;
      images: string[]; // IPFS CIDs

      // Features
      features: Record<string, any>;
      amenities: string[];

      // Status
      status: string; // 'active', 'sold_out', etc.

      // Timestamps
      firstAcquired: string; // ISO timestamp
      lastUpdated: string; // ISO timestamp
    }>;
  };
}

// ============================================
// ENDPOINT 3: POST /api/v1/marketplace/list
// List NFTs for sale on secondary marketplace
// ============================================

export interface ListMarketplaceRequest {
  // Seller Info
  sellerHederaAccount: string; // Must own the NFTs

  // NFT Details
  tokenId: string; // Property token ID
  serialNumbers: number[]; // Specific NFTs to list
  quantity?: number; // Must match serialNumbers.length

  // Pricing
  pricePerNFT: number; // Price per NFT in USD
  currency?: string; // Default: 'HBAR'

  // Listing Details
  title?: string; // Listing title
  description?: string; // Optional description

  // Terms
  minPurchase?: number; // Minimum NFTs per purchase (default: 1)
  maxPurchase?: number; // Maximum NFTs per purchase (optional)

  // Expiration
  expiresAt?: string; // ISO timestamp when listing expires (optional)
  expiresIn?: number; // Days until listing expires (optional)
}

export interface ListMarketplaceResponse {
  success: boolean;
  message: string;
  data: {
    listingId: string; // UUID
    propertyId: string;
    propertyName: string;
    collectionSymbol: string;
    tokenId: string;
    serialNumbers: number[];
    quantity: number;
    pricePerNFT: number;
    totalPrice: number;
    currency: string;
    status: string;
    listedAt: string; // ISO timestamp
    expiresAt?: string; // ISO timestamp
  };
}

// ============================================
// ENDPOINT 4: GET /api/v1/marketplace/listings
// Fetch all active marketplace listings
// ============================================

export interface MarketplaceListingsQuery {
  // Filters
  propertyType?: string; // Filter by property type
  minPrice?: number; // Minimum price per NFT
  maxPrice?: number; // Maximum price per NFT
  country?: string; // Filter by country
  status?: 'active' | 'sold' | 'cancelled' | 'expired';

  // Sorting
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'oldest' | 'ending_soon';

  // Pagination
  page?: number; // Page number (default: 1)
  limit?: number; // Items per page (default: 20, max: 100)
}

export interface MarketplaceListingsResponse {
  success: boolean;
  data: {
    listings: Array<{
      listingId: string;
      sellerHederaAccount: string;
      propertyId: string;
      propertyName: string;
      collectionSymbol: string;
      tokenId: string;
      serialNumbers: number[];
      quantity: number;
      pricePerNFT: number;
      totalPrice: number;
      currency: string;
      propertyType: string;
      city: string;
      country: string;
      originalTokenPrice: number;
      propertyTotalValue: number;
      totalSupply: number;
      images: string[];
      features: Record<string, any>;
      amenities: string[];
      status: string;
      listedAt: Date;
      expiresAt?: Date;
    }>;
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  };
}

// ============================================
// ENDPOINT 5: GET /api/v1/verification/token-id
// Get verification NFT collection token ID
// ============================================

export interface VerificationTokenResponse {
  success: boolean;
  data: {
    tokenId: string; // Verification NFT token ID
    collectionName: string; // "DeraLinks Verified Users"
    symbol: string; // "DLVERIFY"
    network: string; // "testnet" or "mainnet"
    explorerUrl: string; // HashScan URL
    description: string;

    // Usage info
    purpose: string;
    requiredFor: string[];
    verificationLevels: Array<{
      level: string; // 'basic', 'accredited', 'property_owner'
      description: string;
      requiredFor: string;
    }>;
  };
}

// Type aliases for marketplace endpoints
export type CreateListingRequest = ListMarketplaceRequest;
export type CreateListingResponse = ListMarketplaceResponse;
export type GetListingsResponse = MarketplaceListingsResponse;
export type GetVerificationTokenResponse = VerificationTokenResponse;

// ============================================
// Common Types
// ============================================

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PropertyFeatures {
  // Real Estate
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  lotSize?: number;
  yearBuilt?: number;
  parking?: number;
  floors?: number;

  // Agriculture
  acreage?: number;
  soilType?: string;
  waterAccess?: boolean;
  irrigation?: string;

  // Commercial
  officeSpace?: number;
  retailSpace?: number;
  warehouseSpace?: number;

  // Custom
  [key: string]: any;
}

export interface PropertyLocation {
  address: string;
  city: string;
  state?: string;
  country: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
}

export interface FinancialDetails {
  totalValue: number;
  tokenPrice: number;
  totalSupply: number;
  availableSupply?: number;
  expectedAnnualReturn?: number;
  rentalYield?: number;
  distributionFrequency?: 'monthly' | 'quarterly' | 'annually';
}

// ============================================
// Database Model Types (internal)
// ============================================

export interface User {
  id: string;
  hederaAccountId: string;
  email?: string;
  role: 'investor' | 'property_owner' | 'admin';
  verificationStatus: 'none' | 'basic' | 'accredited' | 'property_owner';
  verificationNftSerial?: number;
  verificationTokenId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Property {
  id: string;
  tokenId: string;
  collectionName: string;
  collectionSymbol: string;
  ownerId?: string;
  ownerHederaAccount: string;
  propertyName: string;
  propertyType: string;
  category?: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  totalValue: number;
  tokenPrice: number;
  totalSupply: number;
  availableSupply: number;
  description?: string;
  metadataCid?: string;
  images: string[];
  documents: any[];
  features: Record<string, any>;
  amenities: string[];
  expectedAnnualReturn?: number;
  rentalYield?: number;
  distributionFrequency?: string;
  hcsTopicId?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  launchedAt?: Date;
}

export interface NFTHolding {
  id: string;
  ownerHederaAccount: string;
  ownerId?: string;
  tokenId: string;
  propertyId: string;
  serialNumbers: number[];
  quantity: number;
  totalInvested: number;
  currentValue: number;
  totalDividends: number;
  firstAcquiredAt: Date;
  lastUpdatedAt: Date;
}

export interface MarketplaceListing {
  id: string;
  sellerHederaAccount: string;
  sellerId?: string;
  tokenId: string;
  propertyId: string;
  serialNumbers: number[];
  quantity: number;
  pricePerNft: number;
  totalPrice: number;
  currency: string;
  title?: string;
  description?: string;
  minPurchase: number;
  maxPurchase?: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  soldAt?: Date;
}

export interface Transaction {
  id: string;
  fromHederaAccount?: string;
  toHederaAccount?: string;
  fromUserId?: string;
  toUserId?: string;
  transactionType: string;
  tokenId?: string;
  propertyId?: string;
  serialNumbers?: number[];
  quantity?: number;
  amount?: number;
  currency: string;
  feeAmount?: number;
  hederaTransactionId?: string;
  hederaTimestamp?: Date;
  listingId?: string;
  status: string;
  metadata: Record<string, any>;
  createdAt: Date;
}
