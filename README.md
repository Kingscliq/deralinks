# DeraLinks - Real Estate Tokenization Platform

DeraLinks is a comprehensive platform for tokenizing real estate assets on a DAG-based distributed ledger (Hedera). It enables property owners to fractionally tokenize their assets and create a marketplace for trading these tokens.

---

## 🏗️ Project Structure

```
deralinks/
├── backend/                    # Node.js/Express API server
├── app-react-version/          # React frontend application
├── hedera-setup/              # DAG ledger setup utilities
└── README.md                  # This file
```

---

## 🎯 Overview

DeraLinks combines DAG-based distributed ledger technology with real estate investment, providing:

- **Asset Tokenization**: Convert real estate properties into NFT collections on Hedera (a DAG-based distributed ledger)
- **Fractional Ownership**: Split properties into multiple NFT tokens for fractional investment
- **Marketplace**: Buy and sell property tokens on a decentralized marketplace
- **Wallet Integration**: Secure wallet connection via HashConnect (HashPack/Blade wallets)
- **IPFS Storage**: Decentralized storage for property images and documents via Pinata

---

## 🔧 Backend (`/backend`)

### Tech Stack

- **Runtime**: Node.js v18+
- **Framework**: Express.js
- **Database**: PostgreSQL 14+
- **Ledger / SDK**: Hedera (DAG-based ledger) via @hashgraph/sdk
- **Storage**: Pinata (IPFS)
- **Validation**: Express Validator
- **CORS**: Configured for frontend integration

### Key Features

- **Property Management**: Create, mint, and manage tokenized properties
- **Marketplace API**: List, buy, and manage property token listings
- **File Uploads**: Upload property images/documents to IPFS
- **User Holdings**: Track user NFT holdings via Hedera mirror node
- **Transaction Processing**: Handle Hedera token creation, minting, and transfers
- **Error Handling**: Comprehensive error codes and validation

### Environment Variables

```env
# Server
PORT=3600
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Hedera Configuration
HEDERA_NETWORK=testnet
OPERATOR_ID=0.0.xxxxx
OPERATOR_KEY=302...
TREASURY_ACCOUNT_ID=0.0.xxxxx
TREASURY_PRIVATE_KEY=302...

# IPFS (Pinata)
PINATA_JWT=your_pinata_jwt
PINATA_GATEWAY_URL=https://gateway.pinata.cloud

# CORS
FRONTEND_URL=https://your-frontend.vercel.app
```

### API Documentation

Comprehensive API documentation available at:

- `backend/API-DOCUMENTATION.md` - Full endpoint reference
- `backend/API-SCHEMAS.md` - Request/response schemas

### Key Endpoints

```
POST   /api/v1/properties/mint          # Mint new property NFTs
GET    /api/v1/properties                # List all properties
GET    /api/v1/users/:accountId/assets   # Get user's NFT holdings
POST   /api/v1/marketplace/list          # List NFTs for sale
GET    /api/v1/marketplace/listings      # Get marketplace listings
POST   /api/v1/marketplace/buy           # Purchase NFTs
POST   /api/v1/files/upload              # Upload file to IPFS
POST   /api/v1/files/upload-multiple     # Upload multiple files
```

### Local Development

```bash
cd backend
npm install
cp .env.example .env  # Configure environment variables
npm run dev           # Start development server on port 3600
```

### Deployment

- **Platform**: Render.com (or any Node.js hosting)
- **Database**: PostgreSQL managed service
- **Build Command**: `npm install`
- **Start Command**: `npm start`

---

## 💻 Frontend (`/app-react-version`)

### Tech Stack

- **Framework**: React 17 (Create React App)
  - _Note: React 17 is used due to HashConnect v0.2.9 compatibility. The wallet library is not compatible with React 18+. Upgrading would require migrating to a newer HashConnect version or alternative wallet connector._
- **Language**: JavaScript (ES2020+)
- **State Management**: React hooks + Context API
- **HTTP Client**: Axios
- **Wallet Integration**: HashConnect v0.2.9 (HashPack/Blade support)
- **Styling**: CSS3 with modern features

### Key Features

- **Wallet Connection**: Secure pairing with Hedera wallets via HashConnect
- **Asset Tokenization**: Upload property images/documents and mint NFTs
- **My Assets**: View owned property tokens with serial numbers
- **Marketplace**: Browse and purchase property tokens
- **Listing Management**: List owned NFTs for sale with custom pricing
- **Purchase Flow**: Buy property tokens with form-based checkout
- **Error Boundaries**: Graceful error handling prevents app crashes
- **Responsive Design**: Mobile-friendly interface

### Environment Variables

```env
REACT_APP_API_BASE_URL=https://your-backend-api.com/api/v1
REACT_APP_HASHCONNECT_NETWORK=testnet
```

### Core Components

