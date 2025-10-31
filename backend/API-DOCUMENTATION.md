# DeraLinks API Documentation

**Version:** 1.0.0
**Base URL:** `http://localhost:3600/api/v1`
**Network:** Hedera Testnet
**Authentication:** Wallet Signatures (HashPack)

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Platform Fees](#platform-fees)
3. [Properties Endpoints](#properties-endpoints)
4. [Tokens Endpoints](#tokens-endpoints)
5. [Users Endpoints](#users-endpoints)
6. [Investors Endpoints](#investors-endpoints)
7. [Property Owners Endpoints](#property-owners-endpoints)
8. [Marketplace Endpoints](#marketplace-endpoints)
9. [Files/IPFS Endpoints](#filesipfs-endpoints)
10. [Admin Endpoints](#admin-endpoints)
11. [Verification Endpoints](#verification-endpoints)
12. [DAO Governance Endpoints](#dao-governance-endpoints)
13. [Error Codes](#error-codes)

---

## 🔐 Authentication

DeraLinks uses **wallet-based authentication** via signed messages. No JWT tokens or sessions required.

### How It Works

1. **Generate Challenge Message**
   ```javascript
   const challenge = `DeraLinks Authentication

   Account: 0.0.123456
   Timestamp: ${Date.now()}
   Nonce: ${Math.random().toString(36).substring(7)}

   Please sign this message to authenticate with DeraLinks.`;
   ```

2. **Sign with HashPack**
   ```javascript
   const signature = await hashconnect.sign(accountId, challenge);
   ```

3. **Send with Request**
   ```json
   {
     "accountId": "0.0.123456",
     "message": "DeraLinks Authentication...",
     "signature": "0x...",
     "publicKey": "302a300506032b6570032100..."
   }
   ```

### Signature Verification
- All protected endpoints verify wallet signatures
- Timestamps must be within 5 minutes (prevents replay attacks)
- Public key must match account ID

---

## 💰 Platform Fees

DeraLinks operates a multi-layer fee structure to generate revenue while maintaining competitive pricing for property owners and investors.

### Fee Structure Overview

| Fee Type | Rate | When Applied | Who Pays |
|----------|------|--------------|----------|
| **Minting Fee** | $50 + $0.50/NFT | Property tokenization (upfront) | Property Owner |
| **Primary Sale Commission** | 10% | First sale from treasury | Property Owner |
| **Platform Transaction Fee** | 2.5% | All marketplace sales | Seller |
| **Listing Fee** | $25 | Creating marketplace listing | Seller |
| **Royalty Fee** | 5% | Secondary sales (automatic) | Buyer |

---

### 1. Minting Fee (Phase 1 - Upfront Revenue)

**When:** Property owner creates NFT collection
**Formula:** `$50 base + ($0.50 × total NFT supply)`
**Purpose:** Covers platform costs for NFT creation, IPFS storage, and HCS topic setup

**Examples:**
- 100 NFTs: $50 + (100 × $0.50) = **$100**
- 1,000 NFTs: $50 + (1,000 × $0.50) = **$550**
- 10,000 NFTs: $50 + (10,000 × $0.50) = **$5,050**

---

### 2. Primary Sale Commission (Phase 1 - First Sale Revenue)

**When:** Property owner sells NFTs from their treasury (first time sale)
**Rate:** 10% of sale price
**Purpose:** Platform revenue from helping property owners raise capital

**Example:**
- Property owner sells 50 NFTs at $1,000 each = $50,000 total
- Platform commission: 10% × $50,000 = **$5,000**
- Property owner receives: **$45,000**

---

### 3. Platform Transaction Fee (Phase 2 - Marketplace Revenue)

**When:** Any marketplace sale (secondary market)
**Rate:** 2.5% of sale price
**Purpose:** Platform revenue from facilitating marketplace transactions

**Example:**
- Investor sells 10 NFTs at $1,200 each = $12,000 total
- Platform fee: 2.5% × $12,000 = **$300**
- Seller receives: $12,000 - $300 = **$11,700**
- Note: 5% royalty to property owner enforced automatically by Hedera

---

### 4. Listing Fee (Phase 2 - Marketplace Revenue)

**When:** Seller creates marketplace listing
**Rate:** $25 (standard) or $100 (premium featured)
**Duration:** 90 days
**Purpose:** Platform revenue from marketplace listing services

---

### 5. Royalty Fee (Built into NFT)

**When:** All secondary sales (after first sale)
**Rate:** 5% of sale price
**Recipient:** Original property owner
**Enforcement:** Automatic via Hedera smart contract

**Example:**
- NFT sells for $1,200 on secondary market
- Royalty: 5% × $1,200 = **$60** (goes to property owner)
- Platform fee: 2.5% × $1,200 = **$30** (goes to platform)
- Seller receives: $1,200 - $60 - $30 = **$1,110**

---

### Revenue Model Example

**Scenario:** Property owner tokenizes $500,000 property into 10,000 NFTs at $50 each

**Phase 1 - Tokenization:**
- Minting fee: $50 + (10,000 × $0.50) = **$5,050** ← Platform Revenue
- Property owner pays upfront

**Phase 1 - Primary Sales:**
- Property owner sells 5,000 NFTs at $50 = $250,000 total
- Primary sale commission: 10% × $250,000 = **$25,000** ← Platform Revenue
- Property owner receives: **$225,000**

**Phase 2 - Secondary Market:**
- Investor sells 10 NFTs at $55 each = $550 total
- Listing fee: **$25** ← Platform Revenue
- Platform transaction fee: 2.5% × $550 = **$13.75** ← Platform Revenue
- Royalty to property owner: 5% × $550 = $27.50 (auto-enforced)
- Investor receives: $550 - $13.75 - $27.50 = **$508.75**

**Total Platform Revenue:**
- Minting: $5,050
- Primary sales: $25,000
- Listing: $25
- Transaction fee: $13.75
- **Grand Total: $30,088.75**

---

### Fee Configuration

All fees are configurable via environment variables in `.env`:

```bash
# Phase 1: Minting Fees
MINTING_BASE_FEE=50                    # Base minting fee in USD (default: 50)
MINTING_PER_NFT_FEE=0.5                # Per-NFT minting fee in USD (default: 0.5)

# Phase 1: Primary Sale Commission
PRIMARY_SALE_COMMISSION=10             # Primary sale commission % (default: 10)

# Phase 2: Platform Transaction Fee
PLATFORM_TRANSACTION_FEE=2.5           # Platform transaction fee % (default: 2.5)

# Phase 2: Listing Fees
LISTING_FEE_STANDARD=25                # Standard listing fee in USD (default: 25)
LISTING_FEE_PREMIUM=100                # Premium listing fee in USD (default: 100)
LISTING_FEE_DURATION=90                # Listing duration in days (default: 90)

# NFT Royalty Fee
ROYALTY_FEE=5                          # Royalty fee % on secondary sales (default: 5)

# Fee Collection Account
FEE_COLLECTOR_ACCOUNT_ID=0.0.xxxxx     # Platform fee recipient account
```

**To adjust fees in production:**
1. Update environment variables on Render.com dashboard
2. Restart the service
3. New fee rates take effect immediately (no code deployment needed)

---

## 🏠 Properties Endpoints

### 1. Mint Property NFT Collection

Create a new property and mint its NFT collection.

**Endpoint:** `POST /api/v1/properties/mint`

**Request Body:**
```json
{
  "ownerHederaAccount": "0.0.7127074",
  "propertyName": "Luxury Villa Lagos",
  "collectionName": "Luxury Villa Lagos NFTs",
  "collectionSymbol": "LVL",
  "propertyType": "real_estate",
  "category": "residential",
  "address": "123 Victoria Island",
  "city": "Lagos",
  "state": "Lagos",
  "country": "Nigeria",
  "zipCode": "101241",
  "latitude": 6.4281,
  "longitude": 3.4219,
  "totalValue": 500000.00,
  "tokenPrice": 50.00,
  "totalSupply": 10000,
  "expectedAnnualReturn": 12.5,
  "rentalYield": 8.5,
  "distributionFrequency": "monthly",
  "description": "Luxury 5-bedroom villa",
  "features": {
    "bedrooms": 5,
    "bathrooms": 4,
    "sqft": 3500,
    "yearBuilt": 2020
  },
  "amenities": ["pool", "gym", "security"],
  "images": ["QmXxx...", "QmYyy..."],
  "documents": ["QmDeed...", "QmTitle..."],
  "royaltyPercentage": 5
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Property NFT collection minted successfully",
  "data": {
    "propertyId": "uuid-123",
    "tokenId": "0.0.7128093",
    "collectionName": "Luxury Villa Lagos NFTs",
    "collectionSymbol": "LVL",
    "totalSupply": 10000,
    "tokenPrice": 50.00,
    "hcsTopicId": "0.0.7127460",
    "metadata": {
      "metadataCID": "QmMetadata...",
      "metadataUrl": "https://gateway.pinata.cloud/ipfs/QmMetadata..."
    },
    "hedera": {
      "transactionId": "0.0.7127074@1234567890.123456789",
      "timestamp": "2025-10-28T10:30:00.000Z",
      "explorerUrl": "https://hashscan.io/testnet/token/0.0.7128093"
    },
    "fees": {
      "mintingFee": 5050.00,
      "currency": "USD",
      "breakdown": {
        "baseFee": 50,
        "perNFTFee": 0.5,
        "nftCount": 10000
      },
      "note": "Minting fee must be paid to platform before collection is created"
    }
  }
}
```

**Platform Fees:**
- **Minting Fee**: $50 base fee + $0.50 per NFT
- Example: Minting 10,000 NFTs = $50 + (10,000 × $0.50) = **$5,050 USD**

---

### 2. List All Properties

Get a paginated list of properties with optional filters.

**Endpoint:** `GET /api/v1/properties`

**Query Parameters:**
- `status` - Filter by status (draft, active, sold_out, archived)
- `propertyType` - Filter by type (real_estate, agriculture, commercial)
- `city` - Filter by city
- `country` - Filter by country
- `minPrice` - Minimum token price
- `maxPrice` - Maximum token price
- `limit` - Results per page (default: 50)
- `offset` - Pagination offset (default: 0)

**Example Request:**
```
GET /api/v1/properties?status=active&country=Nigeria&limit=10&offset=0
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "properties": [
      {
        "id": "uuid-123",
        "token_id": "0.0.7128093",
        "property_name": "Luxury Villa Lagos",
        "collection_name": "Luxury Villa Lagos NFTs",
        "owner_hedera_account": "0.0.7127074",
        "property_type": "real_estate",
        "category": "residential",
        "city": "Lagos",
        "country": "Nigeria",
        "total_value": "500000.00",
        "token_price": "50.00",
        "total_supply": 10000,
        "available_supply": 10000,
        "owner_serial_numbers": [1, 2, 3, 4, 5],
        "owner_nft_count": 5,
        "images": ["QmXxx...", "QmYyy..."],
        "status": "active",
        "expected_annual_return": "12.50",
        "rental_yield": "8.50",
        "created_at": "2025-10-28T10:30:00.000Z"
      }
    ],
    "count": 1
  }
}
```

**Note:**
- `owner_serial_numbers` - Array of NFT serial numbers currently owned by the property owner (treasury account)
- `owner_nft_count` - Total count of NFTs owned by the property owner

---

### 3. Get Property Details

Get detailed information about a specific property.

**Endpoint:** `GET /api/v1/properties/:id`

**Parameters:**
- `id` - Property UUID or Hedera token ID

**Example Request:**
```
GET /api/v1/properties/uuid-123
GET /api/v1/properties/0.0.7128093
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-123",
    "token_id": "0.0.7128093",
    "collection_name": "Luxury Villa Lagos NFTs",
    "collection_symbol": "LVL",
    "owner_hedera_account": "0.0.7127074",
    "property_name": "Luxury Villa Lagos",
    "property_type": "real_estate",
    "category": "residential",
    "address": "123 Victoria Island",
    "city": "Lagos",
    "state": "Lagos",
    "country": "Nigeria",
    "zip_code": "101241",
    "latitude": "6.42810000",
    "longitude": "3.42190000",
    "total_value": "500000.00",
    "token_price": "50.00",
    "total_supply": 10000,
    "available_supply": 10000,
    "description": "Luxury 5-bedroom villa",
    "metadata_cid": "QmMetadata...",
    "images": ["QmXxx...", "QmYyy..."],
    "documents": ["QmDeed...", "QmTitle..."],
    "features": {
      "bedrooms": 5,
      "bathrooms": 4,
      "sqft": 3500,
      "yearBuilt": 2020
    },
    "amenities": ["pool", "gym", "security"],
    "expected_annual_return": "12.50",
    "rental_yield": "8.50",
    "distribution_frequency": "monthly",
    "hcs_topic_id": "0.0.7127460",
    "status": "active",
    "created_at": "2025-10-28T10:30:00.000Z",
    "updated_at": "2025-10-28T10:30:00.000Z",
    "launched_at": "2025-10-28T10:30:00.000Z"
  }
}
```

---

### 4. Update Property

Update property details (owner only).

**Endpoint:** `PUT /api/v1/properties/:id`

**Request Body:**
```json
{
  "description": "Updated description",
  "images": ["QmNew1...", "QmNew2..."],
  "expected_annual_return": 13.0,
  "status": "active"
}
```

**Allowed Fields:**
- `description`, `images`, `documents`, `features`, `amenities`
- `expected_annual_return`, `rental_yield`
- `status`, `available_supply`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Property updated successfully",
  "data": {
    "id": "uuid-123",
    "description": "Updated description",
    "updated_at": "2025-10-28T11:00:00.000Z"
  }
}
```

---

### 5. Verify Property Documents

Trigger document verification workflow (property owner only).

**Endpoint:** `POST /api/v1/properties/:id/verify`

**Request Body:**
```json
{
  "accountId": "0.0.7127074",
  "signature": "0x...",
  "publicKey": "302a300506032b6570032100...",
  "message": "DeraLinks Authentication...",
  "verificationType": "document-verification"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Document verification initiated successfully",
  "data": {
    "propertyId": "uuid-123",
    "propertyName": "Luxury Villa Lagos",
    "verificationStatus": "pending",
    "requestedAt": "2025-10-28T11:00:00.000Z",
    "verificationLogId": "uuid-456",
    "documentsCount": 3,
    "nextSteps": [
      "Documents will be reviewed by our verification team",
      "You will receive a notification once verification is complete",
      "Verification typically takes 3-5 business days"
    ]
  }
}
```

---

## 🪙 Tokens Endpoints

### 6. Mint NFTs

Mint NFTs to treasury account (admin only).

**Endpoint:** `POST /api/v1/tokens/mint`

**Request Body:**
```json
{
  "tokenId": "0.0.7128093",
  "quantity": 100,
  "metadata": [
    {
      "name": "Villa Share #1",
      "description": "1/10000 ownership share",
      "image": "QmImage1...",
      "properties": {
        "serial": 1,
        "propertyId": "uuid-123"
      }
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "100 NFTs minted successfully",
  "data": {
    "tokenId": "0.0.7128093",
    "serialNumbers": [1, 2, 3, ..., 100],
    "mintedTo": "0.0.7127072",
    "transactionId": "0.0.7127074@1234567890.123456789"
  }
}
```

---

### 7. Get Token Information

Get details about a Hedera token.

**Endpoint:** `GET /api/v1/tokens/:tokenId/info`

**Example Request:**
```
GET /api/v1/tokens/0.0.7128093/info
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "tokenId": "0.0.7128093",
    "name": "Luxury Villa Lagos NFTs",
    "symbol": "LVL",
    "tokenType": "NON_FUNGIBLE_UNIQUE",
    "totalSupply": "10000",
    "treasury": "0.0.7127072",
    "customFees": {
      "royaltyFees": [
        {
          "amount": {
            "numerator": 5,
            "denominator": 100
          },
          "feeCollector": "0.0.7127073"
        }
      ]
    }
  }
}
```

---

### 8. Transfer NFTs

Transfer NFTs between accounts.

**Endpoint:** `POST /api/v1/tokens/transfer`

**Request Body:**
```json
{
  "tokenId": "0.0.7128093",
  "fromAccount": "0.0.7127072",
  "toAccount": "0.0.123456",
  "serialNumbers": [1, 2, 3]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "NFTs transferred successfully",
  "data": {
    "tokenId": "0.0.7128093",
    "serialNumbers": [1, 2, 3],
    "from": "0.0.7127072",
    "to": "0.0.123456",
    "transactionId": "0.0.7127074@1234567890.123456789",
    "timestamp": "2025-10-28T11:00:00.000Z"
  }
}
```

---

### 9. Get Token Holders

Get all holders of a specific token.

**Endpoint:** `GET /api/v1/tokens/:tokenId/holders`

**Example Request:**
```
GET /api/v1/tokens/0.0.7128093/holders
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "tokenId": "0.0.7128093",
    "totalSupply": 10000,
    "holders": [
      {
        "account": "0.0.123456",
        "serialNumbers": [1, 2, 3, 10, 25],
        "quantity": 5,
        "percentage": "0.05"
      },
      {
        "account": "0.0.789012",
        "serialNumbers": [4, 5, 6],
        "quantity": 3,
        "percentage": "0.03"
      }
    ],
    "holderCount": 2
  }
}
```

---

## 👤 Users Endpoints

### 10. Get User Assets

Get all assets (NFTs) owned by a Hedera account.

**Endpoint:** `GET /api/v1/users/:accountId/assets`

**Example Request:**
```
GET /api/v1/users/0.0.123456/assets
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "accountId": "0.0.123456",
    "holdings": [
      {
        "property_id": "uuid-123",
        "property_name": "Luxury Villa Lagos",
        "token_id": "0.0.7128093",
        "serial_numbers": [1, 2, 3, 10, 25],
        "quantity": 5,
        "ownership_percentage": "0.05",
        "total_invested": "250.00",
        "current_value": "275.00",
        "total_dividends": "15.50",
        "first_acquired_at": "2025-10-01T10:00:00.000Z"
      }
    ],
    "totalProperties": 1,
    "totalNFTs": 5,
    "totalValue": "275.00"
  }
}
```

---

## 💼 Investors Endpoints

### 11. Register Investor

Register a new investor account.

**Endpoint:** `POST /api/v1/investors/register`

**Request Body:**
```json
{
  "hederaAccountId": "0.0.123456",
  "email": "investor@example.com",
  "fullName": "John Doe",
  "country": "Nigeria",
  "investorType": "retail"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Investor registered successfully",
  "data": {
    "id": "uuid-789",
    "hederaAccountId": "0.0.123456",
    "email": "investor@example.com",
    "fullName": "John Doe",
    "kycStatus": "pending",
    "registeredAt": "2025-10-28T11:00:00.000Z"
  }
}
```

---

### 12. Get Investor Profile

Get investor profile details.

**Endpoint:** `GET /api/v1/investors/:id/profile`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-789",
    "hederaAccountId": "0.0.123456",
    "email": "investor@example.com",
    "fullName": "John Doe",
    "country": "Nigeria",
    "investorType": "retail",
    "kycStatus": "verified",
    "kycVerifiedAt": "2025-10-20T10:00:00.000Z",
    "verificationNftTokenId": "0.0.7152949",
    "verificationNftSerial": 1,
    "registeredAt": "2025-10-15T10:00:00.000Z"
  }
}
```

---

### 13. Submit KYC Documents

Submit KYC documents for verification.

**Endpoint:** `POST /api/v1/investors/:id/kyc`

**Request Body:**
```json
{
  "documentType": "passport",
  "documentNumber": "AB1234567",
  "documentCID": "QmPassport...",
  "verificationType": "kyc",
  "additionalInfo": {
    "dateOfBirth": "1990-01-01",
    "nationality": "Nigerian"
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "KYC documents submitted successfully",
  "data": {
    "submissionId": "uuid-999",
    "status": "pending",
    "submittedAt": "2025-10-28T11:00:00.000Z",
    "estimatedReviewTime": "2-3 business days"
  }
}
```

---

### 14. Get Investor Transactions

Get transaction history for an investor.

**Endpoint:** `GET /api/v1/investors/:id/transactions`

**Query Parameters:**
- `limit` - Results per page (default: 50)
- `offset` - Pagination offset

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "uuid-tx1",
        "transactionType": "primary_sale",
        "tokenId": "0.0.7128093",
        "serialNumbers": [1, 2, 3],
        "quantity": 3,
        "amount": "150.00",
        "currency": "USD",
        "hederaTransactionId": "0.0.123456@1234567890.123456789",
        "status": "completed",
        "createdAt": "2025-10-28T10:00:00.000Z"
      }
    ],
    "count": 1
  }
}
```

---

## 🏢 Property Owners Endpoints

### 15. Register Property Owner

Register as a property owner.

**Endpoint:** `POST /api/v1/property-owners/register`

**Request Body:**
```json
{
  "hederaAccountId": "0.0.789012",
  "email": "owner@example.com",
  "fullName": "Jane Smith",
  "country": "Nigeria",
  "ownerType": "individual"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Property owner registered successfully",
  "data": {
    "id": "uuid-owner1",
    "hederaAccountId": "0.0.789012",
    "verificationStatus": "pending",
    "registeredAt": "2025-10-28T11:00:00.000Z"
  }
}
```

---

### 16. Submit Verification Documents

Submit property owner verification documents.

**Endpoint:** `POST /api/v1/property-owners/:id/verification`

**Request Body:**
```json
{
  "governmentIdCID": "QmGovID...",
  "proofOfAddressCID": "QmAddress...",
  "selfieWithIdCID": "QmSelfie...",
  "titleDeedCID": "QmDeed...",
  "propertyAppraisalCID": "QmAppraisal...",
  "propertyAddress": "123 Victoria Island, Lagos",
  "propertyValue": 500000.00,
  "propertyType": "residential"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Verification documents submitted successfully",
  "data": {
    "verificationId": "uuid-verif1",
    "status": "pending",
    "submittedAt": "2025-10-28T11:00:00.000Z"
  }
}
```

---

### 17. Get Verification Status

Check verification status.

**Endpoint:** `GET /api/v1/property-owners/:id/verification-status`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "ownerId": "uuid-owner1",
    "verificationStatus": "verified",
    "verifiedAt": "2025-10-25T10:00:00.000Z",
    "verificationNftTokenId": "0.0.7152947",
    "verificationNftSerial": 1,
    "submittedDocuments": {
      "governmentId": "QmGovID...",
      "titleDeed": "QmDeed...",
      "appraisal": "QmAppraisal..."
    }
  }
}
```

---

## 🛒 Marketplace Endpoints

### 18. Create Listing

List NFTs for sale on secondary market.

**Endpoint:** `POST /api/v1/marketplace/list`

**Request Body:**
```json
{
  "sellerHederaAccount": "0.0.123456",
  "tokenId": "0.0.7128093",
  "serialNumbers": [1, 2, 3],
  "quantity": 3,
  "pricePerNFT": 55.00,
  "currency": "USD",
  "title": "3 Villa Shares for Sale",
  "description": "Selling 3 shares of Luxury Villa Lagos",
  "expiresInDays": 30
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Listing created successfully",
  "data": {
    "listingId": "uuid-listing1",
    "tokenId": "0.0.7128093",
    "serialNumbers": [1, 2, 3],
    "pricePerNFT": "55.00",
    "totalPrice": "165.00",
    "status": "active",
    "expiresAt": "2025-11-27T11:00:00.000Z",
    "createdAt": "2025-10-28T11:00:00.000Z",
    "fees": {
      "listingFee": 25,
      "currency": "USD",
      "note": "Listing fee must be paid to platform to activate listing",
      "validFor": "90 days"
    }
  }
}
```

**Platform Fees:**
- **Listing Fee**: $25 USD (standard listing, valid for 90 days)

---

### 19. Get Marketplace Listings

Browse active marketplace listings.

**Endpoint:** `GET /api/v1/marketplace/listings`

**Query Parameters:**
- `tokenId` - Filter by property token
- `minPrice` - Minimum price per NFT
- `maxPrice` - Maximum price per NFT
- `status` - Filter by status (active, sold, cancelled, expired)
- `limit` - Results per page (default: 50)
- `offset` - Pagination offset

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "listings": [
      {
        "id": "uuid-listing1",
        "sellerHederaAccount": "0.0.123456",
        "tokenId": "0.0.7128093",
        "propertyName": "Luxury Villa Lagos",
        "serialNumbers": [1, 2, 3],
        "quantity": 3,
        "pricePerNFT": "55.00",
        "totalPrice": "165.00",
        "currency": "USD",
        "title": "3 Villa Shares for Sale",
        "status": "active",
        "createdAt": "2025-10-28T11:00:00.000Z",
        "expiresAt": "2025-11-27T11:00:00.000Z"
      }
    ],
    "count": 1
  }
}
```

---

### 20. Make Offer

Make an offer on a marketplace listing.

**Endpoint:** `POST /api/v1/marketplace/offers`

**Request Body:**
```json
{
  "listingId": "uuid-listing1",
  "buyerHederaAccount": "0.0.789012",
  "offerPrice": 52.00,
  "quantity": 2,
  "expiresInDays": 7
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Offer submitted successfully",
  "data": {
    "offerId": "uuid-offer1",
    "listingId": "uuid-listing1",
    "offerPrice": "52.00",
    "quantity": 2,
    "totalOfferAmount": "104.00",
    "status": "pending",
    "expiresAt": "2025-11-04T11:00:00.000Z"
  }
}
```

---

### 21. Buy NFTs

Purchase NFTs from marketplace (buy now).

**Endpoint:** `POST /api/v1/marketplace/buy`

**Request Body:**
```json
{
  "listingId": "uuid-listing1",
  "buyerHederaAccount": "0.0.789012",
  "quantity": 2,
  "paymentMethod": "HBAR"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Purchase initiated successfully",
  "data": {
    "transactionId": "uuid-tx1",
    "listingId": "uuid-listing1",
    "tokenId": "0.0.7128093",
    "serialNumbers": [1, 2],
    "quantity": 2,
    "pricePerNFT": "55.00",
    "totalPrice": "110.00",
    "buyer": "0.0.789012",
    "seller": "0.0.123456",
    "saleType": "secondary",
    "fees": {
      "platformFee": 2.75,
      "feeType": "Platform Transaction Fee",
      "feePercentage": 2.5,
      "sellerReceives": 107.25,
      "royaltyFee": 5,
      "royaltyNote": "Enforced automatically by Hedera smart contract to property owner",
      "breakdown": {
        "totalPrice": 110.00,
        "platformFee": 2.75,
        "sellerReceives": 107.25,
        "description": "Seller receives 97.5% after 2.5% platform fee. 5% royalty to property owner is automatically enforced by NFT contract"
      },
      "currency": "USD"
    },
    "instructions": {
      "step1": "Transfer payment to seller account",
      "step2": "Seller approves and transfers NFT to buyer",
      "step3": "Transaction status will be updated to completed",
      "paymentDetails": {
        "recipient": "0.0.123456",
        "amount": 110.00,
        "currency": "USD",
        "platformFeeRecipient": "0.0.PLATFORM",
        "platformFeeAmount": 2.75
      }
    }
  }
}
```

**Platform Fees:**
- **Primary Sale** (from property owner): 10% commission to platform
  - Example: $100 sale → Platform: $10, Owner receives: $90
- **Secondary Sale** (from other sellers): 2.5% platform transaction fee + 5% royalty (automatic)
  - Example: $100 sale → Platform: $2.50, Royalty: $5, Seller receives: $92.50

---

## 📁 Files/IPFS Endpoints

### 22. Upload File to IPFS

Upload a single file to IPFS (Pinata).

**Endpoint:** `POST /api/v1/files/upload`

**Content-Type:** `multipart/form-data`

**Request Body:**
- `file` - File to upload

**Response (200 OK):**
```json
{
  "success": true,
  "message": "File uploaded to IPFS successfully",
  "data": {
    "cid": "QmXxx...",
    "url": "https://gateway.pinata.cloud/ipfs/QmXxx...",
    "size": 1024567,
    "name": "property-image.jpg"
  }
}
```

---

### 23. Upload Multiple Files

Upload multiple files to IPFS.

**Endpoint:** `POST /api/v1/files/upload-multiple`

**Content-Type:** `multipart/form-data`

**Request Body:**
- `files` - Array of files

**Response (200 OK):**
```json
{
  "success": true,
  "message": "3 files uploaded to IPFS successfully",
  "data": {
    "files": [
      {
        "cid": "QmXxx...",
        "url": "https://gateway.pinata.cloud/ipfs/QmXxx...",
        "name": "image1.jpg"
      },
      {
        "cid": "QmYyy...",
        "url": "https://gateway.pinata.cloud/ipfs/QmYyy...",
        "name": "image2.jpg"
      }
    ],
    "count": 2
  }
}
```

---

### 24. Upload JSON Metadata

Upload JSON metadata to IPFS.

**Endpoint:** `POST /api/v1/files/upload-json`

**Request Body:**
```json
{
  "metadata": {
    "name": "Luxury Villa Lagos",
    "description": "5-bedroom luxury villa",
    "image": "QmImage...",
    "properties": {
      "bedrooms": 5,
      "bathrooms": 4
    }
  },
  "filename": "property-metadata.json"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "JSON uploaded to IPFS successfully",
  "data": {
    "cid": "QmMetadata...",
    "url": "https://gateway.pinata.cloud/ipfs/QmMetadata...",
    "name": "property-metadata.json"
  }
}
```

---

### 25. Get File Information

Get information about an IPFS file.

**Endpoint:** `GET /api/v1/files/:cid`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "cid": "QmXxx...",
    "url": "https://gateway.pinata.cloud/ipfs/QmXxx...",
    "pinned": true,
    "size": 1024567
  }
}
```

---

## 👨‍💼 Admin Endpoints

### 26. Get Pending Verifications

Get all pending KYC and property owner verifications.

**Endpoint:** `GET /api/v1/admin/pending-verifications`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "investorKYC": [
      {
        "id": "uuid-kyc1",
        "investorId": "uuid-inv1",
        "investorName": "John Doe",
        "documentType": "passport",
        "status": "pending",
        "submittedAt": "2025-10-28T10:00:00.000Z"
      }
    ],
    "propertyOwners": [
      {
        "id": "uuid-po1",
        "ownerName": "Jane Smith",
        "propertyAddress": "123 Victoria Island",
        "status": "pending",
        "submittedAt": "2025-10-28T09:00:00.000Z"
      }
    ],
    "totalPending": 2
  }
}
```

---

### 27. Approve Investor KYC

Approve investor KYC submission.

**Endpoint:** `POST /api/v1/admin/investors/:id/approve-kyc`

**Request Body:**
```json
{
  "verificationNftSerial": 1,
  "adminNotes": "Documents verified successfully"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Investor KYC approved successfully",
  "data": {
    "investorId": "uuid-inv1",
    "kycStatus": "verified",
    "verificationNftTokenId": "0.0.7152949",
    "verificationNftSerial": 1,
    "verifiedAt": "2025-10-28T11:00:00.000Z"
  }
}
```

---

### 28. Reject Investor KYC

Reject investor KYC submission.

**Endpoint:** `POST /api/v1/admin/investors/:id/reject-kyc`

**Request Body:**
```json
{
  "rejectionReason": "Documents unclear, please resubmit"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Investor KYC rejected",
  "data": {
    "investorId": "uuid-inv1",
    "kycStatus": "rejected",
    "rejectionReason": "Documents unclear, please resubmit"
  }
}
```

---

### 29. Approve Property Owner

Approve property owner verification.

**Endpoint:** `POST /api/v1/admin/property-owners/:id/approve`

**Request Body:**
```json
{
  "verificationNftSerial": 1,
  "adminNotes": "Property documents verified"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Property owner approved successfully",
  "data": {
    "ownerId": "uuid-po1",
    "verificationStatus": "verified",
    "verificationNftTokenId": "0.0.7152947",
    "verificationNftSerial": 1
  }
}
```

---

### 30. Reject Property Owner

Reject property owner verification.

**Endpoint:** `POST /api/v1/admin/property-owners/:id/reject`

**Request Body:**
```json
{
  "rejectionReason": "Title deed not valid"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Property owner verification rejected",
  "data": {
    "ownerId": "uuid-po1",
    "verificationStatus": "rejected",
    "rejectionReason": "Title deed not valid"
  }
}
```

---

## ✅ Verification Endpoints

### 31. Get Verification Token ID

Get the Hedera token ID for a verification NFT type.

**Endpoint:** `GET /api/v1/verification/token-id`

**Query Parameters:**
- `verificationType` - Type of verification (property-owner, investor, kyc, accredited-investor)

**Example Request:**
```
GET /api/v1/verification/token-id?verificationType=property-owner
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "tokenId": "0.0.7152947",
    "verificationType": "property-owner",
    "tokenName": "DeraLinks Property Owner Verification",
    "tokenSymbol": "DLPOWNER",
    "network": "testnet",
    "explorerUrl": "https://hashscan.io/testnet/token/0.0.7152947"
  }
}
```

---

## 🏛️ DAO Governance Endpoints

### 32. Create DAO Proposal

Create a governance proposal for a property (NFT holders only).

**Endpoint:** `POST /api/v1/dao/:propertyId/proposals`

**Request Body:**
```json
{
  "tokenId": "0.0.7128093",
  "proposerAccount": "0.0.123456",
  "title": "Install Solar Panels",
  "description": "Proposal to install solar panels to reduce electricity costs",
  "proposalType": "maintenance",
  "proposalData": {
    "estimatedCost": 50000.00,
    "contractor": "Green Energy Ltd",
    "timeline": "3 months"
  },
  "documentCids": ["QmProposal...", "QmQuote..."],
  "votingDurationDays": 7,
  "quorumPercentage": 51,
  "approvalThresholdPercentage": 66,
  "signature": "0x...",
  "publicKey": "302a300506032b6570032100...",
  "message": "DeraLinks Authentication..."
}
```

**Proposal Types:**
- `maintenance` - Property repairs/improvements
- `budget` - Budget allocation decisions
- `distribution` - Dividend distribution schedules
- `asset_sale` - Sell property or major assets
- `general` - General governance decisions

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Proposal created successfully",
  "data": {
    "id": "uuid-proposal1",
    "propertyId": "uuid-123",
    "tokenId": "0.0.7128093",
    "proposerAccount": "0.0.123456",
    "proposerVotingPower": 50,
    "title": "Install Solar Panels",
    "proposalType": "maintenance",
    "status": "active",
    "votingStartsAt": "2025-10-28T11:00:00.000Z",
    "votingEndsAt": "2025-11-04T11:00:00.000Z",
    "quorumPercentage": 51,
    "approvalThresholdPercentage": 66,
    "totalVotingPower": 10000,
    "createdAt": "2025-10-28T11:00:00.000Z"
  }
}
```

