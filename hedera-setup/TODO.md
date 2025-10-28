# Hedera Setup - Complete TODO List

**Project:** DeraLinks NFT RWA Platform - Hedera Blockchain Setup

**NFT Model:** Fractional ownership via Non-Fungible Token (NFT) collections
- Each property/asset = One NFT Collection (Hedera HTS Non-Fungible)
- Supply set at creation (e.g., 10,000 NFTs with serial numbers 1-10,000)
- Each NFT represents one share of the property
- Investors own specific NFT serial numbers
- Voting power = number of NFTs owned per property

**NFT Categories:** Real Estate, Agriculture, Properties

**AI/Analytics:** Automated valuation, continuous scoring, scenario analysis

**Network:** Hedera Testnet (Development) → Mainnet (Production)

**Wallet Integration:** HashPack

**Keep it Simple**

---

## 📊 Progress Summary

**Current Status:** Phase 6E Complete - Backend API with 40 Endpoints + Full Documentation!

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 | ✅ DONE | Initial Project Setup |
| Phase 2 | ✅ DONE | Core Utility Functions |
| Phase 3 | ✅ DONE | Account Creation (Treasury, Fee Collector, Admin) |
| Phase 4 | ✅ DONE | HCS Topics Creation (26 topics) |
| Phase 5 | ✅ DONE | NFT Collections Creation (3 collections) |
| Phase 6 | ✅ DONE | NFT Minting, Transfer Testing (30 NFTs) & IPFS Integration (Pinata) |
| Phase 6A | ⏳ | AI/Analytics Integration |
| **Phase 6B** | ✅ DONE | **Compliance & KYC (Verification NFTs Created)** |
| **Phase 6C** | ✅ DONE | **Database & Backend API (33 Endpoints Operational)** |
| **Phase 6D** | ✅ DONE | **DAO Governance (40 Endpoints Total)** |
| **Phase 6E** | ✅ DONE | **API Documentation (3 comprehensive docs created)** |
| Phase 7 | ⏳ | Smart Contracts (Optional) |
| Phase 8-9 | ⏳ | Configuration & Documentation |
| Phase 10 | ⏳ | Frontend - NFT Management, **Investor Dashboard, Property Details with AI, DAO UI, Marketplace** |
| Phase 11 | ⏳ | Frontend Integration & Testing |
| Phase 12 | ⏳ | Production Deployment (Mainnet) |

**Files Created:**
- ✅ `scripts/utils/client.ts` - Hedera client utility
- ✅ `scripts/utils/helpers.ts` - Helper functions
- ✅ `scripts/utils/ipfs.ts` - IPFS/Pinata upload utilities
- ✅ `scripts/utils/verification-checker.ts` - NFT verification checker utility (Phase 6B)
- ✅ `scripts/test-connection.ts` - Connection test
- ✅ `scripts/test-ipfs.ts` - IPFS/Pinata connection test
- ✅ `scripts/01-create-accounts.ts` - Account creation script
- ✅ `scripts/02-create-topics.ts` - HCS topics creation script
- ✅ `scripts/03-create-collections.ts` - NFT collections creation script
- ✅ `scripts/04-mint-nfts.ts` - NFT minting script
- ✅ `scripts/05-test-transfer.ts` - NFT transfer test script
- ✅ `scripts/06-upload-to-ipfs.ts` - IPFS asset upload script
- ✅ `scripts/07-batch-transfer-nfts.ts` - Batch NFT transfer script
- ✅ `scripts/08-remint-with-real-ipfs.ts` - Re-mint with real IPFS metadata
- ✅ `scripts/09-create-verification-collection.ts` - Create Verification NFT collection (Phase 6B)
- ✅ `scripts/10-mint-verification-nft.ts` - Mint verification NFTs after KYC (Phase 6B)
- ✅ `scripts/11-revoke-verification.ts` - Revoke/freeze verification NFTs (Phase 6B)
- ✅ `.gitignore` (root + local) - Security protection
- ✅ `IPFS-SETUP.md` - IPFS/Pinata integration guide
- ✅ `DECENTRALIZED-KYC-STRATEGY.md` - KYC architecture options (Phase 6B)
- ✅ `KYC-IMPLEMENTATION-GUIDE.md` - KYC implementation guide (Phase 6B)
- ✅ `KYC-PURPOSE-AND-COMPLIANCE.md` - Compliance philosophy (Phase 6B)
- ✅ `NFT-BASED-KYC-MODEL.md` - NFT-based verification model (Phase 6B)
- ✅ `VERIFICATION-TIERS.md` - Who needs verification (Phase 6B)
- ✅ `PHASE-6B-QUICKSTART.md` - Quick start guide (Phase 6B)
- ✅ `PHASE-6B-SUMMARY.md` - Implementation summary (Phase 6B)
- ✅ `../backend/API-DOCUMENTATION.md` - Complete API documentation (Phase 6E)
- ✅ `../backend/API-QUICK-REFERENCE.md` - Quick reference guide (Phase 6E)
- ✅ `../backend/POSTMAN-COLLECTION.json` - Postman collection (Phase 6E)
- ✅ `output/accounts.json` - Platform accounts (gitignored)
- ✅ `output/topics.json` - HCS topic IDs (gitignored)
- ✅ `output/collections.json` - NFT collections (gitignored)
- ✅ `output/nfts.json` - Minted NFTs inventory (gitignored)
- ✅ `output/ipfs-cids.json` - IPFS CIDs for all uploaded assets (gitignored)
- ✅ `assets/images/` - Placeholder property images

**Platform Accounts:**
- **Operator:** 0.0.7125108 | **Balance:** ~50 HBAR
- **Treasury:** 0.0.7127072 | **Balance:** 20 HBAR ✅
- **Fee Collector:** 0.0.7127073 | **Balance:** 10 HBAR ✅
- **Admin:** 0.0.7127074 | **Balance:** 20 HBAR ✅

**NFT Collections:**
- **Real Estate:** 0.0.7128093 (5% royalty) ✅
- **Agriculture:** 0.0.7128095 (3% royalty) ✅
- **Properties:** 0.0.7128101 (4% royalty) ✅

**Verification NFT Collections (Soulbound):**
- **Property Owner Verification:** 0.0.7152947 (DLPOWNER) ✅
- **Investor Verification:** 0.0.7152949 (DLINVEST) ✅
- **Accredited Investor Verification:** 0.0.7152952 (DLACCRED) ✅

**HCS Topics:** 26 total (view in `output/topics.json`)
- Global: 4 topics ✅
- Real Estate: 6 topics ✅
- Agriculture: 6 topics ✅
- Properties: 6 topics ✅
- Marketplace: 4 topics ✅

**NFTs Minted:** 30 total across 6 sample properties
- Real Estate: 10 NFTs (2 properties) ✅
- Agriculture: 10 NFTs (2 farms) ✅
- Properties: 10 NFTs (2 properties) ✅

---

## ⚠️ IMPORTANT: We Start on Testnet

**All development and testing will be done on Hedera Testnet first:**
- ✅ Free testnet HBAR from https://portal.hedera.com
- ✅ Zero cost for testing and development
- ✅ Full Hedera functionality (NFTs, HCS, all services)
- ✅ HashPack wallet supports testnet
- ✅ Same code works on mainnet when ready
- ✅ View everything on HashScan Testnet: https://hashscan.io/testnet

**Only after thorough testing will we deploy to mainnet (Phase 12)**

---

## Phase 1: Initial Project Setup ✅ COMPLETED

### 1.1 Environment Configuration (TESTNET) ✅
- [x] Create FREE Hedera testnet account at https://portal.hedera.com
- [x] Receive free testnet HBAR (500 HBAR) from portal
- [x] Copy `OPERATOR_ID` and `OPERATOR_KEY` from portal
- [x] Configure `.env` file with testnet operator credentials
- [x] Set `HEDERA_NETWORK=testnet` in `.env`
- [x] Verify operator account has sufficient testnet HBAR balance (100 HBAR)
- [x] Test connection to Hedera testnet
- [x] Confirm HashScan testnet access: https://hashscan.io/testnet
- **Account:** 0.0.7125108 | **Balance:** 100 HBAR ✅

### 1.2 Dependencies Installation ✅
- [x] Install core dependencies (`@hashgraph/sdk`, `dotenv`)
- [x] Install development dependencies (`typescript`, `tsx`, `@types/node`)
- [x] Verify all packages are installed correctly
- [x] Set up TypeScript configuration for scripts

### 1.3 Project Structure ✅
- [x] Create `scripts/` directory for setup scripts
- [x] Create `scripts/utils/` directory for utility functions
- [x] Create `contracts/` directory for smart contracts (if needed)
- [x] Create `output/` directory for generated configuration files
- [x] Configure `.gitignore` to protect sensitive data (root + hedera-setup)

---

## Phase 2: Core Utility Functions ✅ COMPLETED

### 2.1 Client Configuration ✅
- [x] Create Hedera client initialization utility
- [x] Configure client for TESTNET network (`Client.forTestnet()`)
- [x] Implement network selection logic (testnet/mainnet/previewnet)
- [x] Configure operator account settings with testnet credentials
- [x] Set up transaction fee limits for testnet
- [x] Configure timeout settings
- [x] Verify connection to testnet nodes
- **File:** `scripts/utils/client.ts` ✅

### 2.2 Helper Functions ✅
- [x] Create output directory management functions
- [x] Implement file save/load utilities for JSON data
- [x] Create formatting helpers (HBAR amounts, timestamps)
- [x] Implement delay/sleep utilities for rate limiting
- [x] Add error handling and logging utilities
- **File:** `scripts/utils/helpers.ts` ✅

### 2.3 Test & Verification ✅
- [x] Create connection test script
- [x] Verify testnet connection successful
- [x] Confirm operator balance (100 HBAR)
- **Script:** `npm run test:connection` ✅

---

## Phase 3: Account Creation on Testnet (Script 1) ✅ COMPLETED

### 3.1 Treasury Account (Testnet) ✅
- [x] Generate new ED25519 key pair for treasury
- [x] Create testnet account with initial HBAR balance (20 testnet HBAR)
- [x] Enable unlimited automatic token associations
- [x] Set account memo as "DeraLinks - Treasury - TESTNET"
- [x] Save account ID and private key securely
- [x] Verify account on HashScan testnet
- **Account:** 0.0.7127072 | **Balance:** 20 HBAR ✅
- **Purpose:** Holds all tokens initially, platform treasury