```
src/
├── components/
│   ├── hedera/
│   │   └── walletConnect.js      # HashConnect wallet integration
│   ├── ui/
│   │   ├── Header.jsx            # Navigation header
│   │   ├── Hero.jsx              # Landing hero section
│   │   └── ConnectPrompt.jsx    # Wallet connection prompt
│   ├── Marketplace.jsx           # Browse listings
│   ├── MyAssets.jsx              # User's owned NFTs
│   ├── MyListings.jsx            # User's active listings
│   ├── MintForm.jsx              # Tokenize new assets
│   ├── NFTCard.jsx               # NFT display card
│   └── AssetDetails.jsx          # Asset detail view
├── api/
│   └── mockApi.js                # API client & error handling
├── context/
│   └── NotificationContext.jsx   # Global notifications
└── styles/                        # Component styles
```

### Local Development

```bash
cd app-react-version
npm install
npm start  # HTTPS dev server at https://localhost:3000
```

**Note**: HTTPS is required for HashConnect wallet integration, even in development.

### Build & Deployment

```bash
npm run build  # Creates production build in /build

# Deploy to Vercel (recommended)
# - Automatic deployments from Git
# - Edge network distribution
# - Environment variable management
```

### Deployment Notes

- **Platform**: Vercel (recommended) or any static hosting
- **Build Output**: `build/` directory
- **Environment Variables**: Set in hosting platform dashboard
- **CORS**: Backend must allow frontend domain

---

## 🔗 Hedera Setup Scripts (`/hedera-setup`)

Standalone TypeScript utilities for Hedera (DAG-based ledger) administration. **Not used by the React app at runtime** - these are for initial setup and testing.

### Purpose

- Create Hedera accounts, topics, and token collections
- Mint NFTs directly to the Hedera ledger
- Test transfers and IPFS uploads
- Manage KYC/verification NFTs
- Batch ledger operations

### Usage

```bash
cd hedera-setup
npm install
npm run setup:accounts     # Create accounts
npm run setup:collections  # Create NFT collections
npm run setup:mint         # Mint test NFTs
npm run test:connection    # Test Hedera connection
npm run upload:ipfs        # Test IPFS upload
# See package.json for all scripts
```

---

## 🔄 Application Workflows

### 1. Wallet Connection Flow

```
User clicks "Connect Wallet"
  ↓
HashConnect generates pairing code
  ↓
User scans QR code with HashPack/Blade wallet
  ↓
Wallet pairs and returns account ID
  ↓
Frontend stores pairing data locally
  ↓
User is authenticated and can transact
```

### 2. Asset Tokenization Flow

```
User fills out property details
  ↓
Upload images/documents to IPFS (via backend)
  ↓
Backend returns IPFS URLs
  ↓
Frontend sends mint request with metadata
  ↓
Backend creates Hedera token collection
  ↓
Backend mints NFTs to user's account
  ↓
Property appears in "My Assets"
```

### 3. Marketplace Listing Flow

```
User selects NFT from "My Assets"
  ↓
Clicks "List for Sale"
  ↓
Fills out listing form (price, quantity, duration)
  ↓
Backend creates marketplace listing
  ↓
Listing appears in marketplace
  ↓
Other users can purchase
```

### 4. Purchase Flow

```
Buyer browses marketplace
  ↓
Clicks "Buy" on listing
  ↓
Fills out purchase form (quantity, payment method)
  ↓
Backend processes Hedera transfer
  ↓
NFTs transferred to buyer's account
  ↓
Listing quantity updated
  ↓
Assets appear in buyer's "My Assets"
```

---

## 🛡️ Error Handling

### Frontend

- **Global Error Boundary**: Catches React component errors
- **API Error Handling**: Centralized error processing
- **User Notifications**: Toast notifications for all errors
- **Graceful Degradation**: App continues working despite errors

### Backend

- **Structured Error Codes**: Consistent error format
  ```json
  {
    "success": false,
    "error": {
      "code": "OWNERSHIP_ERROR",
      "message": "Seller does not own serial numbers: 1, 2, 3"
    }
  }
  ```
- **Validation**: Request validation with clear error messages
- **Transaction Error Handling**: Hedera-specific error handling
- **Logging**: Comprehensive error logging for debugging

---

## 🔐 Security Features

### Backend

- **CORS Protection**: Whitelisted frontend domains only
- **Input Validation**: All requests validated
- **SQL Injection Prevention**: Parameterized queries
- **Private Key Security**: Environment variables only
- **Rate Limiting**: API rate limits (recommended for production)

### Frontend

- **HTTPS Only**: Required for wallet connections
- **Local Storage**: Secure pairing data storage
- **No Private Keys**: Never stores private keys
- **CORS Compliance**: Respects backend CORS policies

---

## 📊 Data Flow

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Frontend  │ ←─API──→│   Backend    │ ←─SDK──→│   Hedera    │
│   (React)   │         │  (Express)   │         │ DAG-based ledger  │
└─────────────┘         └──────────────┘         └─────────────┘
       │                       │
       │                       ↓
       │                ┌──────────────┐
       │                │  PostgreSQL  │
       │                │   Database   │
       │                └──────────────┘
       │                       │
       └───────────────────────┼─────────────────────────→
                               ↓
                        ┌──────────────┐
                        │ IPFS/Pinata  │
                        │   Storage    │
                        └──────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL 14+