---

### 33. List DAO Proposals

Get all proposals for a property.

**Endpoint:** `GET /api/v1/dao/:propertyId/proposals`

**Query Parameters:**
- `status` - Filter by status (draft, active, passed, rejected, executed, cancelled)
- `limit` - Results per page (default: 50)
- `offset` - Pagination offset

**Example Request:**
```
GET /api/v1/dao/uuid-123/proposals?status=active&limit=10
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "proposals": [
      {
        "id": "uuid-proposal1",
        "propertyId": "uuid-123",
        "propertyName": "Luxury Villa Lagos",
        "tokenId": "0.0.7128093",
        "proposerAccount": "0.0.123456",
        "title": "Install Solar Panels",
        "proposalType": "maintenance",
        "status": "active",
        "votingEndsAt": "2025-11-04T11:00:00.000Z",
        "votesFor": 25,
        "votesAgainst": 10,
        "votesAbstain": 5,
        "votingPowerFor": 2500,
        "votingPowerAgainst": 1000,
        "uniqueVoters": 40,
        "quorumReached": false,
        "createdAt": "2025-10-28T11:00:00.000Z"
      }
    ],
    "count": 1
  }
}
```

---

### 34. Get Proposal Details

Get detailed information about a specific proposal.

**Endpoint:** `GET /api/v1/dao/proposals/:id`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-proposal1",
    "propertyId": "uuid-123",
    "propertyName": "Luxury Villa Lagos",
    "tokenId": "0.0.7128093",
    "proposerAccount": "0.0.123456",
    "proposerVotingPower": 50,
    "title": "Install Solar Panels",
    "description": "Proposal to install solar panels to reduce electricity costs",
    "proposalType": "maintenance",
    "proposalData": {
      "estimatedCost": 50000.00,
      "contractor": "Green Energy Ltd",
      "timeline": "3 months"
    },
    "documentCids": ["QmProposal...", "QmQuote..."],
    "votingStartsAt": "2025-10-28T11:00:00.000Z",
    "votingEndsAt": "2025-11-04T11:00:00.000Z",
    "quorumPercentage": 51,
    "approvalThresholdPercentage": 66,
    "totalVotingPower": 10000,
    "votesFor": 25,
    "votesAgainst": 10,
    "votesAbstain": 5,
    "votingPowerFor": 2500,
    "votingPowerAgainst": 1000,
    "votingPowerAbstain": 500,
    "uniqueVoters": 40,
    "quorumReached": false,
    "proposalPassed": false,
    "status": "active",
    "createdAt": "2025-10-28T11:00:00.000Z"
  }
}
```

---

### 35. Vote on Proposal

Cast vote on a proposal (NFT holders only).

**Endpoint:** `POST /api/v1/dao/proposals/:id/vote`

**Request Body:**
```json
{
  "voterAccount": "0.0.123456",
  "voteChoice": "for",
  "signature": "0x...",
  "publicKey": "302a300506032b6570032100...",
  "message": "DeraLinks Authentication...",
  "reason": "This will reduce our operational costs significantly"
}
```

**Vote Choices:**
- `for` - Vote in favor
- `against` - Vote against
- `abstain` - Abstain from voting

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Vote cast successfully",
  "data": {
    "id": "uuid-vote1",
    "proposalId": "uuid-proposal1",
    "voterAccount": "0.0.123456",
    "voteChoice": "for",
    "votingPower": 50,
    "votedAt": "2025-10-28T11:30:00.000Z"
  }
}
```