### 3.2 Fee Collector Account (Testnet) ✅
- [x] Generate new ED25519 key pair for fee collector
- [x] Create testnet account with initial HBAR balance (10 testnet HBAR)
- [x] Enable unlimited automatic token associations
- [x] Set account memo as "DeraLinks - Fee Collector - TESTNET"
- [x] Save account ID and private key securely
- [x] Verify account on HashScan testnet
- **Account:** 0.0.7127073 | **Balance:** 10 HBAR ✅
- **Purpose:** Receives all platform fees and royalties

### 3.3 Admin Account (Testnet) ✅
- [x] Generate new ED25519 key pair for admin
- [x] Create testnet account with initial HBAR balance (20 testnet HBAR)
- [x] Enable unlimited automatic token associations
- [x] Set account memo as "DeraLinks - Admin - TESTNET"
- [x] Save account ID and private key securely
- [x] Verify account on HashScan testnet
- **Account:** 0.0.7127074 | **Balance:** 20 HBAR ✅
- **Purpose:** Platform administrator, manages NFTs and topics

### 3.4 Account Data Management ✅
- [x] Save all testnet account data to `output/accounts.json`
- [x] Verify all accounts are created successfully on testnet
- [x] Check all accounts on HashScan: https://hashscan.io/testnet
- [x] Document security warnings for private key storage
- **Script:** `npm run setup:accounts` ✅
- **File:** `scripts/01-create-accounts.ts` ✅
- **Note:** These are TESTNET accounts - will create new ones for mainnet later

---

## Phase 4: HCS Topics Creation on Testnet (Script 2) ✅ COMPLETED

### 4.1 Global Topics ✅
- [x] Create **User Profiles & KYC** topic
  - **Topic ID:** 0.0.7127453 ✅
- [x] Create **System Audit Trail** topic
  - **Topic ID:** 0.0.7127456 ✅
- [x] Create **Document Registry** topic
  - **Topic ID:** 0.0.7127458 ✅
- [x] Create **Platform Notifications** topic
  - **Topic ID:** 0.0.7127459 ✅

### 4.2 Real Estate NFT Topics ✅
- [x] Create **Real Estate - NFT Metadata** topic
  - **Topic ID:** 0.0.7127460 ✅
- [x] Create **Real Estate - Property Events** topic
  - **Topic ID:** 0.0.7127461 ✅
- [x] Create **Real Estate - Financial Data** topic
  - **Topic ID:** 0.0.7127464 ✅
- [x] Create **Real Estate - Rental Income** topic
  - **Topic ID:** 0.0.7127466 ✅
- [x] Create **Real Estate - Distributions** topic
  - **Topic ID:** 0.0.7127468 ✅
- [x] Create **Real Estate - Maintenance Records** topic
  - **Topic ID:** 0.0.7127469 ✅

### 4.3 Agriculture NFT Topics ✅
- [x] Create **Agriculture - NFT Metadata** topic
  - **Topic ID:** 0.0.7127470 ✅
- [x] Create **Agriculture - Harvest Records** topic
  - **Topic ID:** 0.0.7127471 ✅
- [x] Create **Agriculture - Crop Health Updates** topic
  - **Topic ID:** 0.0.7127472 ✅
- [x] Create **Agriculture - Weather Data** topic
  - **Topic ID:** 0.0.7127474 ✅
- [x] Create **Agriculture - Revenue Distribution** topic
  - **Topic ID:** 0.0.7127476 ✅
- [x] Create **Agriculture - Certifications** topic
  - **Topic ID:** 0.0.7127477 ✅

### 4.4 Properties NFT Topics ✅
- [x] Create **Properties - NFT Metadata** topic
  - **Topic ID:** 0.0.7127478 ✅
- [x] Create **Properties - Asset Events** topic
  - **Topic ID:** 0.0.7127479 ✅
- [x] Create **Properties - Valuations** topic
  - **Topic ID:** 0.0.7127480 ✅
- [x] Create **Properties - Ownership Transfers** topic
  - **Topic ID:** 0.0.7127482 ✅
- [x] Create **Properties - Legal Documents** topic
  - **Topic ID:** 0.0.7127485 ✅
- [x] Create **Properties - Income Tracking** topic
  - **Topic ID:** 0.0.7127486 ✅

### 4.5 Marketplace Topics ✅
- [x] Create **Marketplace - Listings** topic
  - **Topic ID:** 0.0.7127487 ✅
- [x] Create **Marketplace - Offers** topic
  - **Topic ID:** 0.0.7127489 ✅
- [x] Create **Marketplace - Transactions** topic
  - **Topic ID:** 0.0.7127490 ✅
- [x] Create **Marketplace - Price History** topic
  - **Topic ID:** 0.0.7127491 ✅

### 4.6 Topic Configuration ✅
- [x] Simplified approach: Operator can submit messages (no admin/submit keys for MVP)
- [x] Configure topic memos with descriptive "DeraLinks" branded names
- [x] Save all testnet topic IDs to `output/topics.json`
- [x] Verify all topics are accessible and functional on testnet
- **Script:** `npm run setup:topics` ✅
- **File:** `scripts/02-create-topics.ts` ✅
- **Total Topics Created:** 26 (4 Global + 6 Real Estate + 6 Agriculture + 6 Properties + 4 Marketplace)
- **Note:** These are TESTNET topics - will create new ones for mainnet later

---

## Phase 5: NFT Collections Creation on Testnet (Script 3) ✅ COMPLETED

**Note:** Creating 3 NFT collections for fractional ownership model
- Each NFT collection represents a category (Real Estate, Agriculture, Properties)
- Each NFT minted = one share of a specific property/asset
- NFT metadata identifies which property the NFT belongs to
- Example: Property with 10,000 shares = Mint 10,000 NFTs with serial numbers 1-10,000

### 5.1 Real Estate NFT Collection ✅
- [x] Create NFT collection with name "Real Estate NFTs"
- [x] Set token symbol as "REALESTATE"
- [x] Configure as **Non-Fungible Unique token** type
- [x] Set treasury account as initial holder
- [x] Configure **infinite supply** type for flexibility
- [x] Add Real Estate metadata topic IDs to token memo (0.0.7127460)
- [x] Set admin key for collection management
- [x] Set supply key for minting new NFTs
- [x] Set KYC key for compliance and verification
- [x] Set freeze key for regulatory controls
- [x] Set pause key for emergency stops
- [x] Set wipe key for compliance requirements
- [x] Configure **5% royalty fee** to fee collector account
- [x] Set fallback fee of 5 HBAR for non-HBAR trades
- [x] Save collection ID to `output/collections.json`
- **Token ID:** 0.0.7128093 ✅
- **View on HashScan:** https://hashscan.io/testnet/token/0.0.7128093
- **Use Cases:** Residential properties, commercial buildings, land parcels

### 5.2 Agriculture NFT Collection ✅
- [x] Create NFT collection with name "Agriculture NFTs"
- [x] Set token symbol as "AGRINFT"
- [x] Configure as **Non-Fungible Unique token** type
- [x] Set treasury account as initial holder
- [x] Configure **infinite supply** type for flexibility
- [x] Add Agriculture metadata topic IDs to token memo (0.0.7127470)
- [x] Set admin key for collection management
- [x] Set supply key for minting new NFTs
- [x] Set KYC key for farmer and investor verification
- [x] Set freeze key for regulatory controls
- [x] Set pause key for emergency stops
- [x] Set wipe key for compliance requirements
- [x] Configure **3% royalty fee** to fee collector account
- [x] Set fallback fee of 3 HBAR for non-HBAR trades
- [x] Save collection ID to `output/collections.json`
- **Token ID:** 0.0.7128095 ✅
- **View on HashScan:** https://hashscan.io/testnet/token/0.0.7128095
- **Use Cases:** Farmland, crop shares, livestock, agricultural equipment

### 5.3 Properties NFT Collection ✅
- [x] Create NFT collection with name "Properties NFTs"
- [x] Set token symbol as "PROPNFT"
- [x] Configure as **Non-Fungible Unique token** type
- [x] Set treasury account as initial holder
- [x] Configure **infinite supply** type for flexibility
- [x] Add Properties metadata topic IDs to token memo (0.0.7127478)
- [x] Set admin key for collection management
- [x] Set supply key for minting new NFTs
- [x] Set KYC key for compliance and verification
- [x] Set freeze key for regulatory controls
- [x] Set pause key for emergency stops
- [x] Set wipe key for compliance requirements
- [x] Configure **4% royalty fee** to fee collector account
- [x] Set fallback fee of 4 HBAR for non-HBAR trades
- [x] Save collection ID to `output/collections.json`
- **Token ID:** 0.0.7128101 ✅
- **View on HashScan:** https://hashscan.io/testnet/token/0.0.7128101
- **Use Cases:** Mixed-use properties, warehouses, industrial assets, parking lots

### 5.4 Collections Verification (Testnet) ✅
- [x] Verify all 3 collections are created successfully on testnet
- [x] View collections on HashScan testnet
- [x] Test royalty fee configuration for each collection
- [x] Verify token associations with testnet treasury account
- [x] Save all collections to `output/collections.json`
- **Script:** `npm run setup:collections` ✅
- **File:** `scripts/03-create-collections.ts` ✅
- **Total Collections Created:** 3 (Real Estate, Agriculture, Properties)
- **Note:** Collections are on TESTNET - will create new ones for mainnet

---

## Phase 6: NFT Minting & Metadata on Testnet (Script 4) ✅ COMPLETED

### 6.1 Real Estate NFT Minting ✅
- [x] Design metadata schema for real estate properties
  - Property address and location coordinates
  - Property type (residential, commercial, mixed-use)
  - Square footage and lot size
  - Number of units/rooms
  - Year built and renovation history
  - Property value and appreciation data
  - Rental income information
  - Property photos and virtual tour links
  - Legal documents (deed, title, insurance)
  - HOA information (if applicable)
- [x] Use placeholder IPFS CIDs (simplified for MVP)
- [x] Mint sample real estate NFTs
  - ✅ Luxury Villa in Lekki, Lagos (5 NFTs, serials 1-5)
  - ✅ Commercial Office Building, Accra (5 NFTs, serials 6-10)
- [x] Submit metadata to Real Estate metadata topic (0.0.7127460)
- [x] Submit initial financial data
- [x] Verify NFTs are minted to treasury account
- [x] Test NFT transfer functionality ✅

