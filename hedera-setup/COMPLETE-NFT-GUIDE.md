# Complete Guide: Creating NFT Collections with Images on Hedera

This guide walks you through the **entire process** of creating NFT collections with custom images on Hedera Testnet, from initial setup to minting and transferring NFTs.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Phase 1: Create Hedera Accounts](#phase-1-create-hedera-accounts)
4. [Phase 2: Create HCS Topics](#phase-2-create-hcs-topics)
5. [Phase 3: Create NFT Collections](#phase-3-create-nft-collections)
6. [Phase 4: Prepare Custom Images](#phase-4-prepare-custom-images)
7. [Phase 5: Upload Images to IPFS](#phase-5-upload-images-to-ipfs)
8. [Phase 6: Mint NFTs with Images](#phase-6-mint-nfts-with-images)
9. [Phase 7: Test NFT Transfers](#phase-7-test-nft-transfers)
10. [Phase 8: Verify on HashScan](#phase-8-verify-on-hashscan)
11. [Advanced Features](#advanced-features)
12. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- **Node.js**: v18 or higher
- **npm**: v8 or higher
- **TypeScript**: Installed globally or via project

### Required Accounts
1. **Hedera Testnet Account**
   - Get free testnet HBAR from: https://portal.hedera.com/
   - You'll need: Account ID and Private Key

2. **Pinata Account** (for IPFS)
   - Sign up at: https://pinata.cloud/
   - Free tier is sufficient
   - You'll need: JWT token

### Knowledge Required
- Basic command line usage
- Basic understanding of NFTs
- Familiarity with blockchain concepts (helpful but not required)

---

## Initial Setup

### Step 1: Clone/Navigate to Project

```bash
cd /Users/user/Documents/deralinks/hedera-setup
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs:
- `@hashgraph/sdk` - Hedera SDK
- `pinata` - IPFS uploads
- `dotenv` - Environment variables
- TypeScript and utilities

### Step 3: Configure Environment Variables

Create a `.env` file in the project root:

```bash
# Hedera Testnet Configuration
OPERATOR_ID=0.0.XXXXXXX          # Your Hedera testnet account ID
OPERATOR_PRIVATE_KEY=302e...     # Your Hedera testnet private key
HEDERA_NETWORK=testnet

# Pinata Configuration (for IPFS)
PINATA_JWT=eyJhbG...              # Your Pinata JWT token
```

**How to get these:**

#### Hedera Testnet Account:
1. Go to https://portal.hedera.com/
2. Create account or login
3. Get free testnet HBAR
4. Copy your Account ID and Private Key

#### Pinata JWT:
1. Sign up at https://pinata.cloud/
2. Go to API Keys section
3. Create new key with **Admin** permissions
4. Copy the JWT token

### Step 4: Verify Setup

```bash
# Test connection to Hedera
npm run setup:accounts -- --test
```

---

## Phase 1: Create Hedera Accounts

NFT collections need several specialized accounts:

### What Gets Created
1. **Treasury Account** - Holds newly minted NFTs
2. **Buyer Account** - Simulates customer purchases
3. **Seller Account** - Simulates property owners

### Run the Script

```bash
npm run setup:accounts
```

### Expected Output

```
🚀 Creating Hedera Accounts
✅ Connected to Hedera Testnet
📋 Operator: 0.0.7144121

Creating accounts...
   ✅ Treasury: 0.0.7127393
   ✅ Buyer: 0.0.7127395
   ✅ Seller: 0.0.7127397

💾 Accounts saved to: output/accounts.json
```

### What Happened
- Created 3 new accounts on Hedera testnet
- Each funded with initial HBAR
- Keys and IDs saved to `output/accounts.json`

---

## Phase 2: Create HCS Topics

Hedera Consensus Service (HCS) topics are used for recording property events and transactions.

### What Gets Created
1. **Property Events Topic** - Records property-related events
2. **Transactions Topic** - Records NFT transactions

### Run the Script

```bash
npm run setup:topics
```

### Expected Output

```
🚀 Creating HCS Topics
✅ Connected to Hedera Testnet

Creating topics...
   ✅ Property Events: 0.0.7127399
   ✅ Transactions: 0.0.7127401

💾 Topics saved to: output/topics.json
```

### What Happened
- Created 2 HCS topics on Hedera
- Topics can be used for transparent event logging
- IDs saved to `output/topics.json`

---

## Phase 3: Create NFT Collections

Now create the actual NFT collections (tokens).

### What Gets Created
Three separate NFT collections:
1. **Real Estate NFTs** - Residential and commercial properties
2. **Agriculture NFTs** - Farms and agricultural land
3. **Properties NFTs** - Industrial, parking, warehouses

Each collection has:
- Unique token ID
- Treasury account (owns minted NFTs)
- Supply key (for minting)
- KYC key (for compliance)
- Custom metadata

### Run the Script

```bash
npm run setup:collections
```

### Expected Output

```
🚀 Creating NFT Collections
✅ Connected to Hedera Testnet

Creating Real Estate NFT Collection...
   ✅ Collection Created!
   📝 Token ID: 0.0.7128093
   🔑 Supply Key: 302e020100300506...

Creating Agriculture NFT Collection...
   ✅ Collection Created!
   📝 Token ID: 0.0.7128095

Creating Properties NFT Collection...
   ✅ Collection Created!
   📝 Token ID: 0.0.7128101

💾 Collections saved to: output/collections.json
```

### What Happened
- Created 3 NFT collections on Hedera
- Each collection is a separate token
- Collections are empty (no NFTs minted yet)
- Treasury owns the collections
- Supply and KYC keys saved for later use

---

## Phase 4: Prepare Custom Images

Before minting, you need images for your NFTs.

### Image Requirements

**Technical Specs:**
- **Format**: JPG, PNG, or WebP
- **Size**: 1000x1000px to 2000x2000px (square recommended)
- **File Size**: Under 10MB each (smaller is better)
- **Quality**: High resolution, clear, professional

### Property List & Image Names

You need **6 images total**, named exactly as shown:

#### Real Estate Collection
- `RE-001.jpg` - Luxury Villa in Lekki, Lagos
- `RE-002.jpg` - Commercial Office Building, Accra

#### Agriculture Collection
- `AG-001.jpg` - Organic Coffee Farm, Yirgacheffe
- `AG-002.jpg` - Cocoa Plantation, Ashanti Region

#### Properties Collection
- `PROP-001.jpg` - Logistics Warehouse, Durban Port
- `PROP-002.jpg` - Multi-level Parking Garage, Cape Town CBD

### Where to Get Images

**Option 1: Free Stock Photos**
- [Unsplash](https://unsplash.com/) - Search: "luxury villa", "office building", "coffee farm", etc.
- [Pexels](https://pexels.com/) - High quality, free commercial use
- [Pixabay](https://pixabay.com/) - Free images and vectors

**Option 2: AI Generated**
- Midjourney, DALL-E, Stable Diffusion
- Use prompts based on property descriptions

**Option 3: Your Own Photos**
- Best for authenticity
- Ensure you have rights to use them

**Option 4: Licensed Stock Images**
- Shutterstock, Getty Images, iStock
- Purchase commercial licenses

### Download & Prepare Images

1. **Download 6 images** matching the property types
2. **Resize if needed** (1500x1500px is ideal)
3. **Optimize file size** (use TinyPNG or Squoosh)
4. **Rename exactly** as shown above

### Place Images in Folders

```bash
# Navigate to project
cd /Users/user/Documents/deralinks/hedera-setup

# Copy/move your images to correct folders
cp ~/Downloads/villa.jpg assets/images/real-estate/RE-001.jpg
cp ~/Downloads/office.jpg assets/images/real-estate/RE-002.jpg
cp ~/Downloads/coffee-farm.jpg assets/images/agriculture/AG-001.jpg
cp ~/Downloads/cocoa-farm.jpg assets/images/agriculture/AG-002.jpg
cp ~/Downloads/warehouse.jpg assets/images/properties/PROP-001.jpg
cp ~/Downloads/parking.jpg assets/images/properties/PROP-002.jpg
```

### Verify Images Are In Place

```bash
ls -l assets/images/real-estate/
ls -l assets/images/agriculture/
ls -l assets/images/properties/
```

You should see your image files listed.

---

## Phase 5: Upload Images to IPFS

IPFS (InterPlanetary File System) provides decentralized storage for NFT images and metadata.

### What This Does
1. Uploads each image to IPFS (via Pinata)
2. Gets a unique CID (Content Identifier) for each image
3. Creates NFT metadata JSON files
4. Uploads metadata to IPFS
5. Saves all CIDs to `output/ipfs-cids.json`

### Run the Upload Script

```bash
npm run upload:ipfs
```

### Expected Output

```
🚀 Uploading Property Assets to IPFS
============================================================

📍 Real Estate Properties:

   Processing: Luxury Villa in Lekki, Lagos
   ✅ Found image: RE-001.jpg
   📤 Uploading image to IPFS...
   📤 Uploading metadata...
   ✅ Complete!
   📦 Image CID: bafkreihyjuiej3hx46sdibpy6bd7r254hmj4z2g5vl56zdvoybisq47wza
   📦 Metadata CID: bafkreihyzr4rzldnhspocftuxxefnrpiwxwp4jmvmhjdtm224vdevib75e

   Processing: Commercial Office Building, Accra
   ✅ Found image: RE-002.jpg
   📤 Uploading image to IPFS...
   📤 Uploading metadata...
   ✅ Complete!

🌾 Agriculture Properties:
   [Similar output for AG-001 and AG-002]

🏭 Properties (Industrial/Commercial):
   [Similar output for PROP-001 and PROP-002]

============================================================
✅ Upload Complete!

📄 Results saved to: output/ipfs-cids.json

Summary:
   Total properties: 6
   Images uploaded: 6
   Metadata files uploaded: 6
```

### What Happened
- Each image uploaded to IPFS
- Each image gets unique CID (like a permanent address)
- Metadata JSON created with image links and property details
- Metadata also uploaded to IPFS
- All CIDs saved to `output/ipfs-cids.json`

### Verify Upload

Check the generated file:

```bash
cat output/ipfs-cids.json
```

You'll see CIDs for all images and metadata.

### View Images on IPFS

You can view your images right now:

```
https://gateway.pinata.cloud/ipfs/YOUR_IMAGE_CID
```

Replace `YOUR_IMAGE_CID` with the CID from the output.

---

## Phase 6: Mint NFTs with Images

Now mint the actual NFTs using the IPFS metadata.

### What This Does
1. Reads real IPFS CIDs from `output/ipfs-cids.json`
2. Mints **5 NFTs per property** (30 total)
3. Each NFT links to the real IPFS metadata
4. NFTs sent to treasury account

### Why 5 NFTs per Property?
Each property is "fractionalized" into 5 shares:
- 1 NFT = 20% ownership of the property
- Users can buy 1 or more NFTs (shares)
- This enables fractional real estate ownership

### Run the Mint Script

```bash
npm run remint:ipfs
```

### Expected Output

```
🔄 Re-minting NFTs with Real IPFS CIDs
============================================================
✅ Connected to Hedera Testnet
📋 Operator: 0.0.7144121

🏠 Minting Real Estate NFTs with real IPFS...

   Minting: Luxury Villa in Lekki, Lagos
   Metadata CID: bafkreihyzr4rzldnhspocftuxxefnrpiwxwp4jmvmhjdtm224vdevib75e
   Image CID: bafkreihyjuiej3hx46sdibpy6bd7r254hmj4z2g5vl56zdvoybisq47wza
   ✅ Minted serial #1
   ✅ Minted serial #2
   ✅ Minted serial #3
   ✅ Minted serial #4
   ✅ Minted serial #5
   🎉 Minted 5 NFTs for Luxury Villa in Lekki, Lagos

   Minting: Commercial Office Building, Accra
   [Similar output, serials #6-10]

🌾 Minting Agriculture NFTs with real IPFS...
   [Similar output for coffee and cocoa farms]

🏭 Minting Properties NFTs with real IPFS...
   [Similar output for warehouse and parking]

============================================================
✅ Re-minting Complete!

📄 Results saved to: output/nfts-with-ipfs.json

📊 Summary:
   Total NFTs minted: 30
   Real Estate: 2 properties (10 NFTs)
   Agriculture: 2 properties (10 NFTs)
   Properties: 2 properties (10 NFTs)

🎨 These NFTs have real IPFS metadata!
   Images will display correctly on HashScan and in wallets.

🔍 View collections on HashScan:
   Real Estate: https://hashscan.io/testnet/token/0.0.7128093
   Agriculture: https://hashscan.io/testnet/token/0.0.7128095
   Properties: https://hashscan.io/testnet/token/0.0.7128101
```

### What Happened
- 30 NFTs created across 3 collections
- Each NFT has:
  - Unique serial number
  - Link to IPFS metadata
  - Property information
  - Custom attributes
- All NFTs currently owned by treasury account
- Images will display on HashScan and wallets

### NFT Serial Numbers

**Real Estate Collection (0.0.7128093):**
- Luxury Villa: Serials 1-5
- Office Building: Serials 6-10

**Agriculture Collection (0.0.7128095):**
- Coffee Farm: Serials 1-5
- Cocoa Plantation: Serials 6-10

**Properties Collection (0.0.7128101):**
- Warehouse: Serials 1-5
- Parking Garage: Serials 6-10

---

## Phase 7: Test NFT Transfers

Test transferring NFTs to buyers.

### Single NFT Transfer

Transfer one NFT to your operator account:

```bash
npm run test:transfer 0.0.YOUR_ACCOUNT_ID
```

Replace `0.0.YOUR_ACCOUNT_ID` with your Hedera account ID (from .env OPERATOR_ID).

### Expected Output

```
🚀 Testing NFT Transfer
============================================================
✅ Connected to Hedera Testnet

📋 Transfer Details:
   NFT Collection: 0.0.7128095 (Agriculture)
   Property: Organic Coffee Farm, Yirgacheffe
   Serial Number: 1
   From: 0.0.7127393 (Treasury)
   To: 0.0.7144121

📎 Step 1: Token Association
   ✅ Token already associated!

✅ Step 2: Granting KYC to recipient...
   ✅ KYC granted!

📤 Step 3: Transferring NFT...
   ✅ Transfer successful!

============================================================
✅ NFT Transfer Test Complete!

🔗 View on HashScan:
   Token: https://hashscan.io/testnet/token/0.0.7128095
   Recipient Account: https://hashscan.io/testnet/account/0.0.7144121
   Transaction: https://hashscan.io/testnet/transaction/...
```

### Batch Transfer (Multiple NFTs)

Transfer multiple NFTs in one transaction:

```bash
npm run batch:transfer
```

This script transfers 3 NFTs from the same collection in a single atomic transaction.

### What Happened
- NFT ownership transferred from treasury to recipient
- Recipient account associated with token (if needed)
- KYC granted to recipient
- Transaction recorded on Hedera blockchain
- Can verify on HashScan

---

## Phase 8: Verify on HashScan

HashScan is Hedera's blockchain explorer.

### View Your Collections

**Real Estate Collection:**
```
https://hashscan.io/testnet/token/0.0.7128093
```

**Agriculture Collection:**
```
https://hashscan.io/testnet/token/0.0.7128095
```

**Properties Collection:**
```
https://hashscan.io/testnet/token/0.0.7128101
```

### What to Check

1. **Collection Details**
   - Token name and symbol
   - Total supply (should show 10 for each)
   - Treasury account
   - Token type: NON_FUNGIBLE_UNIQUE

2. **NFT Images**
   - Click on "NFTs" tab
   - Click on individual serial numbers
   - **Images should display!**
   - Metadata should show property details

3. **NFT Metadata**
   - Property name
   - Description
   - Attributes (location, type, value, etc.)
   - Image URL (ipfs://...)

4. **Ownership**
   - Initially all NFTs owned by treasury
   - After transfers, check recipient accounts

### View Your Account

```
https://hashscan.io/testnet/account/0.0.YOUR_ACCOUNT_ID
```

Check:
- Token balances
- NFTs owned
- Recent transactions

### View Specific Transaction

Click on any transaction hash to see:
- Transaction type
- Sender and receiver
- NFT serials transferred
- Timestamp
- Status (SUCCESS)

---

## Advanced Features

### Batch Transfer for Marketplace

The batch transfer function allows buying multiple NFTs in one transaction:

```typescript
// Example: User buys 3 shares of coffee farm
npm run batch:transfer

// Transfers:
// - Coffee Farm Serial #1
// - Coffee Farm Serial #2
// - Coffee Farm Serial #3
// All in one atomic transaction
```

**Benefits:**
- Lower fees (one transaction instead of three)
- Atomic operation (all or nothing)
- Faster execution
- Better user experience

### Reusable Utilities

Located in `scripts/utils/`:
- `client.ts` - Hedera client setup
- `ipfs.ts` - IPFS upload functions
- `nft-transfers.ts` - Transfer utilities
- `helpers.ts` - Common functions

Use these in your backend API!

### Adding More Properties

To add more properties:

1. **Edit** `scripts/06-upload-to-ipfs.ts`
2. **Add** new property to the `properties` object:
   ```typescript
   {
     id: "RE-003",
     name: "Beach Resort, Zanzibar",
     description: "...",
     location: "...",
     type: "Resort",
     attributes: [...]
   }
   ```
3. **Add image** `assets/images/real-estate/RE-003.jpg`
4. **Re-run** `npm run upload:ipfs`
5. **Re-run** `npm run remint:ipfs`

---

## Troubleshooting

### Common Issues

#### 1. "INSUFFICIENT_TX_FEE" or "INSUFFICIENT_PAYER_BALANCE"

**Problem**: Not enough HBAR in operator account

**Solution**:
```bash
# Get more testnet HBAR
https://portal.hedera.com/
```

#### 2. "INVALID_SIGNATURE"

**Problem**: Wrong private key or missing key

**Solution**:
- Check `.env` file has correct OPERATOR_PRIVATE_KEY
- Ensure key matches OPERATOR_ID
- Key should start with `302e020100300506...`

#### 3. "Image not found" during upload

**Problem**: Image file missing or wrong name

**Solution**:
- Check filename exactly matches: `RE-001.jpg` (case-sensitive)
- Check file is in correct folder: `assets/images/real-estate/`
- Check file extension (must be .jpg, .jpeg, .png, or .webp)

#### 4. Images don't show on HashScan

**Problem**: IPFS propagation delay or incorrect CIDs

**Solution**:
- Wait 5-10 minutes for IPFS to propagate
- Clear browser cache
- Check CIDs in `output/ipfs-cids.json`
- Verify images on Pinata: https://app.pinata.cloud/

#### 5. "TOKEN_NOT_ASSOCIATED_TO_ACCOUNT"

**Problem**: Recipient hasn't associated with token

**Solution**:
- If you control the account: Script will auto-associate
- If external account: They must manually associate via HashScan

#### 6. TypeScript Compilation Errors

**Problem**: Missing dependencies or TypeScript issues

**Solution**:
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

#### 7. Pinata Upload Fails

**Problem**: Invalid JWT or rate limits

**Solution**:
- Check PINATA_JWT in `.env` is correct
- Ensure Pinata API key has **Admin** permissions
- Check Pinata dashboard for rate limits
- Free tier: 100 GB storage, 100 requests/month

---

## Complete Command Reference

```bash
# Setup Phase
npm run setup:accounts       # Create Hedera accounts
npm run setup:topics         # Create HCS topics
npm run setup:collections    # Create NFT collections

# IPFS & Minting Phase
npm run test:ipfs           # Test Pinata connection
npm run upload:ipfs         # Upload images to IPFS
npm run remint:ipfs         # Mint NFTs with real images

# Transfer Phase
npm run test:transfer <ACCOUNT_ID>   # Transfer single NFT
npm run batch:transfer               # Batch transfer multiple NFTs

# Utility
npm run build               # Compile TypeScript
npm test                    # Run tests
```

---

## File Structure

```
hedera-setup/
├── .env                          # Environment variables (SECRETS!)
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript config
│
├── assets/
│   └── images/
│       ├── real-estate/          # Real estate images
│       ├── agriculture/          # Agriculture images
│       └── properties/           # Properties images
│
├── output/                       # Generated files
│   ├── accounts.json             # Created accounts
│   ├── topics.json               # Created topics
│   ├── collections.json          # Created collections
│   ├── ipfs-cids.json            # IPFS CIDs
│   └── nfts-with-ipfs.json       # Minted NFTs
│
├── scripts/
│   ├── 01-create-accounts.ts     # Phase 1
│   ├── 02-create-topics.ts       # Phase 2
│   ├── 03-create-collections.ts  # Phase 3
│   ├── 06-upload-to-ipfs.ts      # Phase 5
│   ├── 08-remint-with-real-ipfs.ts # Phase 6
│   ├── 05-test-transfer.ts       # Single transfer
│   ├── 07-batch-transfer-nfts.ts # Batch transfer
│   │
│   └── utils/
│       ├── client.ts             # Hedera client
│       ├── ipfs.ts               # IPFS functions
│       ├── nft-transfers.ts      # Transfer utilities
│       └── helpers.ts            # Common helpers
│
└── docs/
    ├── COMPLETE-NFT-GUIDE.md     # This file!
    ├── CUSTOM-IMAGES-QUICKSTART.md
    └── TODO.md
```

---

## Summary: Complete Process

1. ✅ **Setup** - Install dependencies, configure .env
2. ✅ **Accounts** - Create treasury, buyer, seller accounts
3. ✅ **Topics** - Create HCS topics for events
4. ✅ **Collections** - Create 3 NFT collections
5. ✅ **Images** - Prepare 6 custom property images
6. ✅ **IPFS** - Upload images and metadata to IPFS
7. ✅ **Mint** - Mint 30 NFTs with real IPFS metadata
8. ✅ **Transfer** - Test single and batch transfers
9. ✅ **Verify** - Check everything on HashScan

**Total Time**: 30-60 minutes (depending on image preparation)

**Cost**: FREE on testnet! (Mainnet would cost ~$5-10 in HBAR)

---

## Next Steps

### For Development
- Integrate with frontend (React, Next.js)
- Build marketplace UI
- Add user authentication
- Implement purchase flows
- Add property management features

### For Production (Mainnet)
1. Change `HEDERA_NETWORK=mainnet` in `.env`
2. Use mainnet account and HBAR
3. All scripts work the same!
4. Consider:
   - Real property valuations
   - Legal compliance
   - KYC/AML requirements
   - Escrow services
   - Property management

### Additional Features
- Add more properties
- Create more NFTs per property
- Implement royalties
- Add secondary market
- Property updates/events via HCS
- Integration with property management systems

---

## Resources

**Hedera Documentation:**
- https://docs.hedera.com/
- https://docs.hedera.com/hedera/sdks-and-apis/sdks

**Tools:**
- HashScan Explorer: https://hashscan.io/
- Hedera Portal: https://portal.hedera.com/
- Pinata Dashboard: https://app.pinata.cloud/

**Community:**
- Hedera Discord: https://discord.gg/hedera
- Hedera GitHub: https://github.com/hashgraph

---

## Congratulations! 🎉

You've successfully created NFT collections with custom images on Hedera!

Your NFTs:
- Have real IPFS images that display on HashScan
- Are fully transferable
- Support fractional ownership
- Are ready for marketplace integration

**Questions?** Check the troubleshooting section or refer to the detailed documentation.
