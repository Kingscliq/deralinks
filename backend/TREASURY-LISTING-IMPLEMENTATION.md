# Treasury Listing Implementation - Summary

## Problem Solved
Property owners can now list NFTs directly from the treasury without needing treasury account credentials.

## Changes Made

### 1. Database Migration (`/database/migrations/004-add-treasury-listing-flag.sql`)
Added two new columns to `marketplace_listings` table:

```sql
-- Tracks if listing is from treasury (property owner) or investor
is_treasury_listing BOOLEAN DEFAULT false

-- Stores the Hedera account that actually holds the NFTs
nft_holder_account VARCHAR(50)
```

### 2. Marketplace Controller - Listing Function (`/src/controllers/marketplace.controller.ts`)

**Modified `createListing()` function:**

#### Before:
```javascript
// Only checked if seller owns NFTs
const nfts = await getAccountNFTs(sellerHederaAccount, tokenId);
if (!owns NFTs) → REJECT
```

#### After:
```javascript
// Step 1: Check if seller is property owner
const isPropertyOwner = (sellerHederaAccount === property.owner_hedera_account);

// Step 2: Determine where to check for NFTs
if (isPropertyOwner) {
  accountToCheck = TREASURY_ACCOUNT;
  isTreasuryListing = true;
  nftHolderAccount = TREASURY_ACCOUNT;
} else {
  accountToCheck = sellerHederaAccount;
  isTreasuryListing = false;
  nftHolderAccount = sellerHederaAccount;
}

// Step 3: Verify NFTs exist
const nfts = await getAccountNFTs(accountToCheck, tokenId);
```

### 3. Marketplace Controller - Buy Function

**Modified `buyNFT()` function:**

- Updated listing query to retrieve `is_treasury_listing` and `nft_holder_account`
- Added transfer information to response:

```javascript
{
  nftHolderAccount: "0.0.7125108",  // Actual account holding NFTs
  isTreasuryTransfer: true,
  transferNote: "NFTs will be transferred from treasury account"
}
```

## How It Works Now

### Property Owner Lists (Primary Sale):
```json
POST /api/v1/marketplace/list
{
  "sellerHederaAccount": "0.0.7144250",  // Property owner account
  "tokenId": "0.0.7170282",
  "serialNumbers": [1, 2],
  "pricePerNFT": 24
}
```

**Backend Process:**
1. ✅ Detects seller is property owner
2. ✅ Checks treasury account for NFTs [1, 2]
3. ✅ Creates listing with:
   - `is_treasury_listing = true`
   - `nft_holder_account = "0.0.7125108"` (treasury)
4. ✅ Returns success

### Investor Buys:
```json
POST /api/v1/marketplace/buy
{
  "listingId": "...",
  "buyerHederaAccount": "0.0.investor"
}
```

**Response Includes:**
```json
{
  "data": {
    "nftHolderAccount": "0.0.7125108",
    "isTreasuryTransfer": true,
    "transferNote": "NFTs will be transferred from treasury account",
    "saleType": "primary",
    "fees": {
      "platformFee": 2.4,
      "feePercentage": 10,
      "sellerReceives": 21.6
    }
  }
}
```

### Investor Lists (Secondary Sale):
```json
POST /api/v1/marketplace/list
{
  "sellerHederaAccount": "0.0.investor",  // Investor owns NFTs
  "tokenId": "0.0.7170282",
  "serialNumbers": [1, 2],
  "pricePerNFT": 30
}
```

**Backend Process:**
1. ✅ Detects seller is NOT property owner
2. ✅ Checks investor account for NFTs [1, 2]
3. ✅ Creates listing with:
   - `is_treasury_listing = false`
   - `nft_holder_account = "0.0.investor"`

## Benefits

✅ **Property owners don't need treasury credentials**
✅ **Simplified UX: Use their own account**
✅ **NFTs stay secure in treasury until sold**
✅ **No breaking changes to existing functionality**
✅ **Fee logic unchanged (already works correctly)**
✅ **Clear audit trail in database**

## Testing

### Test 1: Property Owner Lists
```bash
curl -X POST https://deralinks-backend.onrender.com/api/v1/marketplace/list \
  -H "Content-Type: application/json" \
  -d '{
    "sellerHederaAccount": "0.0.7144250",
    "tokenId": "0.0.7170282",
    "serialNumbers": [1, 2],
    "pricePerNFT": 24,
    "currency": "USD"
  }'
```

**Expected:** Success (checks treasury for NFTs)

### Test 2: Investor Lists (Without Owning)
```bash
curl -X POST https://deralinks-backend.onrender.com/api/v1/marketplace/list \
  -H "Content-Type: application/json" \
  -d '{
    "sellerHederaAccount": "0.0.investor",
    "tokenId": "0.0.7170282",
    "serialNumbers": [1, 2],
    "pricePerNFT": 30
  }'
```

**Expected:** Error - "Seller does not own serial numbers: 1, 2"

## Deployment Steps

1. **Apply database migration:**
   ```sql
   -- Run on production database
   \i database/migrations/004-add-treasury-listing-flag.sql
   ```

2. **Deploy updated code:**
   ```bash
   git add .
   git commit -m "feat: allow property owners to list from treasury"
   git push origin main
   ```

3. **Verify environment variables:**
   ```bash
   TREASURY_ACCOUNT_ID=0.0.7125108
   OPERATOR_ID=0.0.7125108
   ```

## Backward Compatibility

- ✅ Existing listings continue to work
- ✅ New columns have DEFAULT values
- ✅ Old listings will have `is_treasury_listing = false`
- ✅ Buy function handles both old and new listings

## Next Steps

1. Apply migration to production database
2. Test property owner listing on production
3. Update frontend to use new fields:
   - Show "Primary Offering" badge for treasury listings
   - Use `nftHolderAccount` for NFT transfers
4. Update API documentation with examples