- Hedera testnet account (create at portal.hedera.com)
- Pinata account (for IPFS storage)
- HashPack or Blade wallet (for users)

### Quick Start

1. **Clone Repository**

   ```bash
   git clone <repository-url>
   cd deralinks
   ```

2. **Setup Backend**

   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your credentials
   npm run dev
   ```

3. **Setup Frontend**

   ```bash
   cd app-react-version
   npm install
   npm start
   ```

4. **Access Application**
   - Frontend: https://localhost:3000
   - Backend: http://localhost:3600

---

## 🧪 Testing

### Backend Testing

```bash
cd backend
npm test  # Run test suite
```

### Frontend Testing

```bash
cd app-react-version
npm test  # Run React tests
```

### Manual Testing Checklist

- [ ] Wallet connection (HashPack/Blade)
- [ ] Property minting with image upload
- [ ] View minted properties in "My Assets"
- [ ] List property for sale
- [ ] Browse marketplace listings
- [ ] Purchase property token
- [ ] View purchased tokens in "My Assets"
- [ ] Error handling (network errors, CORS, etc.)

---

## 📚 Documentation

### Backend

- `backend/README.md` - Backend setup & deployment
- `backend/API-DOCUMENTATION.md` - Complete API reference
- `backend/API-SCHEMAS.md` - Request/response schemas
- `backend/DEPLOY-README.md` - Deployment guide
- `backend/ENV-SETUP-SUMMARY.md` - Environment variables

### Frontend

- `app-react-version/README.md` - Frontend setup & usage

### Hedera Setup

- `hedera-setup/COMPLETE-NFT-GUIDE.md` - NFT setup guide
- `hedera-setup/NFT-BASED-KYC-MODEL.md` - KYC NFT implementation

---

## 🐛 Troubleshooting

### Common Issues

**Issue**: HashConnect wallet connection fails

- **Solution**: Ensure HTTPS is enabled, clear browser localStorage, remove old pairings from wallet

**Issue**: Images not displaying on NFT cards

- **Solution**: Verify IPFS URLs are accessible, check PINATA_GATEWAY_URL in backend

**Issue**: "Missing required fields" error when listing/buying

- **Solution**: Ensure frontend and backend parameter names match (ownerAccount, sellerAccount)

**Issue**: CORS errors

- **Solution**: Add frontend domain to backend FRONTEND_URL environment variable

**Issue**: Database connection fails

- **Solution**: Verify DATABASE_URL format and PostgreSQL is running

**Issue**: Hedera transaction errors

- **Solution**: Ensure OPERATOR_ID has sufficient HBAR balance on testnet

---

## 🤝 Contributing

1. Create feature branch from `main`
2. Make changes with clear commit messages
3. Test thoroughly (wallet connection, minting, marketplace)
4. Submit pull request with description

---

## 📄 License

[Your License Here]

---

## 🆘 Support

For issues and questions:

- Check API documentation
- Review error logs (frontend console & backend logs)
- Test with production build locally
- Verify environment variables are set correctly

---

## 🎯 Production Deployment Checklist

### Backend

- [ ] Set all environment variables
- [ ] Database migrations run
- [ ] CORS configured for frontend domain
- [ ] Hedera accounts funded
- [ ] Pinata JWT configured
- [ ] Error logging enabled

### Frontend

- [ ] Environment variables set in hosting platform
- [ ] Backend API URL configured
- [ ] Production build tested locally
- [ ] Wallet connection tested on deployed URL
- [ ] All routes tested (direct navigation + refresh)
- [ ] Error boundaries working

---

**Built with ❤️ using Hedera, React, and Node.js**

---

## � Demo & Resources

- **Live App (Deployed)**: https://deralinks.vercel.app/
- **Presentation (Loom)**: https://www.loom.com/share/1243fbce321f422694c144851be32053
- **Social (X)**: https://x.com/DeralinksA81789
- **Certificate**: https://drive.google.com/file/d/1xf_nrOFrc7p_6p6Bcujpt5DWTDU2_9Mj/view?usp=drive_link
- **GitHub Repository**: https://github.com/Kingscliq/deralinks
- **Hedera Account ID (testnet)**: `0.0.3778695`

> Security notice: the project's private keys MUST NOT be committed to source control or included in README files. The private key you provided has been intentionally omitted from this file. Store private keys in a secure secret manager or in a local `.env` file that's excluded from git (see `backend/.env.example` and `backend/ENV-SETUP-SUMMARY.md`). Example environment variable:

```
# backend/.env
OPERATOR_ID=0.0.3778695
OPERATOR_KEY=302...   # set this locally or in your secret manager
```

If you need guidance for secure secret storage, ask and I can suggest best practices (Vault, environment variables, platform secrets on Vercel/Render/etc.).

## �📞 Contact & Links

- **Hedera**: [portal.hedera.com](https://portal.hedera.com)
- **HashConnect**: [docs.hashconnect.hashpack.app](https://docs.hashconnect.hashpack.app)
- **Pinata**: [pinata.cloud](https://pinata.cloud)

---

_Last Updated: October 31, 2025_