### 6.2 Agriculture NFT Minting ✅
- [x] Design metadata schema for agricultural assets
  - Farm location and total acreage
  - Crop type and planting schedule
  - Soil quality and water access
  - Equipment and infrastructure
  - Historical yield data
  - Certification status (organic, fair trade, etc.)
  - Expected revenue and profit sharing model
  - Farm photos and drone footage
  - Legal documents (land lease, permits)
  - Weather and climate data
- [x] Use placeholder IPFS CIDs (simplified for MVP)
- [x] Mint sample agriculture NFTs
  - ✅ Organic Coffee Farm, Yirgacheffe (5 NFTs, serials 1-5)
  - ✅ Cocoa Plantation, Ashanti Region (5 NFTs, serials 6-10)
- [x] Submit metadata to Agriculture metadata topic (0.0.7127470)
- [x] Submit harvest and crop data
- [x] Verify NFTs are minted to treasury account
- [x] Test NFT transfer functionality ✅

### 6.3 Properties NFT Minting ✅
- [x] Design metadata schema for general properties
  - Property address and location
  - Property category (warehouse, industrial, parking, etc.)
  - Total area and zoning information
  - Current usage and tenant information
  - Property value and assessment
  - Revenue model (lease, rental, usage fees)
  - Property photos and blueprints
  - Legal documents (permits, licenses)
  - Maintenance records
  - Environmental compliance documents
- [x] Use placeholder IPFS CIDs (simplified for MVP)
- [x] Mint sample properties NFTs
  - ✅ Logistics Warehouse, Durban Port (5 NFTs, serials 1-5)
  - ✅ Multi-level Parking Garage, Cape Town CBD (5 NFTs, serials 6-10)
- [x] Submit metadata to Properties metadata topic (0.0.7127478)
- [x] Submit valuation and income data
- [x] Verify NFTs are minted to treasury account
- [x] Test ownership transfer functionality ✅

### 6.4 Metadata Management System ✅
- [x] Create metadata schemas (JSON format)
- [x] Use placeholder IPFS CIDs (real IPFS integration for production)
- [x] Implement batch minting capabilities
- [x] Add error handling for minting failures
- [x] Save all minted NFT serial numbers to `output/nfts.json`
- [x] Create metadata templates for each NFT type ✅
- [x] Document IPFS pinning strategy (Pinata integration complete) ✅
- [x] Set up IPFS upload infrastructure with Pinata ✅

### 6.5 NFT Verification & Testing ✅
- [x] Verify all NFTs have valid metadata
- [x] Test NFT transfer between accounts
  - ✅ Auto-association with token collection
  - ✅ KYC grant to recipient
  - ✅ Transfer NFT serial #1 (Agriculture) successfully
- [x] Test HCS message submission ✅
- [x] Create NFT inventory in `output/nfts.json`
- [x] Test NFT display on Hedera mirror node (verified via HashScan)
- ⏸️ Test royalty collection on secondary sales (requires marketplace)
- [x] Verify IPFS content accessibility ✅ (Pinata integration working)

### 6.6 IPFS Integration (Pinata) ✅
- [x] Set up Pinata account and obtain API keys
- [x] Create IPFS upload utility module (`scripts/utils/ipfs.ts`)
- [x] Implement file upload functionality
- [x] Implement JSON metadata upload functionality
- [x] Implement batch upload for multiple files
- [x] Create NFT metadata generation helper
- [x] Test Pinata connection and authentication
- [x] Create upload script for property assets (`scripts/06-upload-to-ipfs.ts`)
- [x] Generate placeholder images for 6 properties
- [x] Upload all property images to IPFS
- [x] Generate and upload NFT metadata JSON files
- [x] Save all IPFS CIDs to `output/ipfs-cids.json`
- [x] Verify uploads via IPFS gateway
- [x] Create comprehensive IPFS setup documentation (`IPFS-SETUP.md`)

**Phase 6 Summary:**
- **Minting Script:** `npm run setup:mint` ✅
- **File:** `scripts/04-mint-nfts.ts` ✅
- **Test Script:** `npm run test:transfer` ✅
- **File:** `scripts/05-test-transfer.ts` ✅
- **IPFS Upload Script:** `npm run upload:ipfs` ✅
- **File:** `scripts/06-upload-to-ipfs.ts` ✅
- **IPFS Utils:** `scripts/utils/ipfs.ts` ✅
- **Total NFTs Minted:** 30 (6 properties × 5 NFTs each)
- **Metadata Submitted:** All property metadata submitted to HCS topics
- **Transfer Testing:** Successfully tested NFT transfer with KYC compliance
- **IPFS Integration:** ✅ Complete with Pinata (12 files uploaded: 6 images + 6 metadata)
- **Real IPFS CIDs:** Available in `output/ipfs-cids.json`
- **Note:** Using placeholder text files as images - replace with actual property photos for production

---

## Phase 6A: AI/Analytics Integration

### 6A.1 Data Pipeline Setup
- [ ] Set up data collection infrastructure
- [ ] Integrate external data sources (market comps, rental yields, etc.)
- [ ] Create data ingestion pipeline for property metadata
- [ ] Set up scheduled data refresh jobs
- [ ] Store historical data for trend analysis

### 6A.2 Valuation Model (MVP)
- [ ] Design baseline valuation model (comparative market analysis)
- [ ] Implement property scoring algorithm
- [ ] Create valuation calculation service
- [ ] Add rental yield projections
- [ ] Generate valuation reports (JSON format)
- [ ] Store valuations in HCS topics for transparency

### 6A.3 Continuous Monitoring & Alerts
- [ ] Set up automated valuation refresh (daily/weekly)
- [ ] Implement event-driven revaluation triggers
- [ ] Create alert system for significant value changes
- [ ] Add scenario analysis (best/worst/likely cases)
- [ ] Generate investor-facing valuation dashboards

### 6A.4 Analytics API
- [ ] Create API endpoint for property valuations
- [ ] Add endpoint for historical performance data
- [ ] Implement portfolio analytics (ROI, yields)
- [ ] Add comparison analytics (asset vs market)
- [ ] Generate downloadable reports (PDF/CSV)

### 6A.5 Future ML Enhancements (Post-MVP)
- [ ] Implement gradient-boosted models for non-linear patterns
- [ ] Add time-series forecasting for rent projections
- [ ] Integrate satellite/imagery analysis for change detection
- [ ] Add explainability features (SHAP values)
- [ ] Build recommendation engine (hold/sell/refinance)

---

## Phase 6B: Compliance & KYC Integration

**🎉 Infrastructure Complete! Ready for KYC Provider Integration**

**Architecture Documents Created:**
- ✅ `DECENTRALIZED-KYC-STRATEGY.md` - Complete analysis of 4 KYC approaches
- ✅ `KYC-PURPOSE-AND-COMPLIANCE.md` - Regulatory compliance explanation
- ✅ `KYC-IMPLEMENTATION-GUIDE.md` - Practical implementation guide
- ✅ `NFT-BASED-KYC-MODEL.md` - NFT verification badge system (RECOMMENDED)

**Scripts Created:**
- ✅ `scripts/09-create-verification-collection.ts` - Creates Verification NFT collection
- ✅ `scripts/10-mint-verification-nft.ts` - Mints verification NFT after KYC
- ✅ `scripts/11-revoke-verification.ts` - Revoke/freeze verification NFTs
- ✅ `scripts/utils/verification-checker.ts` - Middleware & utilities for checking verification

**Model:** NFT-Based Verification (Custodial KYC + Soulbound NFT)
- KYC happens off-chain with provider (Onfido/Sumsub)
- Platform mints non-transferable "Verification NFT" to user wallet
- Middleware checks NFT ownership before allowing platform operations
- Maintains link to KYC provider for regulatory requests
- On-chain attestations submitted to HCS for audit trail

**⚡ Tiered Access - Who Needs Verification:**
- ✅ **Property Owners** - MANDATORY (level: `property-owner`) to tokenize assets
- ⚠️ **Large Investors** - Optional based on amount/jurisdiction (level: `accredited` or `basic`)
- ❌ **Small Investors** - Usually not required (browse & small purchases allowed)
- ❌ **Browsers** - Never required (public access)

**See `VERIFICATION-TIERS.md` for complete access control matrix.**

### 6B.1 KYC Provider Setup
- [x] ✅ Select KYC provider (Recommended: Sumsub $0.30-1/user, or Onfido)
- [ ] Create KYC provider account and get API credentials
- [ ] Configure KYC provider in `.env`
- [x] ✅ Set up KYC verification levels (basic, accredited investor) - Built into minting script
- [x] ✅ Define required documents per jurisdiction - Documented in guides
- [ ] Test KYC API integration

### 6B.2 KYC Workflow Implementation
- [x] ✅ Create investor registration flow - Architecture documented
- [ ] Implement document upload (ID, proof of address) - KYC provider handles this
- [x] ✅ Build KYC status tracking system - Via NFT ownership checker utility
- [ ] Create KYC verification callback handler - Webhook to trigger NFT minting
- [x] ✅ Implement accredited investor verification - Two-level system (basic/accredited)
- [x] ✅ Store KYC status in database (linked to Hedera account) - Schema in `verification-nfts.json`
- [x] ✅ Add KYC status check before NFT purchases - Middleware utility created
- [x] ✅ Create KYC status update notifications - Via HCS attestation topic

### 6B.3 Licensing & Document Verification
- [ ] Research licensing body APIs (land registry, property verification)
- [ ] Integrate licensing API for property document verification
- [ ] Implement title deed verification
- [ ] Add property ownership verification
- [ ] Create document authenticity checks (digital signatures, certificates)
- [ ] Store verification results with IPFS CIDs
- [ ] Record verification on HCS topic for audit trail
- [ ] Build admin dashboard for document review

### 6B.4 AML & Sanctions Screening
- [ ] Integrate AML screening provider (optional)
- [ ] Implement sanctions list checking
- [ ] Create automated screening on investor registration
- [ ] Add periodic re-screening for existing investors
- [ ] Build alert system for flagged accounts
- [ ] Create compliance reporting tools