---

### 36. Get Vote Results

Get real-time voting results for a proposal.

**Endpoint:** `GET /api/v1/dao/proposals/:id/results`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "proposal": {
      "id": "uuid-proposal1",
      "title": "Install Solar Panels",
      "status": "active",
      "votingEndsAt": "2025-11-04T11:00:00.000Z",
      "quorumPercentage": 51,
      "approvalThresholdPercentage": 66
    },
    "results": {
      "totalVotingPower": 10000,
      "votesFor": 25,
      "votesAgainst": 10,
      "votesAbstain": 5,
      "votingPowerFor": 2500,
      "votingPowerAgainst": 1000,
      "votingPowerAbstain": 500,
      "uniqueVoters": 40,
      "participationRate": "40.00",
      "forPercentage": "71.43",
      "againstPercentage": "28.57",
      "quorumReached": false,
      "proposalPassed": false
    },
    "votes": [
      {
        "voterAccount": "0.0.123456",
        "voteChoice": "for",
        "votingPower": 50,
        "votedAt": "2025-10-28T11:30:00.000Z",
        "reason": "This will reduce our operational costs significantly"
      }
    ]
  }
}
```

---

### 37. Execute Proposal

Execute a passed proposal.

**Endpoint:** `POST /api/v1/dao/proposals/:id/execute`

**Request Body:**
```json
{
  "executorAccount": "0.0.123456",
  "signature": "0x...",
  "publicKey": "302a300506032b6570032100...",
  "message": "DeraLinks Authentication..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Proposal executed successfully",
  "data": {
    "id": "uuid-proposal1",
    "status": "executed",
    "executedAt": "2025-11-05T10:00:00.000Z",
    "executionNotes": "Executed by 0.0.123456"
  }
}
```

---

### 38. Get Property Treasury

Get treasury information for a property.

**Endpoint:** `GET /api/v1/dao/:propertyId/treasury`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-123",
    "propertyName": "Luxury Villa Lagos",
    "tokenId": "0.0.7128093",
    "treasuryBalance": "125000.00",
    "treasuryCurrency": "HBAR",
    "totalIncome": "200000.00",
    "totalExpenses": "50000.00",
    "totalDistributions": "25000.00",
    "lastDistributionAt": "2025-10-01T10:00:00.000Z"
  }
}
```

