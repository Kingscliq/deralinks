# DeraLinks Platform

DeraLinks is a full-stack platform for tokenizing real-world properties on Hedera Hashgraph, managing secondary-market listings, and exposing investor tooling through a web dashboard. The repository contains both the backend API and the React-based frontend.

---

## Table of Contents

1. [Repository Layout](#repository-layout)
2. [Backend API (`backend/`)](#backend-api-backend)
   - [Tech Stack](#tech-stack)
   - [Key Features](#key-features)
   - [Local Development](#local-development)
   - [Environment Variables](#environment-variables)
   - [Database Schema](#database-schema)
   - [API Documentation](#api-documentation)
3. [Frontend App (`app-react-version/`)](#frontend-app-app-react-version)
   - [Tech Stack](#tech-stack-1)
   - [Core Flows](#core-flows)
   - [Local Development](#local-development-1)
   - [Environment Variables](#environment-variables-1)
   - [Build & Deployment](#build--deployment)
4. [Shared Workflows](#shared-workflows)
5. [Troubleshooting & Tips](#troubleshooting--tips)
6. [Additional References](#additional-references)

---

## Repository Layout

```text
deralinks/
├── backend/                # Express + PostgreSQL backend API (TypeScript)
├── app-react-version/      # React 17 investor dashboard (Create React App)
├── database/               # SQL schema & migrations
├── Dockerfile              # Backend container definition
├── render.yaml             # Render deployment config
├── backend/API-*.md        # API documentation bundle
└── miscellaneous docs      # Deployment, environment, and ops guides
```

---

## Backend API (`backend/`)

### Tech Stack

- **Runtime:** Node.js 18+, Express
- **Language:** TypeScript (compiled via `ts-node` in dev, bundled for prod)
- **Database:** PostgreSQL (schema + migrations stored in `/database`)
- **Blockchain:** Hedera Hashgraph via `@hashgraph/sdk`
- **Storage:** IPFS (Pinata) for media/documents
- **Job Runner:** Scheduler service for blockchain/mirror-node sync

### Key Features

- **Property Minting:** Create Hedera NFT collections representing fractional ownership, with metadata pushed to IPFS.
- **Marketplace:** List NFTs for sale, manage offers, execute purchases.
- **Investor Holdings:** Aggregate holdings from Hedera mirror node + internal DB to provide portfolio insights.
- **DAO Module:** Allow property-level governance (proposals, votes, execution).
- **Verification Workflows:** KYC/property owner processes tied to verification NFTs.
- **File Uploads:** Proxy uploads to IPFS (Pinata) for images and documents.

### Local Development

```bash
cd backend
npm install
npm run dev   # Starts API on http://localhost:3600
```

### Environment Variables

Create `backend/.env` (see `ENV-SETUP-SUMMARY.md` for full list):

```
PORT=3600
DATABASE_URL=postgres://user:password@localhost:5432/deralinks
OPERATOR_ID=0.0.xxxxxxx
OPERATOR_KEY=302e...
TREASURY_ACCOUNT_ID=0.0.xxxxxxx
FEE_COLLECTOR_ACCOUNT_ID=0.0.xxxxxxx
PINATA_JWT=eyJ...
HEDERA_NETWORK=testnet
```

> **Note:** The configured Hedera operator/treasury accounts must maintain sufficient HBAR. Mint/list requests return `INSUFFICIENT_PAYER_BALANCE` otherwise.

### Database Schema

- Base schema: `database/schema.sql`
- Migrations: `database/migrations/`
- Init scripts: `database/init/`

### API Documentation

- `backend/API-DOCUMENTATION.md` – full reference with sample payloads.
- `backend/API-QUICK-REFERENCE.md` – endpoint cheat sheet.
- `backend/API-SCHEMAS.md` – JSON schema catalogue.
- `POSTMAN-COLLECTION.json` – importable testing collection.

---

## Frontend App (`app-react-version/`)

### Tech Stack

- **Framework:** React 17 (Create React App / `react-scripts@5`)
  - _Note: React 17 is used due to HashConnect wallet library compatibility. The HashConnect package (v0.2.9) used for Hedera wallet integration is not compatible with React 18+. Upgrading to React 18 would require migrating to a newer HashConnect version or alternative wallet connector._
- **Language:** JavaScript (ES2020+)
- **State Management:** React hooks + Context API
- **HTTP Client:** Axios
- **Wallet Connector:** HashConnect v0.2.9 (HashPack/Blade support)

### Core Flows

- **Wallet Connection:** Secure pairing with HashConnect; stores pairing info locally.
- **Tokenize Asset:** Upload media/docs to IPFS, assemble mint payload, invoke backend mint endpoint.
- **My Assets:** Display holdings sourced from Hedera mirror node + recently minted local cache.
- **Marketplace:** Browse listings, list owned NFTs, buy/sell on secondary market.
- **My Listings:** Surface listings created by the connected wallet (filters by seller account).

### Local Development

```bash
cd app-react-version
npm install
npm start   # HTTPS-enabled dev server at https://localhost:3000/
```

### Environment Variables

Optional `app-react-version/.env` overrides:

```
REACT_APP_API_BASE_URL=https://backend-host/api/v1
REACT_APP_HASHCONNECT_NETWORK=testnet
```

### Build & Deployment

- `npm run build` emits production bundle (`build/` directory).
- Frontend is deployed to Vercel (refer to last deployment instructions/README for specifics).

---

## Hedera Setup Scripts (`hedera-setup/`)

The `hedera-setup/` folder contains standalone TypeScript scripts for initial Hedera blockchain setup and testing. **These scripts are not used by the React application at runtime** - they're utilities for blockchain administrators and developers.

### Purpose

- Create Hedera accounts, topics, and token collections
- Mint NFTs directly to the blockchain
- Test token transfers and IPFS uploads
- Manage KYC/verification NFTs
- Batch operations for blockchain setup

### Usage

```bash
cd hedera-setup
npm install
npm run setup:accounts    # Create accounts
npm run setup:collections # Create NFT collections
npm run setup:mint        # Mint test NFTs
# See package.json for all available scripts
```

**Note:** The React app interacts with the Hedera blockchain through the backend API only. These scripts are for initial setup, testing, and administrative tasks.

---

## Shared Workflows

### File Uploads

1. Frontend sends `multipart/form-data` to `POST /api/v1/files/upload` or `/files/upload-multiple`.
2. Backend uploads to Pinata/IPFS and returns canonical `gatewayUrl` / `ipfsUrl` plus CID.
3. Frontend injects returned URLs into `images`/`documents` fields when minting or updating assets.

### Mint ➔ Portfolio Lifecycle

- Immediately after mint, frontend caches the response so the asset appears under **My Assets**.
- Background jobs ingest Hedera mirror node events to sync holdings in the database.

### Marketplace Lifecycle

1. Seller lists NFTs: `POST /api/v1/marketplace/list`.
2. Listings appear via `GET /api/v1/marketplace/listings` (filters supported).
3. Buyers interact through offers (`/offers`) or instant purchases (`/buy`).

---

## Troubleshooting & Tips

- **Hedera Insufficient Balance:** Ensure `OPERATOR_ID` / `TREASURY_ACCOUNT_ID` have HBAR on the configured network.
- **HashConnect “Invalid encrypted text”:** Clear local storage and wallet pairings if you change `hashconnect` versions; stale encrypted payloads cause decryption failures.
- **Webpack Ajv Error (`Cannot find module 'ajv/dist/compile/codegen'`):** Pin `ajv@^8` and `ajv-keywords@^5` alongside `react-scripts@5`.
- **HTTPS Requirement:** Wallet connections demand HTTPS even locally (the `start` script sets `HTTPS=true`).
- **Logging:** Backend logs include Hedera transaction IDs, IPFS upload CIDs, and detailed error codes—monitor them during integration.

---

## Additional References

- `backend/README.md` – in-depth backend setup, Docker usage, deployment notes.
- `app-react-version/README.md` – frontend-specific instructions and workflow tips.
- `DOCKER-SETUP.md`, `DEPLOY-README.md`, `RENDER-DEPLOYMENT-GUIDE.md` – operational docs.
- `ENV-SETUP-SUMMARY.md` – consolidated environment variable checklist.

Happy building! ✨
