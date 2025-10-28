# DeraLinks Backend API

Node.js/TypeScript Express API for the DeraLinks NFT RWA Platform.

---

## 🚀 Quick Start

### Using Docker (Recommended)

From the root directory:

```bash
# 1. Configure environment
cp ../.env.docker ../.env

# 2. Start all services
docker-compose up

# 3. Test API
curl http://localhost:3600/health
```

### Local Development (Without Docker)

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your configuration

# 3. Start PostgreSQL & Redis locally
# (or use Docker only for databases)

# 4. Start development server
npm run dev
```

---

## 📦 Available Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm start            # Start production server
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm test             # Run tests
```

---

## 🛠️ Development with Docker

### View Logs
```bash
docker-compose logs -f backend
```

### Install Dependencies
```bash
docker exec -it deralinks-backend npm install package-name
```

### Run Commands
```bash
docker exec -it deralinks-backend npm run build
```

### Access Container Shell
```bash
docker exec -it deralinks-backend sh
```

### Hot Reload
Code changes in `src/` automatically restart the server.

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── index.ts              # Entry point
│   ├── config/               # Configuration
│   ├── controllers/          # Route controllers
│   ├── middleware/           # Express middleware
│   ├── models/               # Database models
│   ├── routes/               # API routes
│   ├── services/             # Business logic
│   │   ├── hedera.service.ts   # Hedera SDK integration
│   │   ├── ipfs.service.ts     # IPFS/Pinata integration
│   │   └── verification.service.ts # KYC verification
│   ├── utils/                # Utilities
│   └── types/                # TypeScript types
│
├── database/
│   ├── init/                 # Initial schema (Docker)
│   ├── migrations/           # Database migrations
│   └── seeds/                # Seed data
│
├── Dockerfile                # Container definition
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
└── .env.example              # Environment template
```

---

## 🔌 API Endpoints (Coming in Phase 6C)

### Properties
- `POST /api/v1/properties/mint` - Mint NFT collection
- `GET /api/v1/properties` - List all properties
- `GET /api/v1/properties/:id` - Get property details

### User Assets
- `GET /api/v1/users/:accountId/assets` - Get user's NFTs

### Marketplace
- `POST /api/v1/marketplace/list` - List NFT for sale
- `GET /api/v1/marketplace/listings` - Get all listings
- `POST /api/v1/marketplace/buy` - Purchase NFT

### Verification
- `GET /api/v1/verification/token-id` - Get verification token ID
- `GET /api/v1/verification/check/:accountId` - Check verification status

---

## 🗄️ Database

### Connect to PostgreSQL
```bash
docker exec -it deralinks-postgres psql -U deralinks -d deralinks_db
```

### Run Migrations
```bash
npm run db:migrate
```

### Seed Database
```bash
npm run db:seed
```

---

## 🔐 Environment Variables

See `.env.example` for full list. Key variables:

```bash
# Server
NODE_ENV=development
PORT=3600

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=deralinks
DB_PASSWORD=your_password
DB_NAME=deralinks_db

# Hedera
OPERATOR_ID=0.0.xxxxx
OPERATOR_KEY=your_key
HEDERA_NETWORK=testnet

# IPFS
PINATA_API_KEY=your_key
PINATA_SECRET_KEY=your_secret

# JWT
JWT_SECRET=your_secret
```

---

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- services/hedera.service.test.ts
```

---

## 📝 Code Style

- **TypeScript** for type safety
- **ESLint** for linting
- **Prettier** for formatting
- **Path aliases** (@/*, @config/*, @services/*, etc.)

```typescript
// Example: Using path aliases
import { createClient } from '@/utils/hedera';
import { uploadToIPFS } from '@services/ipfs.service';
import type { PropertyMetadata } from '@types/property';
```

---

## 🐛 Debugging

### View All Logs
```bash
docker-compose logs -f
```

### Backend Only
```bash
docker-compose logs -f backend
```

### Database Queries
```bash
docker exec -it deralinks-postgres psql -U deralinks -d deralinks_db -c "SELECT * FROM users LIMIT 5;"
```

### Redis Keys
```bash
docker exec -it deralinks-redis redis-cli KEYS "*"
```

---

## 🚀 Deployment

Production build:

```bash
npm run build
npm start
```

Docker production:

```bash
docker build --target production -t deralinks-backend:prod .
docker run -p 3600:3600 --env-file .env.production deralinks-backend:prod
```

---

## 📚 Documentation

- [Docker Setup](../DOCKER-SETUP.md) - Complete Docker guide
- [API Documentation](./docs/API.md) - API endpoints (coming soon)
- [Database Schema](./database/schema.md) - Database structure (coming soon)

---

## ✅ Health Check

```bash
curl http://localhost:3600/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-01-27T...",
  "environment": "development",
  "network": "testnet"
}
```

---

**Backend API ready for Phase 6C development!** 🎉
