# DeraLinks API - Complete Schemas Documentation

**Base URL:** `http://localhost:3600/api/v1`

---

## 📋 Table of Contents

1. [Mint Property NFT Collection](#1-mint-property-nft-collection)
2. [Get User Assets](#2-get-user-assets)
3. [List NFT on Marketplace](#3-list-nft-on-marketplace)
4. [Get All Marketplace Listings](#4-get-all-marketplace-listings)
5. [Get Verification Token ID](#5-get-verification-token-id)

---

## 1. Mint Property NFT Collection

**Endpoint:** `POST /api/v1/properties/mint`

**Purpose:** Mint a new NFT collection for a tokenized property

**Authentication:** Required (property-owner verification NFT)

### Request Schema

```typescript
{
  // REQUIRED: Property Owner
  "ownerHederaAccount": "0.0.1234567", // Must have property-owner verification

  // REQUIRED: Property Basic Info
  "propertyName": "Sunset Villa Estate",
  "collectionName": "Sunset Villa Estate NFTs",
  "collectionSymbol": "SUNSET", // Max 10 characters

  // REQUIRED: Property Type
  "propertyType": "real_estate", // Options: real_estate, agriculture, commercial, industrial, mixed_use
  "category": "residential", // Optional: residential, farmland, office, warehouse, etc.

  // REQUIRED: Location
  "address": "123 Ocean Drive, Suite 100",
  "city": "Miami",
  "state": "Florida", // Optional
  "country": "USA",
  "zipCode": "33139", // Optional
  "latitude": 25.7617, // Optional
  "longitude": -80.1918, // Optional

  // REQUIRED: Financial Details
  "totalValue": 5000000, // USD - Total property valuation
  "totalSupply": 1000, // Number of NFT shares to create
  "tokenPrice": 5000, // USD - Price per NFT share

  // OPTIONAL: Revenue Projections
  "expectedAnnualReturn": 8.5, // % - Expected annual return
  "rentalYield": 6.2, // % - Annual rental yield
  "distributionFrequency": "quarterly", // Options: monthly, quarterly, annually

  // REQUIRED: Description
  "description": "Luxury beachfront villa with panoramic ocean views...",

  // OPTIONAL: Property Features (varies by type)
  "features": {
    // For Real Estate
    "bedrooms": 5,
    "bathrooms": 4.5,
    "squareFeet": 4500,
    "lotSize": 8000,
    "yearBuilt": 2020,
    "parking": 3,
    "floors": 2,

    // For Agriculture
    "acreage": 150,
    "soilType": "loam",
    "waterAccess": true,
    "irrigation": "drip system",
    "zoning": "agricultural",

    // For Commercial
    "officeSpace": 10000,
    "retailSpace": 2000,
    "warehouseSpace": 5000,
    "loadingDocks": 3,

    // Custom fields allowed
    "customField": "any value"
  },

  // OPTIONAL: Amenities
  "amenities": [
    "pool",
    "gym",
    "24/7 security",
    "ocean view",
    "smart home"
  ],

  // OPTIONAL: Media
  "images": [
    "QmXxx...exterior", // IPFS CIDs
    "QmYyy...interior",
    "QmZzz...pool"
  ],
  "documents": [
    {
      "name": "Title Deed",
      "cid": "QmAbc...deed",
      "type": "pdf"
    },
    {
      "name": "Property License",
      "cid": "QmDef...license",
      "type": "pdf"
    }
  ],

  // OPTIONAL: Blockchain Settings
  "royaltyPercentage": 5, // % royalty on secondary sales (default: 5)
  "kycRequired": false // Require KYC for all purchases (default: false)
}
```

### Response Schema

```typescript
{
  "success": true,
  "message": "Property NFT collection minted successfully",
  "data": {
    "propertyId": "550e8400-e29b-41d4-a716-446655440000",
    "tokenId": "0.0.7200123", // Hedera token ID
    "collectionName": "Sunset Villa Estate NFTs",
    "collectionSymbol": "SUNSET",
    "totalSupply": 1000,
    "tokenPrice": 5000,
    "hcsTopicId": "0.0.7200124", // Topic for property updates

    "metadata": {
      "metadataCID": "QmMetadata...",
      "metadataUrl": "https://gateway.pinata.cloud/ipfs/QmMetadata..."
    },

    "hedera": {
      "transactionId": "0.0.7125108@1706388432.123456789",
      "timestamp": "2025-01-27T15:30:00.000Z",
      "explorerUrl": "https://hashscan.io/testnet/token/0.0.7200123"
    }
  }
}
```

---

## 2. Get User Assets

**Endpoint:** `GET /api/v1/users/:accountId/assets`

**Purpose:** Get all NFTs owned by a specific Hedera account

**Authentication:** Optional (public endpoint)

### URL Parameters

```
accountId: string - Hedera account ID (e.g., "0.0.1234567")
```

### Response Schema

```typescript
{
  "success": true,
  "data": {
    // Portfolio Summary
    "accountId": "0.0.1234567",
    "totalProperties": 5, // Number of different properties owned
    "totalNFTs": 45, // Total NFT count across all properties
    "totalInvested": 225000, // USD - Total amount invested
    "currentValue": 245000, // USD - Current portfolio value
    "totalDividends": 12500, // USD - Total dividends received
    "roi": 14.22, // % - Return on investment

    // Holdings by Property
    "holdings": [
      {
        // Property Info
        "propertyId": "550e8400-e29b-41d4-a716-446655440000",
        "tokenId": "0.0.7200123",
        "propertyName": "Sunset Villa Estate",
        "collectionSymbol": "SUNSET",
        "propertyType": "real_estate",

        // Location
        "city": "Miami",
        "country": "USA",

        // Ownership Details
        "serialNumbers": [1, 5, 12, 23, 45, 67, 89, 100, 234, 567],
        "quantity": 10, // Number of NFTs owned
        "ownershipPercentage": 1.0, // % of total supply (10/1000)

        // Financial Details
        "invested": 50000, // USD - Amount invested in this property
        "currentValue": 55000, // USD - Current value of holdings
        "tokenPrice": 5500, // USD - Current price per NFT

        // Revenue
        "dividendsReceived": 3200, // USD - Dividends from this property
        "expectedAnnualReturn": 8.5, // %
        "rentalYield": 6.2, // %

        // Property Details
        "totalValue": 5000000, // USD - Total property valuation
        "totalSupply": 1000, // Total NFT supply
        "description": "Luxury beachfront villa...",
        "images": ["QmXxx...exterior", "QmYyy...interior"],

        // Features
        "features": {
          "bedrooms": 5,
          "bathrooms": 4.5,
          "squareFeet": 4500,
          "yearBuilt": 2020
        },
        "amenities": ["pool", "gym", "ocean view"],

        // Status
        "status": "active",

        // Timestamps
        "firstAcquired": "2024-06-15T10:30:00.000Z",
        "lastUpdated": "2025-01-27T15:30:00.000Z"
      }
      // ... more holdings
    ]
  }
}
```

---

## 3. List NFT on Marketplace

**Endpoint:** `POST /api/v1/marketplace/list`

**Purpose:** List NFTs for sale on the secondary marketplace

**Authentication:** Required (must own the NFTs)

### Request Schema

```typescript
{
  // REQUIRED: Seller Info
  "sellerHederaAccount": "0.0.1234567", // Must own the NFTs

  // REQUIRED: NFT Details
  "tokenId": "0.0.7200123", // Property token ID
  "serialNumbers": [1, 5, 12], // Specific NFTs to list
  "quantity": 3, // Must match serialNumbers.length

  // REQUIRED: Pricing
  "pricePerNFT": 5500, // USD - Price per NFT
  "currency": "USD", // Optional (default: USD)

  // REQUIRED: Listing Details
  "title": "3 NFTs from Sunset Villa Estate",
  "description": "Prime investment opportunity. Selling 3 shares...", // Optional

  // OPTIONAL: Purchase Terms
  "minPurchase": 1, // Minimum NFTs per purchase (default: 1)
  "maxPurchase": 3, // Maximum NFTs per purchase (optional)

  // OPTIONAL: Expiration
  "expiresIn": 30 // Days until listing expires (optional)
}
```

### Response Schema

```typescript
{
  "success": true,
  "message": "NFTs listed successfully",
  "data": {
    "listingId": "660e8400-e29b-41d4-a716-446655440111",
    "tokenId": "0.0.7200123",
    "serialNumbers": [1, 5, 12],
    "quantity": 3,
    "pricePerNFT": 5500,
    "totalPrice": 16500,
    "status": "active",

    "seller": {
      "hederaAccount": "0.0.1234567"
    },

    "property": {
      "propertyId": "550e8400-e29b-41d4-a716-446655440000",
      "propertyName": "Sunset Villa Estate",
      "collectionSymbol": "SUNSET",
      "images": ["QmXxx...exterior"]
    },

    "createdAt": "2025-01-27T15:30:00.000Z",
    "expiresAt": "2025-02-26T15:30:00.000Z"
  }
}
```

---

## 4. Get All Marketplace Listings

**Endpoint:** `GET /api/v1/marketplace/listings`

**Purpose:** Fetch all active marketplace listings with filters

**Authentication:** Optional (public endpoint)

### Query Parameters

```
// Filters
propertyType?: string - Filter by type (e.g., "real_estate")
minPrice?: number - Minimum price per NFT
maxPrice?: number - Maximum price per NFT
country?: string - Filter by country (e.g., "USA")
status?: string - Filter by status (default: "active")

// Sorting
sortBy?: string - Options: price_asc, price_desc, newest, oldest, ending_soon

// Pagination
page?: number - Page number (default: 1)
limit?: number - Items per page (default: 20, max: 100)
```

### Example Request

```
GET /api/v1/marketplace/listings?propertyType=real_estate&maxPrice=10000&sortBy=price_asc&page=1&limit=20
```

### Response Schema

```typescript
{
  "success": true,
  "data": {
    // Pagination Info
    "total": 156, // Total number of listings
    "page": 1,
    "limit": 20,
    "totalPages": 8,

    // Listings
    "listings": [
      {
        // Listing Info
        "listingId": "660e8400-e29b-41d4-a716-446655440111",
        "status": "active",
        "createdAt": "2025-01-27T15:30:00.000Z",
        "expiresAt": "2025-02-26T15:30:00.000Z",

        // Seller
        "seller": {
          "hederaAccount": "0.0.1234567"
        },

        // NFT Details
        "tokenId": "0.0.7200123",
        "serialNumbers": [1, 5, 12],
        "quantity": 3,

        // Pricing
        "pricePerNFT": 5500,
        "totalPrice": 16500,
        "currency": "USD",

        // Listing Details
        "title": "3 NFTs from Sunset Villa Estate",
        "description": "Prime investment opportunity...",
        "minPurchase": 1,
        "maxPurchase": 3,

        // Property Info
        "property": {
          "propertyId": "550e8400-e29b-41d4-a716-446655440000",
          "propertyName": "Sunset Villa Estate",
          "collectionSymbol": "SUNSET",
          "propertyType": "real_estate",
          "category": "residential",

          // Location
          "city": "Miami",
          "state": "Florida",
          "country": "USA",

          // Property Details
          "totalValue": 5000000,
          "totalSupply": 1000,
          "expectedAnnualReturn": 8.5,
          "rentalYield": 6.2,

          // Media
          "images": ["QmXxx...exterior", "QmYyy...interior"],
          "description": "Luxury beachfront villa...",

          // Features
          "features": {
            "bedrooms": 5,
            "bathrooms": 4.5,
            "squareFeet": 4500,
            "yearBuilt": 2020
          },
          "amenities": ["pool", "gym", "ocean view", "smart home"]
        }
      }
      // ... more listings (up to limit)
    ]
  }
}
```

---

## 5. Get Verification Token ID

**Endpoint:** `GET /api/v1/verification/token-id`

**Purpose:** Get the DeraLinks verification NFT collection token ID for display on user dashboard

**Authentication:** Optional (public endpoint)

### Response Schema

```typescript
{
  "success": true,
  "data": {
    "tokenId": "0.0.7199500", // Verification NFT token ID
    "collectionName": "DeraLinks Verified Users",
    "symbol": "DLVERIFY",
    "network": "testnet", // or "mainnet"
    "explorerUrl": "https://hashscan.io/testnet/token/0.0.7199500",
    "description": "Non-transferable verification badges for DeraLinks platform users",

    // Usage Information
    "purpose": "Identity verification for property tokenization and trading",
    "requiredFor": [
      "Creating property NFT collections",
      "Large investments (above threshold)",
      "Secondary market trading (jurisdiction dependent)"
    ],

    // Verification Levels
    "verificationLevels": [
      {
        "level": "property_owner",
        "description": "Enhanced KYC for property owners and tokenizers",
        "requiredFor": "Creating and minting property NFT collections"
      },
      {
        "level": "accredited",
        "description": "Accredited investor verification",
        "requiredFor": "Large investments above $2,000 (US jurisdiction)"
      },
      {
        "level": "basic",
        "description": "Basic KYC identity verification",
        "requiredFor": "Investments above jurisdiction-specific thresholds"
      }
    ]
  }
}
```

---

## Error Responses

All endpoints return consistent error format:

```typescript
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT", // Error code
    "message": "Missing required field: propertyName", // Human-readable message
    "details": { // Optional additional details
      "field": "propertyName",
      "expected": "string",
      "received": "undefined"
    }
  }
}
```

### Common Error Codes

- `INVALID_INPUT` - Invalid request data
- `UNAUTHORIZED` - Missing or invalid authentication
- `FORBIDDEN` - No permission to perform action
- `NOT_FOUND` - Resource not found
- `VERIFICATION_REQUIRED` - Verification NFT required
- `INSUFFICIENT_BALANCE` - Not enough NFTs owned
- `HEDERA_ERROR` - Hedera blockchain error
- `DATABASE_ERROR` - Database operation failed

---

## Usage Examples

### 1. Mint Property (cURL)

```bash
curl -X POST http://localhost:3600/api/v1/properties/mint \
  -H "Content-Type: application/json" \
  -d '{
    "ownerHederaAccount": "0.0.7125108",
    "propertyName": "Sunset Villa Estate",
    "collectionName": "Sunset Villa Estate NFTs",
    "collectionSymbol": "SUNSET",
    "propertyType": "real_estate",
    "address": "123 Ocean Drive",
    "city": "Miami",
    "country": "USA",
    "totalValue": 5000000,
    "totalSupply": 1000,
    "tokenPrice": 5000,
    "description": "Luxury beachfront villa with panoramic ocean views"
  }'
```

### 2. Get User Assets (cURL)

```bash
curl http://localhost:3600/api/v1/users/0.0.1234567/assets
```

### 3. List on Marketplace (cURL)

```bash
curl -X POST http://localhost:3600/api/v1/marketplace/list \
  -H "Content-Type: application/json" \
  -d '{
    "sellerHederaAccount": "0.0.1234567",
    "tokenId": "0.0.7200123",
    "serialNumbers": [1, 5, 12],
    "quantity": 3,
    "pricePerNFT": 5500,
    "title": "3 NFTs from Sunset Villa Estate"
  }'
```

### 4. Get Marketplace Listings (cURL)

```bash
curl "http://localhost:3600/api/v1/marketplace/listings?propertyType=real_estate&sortBy=price_asc&limit=10"
```

### 5. Get Verification Token (cURL)

```bash
curl http://localhost:3600/api/v1/verification/token-id
```

---

**Documentation Last Updated:** 2025-01-27
**API Version:** v1
**Base URL:** `http://localhost:3600/api/v1`