---

## ❌ Error Codes

### HTTP Status Codes
- `200` - OK (Success)
- `201` - Created (Resource created)
- `400` - Bad Request (Invalid input)
- `401` - Unauthorized (Invalid signature)
- `403` - Forbidden (No permission)
- `404` - Not Found (Resource not found)
- `500` - Internal Server Error

### Common Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

### Error Codes List

**Authentication Errors:**
- `INVALID_SIGNATURE` - Wallet signature verification failed
- `EXPIRED_SIGNATURE` - Signature timestamp expired (>5 minutes)
- `INVALID_PUBLIC_KEY` - Public key format invalid
- `MISSING_SIGNATURE` - Required signature not provided

**Authorization Errors:**
- `NO_VOTING_POWER` - Account owns no NFTs for this property
- `VERIFICATION_REQUIRED` - Verification NFT required
- `UNAUTHORIZED` - Not authorized to perform action
- `ADMIN_ONLY` - Admin privileges required

**Validation Errors:**
- `INVALID_INPUT` - Missing or invalid required fields
- `INVALID_TYPE` - Invalid type value (proposal type, vote choice, etc.)
- `INVALID_CHOICE` - Invalid vote choice
- `INVALID_ACCOUNT_ID` - Hedera account ID format invalid

**Resource Errors:**
- `NOT_FOUND` - Resource not found
- `TOKEN_NOT_FOUND` - Verification token not configured
- `PROPERTY_NOT_FOUND` - Property not found
- `PROPOSAL_NOT_FOUND` - Proposal not found