### 6B.5 Transfer Restrictions & Compliance
- [x] ✅ Implement jurisdictional transfer limits - Via verification level checks
- [x] ✅ Add investor accreditation checks for token transfers - Middleware checks verification level
- [x] ✅ Create whitelist/blacklist functionality - Via verification NFT ownership + freeze/wipe
- [ ] Implement lock-up period enforcement - Can be added to NFT metadata
- [ ] Add transfer approval workflow for admin - Future enhancement
- [x] ✅ Create compliance audit logs - HCS attestation topic records all verifications/revocations

---

## Phase 6C: Database & Backend API Design ✅ COMPLETED!

**Status:** Backend API with 33 endpoints operational on Docker (testnet)
**Date Completed:** October 28, 2025

### 6C.1 Database Schema Design ✅ COMPLETED
- [x] ✅ Set up PostgreSQL database (Docker)
- [x] ✅ Design **INVESTORS** table schema (13 tables total)
- [x] ✅ Design **PROPERTIES** table schema
- [x] ✅ Design **NFT_HOLDINGS** table schema
- [x] ✅ Design **TRANSACTIONS** table schema
- [x] ✅ Design **MARKETPLACE_LISTINGS** table schema
- [x] ✅ Design **MARKETPLACE_OFFERS** table schema
- [x] ✅ Design **MARKETPLACE_TRANSACTIONS** table schema
- [x] ✅ Design **PROPERTY_OWNERS** table schema
- [x] ✅ Design **PROPERTY_OWNER_VERIFICATIONS** table schema
- [x] ✅ Design **KYC_SUBMISSIONS** table schema
- [x] ✅ Design **NFT_TRANSFERS** table schema
- [x] ✅ Design **USERS** table schema
- [x] ✅ Design **PLATFORM_CONFIG** table schema
- [x] ✅ Create database schema with indexes and triggers
- [x] ✅ Initialize database with verification token configuration

### 6C.2 Hedera Indexer Setup ✅ COMPLETED
- [x] ✅ Set up Hedera Mirror Node indexer (indexer.service.ts)
- [x] ✅ Create NFT transfer event indexing (fetchNFTTransfers, syncNFTTransfers)
- [x] ✅ Index NFT transfer events to database
- [x] ✅ Index HCS topic messages (fetchTopicMessages, syncTopicMessages)
- [x] ✅ Sync token balances with database (updateNFTHoldings)
- [x] ✅ Create background jobs for data sync (scheduler.service.ts)
- [x] ✅ Integrate scheduler into app startup with graceful shutdown

### 6C.3 Backend API Structure ✅ COMPLETED
- [x] ✅ Set up Node.js/TypeScript backend (Express)
- [x] ✅ Configure environment variables with real credentials
- [x] ✅ Set up database connection pool (PostgreSQL)
- [x] ✅ Create Hedera SDK integration layer (hedera.service.ts)
- [x] ✅ Configure CORS and security headers
- [x] ✅ Set up API logging (morgan)
- [x] ✅ Docker containerization (postgres, redis, backend)
- [x] ✅ IPFS/Pinata integration for file uploads
- [x] ✅ Wallet signature verification utility (wallet-signature.ts) - DApp authentication

### 6C.4 Properties Endpoints ✅ 5/6 COMPLETED
- [x] ✅ `POST /api/v1/properties/mint` - Mint property NFT collection
- [x] ✅ `GET /api/v1/properties` - List all properties (with filters, pagination)
- [x] ✅ `GET /api/v1/properties/:id` - Get property details
- [x] ✅ `PUT /api/v1/properties/:id` - Update property details
- [x] ✅ `POST /api/v1/properties/:id/verify` - Trigger document verification (with wallet auth)
- [ ] `GET /api/v1/properties/:id/valuations` - Get valuation history (Future - Phase 6A)

### 6C.5 Investors Endpoints ✅ 5/5 COMPLETED
- [x] ✅ `POST /api/v1/investors/register` - Register new investor
- [x] ✅ `GET /api/v1/investors/:id/profile` - Get investor profile
- [x] ✅ `POST /api/v1/investors/:id/kyc` - Submit KYC documents
- [x] ✅ `GET /api/v1/investors/:id/transactions` - Transaction history
- [x] ✅ `GET /api/v1/users/:accountId/assets` - Get investor portfolio

### 6C.6 Tokens Endpoints ✅ 4/4 COMPLETED
- [x] ✅ `POST /api/v1/tokens/mint` - Mint NFTs to treasury
- [x] ✅ `GET /api/v1/tokens/:tokenId/info` - Get token information
- [x] ✅ `POST /api/v1/tokens/transfer` - Initiate token transfer
- [x] ✅ `GET /api/v1/tokens/:tokenId/holders` - Get NFT holders

### 6C.7 Marketplace Endpoints ✅ 4/4 COMPLETED
- [x] ✅ `POST /api/v1/marketplace/list` - Create listing
- [x] ✅ `GET /api/v1/marketplace/listings` - Get active listings (with pagination)
- [x] ✅ `POST /api/v1/marketplace/offers` - Make offer
- [x] ✅ `POST /api/v1/marketplace/buy` - Purchase NFT

### 6C.8 Property Owners Endpoints ✅ 3/3 COMPLETED
- [x] ✅ `POST /api/v1/property-owners/register` - Register property owner
- [x] ✅ `POST /api/v1/property-owners/:id/verification` - Submit verification documents
- [x] ✅ `GET /api/v1/property-owners/:id/verification-status` - Get verification status

### 6C.9 Admin/KYC Approval Endpoints ✅ 5/5 COMPLETED
- [x] ✅ `GET /api/v1/admin/pending-verifications` - Get pending KYC/verifications
- [x] ✅ `POST /api/v1/admin/investors/:id/approve-kyc` - Approve investor KYC
- [x] ✅ `POST /api/v1/admin/investors/:id/reject-kyc` - Reject investor KYC
- [x] ✅ `POST /api/v1/admin/property-owners/:id/approve` - Approve property owner
- [x] ✅ `POST /api/v1/admin/property-owners/:id/reject` - Reject property owner

### 6C.10 Files/IPFS Endpoints ✅ 4/4 COMPLETED
- [x] ✅ `POST /api/v1/files/upload` - Upload single file to IPFS
- [x] ✅ `POST /api/v1/files/upload-multiple` - Upload multiple files to IPFS
- [x] ✅ `POST /api/v1/files/upload-json` - Upload JSON metadata to IPFS
- [x] ✅ `GET /api/v1/files/:cid` - Get file information

### 6C.11 Verification Endpoints ✅ 1/1 COMPLETED
- [x] ✅ `GET /api/v1/verification/token-id` - Get verification NFT token ID

**Phase 6C Summary:**
- **Total API Endpoints:** 33 (all functional)
- **Database Tables:** 13 (all created with proper relationships)
- **Verification NFT Collections:** 3 (property-owner, investor, accredited-investor)
- **Docker Services:** 3 (postgres, redis, backend) - all running
- **API Status:** ✅ Operational at http://localhost:3600
- **Hedera Network:** testnet
- **IPFS Provider:** Pinata (fully integrated)
- **Blockchain Indexer:** ✅ Real-time NFT transfer and HCS message syncing
- **DApp Authentication:** ✅ Wallet signature verification (no JWT/sessions)

---

## Phase 6D: DAO Governance (Core Feature) ✅ COMPLETED!

**Status:** DAO Governance system with 7 endpoints operational on Docker (testnet)
**Date Completed:** October 28, 2025

### 6D.1 DAO Architecture Design ✅ COMPLETED
- [x] ✅ Design per-property DAO structure (each property has its own DAO)
- [x] ✅ Define governance roles (NFT holders have voting power)
- [x] ✅ Design proposal types (maintenance, budget, distribution, asset_sale, general)
- [x] ✅ Define voting mechanisms (token-weighted: 1 NFT = 1 vote)
- [x] ✅ Design quorum and threshold requirements (customizable, default 51%)
- [x] ✅ Plan off-chain execution system (executeProposal function)

### 6D.2 Proposal System ✅ COMPLETED
- [x] ✅ Create proposal submission system (createProposal service)
- [x] ✅ Implement proposal validation (proposer must own NFTs)
- [x] ✅ Build proposal detail storage (dao_proposals table)
- [x] ✅ Add proposal attachment support (document_cids field)
- [x] ✅ Implement proposal status tracking (draft, active, passed, rejected, executed, cancelled)
- [ ] Create proposal notification system (Future enhancement)
- [ ] Add proposal discussion/comments feature (Future enhancement)

### 6D.3 Voting System ✅ COMPLETED
- [x] ✅ Implement vote submission via wallet signature (castVote with signature verification)
- [x] ✅ Verify voting power (get_voting_power function counts NFTs owned per property)
- [x] ✅ Record votes in database (dao_votes table with signatures)
- [x] ✅ Implement vote tallying system (automatic via database triggers)
- [x] ✅ Add real-time vote count updates (update_proposal_tally trigger)
- [ ] Create vote delegation feature (Future enhancement)
- [x] ✅ Implement voting period enforcement (voting_starts_at, voting_ends_at validation)
- [x] ✅ Add vote change option (update existing vote before deadline)

### 6D.4 Proposal Execution ✅ BASIC COMPLETE
- [x] ✅ Implement proposal execution endpoint (executeProposal)
- [x] ✅ Add execution status tracking (executed_at, execution_notes)
- [ ] Design off-chain relayer system (Future enhancement)
- [ ] Add multi-signature approval for high-value actions (Future enhancement)
- [ ] Implement timelock for approved proposals (Future enhancement)
- [ ] Create execution notification system (Future enhancement)
- [x] ✅ Build audit trail (all votes and proposals stored with signatures)

### 6D.5 DAO Treasury Management ✅ COMPLETED
- [x] ✅ Create per-property treasury tracking (treasury_balance, treasury_currency in properties)
- [x] ✅ Add operational expense tracking (dao_treasury_transactions table)
- [x] ✅ Implement rent collection recording (transaction_type: 'income')
- [x] ✅ Create distribution tracking (total_distributions, last_distribution_at)
- [x] ✅ Add treasury balance monitoring (getTreasuryBalance function)
- [ ] Create automated distribution calculations (Future - requires payment integration)
- [ ] Create financial reporting tools (Future - Phase 10 frontend)

