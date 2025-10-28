# DeraLinks API - Quick Reference

**Base URL:** `http://localhost:3600/api/v1`

---

## 🚀 Quick Start

### 1. Test Connection
```bash
curl http://localhost:3600/health
```

### 2. View All Endpoints
```bash
curl http://localhost:3600/api/v1
```

---

## 📋 All 40 Endpoints

### Properties (5 endpoints)
```
POST   /api/v1/properties/mint                      # Mint property NFT collection
GET    /api/v1/properties                           # List all properties
GET    /api/v1/properties/:id                       # Get property details
PUT    /api/v1/properties/:id                       # Update property
POST   /api/v1/properties/:id/verify                # Verify property documents
```

### Tokens (4 endpoints)
```
POST   /api/v1/tokens/mint                          # Mint NFTs
GET    /api/v1/tokens/:tokenId/info                 # Get token info
POST   /api/v1/tokens/transfer                      # Transfer NFTs
GET    /api/v1/tokens/:tokenId/holders              # Get token holders
```

### Users (1 endpoint)
```
GET    /api/v1/users/:accountId/assets              # Get user's NFT holdings
```

### Investors (4 endpoints)
```
POST   /api/v1/investors/register                   # Register investor
GET    /api/v1/investors/:id/profile                # Get investor profile
POST   /api/v1/investors/:id/kyc                    # Submit KYC documents
GET    /api/v1/investors/:id/transactions           # Get transaction history
```

### Property Owners (3 endpoints)
```
POST   /api/v1/property-owners/register             # Register property owner
POST   /api/v1/property-owners/:id/verification     # Submit verification docs
GET    /api/v1/property-owners/:id/verification-status  # Check verification status
```

### Marketplace (4 endpoints)
```
POST   /api/v1/marketplace/list                     # Create NFT listing
GET    /api/v1/marketplace/listings                 # Browse listings
POST   /api/v1/marketplace/offers                   # Make offer
POST   /api/v1/marketplace/buy                      # Buy NFT
```

### Files/IPFS (4 endpoints)
```
POST   /api/v1/files/upload                         # Upload file to IPFS
POST   /api/v1/files/upload-multiple                # Upload multiple files
POST   /api/v1/files/upload-json                    # Upload JSON metadata
GET    /api/v1/files/:cid                           # Get file info
```

### Admin (5 endpoints)
```
GET    /api/v1/admin/pending-verifications          # Get pending verifications
POST   /api/v1/admin/investors/:id/approve-kyc      # Approve investor KYC
POST   /api/v1/admin/investors/:id/reject-kyc       # Reject investor KYC
POST   /api/v1/admin/property-owners/:id/approve    # Approve property owner
POST   /api/v1/admin/property-owners/:id/reject     # Reject property owner
```

### Verification (1 endpoint)
```
GET    /api/v1/verification/token-id                # Get verification NFT token ID
```

### DAO Governance (7 endpoints)
```
POST   /api/v1/dao/:propertyId/proposals            # Create proposal
GET    /api/v1/dao/:propertyId/proposals            # List proposals
GET    /api/v1/dao/proposals/:id                    # Get proposal details
POST   /api/v1/dao/proposals/:id/vote               # Cast vote
GET    /api/v1/dao/proposals/:id/results            # Get vote results
POST   /api/v1/dao/proposals/:id/execute            # Execute proposal
GET    /api/v1/dao/:propertyId/treasury             # Get treasury info
```

---

## 🔐 Authentication Pattern

All protected endpoints require wallet signature:

```json
{
  "accountId": "0.0.123456",
  "signature": "0x...",
  "publicKey": "302a300506032b6570032100...",
  "message": "DeraLinks Authentication\n\nAccount: 0.0.123456\nTimestamp: 1234567890\n..."
}
```

---

## 🎯 Common Use Cases

### Use Case 1: Tokenize a Property
```bash
# 1. Upload images
POST /api/v1/files/upload

# 2. Mint property collection
POST /api/v1/properties/mint

# 3. View property
GET /api/v1/properties/:id
```

### Use Case 2: Investor Registration & Purchase
```bash
# 1. Register investor
POST /api/v1/investors/register

# 2. Submit KYC
POST /api/v1/investors/:id/kyc

# 3. Admin approves KYC
POST /api/v1/admin/investors/:id/approve-kyc

# 4. Browse properties
GET /api/v1/properties?status=active

# 5. Purchase NFTs (via marketplace or primary sale)
POST /api/v1/marketplace/buy
```