**Business Logic Errors:**
- `VOTING_NOT_STARTED` - Voting period has not started
- `VOTING_ENDED` - Voting period has ended
- `PROPOSAL_NOT_PASSED` - Proposal did not pass
- `NO_DOCUMENTS` - No documents available for verification
- `ALREADY_VOTED` - Already voted on this proposal (use update)

**Server Errors:**
- `MINT_ERROR` - Failed to mint NFT
- `TRANSFER_ERROR` - Failed to transfer NFT
- `FETCH_ERROR` - Failed to fetch data
- `CREATE_PROPOSAL_ERROR` - Failed to create proposal
- `VOTE_ERROR` - Failed to cast vote
- `EXECUTE_ERROR` - Failed to execute proposal

---

## 📊 Testing & Usage Examples

### Example 1: Complete Property Tokenization Flow

```bash
# 1. Upload property images to IPFS
curl -X POST http://localhost:3600/api/v1/files/upload \
  -F "file=@property-image1.jpg"

# 2. Mint property NFT collection
curl -X POST http://localhost:3600/api/v1/properties/mint \
  -H "Content-Type: application/json" \
  -d '{
    "ownerHederaAccount": "0.0.7127074",
    "propertyName": "Luxury Villa Lagos",
    "collectionName": "Luxury Villa Lagos NFTs",
    "collectionSymbol": "LVL",
    "propertyType": "real_estate",
    "address": "123 Victoria Island",
    "city": "Lagos",
    "country": "Nigeria",
    "totalValue": 500000.00,
    "tokenPrice": 50.00,
    "totalSupply": 10000,
    "images": ["QmXxx..."],
    "royaltyPercentage": 5
  }'

# 3. List property on marketplace
curl -X GET "http://localhost:3600/api/v1/properties?status=active"
```