### 6D.6 DAO API Endpoints ✅ 7/7 COMPLETED
- [x] ✅ `POST /api/v1/dao/:propertyId/proposals` - Create proposal
- [x] ✅ `GET /api/v1/dao/:propertyId/proposals` - List proposals
- [x] ✅ `GET /api/v1/dao/proposals/:id` - Get proposal details
- [x] ✅ `POST /api/v1/dao/proposals/:id/vote` - Cast vote
- [x] ✅ `GET /api/v1/dao/proposals/:id/results` - Get vote results
- [x] ✅ `POST /api/v1/dao/proposals/:id/execute` - Execute proposal
- [x] ✅ `GET /api/v1/dao/:propertyId/treasury` - Get treasury info

**Phase 6D Summary:**
- **Total API Endpoints:** 40 (was 33, added 7 DAO endpoints)
- **Database Tables Added:** 3 (dao_proposals, dao_votes, dao_treasury_transactions)
- **Database Functions:** 2 (get_voting_power, update_proposal_tally)
- **Proposal Types:** 5 (maintenance, budget, distribution, asset_sale, general)
- **Voting System:** Token-weighted with wallet signature verification
- **Security:** All operations require wallet signatures, timestamp validation
- **Treasury Tracking:** ✅ Per-property balance, income, expenses, distributions
- **API Status:** ✅ Operational at http://localhost:3600
- **Governance Features:** ✅ Create proposals, cast votes, real-time tallying, execution

---

## Phase 6E: API Documentation ✅ COMPLETED!

**Status:** Complete API documentation for all 40 endpoints created
**Date Completed:** October 28, 2025

### 6E.1 Documentation Files ✅ COMPLETED
- [x] ✅ Create comprehensive API documentation (API-DOCUMENTATION.md)
- [x] ✅ Create quick reference guide (API-QUICK-REFERENCE.md)
- [x] ✅ Create Postman collection for testing (POSTMAN-COLLECTION.json)
- [x] ✅ Document all 40 endpoints with request/response examples
- [x] ✅ Document authentication patterns (wallet signatures)
- [x] ✅ Document error codes and HTTP status codes
- [x] ✅ Provide testing examples with cURL
- [x] ✅ Document common use case flows

### 6E.2 Documentation Content ✅ COMPLETED
- [x] ✅ Properties endpoints (5 endpoints)
- [x] ✅ Tokens endpoints (4 endpoints)
- [x] ✅ Users endpoints (1 endpoint)
- [x] ✅ Investors endpoints (4 endpoints)
- [x] ✅ Property Owners endpoints (3 endpoints)
- [x] ✅ Marketplace endpoints (4 endpoints)
- [x] ✅ Files/IPFS endpoints (4 endpoints)
- [x] ✅ Admin endpoints (5 endpoints)
- [x] ✅ Verification endpoints (1 endpoint)
- [x] ✅ DAO Governance endpoints (7 endpoints)
- [x] ✅ System endpoints (2 endpoints)

### 6E.3 API Documentation Features ✅ COMPLETED
- [x] ✅ Complete request/response examples for each endpoint
- [x] ✅ Authentication guide with wallet signature verification
- [x] ✅ Error codes reference with descriptions
- [x] ✅ Testing instructions with cURL examples
- [x] ✅ Use case flows for common operations
- [x] ✅ Network information (testnet details, token IDs)
- [x] ✅ Postman collection with pre-configured variables
- [x] ✅ Quick reference guide for rapid lookup
- [x] ✅ Response format templates
- [x] ✅ HTTP status codes guide
- [x] ✅ Debugging tips and troubleshooting guide

**Phase 6E Summary:**
- **Documentation Files:** 3 (API-DOCUMENTATION.md, API-QUICK-REFERENCE.md, POSTMAN-COLLECTION.json)
- **Total Endpoints Documented:** 40 (all operational endpoints)
- **Files Location:** `/backend` directory
- **Postman Collection:** ✅ Ready to import with example requests
- **Quick Reference:** ✅ All endpoints listed by category
- **Full Documentation:** ✅ Complete with request/response examples
- **Testing Support:** ✅ cURL examples and Postman collection provided

---

## Phase 7: Smart Contracts (Optional - Advanced)

### 7.1 Real Estate Management Contract
- [ ] Design contract for property rental tracking
- [ ] Implement automated distribution calculation logic
- [ ] Add property management functions (maintenance requests, etc.)
- [ ] Add voting mechanism for major property decisions
- [ ] Implement revenue distribution to NFT holders
- [ ] Deploy to Hedera testnet
- [ ] Test contract functionality
- [ ] Integrate with HCS topics

### 7.2 Agriculture Revenue Contract
- [ ] Design contract for harvest revenue distribution
- [ ] Implement seasonal payout calculations
- [ ] Add crop insurance integration
- [ ] Add weather oracle integration
- [ ] Implement investor return calculations
- [ ] Deploy to Hedera testnet
- [ ] Test payment distribution
- [ ] Monitor gas costs and optimize

### 7.3 Properties Income Contract
- [ ] Design contract for property income tracking
- [ ] Implement automated lease payment distribution
- [ ] Add tenant management functions
- [ ] Add maintenance fund allocation
- [ ] Implement profit distribution to NFT holders
- [ ] Deploy to Hedera testnet
- [ ] Test income distribution flow
- [ ] Create admin dashboard integration

### 7.4 Marketplace Contract
- [ ] Design contract for NFT trading
- [ ] Implement listing and offer system
- [ ] Add escrow functionality
- [ ] Add price discovery mechanism
- [ ] Implement trade settlement
- [ ] Deploy to Hedera testnet
- [ ] Test marketplace flows
- [ ] Integrate with royalty system

---

## Phase 8: Configuration Generation

### 8.1 Frontend Configuration
- [ ] Aggregate all account IDs
- [ ] Aggregate all topic IDs (20+ topics)
- [ ] Aggregate all collection IDs (3 collections)
- [ ] Aggregate all minted NFT serial numbers
- [ ] Include smart contract addresses (if deployed)
- [ ] Generate `output/config.json` with complete configuration
- [ ] Generate `output/frontend.env` for Next.js application
- [ ] Create network configuration (testnet/mainnet endpoints)
- [ ] Document configuration structure and usage

### 8.2 Configuration File Structure
- [ ] Include Hedera network information
- [ ] Include mirror node REST API URLs
- [ ] Include JSON-RPC relay URLs for EVM compatibility
- [ ] Include all platform accounts
- [ ] Include all NFT collection IDs and metadata
- [ ] Include all HCS topic IDs organized by category
- [ ] Include IPFS gateway URLs
- [ ] Include transaction default settings

### 8.3 Verification & Testing
- [ ] Verify all IDs are valid and accessible
- [ ] Test configuration file loading in Node.js
- [ ] Test configuration file loading in browser
- [ ] Validate environment variable format for Next.js
- [ ] Create configuration backup in secure location
- [ ] Test mirror node API access with configuration
- [ ] Document migration process for production deployment

---

## Phase 9: Documentation & Security

### 9.1 Comprehensive Documentation
- [ ] Create detailed README.md for hedera-setup directory
- [ ] Document each script's purpose and usage
- [ ] Add troubleshooting guide for common issues
- [ ] Document network migration process (testnet → mainnet)
- [ ] Create API documentation for utility functions
- [ ] Document NFT metadata schemas for each collection
- [ ] Create operator guide for ongoing maintenance
- [ ] Document IPFS integration and best practices

### 9.2 Security Measures
- [ ] Verify `.gitignore` excludes all sensitive files
- [ ] Ensure `output/` directory is gitignored
- [ ] Ensure `.env` file is gitignored
- [ ] Create secure backup process for private keys
- [ ] Document key rotation procedures
- [ ] Implement access control recommendations
- [ ] Create incident response plan
- [ ] Set up monitoring for suspicious account activity
- [ ] Document multi-signature setup for production

### 9.3 Testing & Validation
- [ ] Test complete setup process from scratch on new testnet account
- [ ] Validate all generated files are properly formatted
- [ ] Test NFT minting with various metadata configurations
- [ ] Test NFT transfer between different accounts
- [ ] Test HCS message submission for all topics
- [ ] Test HCS message retrieval via mirror node
- [ ] Test royalty fee collection on NFT sales
- [ ] Performance testing for batch operations
- [ ] Load testing for concurrent transactions
- [ ] Test error handling and recovery procedures

---

## Phase 10: Frontend NFT Management Features

### 10.0 HashPack Wallet Integration Setup

#### Initial Setup
- [ ] Install HashPack SDK: `npm install hashconnect`
- [ ] Create HashPack provider/context for React
- [ ] Initialize HashPack with app metadata (name, description, icon)
- [ ] **Configure HashPack for TESTNET network**
- [ ] Set up pairing event listeners
- [ ] Implement session storage for paired data
- [ ] Create wallet connection modal/UI component

#### Connection Flow
- [ ] Create "Connect Wallet" button component
- [ ] Implement pairing request (generates QR code + deep link)
- [ ] Handle pairing approval from HashPack
- [ ] **Ensure HashPack is set to TESTNET mode**
- [ ] Store paired account data (accountId, network, publicKey)
- [ ] Display connected account ID and network (testnet) in UI
- [ ] Create "Disconnect" functionality
- [ ] Implement auto-reconnect on page refresh
- [ ] Warn users if they connect with mainnet instead of testnet

#### Transaction Signing
- [ ] Create transaction preparation utility
- [ ] Serialize transactions for HashPack
- [ ] Send signing request to HashPack
- [ ] Handle user approval in HashPack app/extension
- [ ] Receive signed transaction
- [ ] Submit signed transaction to Hedera network
- [ ] Handle transaction errors and retries

#### User Experience
- [ ] Show HashPack pairing QR code for mobile users
- [ ] Provide deep link for HashPack mobile app
- [ ] Display connection status indicator
- [ ] Show wallet balance (HBAR)
- [ ] Create wallet dropdown menu (disconnect, switch account)
- [ ] Add HashPack browser extension detection
- [ ] Provide instructions for users without HashPack

### 10.1 Backend API Endpoints (Next.js API Routes)

#### NFT Listing API
- [ ] Create API endpoint to fetch all NFTs from Hedera Mirror Node
- [ ] Implement filtering by collection type (Real Estate, Agriculture, Properties)
- [ ] Implement pagination for large NFT lists
- [ ] Add sorting options (price, date, popularity)
- [ ] Implement search functionality by metadata attributes
- [ ] Create endpoint to fetch NFT details by token ID and serial number
- [ ] Implement caching strategy for frequently accessed NFTs
- [ ] Add rate limiting to prevent API abuse