### Use Case 3: DAO Governance
```bash
# 1. Create proposal (requires NFT ownership)
POST /api/v1/dao/:propertyId/proposals

# 2. Vote on proposal
POST /api/v1/dao/proposals/:id/vote

# 3. Check results
GET /api/v1/dao/proposals/:id/results

# 4. Execute if passed
POST /api/v1/dao/proposals/:id/execute
```

### Use Case 4: Secondary Market Trading
```bash
# 1. List NFTs for sale
POST /api/v1/marketplace/list

# 2. Browse listings
GET /api/v1/marketplace/listings

# 3. Make offer
POST /api/v1/marketplace/offers

# 4. Buy now
POST /api/v1/marketplace/buy
```

---

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Optional success message",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

---

## 🔢 HTTP Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized (Invalid signature)
- `403` - Forbidden (No permission)
- `404` - Not Found
- `500` - Internal Server Error

---

## 🎨 Proposal Types

- `maintenance` - Property repairs/improvements
- `budget` - Budget allocation
- `distribution` - Dividend schedules
- `asset_sale` - Sell property/assets
- `general` - General decisions

---

## ✅ Vote Choices

- `for` - Vote in favor
- `against` - Vote against
- `abstain` - Abstain from voting

---

## 🏷️ Property Types

- `real_estate` - Real estate properties
- `agriculture` - Farms and agricultural land
- `commercial` - Commercial properties

---

## 📦 Verification Types

- `property-owner` - Property owner verification NFT
- `investor` - Basic investor verification NFT
- `kyc` - KYC verification
- `accredited-investor` - Accredited investor verification NFT

---

## 🌐 Hedera Network Info

**Testnet:**
- Network: `testnet`
- Mirror Node: `https://testnet.mirrornode.hedera.com`
- Explorer: `https://hashscan.io/testnet`
- Faucet: `https://portal.hedera.com`

**NFT Collections:**
- Real Estate: `0.0.7128093`
- Agriculture: `0.0.7128095`
- Properties: `0.0.7128101`

**Verification NFTs:**
- Property Owner: `0.0.7152947` (DLPOWNER)
- Investor: `0.0.7152949` (DLINVEST)
- Accredited Investor: `0.0.7152952` (DLACCRED)

---

## 🧪 Testing with cURL

### Example 1: Get All Properties
```bash
curl http://localhost:3600/api/v1/properties
```

### Example 2: Get Property Details
```bash
curl http://localhost:3600/api/v1/properties/0.0.7128093
```

### Example 3: Get User Assets
```bash
curl http://localhost:3600/api/v1/users/0.0.123456/assets
```

### Example 4: Upload File
```bash
curl -X POST http://localhost:3600/api/v1/files/upload \
  -F "file=@property-image.jpg"
```

### Example 5: Create Proposal (with signature)
```bash
curl -X POST http://localhost:3600/api/v1/dao/uuid-123/proposals \
  -H "Content-Type: application/json" \
  -d '{
    "tokenId": "0.0.7128093",
    "proposerAccount": "0.0.123456",
    "title": "Install Solar Panels",
    "description": "Reduce costs",
    "proposalType": "maintenance",
    "signature": "0x...",
    "publicKey": "302a...",
    "message": "DeraLinks Authentication..."
  }'
```

---

## 🐛 Debugging Tips

### Check Server Status
```bash
curl http://localhost:3600/health
```

### Check Database Connection
- Backend logs will show database connection status
- Check Docker: `docker-compose logs backend`

### Common Issues

**401 Unauthorized:**
- Check signature format
- Verify timestamp is within 5 minutes
- Ensure public key matches account ID

**403 Forbidden:**
- Check NFT ownership for DAO operations
- Verify verification NFT for protected operations

**404 Not Found:**
- Check UUID or token ID format
- Verify resource exists in database

---

## 📚 Full Documentation

See `API-DOCUMENTATION.md` for complete details including:
- Full request/response examples
- All query parameters
- Error codes reference
- Complete use case flows

---

## 🔗 Resources

- Backend API: `http://localhost:3600/api/v1`
- Health Check: `http://localhost:3600/health`
- API Info: `http://localhost:3600/api/v1`
- HashScan: `https://hashscan.io/testnet`

---

**Last Updated:** October 28, 2025