---

### Example 2: DAO Governance Flow

```bash
# 1. Create proposal (with wallet signature)
curl -X POST http://localhost:3600/api/v1/dao/uuid-123/proposals \
  -H "Content-Type: application/json" \
  -d '{
    "tokenId": "0.0.7128093",
    "proposerAccount": "0.0.123456",
    "title": "Install Solar Panels",
    "description": "Reduce electricity costs",
    "proposalType": "maintenance",
    "votingDurationDays": 7,
    "signature": "0x...",
    "publicKey": "302a...",
    "message": "DeraLinks Authentication..."
  }'

# 2. Vote on proposal
curl -X POST http://localhost:3600/api/v1/dao/proposals/uuid-proposal1/vote \
  -H "Content-Type: application/json" \
  -d '{
    "voterAccount": "0.0.123456",
    "voteChoice": "for",
    "signature": "0x...",
    "publicKey": "302a...",
    "message": "DeraLinks Authentication..."
  }'

# 3. Check vote results
curl -X GET http://localhost:3600/api/v1/dao/proposals/uuid-proposal1/results

# 4. Execute passed proposal
curl -X POST http://localhost:3600/api/v1/dao/proposals/uuid-proposal1/execute \
  -H "Content-Type: application/json" \
  -d '{
    "executorAccount": "0.0.123456",
    "signature": "0x...",
    "publicKey": "302a...",
    "message": "DeraLinks Authentication..."
  }'
```

---

## 🔗 Additional Resources

- **Hedera Documentation:** https://docs.hedera.com
- **HashPack Wallet:** https://www.hashpack.app
- **Hedera Testnet Faucet:** https://portal.hedera.com
- **HashScan Explorer (Testnet):** https://hashscan.io/testnet
- **Pinata IPFS:** https://www.pinata.cloud

---

## 📞 Support

For API support or questions:
- GitHub Issues: [Link to your repo]
- Email: support@deralinks.com
- Documentation: [Link to docs]

---

**Last Updated:** October 28, 2025
**API Version:** 1.0.0
**Status:** Active on Testnet