#### NFT Creation/Minting API
- [ ] Create API endpoint for NFT minting requests
- [ ] Implement authentication and authorization (admin only)
- [ ] Add request validation for NFT metadata
- [ ] Create IPFS upload endpoint for images and documents
- [ ] Implement batch minting endpoint
- [ ] Add transaction status tracking
- [ ] Create webhook for minting completion notifications
- [ ] Implement error handling and retry logic

#### Metadata Management API
- [ ] Create endpoint to fetch metadata from IPFS
- [ ] Implement metadata validation endpoint
- [ ] Create endpoint to update NFT metadata (if mutable)
- [ ] Add endpoint to fetch HCS topic messages
- [ ] Implement metadata caching

### 10.2 Frontend NFT Listing Features

#### NFT Gallery/Marketplace Page
- [ ] Create NFT gallery page with grid/list view
- [ ] Implement collection filter dropdown (Real Estate, Agriculture, Properties)
- [ ] Add search bar for NFT metadata search
- [ ] Implement price range filter
- [ ] Add location-based filtering (by country/city)
- [ ] Create sorting options (newest, price low-to-high, high-to-low)
- [ ] Implement infinite scroll or pagination
- [ ] Add "Featured NFTs" section
- [ ] Create "Recently Listed" section
- [ ] Add NFT card component with:
  - Thumbnail image from IPFS
  - NFT name and collection badge
  - Price and currency
  - Key metadata highlights
  - "View Details" button

#### NFT Detail Page
- [ ] Create detailed NFT page layout
- [ ] Display full-size NFT image/media from IPFS
- [ ] Show complete NFT metadata:
  - Property/farm/asset details
  - Location information
  - Financial data (price, revenue, ROI)
  - Legal documents links
  - Certification information
- [ ] Display NFT ownership information
- [ ] Show transaction history from HCS topics
- [ ] Display price history chart
- [ ] Add "Buy Now" or "Make Offer" button
- [ ] Show related NFTs from same collection
- [ ] Display royalty information

#### Collection Pages
- [ ] Create dedicated page for Real Estate NFTs
- [ ] Create dedicated page for Agriculture NFTs
- [ ] Create dedicated page for Properties NFTs
- [ ] Show collection statistics (total supply, floor price, volume)
- [ ] Display collection description and use cases
- [ ] Show top NFTs in collection
- [ ] Add collection-specific filters

### 10.3 Frontend NFT Creation Features

#### Admin Dashboard for NFT Creation
- [ ] Create admin-only dashboard page
- [ ] Implement role-based access control
- [ ] Add admin authentication check
- [ ] Create navigation for NFT management tools

#### NFT Creation Form - Real Estate
- [ ] Create multi-step form for Real Estate NFT creation
- [ ] **Step 1: Basic Information**
  - Property type dropdown (residential, commercial, land)
  - Property name/title input
  - Description textarea
  - Collection selection (auto-set to Real Estate)
- [ ] **Step 2: Location Details**
  - Country dropdown
  - City/region input
  - Full address input
  - GPS coordinates input (with map picker)
- [ ] **Step 3: Property Details**
  - Square footage input
  - Lot size input
  - Number of units/rooms
  - Year built
  - Renovation history
- [ ] **Step 4: Financial Information**
  - Property value input
  - Purchase price
  - Expected ROI percentage
  - Rental income (monthly/annual)
  - Appreciation data
- [ ] **Step 5: Media Upload**
  - Image upload (multiple files to IPFS)
  - Document upload (deed, title, insurance)
  - Virtual tour link input
  - Image preview and reordering
- [ ] **Step 6: Legal & Additional**
  - HOA information
  - Legal documents upload
  - Certification uploads
  - Terms and conditions checkbox
- [ ] **Step 7: Review & Mint**
  - Preview all entered data
  - Show estimated gas fees
  - Confirm and mint button
  - Transaction progress indicator

#### NFT Creation Form - Agriculture
- [ ] Create multi-step form for Agriculture NFT creation
- [ ] **Step 1: Basic Information**
  - Farm/asset name
  - Crop/livestock type dropdown
  - Description
- [ ] **Step 2: Location Details**
  - Country and region
  - Farm address
  - GPS coordinates with map
  - Total acreage input
- [ ] **Step 3: Agricultural Details**
  - Crop type and planting schedule
  - Soil quality assessment
  - Water access information
  - Equipment and infrastructure list
- [ ] **Step 4: Production & Revenue**
  - Historical yield data
  - Expected revenue
  - Profit sharing model
  - Investment return timeline
- [ ] **Step 5: Certifications**
  - Organic certification upload
  - Fair trade certification
  - Other certifications
  - Verification documents
- [ ] **Step 6: Media Upload**
  - Farm photos upload to IPFS
  - Drone footage/video upload
  - Document uploads
- [ ] **Step 7: Review & Mint**
  - Preview all data
  - Mint NFT with transaction tracking

#### NFT Creation Form - Properties
- [ ] Create multi-step form for Properties NFT creation
- [ ] **Step 1: Basic Information**
  - Property category (warehouse, industrial, parking, storage)
  - Property name
  - Description
- [ ] **Step 2: Location Details**
  - Country and city
  - Property address
  - GPS coordinates
- [ ] **Step 3: Property Specifications**
  - Total area
  - Zoning information
  - Current usage
  - Tenant information
- [ ] **Step 4: Financial Details**
  - Property value
  - Revenue model (lease/rental/usage fees)
  - Monthly/annual income
  - Expected ROI
- [ ] **Step 5: Legal & Compliance**
  - Permits and licenses upload
  - Environmental compliance documents
  - Maintenance records
- [ ] **Step 6: Media Upload**
  - Property photos to IPFS
  - Blueprints/floor plans
  - Documents upload
- [ ] **Step 7: Review & Mint**
  - Preview and mint

### 10.4 NFT Creation - Technical Implementation

#### Form Components
- [ ] Create reusable form input components
- [ ] Build file upload component with IPFS integration
- [ ] Create location picker component with map integration
- [ ] Build image preview and gallery component
- [ ] Create progress stepper component
- [ ] Build validation error display component

#### Form Validation
- [ ] Implement client-side validation for all fields
- [ ] Add real-time validation feedback
- [ ] Create custom validation rules for:
  - Price/financial data formats
  - GPS coordinates
  - File size and type restrictions
  - Required fields per NFT type
- [ ] Implement form state management (React Hook Form or Formik)

#### IPFS Integration
- [ ] Set up IPFS client (Pinata, NFT.Storage, or Web3.Storage)
- [ ] Implement image upload to IPFS
- [ ] Implement document upload to IPFS
- [ ] Add upload progress indicators
- [ ] Implement retry logic for failed uploads
- [ ] Create IPFS metadata JSON structure
- [ ] Generate and upload metadata JSON to IPFS
- [ ] Store IPFS CIDs in database for reference

#### HashPack Wallet Integration for Minting
- [ ] Install and configure HashPack SDK
- [ ] Implement HashPack connection flow
- [ ] Handle wallet pairing and account selection
- [ ] Store paired wallet data (account ID, public key)
- [ ] Request admin key signature for minting transactions
- [ ] Implement transaction signing flow with HashPack
- [ ] Create transaction builder for NFT minting
- [ ] Add transaction fee estimation display
- [ ] Implement transaction submission to Hedera via HashPack
- [ ] Add transaction status monitoring
- [ ] Handle HashPack approval/rejection flows
- [ ] Create success/error notifications
- [ ] Implement auto-reconnect on page refresh
- [ ] Add disconnect wallet functionality

#### Transaction Monitoring
- [ ] Poll Hedera mirror node for transaction status
- [ ] Display real-time minting progress
- [ ] Show transaction ID and explorer link
- [ ] Implement retry mechanism for failed transactions
- [ ] Create transaction history log
- [ ] Add email/notification on mint completion

### 10.5 NFT Listing - Technical Implementation

#### Data Fetching
- [ ] Implement mirror node API integration
- [ ] Create NFT data fetching hooks (React Query or SWR)
- [ ] Implement real-time updates for new NFTs
- [ ] Add error handling and retry logic
- [ ] Create loading states and skeletons

#### NFT Display Components
- [ ] Create NFT card component with lazy loading
- [ ] Build image optimization and caching
- [ ] Implement IPFS gateway fallbacks
- [ ] Create metadata display components
- [ ] Build responsive grid layout

#### Search & Filter Implementation
- [ ] Implement client-side filtering
- [ ] Add debounced search functionality
- [ ] Create filter state management
- [ ] Implement URL query parameters for shareable filters
- [ ] Add filter reset functionality

### 10.6 User Permissions & Access Control

#### Admin Features
- [ ] Implement admin authentication via HashPack wallet
- [ ] Verify admin account ID matches configured admin account
- [ ] Create role-based permission system
- [ ] Add admin-only routes and components
- [ ] Implement secure API key management for minting
- [ ] Create admin activity logs

#### User Features
- [ ] Allow users to view NFTs (read-only without wallet)
- [ ] Implement HashPack wallet-based authentication
- [ ] Show user's owned NFTs after wallet connection
- [ ] Add "My Portfolio" page displaying connected wallet's NFTs
- [ ] Implement user preferences (save to local storage or HCS)
- [ ] Display wallet balance (HBAR and NFTs)

### 10.7 Testing & Quality Assurance

#### Form Testing
- [ ] Test all form validations
- [ ] Test IPFS upload functionality
- [ ] Test HashPack wallet connection and pairing
- [ ] Test HashPack transaction signing
- [ ] Test transaction submission via HashPack
- [ ] Test error scenarios and edge cases
- [ ] Test HashPack disconnection handling

#### Listing Testing
- [ ] Test NFT display with various metadata
- [ ] Test search and filter functionality
- [ ] Test pagination and infinite scroll
- [ ] Test responsive design on all devices
- [ ] Test loading states and error handling
- [ ] Test NFT display for connected wallet's assets

#### End-to-End Testing
- [ ] Test complete NFT creation flow with HashPack
- [ ] Test NFT listing and detail view
- [ ] Test HashPack wallet integration (connect, disconnect, reconnect)
- [ ] Test transaction completion and confirmation
- [ ] Test HashPack rejection handling
- [ ] Test with multiple HashPack accounts
- [ ] Perform load testing for multiple concurrent users

---

### 10.8 Investor Dashboard (Portfolio & Holdings)

#### Portfolio Overview
- [ ] Create investor dashboard landing page
- [ ] Display total portfolio value (HBAR + NFT value)
- [ ] Show portfolio performance (ROI, gains/losses)
- [ ] Create asset allocation pie chart (by property type)
- [ ] Display total NFTs owned across all properties
- [ ] Show available HBAR balance
- [ ] Add portfolio value history chart (30d, 90d, 1y)

#### Holdings Table
- [ ] Create NFT holdings table with columns:
  - Property name & image
  - NFTs owned / Total supply
  - Ownership percentage
  - Current valuation (from AI)
  - Purchase price
  - Gain/Loss (%)
  - Action buttons (View, Sell, Vote)
- [ ] Implement sorting and filtering
- [ ] Add search functionality
- [ ] Create detailed holding view (click to expand)

#### Distributions & Income
- [ ] Display total distributions received
- [ ] Create distribution history table
- [ ] Show upcoming distribution schedule
- [ ] Add distribution notifications
- [ ] Create downloadable distribution reports (PDF/CSV)
- [ ] Display yield/return metrics

#### Transaction History
- [ ] Create transaction history timeline
- [ ] Filter by type (purchase, sale, distribution, vote)
- [ ] Show Hedera transaction IDs with HashScan links
- [ ] Add export functionality
- [ ] Display pending transactions

---

### 10.9 Property Detail Pages with AI Valuations

#### Property Overview
- [ ] Create property detail page layout
- [ ] Display property hero image gallery (IPFS)
- [ ] Show property name, address, location on map
- [ ] Display property type and category
- [ ] Show total NFT supply and available supply
- [ ] Display current price per NFT
- [ ] Add "Buy NFTs" CTA button

#### Property Financials
- [ ] Display current AI valuation with confidence score
- [ ] Show valuation history chart
- [ ] Display rental income data (monthly/annual)
- [ ] Show expense breakdown
- [ ] Display projected returns (1yr, 3yr, 5yr)
- [ ] Add ROI calculator widget
- [ ] Show comparable properties

#### AI Valuation Section
- [ ] Display AI valuation prominently
- [ ] Show valuation methodology
- [ ] Display confidence score with visual indicator
- [ ] Create scenario analysis (best/worst/likely cases)
- [ ] Show valuation drivers (explainability)
- [ ] Display market comparisons
- [ ] Add "Request Re-evaluation" button
- [ ] Show last updated timestamp

#### Property Documents
- [ ] Create document library section
- [ ] Display title deed (IPFS link)
- [ ] Show property surveys
- [ ] Link to legal documents
- [ ] Display verification status badges
- [ ] Add document download buttons
- [ ] Show licensing verification status

#### NFT Holders
- [ ] Display current NFT holders table
- [ ] Show ownership distribution chart
- [ ] Display top holders
- [ ] Show recent transfers
- [ ] Add holder analytics

---

### 10.10 DAO Governance UI

#### DAO Governance Hub
- [ ] Create DAO overview page per property
- [ ] Display active proposals count
- [ ] Show total voting power (your NFTs)
- [ ] Display treasury balance
- [ ] Create governance timeline/activity feed
- [ ] Show proposal submission form link

#### Proposal List
- [ ] Create proposal listing page
- [ ] Filter by status (active, passed, failed, executed)
- [ ] Filter by type (maintenance, budget, distribution, sale)
- [ ] Display proposal cards with:
  - Title and description preview
  - Proposer info
  - Voting period (time remaining)
  - Current vote tally (for/against/abstain)
  - Your vote status
- [ ] Add sorting options
- [ ] Implement pagination

#### Proposal Detail Page
- [ ] Display full proposal details
- [ ] Show proposer information and NFT ownership
- [ ] Display proposal type and category
- [ ] Show attached documents/budgets
- [ ] Display voting period (start/end dates)
- [ ] Show real-time vote results with progress bars
- [ ] Display quorum status
- [ ] Show detailed vote breakdown by address
- [ ] Add discussion/comments section

#### Voting Interface
- [ ] Create vote casting interface
- [ ] Display voting power (# of NFTs)
- [ ] Add vote options (For, Against, Abstain)
- [ ] Implement HashPack signature for vote
- [ ] Show vote confirmation modal
- [ ] Display vote receipt with transaction ID
- [ ] Add vote change option (if before deadline)
- [ ] Show voting history

#### Proposal Creation
- [ ] Create proposal submission form (for NFT holders)
- [ ] Validate proposer owns NFTs
- [ ] Add proposal type selection
- [ ] Implement rich text editor for description
- [ ] Add document attachment support
- [ ] Create budget input fields
- [ ] Add proposal preview
- [ ] Submit proposal via HashPack signature
- [ ] Display submission confirmation

#### DAO Treasury
- [ ] Display property treasury balance
- [ ] Show income sources (rent, etc.)
- [ ] Display expenses breakdown
- [ ] Create distribution schedule
- [ ] Show treasury transaction history
- [ ] Add treasury analytics charts

---

### 10.11 Secondary Marketplace UI

#### Marketplace Landing
- [ ] Create marketplace home page
- [ ] Display featured listings
- [ ] Show trending properties
- [ ] Display recent sales
- [ ] Add marketplace statistics (volume, floor prices)
- [ ] Create search and filter bar

#### NFT Listings
- [ ] Create NFT listing grid/list view
- [ ] Display listing cards with:
  - Property image
  - NFT serial number(s)
  - Price (HBAR)
  - Seller info
  - Time listed
- [ ] Implement filters:
  - Price range
  - Property type
  - Location
  - Listing date
- [ ] Add sorting (newest, price low-high, price high-low)
- [ ] Implement pagination/infinite scroll

#### Create Listing
- [ ] Create "Sell NFT" flow
- [ ] Select NFTs to sell from portfolio
- [ ] Set listing price (HBAR)
- [ ] Add listing duration
- [ ] Add optional description
- [ ] Preview listing
- [ ] Submit listing via HashPack
- [ ] Display listing confirmation

#### Make Offer/Buy
- [ ] Create "Buy Now" flow for listed NFTs
- [ ] Display purchase summary (price, fees, royalties)
- [ ] Calculate total cost
- [ ] Implement HashPack purchase confirmation
- [ ] Transfer NFTs via smart contract/escrow
- [ ] Display purchase receipt
- [ ] Send confirmation notifications

#### Offer System
- [ ] Create "Make Offer" interface
- [ ] Allow offers below listing price
- [ ] Set offer expiration
- [ ] Notify seller of offers
- [ ] Seller accept/reject offers
- [ ] Auto-execute accepted offers via HashPack

#### Price History & Analytics
- [ ] Display price history charts per property
- [ ] Show floor price tracking
- [ ] Display sales volume
- [ ] Show average sale price
- [ ] Create marketplace analytics dashboard

---

## Phase 11: Frontend Integration Preparation

### 11.1 Configuration Transfer (Testnet)
- [ ] Copy `output/frontend.env` to frontend directory as `.env.local`
- [ ] Verify frontend can load and parse testnet configuration
- [ ] Ensure `NEXT_PUBLIC_HEDERA_NETWORK=testnet` is set
- [ ] Test connection to Hedera testnet from frontend
- [ ] Validate all testnet topic IDs are accessible via mirror node
- [ ] Validate all testnet collection IDs are accessible
- [ ] Test IPFS gateway connectivity from frontend
- [ ] Verify testnet mirror node endpoints work

### 11.2 Integration Testing (Testnet)
- [ ] Test HashPack wallet connection and pairing on TESTNET
- [ ] Verify HashPack shows testnet network indicator
- [ ] Test HashPack account switching on testnet
- [ ] Test NFT display and metadata retrieval from testnet Mirror Node
- [ ] Test NFT image loading from IPFS
- [ ] Test HCS message reading and display from testnet topics
- [ ] Test HCS message submission from frontend via HashPack on testnet
- [ ] Test NFT transfer functionality with HashPack signatures (testnet)
- [ ] Test NFT approval and allowances via HashPack (testnet)
- [ ] Test marketplace listing creation with HashPack (testnet)
- [ ] Test marketplace offer submission with HashPack (testnet)
- [ ] Test search and filtering functionality
- [ ] Test HashPack transaction rejection scenarios
- [ ] Test HashPack mobile app vs browser extension (both on testnet)

### 11.3 User Experience Testing (Testnet)
- [ ] Test HashPack wallet connection flow (first-time users on testnet)
- [ ] Test HashPack pairing QR code on mobile (testnet)
- [ ] Verify UI shows "TESTNET" network indicator
- [ ] Test NFT browsing experience (with and without wallet)
- [ ] Test NFT detail page display (testnet NFTs)
- [ ] Test transaction confirmation flows in HashPack (testnet)
- [ ] Test error handling and user feedback
- [ ] Test responsive design on mobile devices
- [ ] Test loading states and progress indicators
- [ ] Test wallet balance display (testnet HBAR)
- [ ] Test "My Portfolio" page with connected HashPack wallet (testnet NFTs)

---

## Phase 12: Migration from Testnet to Mainnet (Production Deployment)

**⚠️ IMPORTANT: Only proceed after thorough testing on testnet!**

### 12.1 Mainnet Preparation
- [ ] Complete ALL testnet testing and validation
- [ ] Document all testnet successes and learnings
- [ ] Obtain mainnet operator account from Hedera portal
- [ ] Purchase and fund operator account with sufficient HBAR (1000+ real HBAR recommended)
- [ ] Create NEW `.env.mainnet` file for mainnet configuration
- [ ] Set `HEDERA_NETWORK=mainnet` in mainnet config
- [ ] Review and adjust transaction fee limits for mainnet
- [ ] Review and confirm NFT royalty percentages (5%, 3%, 4%)
- [ ] Plan mainnet deployment timeline and rollout strategy
- [ ] Create mainnet deployment checklist
- [ ] Prepare rollback plan in case of issues
- [ ] Backup all testnet data for reference

### 12.2 Mainnet Deployment (Real Money - Be Careful!)
- [ ] Switch environment to MAINNET configuration
- [ ] Run account creation script on MAINNET (creates NEW accounts)
- [ ] Verify accounts created successfully on HashScan MAINNET
- [ ] Run topic creation script on MAINNET (creates NEW topics)
- [ ] Verify all topics created on HashScan MAINNET
- [ ] Run NFT collection creation script on MAINNET (creates NEW collections)
- [ ] Verify collections created with correct royalties on MAINNET
- [ ] Deploy smart contracts to MAINNET (if applicable)
- [ ] Verify smart contract deployments on MAINNET
- [ ] Mint initial NFTs on MAINNET (optional, with real HBAR cost)
- [ ] Generate MAINNET configuration files
- [ ] **Note:** All resource IDs will be different from testnet

### 12.3 Production Configuration (Mainnet)
- [ ] Generate production `config.json` with MAINNET resource IDs
- [ ] Generate production `frontend.env` with MAINNET configuration
- [ ] Set `NEXT_PUBLIC_HEDERA_NETWORK=mainnet` in production env
- [ ] Update frontend with production/mainnet environment variables
- [ ] Configure production mainnet mirror node endpoints
- [ ] Configure production IPFS gateways
- [ ] Set up monitoring and alerting systems for mainnet accounts
- [ ] Set up backup and recovery procedures
- [ ] Configure automated balance monitoring (real HBAR costs)
- [ ] Set up transaction cost tracking and alerts
- [ ] Update HashPack integration to use MAINNET

### 12.4 Production Launch (Mainnet - Live with Real Money!)
- [ ] Deploy frontend to production environment
- [ ] Ensure HashPack connects to MAINNET only
- [ ] Test all functionality on production/mainnet
- [ ] Verify all transactions use real HBAR
- [ ] Monitor initial transactions and user activity on HashScan MAINNET
- [ ] Prepare support documentation for users
- [ ] Set up customer support channels
- [ ] Monitor system performance and costs (real money!)
- [ ] Monitor HBAR balance in operator and treasury accounts
- [ ] Set up alerts for low balance warnings

---

## Maintenance & Operations

### Daily Operations
- [ ] Monitor platform account balances
- [ ] Monitor transaction success rates
- [ ] Check for failed transactions and retry if needed
- [ ] Review HCS topic message volumes
- [ ] Monitor IPFS content availability
- [ ] Check for system errors and alerts

### Weekly Operations
- [ ] Review transaction costs and optimize if needed
- [ ] Analyze NFT minting and transfer activity
- [ ] Review marketplace activity and listings
- [ ] Check account balance trends
- [ ] Review security logs for anomalies
- [ ] Update metadata for new NFTs
- [ ] Process any pending administrative tasks

### Monthly Operations
- [ ] Generate monthly activity reports
- [ ] Review and optimize transaction fees
- [ ] Audit platform accounts
- [ ] Review royalty collection statistics
- [ ] Plan for upcoming features and improvements
- [ ] Backup all critical data
- [ ] Review and update documentation

### Quarterly Operations
- [ ] Implement key rotation for security
- [ ] Review and update smart contracts if needed
- [ ] Conduct security audit
- [ ] Review compliance requirements
- [ ] Plan major platform upgrades
- [ ] Review disaster recovery procedures

### Future Enhancements
- [ ] Implement automated minting based on real-world asset registration
- [ ] Add multi-signature support for critical treasury operations
- [ ] Integrate oracle services for real-time property valuations
- [ ] Integrate weather oracles for agriculture NFTs
- [ ] Implement advanced KYC/AML compliance features
- [ ] Add fractional NFT ownership capabilities
- [ ] Implement NFT bundling (property portfolios)
- [ ] Add analytics and reporting dashboard
- [ ] Implement automated revenue distribution
- [ ] Add governance token for platform decisions
- [ ] Integrate with DeFi protocols for NFT-backed lending
- [ ] Add insurance integration for properties
- [ ] Implement dispute resolution mechanism

---

## Quick Reference: NPM Scripts

### Hedera Setup Scripts
```bash
npm run test:connection  # Test Hedera testnet connection
npm run test:ipfs        # Test IPFS/Pinata connection
npm run setup:accounts   # Create platform accounts
npm run setup:topics     # Create HCS topics
npm run setup:collections # Create NFT collections
npm run setup:mint       # Mint sample NFTs
npm run test:transfer    # Test NFT transfer
npm run upload:ipfs      # Upload property assets to IPFS
npm run setup:all        # Run all setup scripts in sequence (if available)
npm run deploy:contracts # Deploy smart contracts (optional)
npm run generate:config  # Generate frontend configuration (Phase 8)
```

### Frontend Development (Next.js)
```bash
npm install              # Install dependencies
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
```

### HashPack Integration
```bash
npm install hashconnect  # Install HashPack SDK
```

**HashPack Resources:**
- SDK Documentation: https://docs.hashpack.app/
- Browser Extension: https://chrome.google.com/webstore (search "HashPack")
- Mobile App: iOS App Store / Google Play Store
- Testnet/Mainnet: HashPack supports both networks

---

## NFT Collection Summary

| Collection | Symbol | Royalty | Use Cases |
|------------|--------|---------|-----------|
| Real Estate NFTs | RENWT | 5% | Residential homes, commercial buildings, land parcels |
| Agriculture NFTs | AGRINFT | 3% | Farmland, crop shares, livestock, agricultural equipment |
| Properties NFTs | PROPNFT | 4% | Warehouses, industrial facilities, parking lots, storage |

---

## Important Security Notes

⚠️ **CRITICAL REMINDERS:**
- **NEVER** commit `output/` directory to git (contains private keys!)
- **NEVER** commit `.env` file to git (contains operator credentials!)
- Store private keys in secure offline storage (hardware wallet, encrypted USB)
- Use separate accounts for development (testnet) and production (mainnet)
- Regularly backup all account information to multiple secure locations
- Implement key rotation every 90 days for security
- Monitor all platform accounts for unauthorized access
- Use hardware wallets for production mainnet accounts
- Enable 2FA on all Hedera portal accounts
- Keep operator account HBAR balance sufficient but not excessive
- Use multi-signature wallets for treasury account on mainnet
- Regular security audits for smart contracts
- Encrypt all backups with strong passwords

---

## Success Criteria

### ✅ Testnet Development Complete When:
- [ ] All 3 platform accounts created and funded on TESTNET
- [ ] All 20+ HCS topics operational on TESTNET
- [ ] All 3 NFT collections created with proper royalties on TESTNET
  - Real Estate NFTs (5%)
  - Agriculture NFTs (3%)
  - Properties NFTs (4%)
- [ ] Sample NFTs minted for each collection on TESTNET
- [ ] Metadata properly stored on IPFS
- [ ] Configuration files generated and validated for TESTNET
- [ ] Frontend successfully connects to Hedera TESTNET
- [ ] HashPack wallet integration working on TESTNET (connect, sign, disconnect)
- [ ] NFT listing page displays all testnet NFTs with filtering
- [ ] NFT creation forms functional for all 3 collections
- [ ] Admin can mint NFTs via HashPack from frontend (testnet)
- [ ] Users can view their portfolio via HashPack connection (testnet)
- [ ] All resources viewable on HashScan Testnet
- [ ] All security measures implemented
- [ ] Documentation complete and accurate
- [ ] All tests passing on TESTNET
- [ ] Team trained on operations

### ✅ Production Mainnet Launch Complete When:
- [ ] All testnet criteria met and validated
- [ ] Mainnet accounts created and funded with real HBAR
- [ ] Mainnet NFT collections deployed
- [ ] Mainnet HCS topics created
- [ ] Frontend configured for MAINNET
- [ ] HashPack integration tested on MAINNET
- [ ] Production monitoring and alerts active
- [ ] Customer support ready

---

## Project Timeline Estimate

- **Phase 1-2 (Setup & Utilities):** 1-2 days
- **Phase 3 (Accounts):** 1 day
- **Phase 4 (Topics):** 1-2 days
- **Phase 5 (Collections):** 2-3 days
- **Phase 6 (Minting):** 3-5 days
- **Phase 7 (Smart Contracts):** 1-2 weeks (optional)
- **Phase 8-9 (Config & Docs):** 2-3 days
- **Phase 10 (Frontend NFT Management):** 2-3 weeks
  - Backend API development: 3-5 days
  - NFT listing features: 3-5 days
  - NFT creation forms: 5-7 days
  - Testing and refinement: 3-4 days
- **Phase 11 (Frontend Integration):** 3-5 days
- **Phase 12 (Production Deployment):** 3-5 days

**Total Estimated Time:** 6-8 weeks (without smart contracts), 8-10 weeks (with smart contracts)

---

---

**Last Updated:** October 28, 2025
**Current Status:** Phase 6E Complete - Backend Operational with Full Documentation
**Development Network:** Hedera Testnet (FREE)
**Production Network:** Hedera Mainnet (Future - after testnet validation)
**Platform:** DeraLinks
**Wallet:** HashPack

---

## Getting Started - Testnet Setup

### Step 1: Get Free Testnet Account
1. Visit https://portal.hedera.com
2. Create free account
3. Receive 500 free testnet HBAR
4. Copy your `OPERATOR_ID` and `OPERATOR_KEY`

### Step 2: Configure Environment
Create `.env` file:
```bash
HEDERA_NETWORK=testnet
OPERATOR_ID=0.0.YOUR_TESTNET_ACCOUNT
OPERATOR_KEY=302e020100300506032b657004220420...
```

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Run Setup Scripts on Testnet
```bash
npm run setup:all
```

### Step 5: View Your Testnet Resources
- Visit https://hashscan.io/testnet
- Search for your account ID
- See your NFT collections, topics, and transactions

**Cost: $0 (Everything is FREE on testnet!)**

---

## Testnet → Mainnet Migration Path

### What Stays the Same:
✅ Your code
✅ NFT metadata schemas
✅ Smart contracts
✅ Frontend UI/UX
✅ HashPack integration code

### What Changes:
🔄 Environment variable: `HEDERA_NETWORK=mainnet`
🔄 Account IDs (new accounts on mainnet)
🔄 NFT Collection IDs (new collections on mainnet)
🔄 HCS Topic IDs (new topics on mainnet)
🔄 Operator account (needs real HBAR)
🔄 Transaction costs (real money on mainnet)

### Migration Process:
1. ✅ Develop and test everything on TESTNET (Phases 1-11)
2. ✅ Validate all functionality works perfectly
3. ✅ Create mainnet operator account with real HBAR
4. ✅ Run setup scripts on MAINNET (creates new resources)
5. ✅ Update frontend config to use mainnet resource IDs
6. ✅ Test on mainnet
7. ✅ Launch to production users

**Remember:** Testnet and mainnet are completely separate networks. Resources created on testnet do NOT transfer to mainnet. You'll create fresh resources on mainnet when ready.
