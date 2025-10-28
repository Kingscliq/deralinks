# Render Environment Variables - Complete Reference

Quick copy-paste reference for all environment variables needed on Render.

---

## 🔐 Critical Secrets (Set in Render Dashboard)

### Hedera Configuration

```bash
# From hedera-setup/output/accounts.json
OPERATOR_ID=0.0.7125108
OPERATOR_KEY=302e020100300506032b657004220420...

# Treasury Account
TREASURY_ACCOUNT_ID=0.0.7127072
TREASURY_PRIVATE_KEY=302e020100300506032b657004220420...

# Fee Collector Account
FEE_COLLECTOR_ACCOUNT_ID=0.0.7127073

# Admin Account
ADMIN_ACCOUNT_ID=0.0.7127074
```

### Pinata IPFS

```bash
# Get from https://app.pinata.cloud/developers/api-keys
PINATA_API_KEY=your_pinata_api_key_here
PINATA_SECRET_KEY=your_pinata_secret_key_here
PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Security Tokens

```bash
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=GENERATE_A_RANDOM_64_CHARACTER_HEX_STRING_HERE
SESSION_SECRET=GENERATE_ANOTHER_RANDOM_64_CHARACTER_HEX_STRING_HERE
```

---

## 🗄️ Database Configuration (Auto-filled by Render)

```bash
# PostgreSQL (Render provides these automatically)
DATABASE_URL=${deralinks-db.DATABASE_URL}
DB_HOST=${deralinks-db.HOST}
DB_PORT=${deralinks-db.PORT}
DB_USER=${deralinks-db.USER}
DB_PASSWORD=${deralinks-db.PASSWORD}
DB_NAME=deralinks
DB_SSL=true
DB_POOL_MIN=2
DB_POOL_MAX=10

# Redis (Render provides these automatically)
REDIS_URL=${deralinks-redis.REDIS_URL}
REDIS_HOST=${deralinks-redis.HOST}
REDIS_PORT=${deralinks-redis.PORT}
REDIS_PASSWORD=${deralinks-redis.PASSWORD}
```

---

## ⚙️ Application Configuration

```bash
# Server
NODE_ENV=production
PORT=3600
API_VERSION=v1

# Hedera Network
HEDERA_NETWORK=testnet
HEDERA_MIRROR_NODE_URL=https://testnet.mirrornode.hedera.com

# CORS (Update with your frontend URL)
CORS_ORIGIN=https://your-frontend-app.onrender.com
CORS_CREDENTIALS=true

# JWT
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Platform Fees
PLATFORM_FEE_PERCENTAGE=2.5
ROYALTY_FEE_PERCENTAGE=5.0

# DAO Governance Defaults
DEFAULT_QUORUM_PERCENTAGE=50
DEFAULT_APPROVAL_THRESHOLD=50
DEFAULT_VOTING_PERIOD_DAYS=7

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Cache TTL (seconds)
CACHE_TTL_SHORT=300
CACHE_TTL_MEDIUM=3600
CACHE_TTL_LONG=86400

# File Upload
MAX_FILE_SIZE_MB=10
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,application/pdf

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=/tmp/logs

# KYC Configuration
KYC_REQUIRED_FOR_PURCHASE=false
KYC_THRESHOLD_USD=2000
KYC_PROVIDER=sumsub

# Frontend URL (Update with actual URL)
FRONTEND_URL=https://your-frontend-app.onrender.com
```

---

## 📋 Copy-Paste Template for Render

Use this in Render Dashboard → Environment tab:

```bash
# ============================================
# CRITICAL SECRETS - Replace with real values
# ============================================

OPERATOR_ID=0.0.YOUR_OPERATOR_ID
OPERATOR_KEY=YOUR_302e_KEY_HERE
TREASURY_ACCOUNT_ID=0.0.YOUR_TREASURY_ID
TREASURY_PRIVATE_KEY=YOUR_302e_KEY_HERE
FEE_COLLECTOR_ACCOUNT_ID=0.0.YOUR_FEE_COLLECTOR_ID
ADMIN_ACCOUNT_ID=0.0.YOUR_ADMIN_ID

PINATA_API_KEY=YOUR_PINATA_API_KEY
PINATA_SECRET_KEY=YOUR_PINATA_SECRET_KEY
PINATA_JWT=YOUR_PINATA_JWT_TOKEN

JWT_SECRET=GENERATE_RANDOM_64_CHAR_HEX
SESSION_SECRET=GENERATE_RANDOM_64_CHAR_HEX

# ============================================
# APPLICATION CONFIGURATION
# ============================================

NODE_ENV=production
PORT=3600
API_VERSION=v1

HEDERA_NETWORK=testnet
HEDERA_MIRROR_NODE_URL=https://testnet.mirrornode.hedera.com

CORS_ORIGIN=https://your-frontend-app.onrender.com
CORS_CREDENTIALS=true

JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

PLATFORM_FEE_PERCENTAGE=2.5
ROYALTY_FEE_PERCENTAGE=5.0

DEFAULT_QUORUM_PERCENTAGE=50
DEFAULT_APPROVAL_THRESHOLD=50
DEFAULT_VOTING_PERIOD_DAYS=7

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

CACHE_TTL_SHORT=300
CACHE_TTL_MEDIUM=3600
CACHE_TTL_LONG=86400

MAX_FILE_SIZE_MB=10
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,application/pdf

LOG_LEVEL=info
LOG_FILE_PATH=/tmp/logs

KYC_REQUIRED_FOR_PURCHASE=false
KYC_THRESHOLD_USD=2000

FRONTEND_URL=https://your-frontend-app.onrender.com

# ============================================
# DATABASE (Auto-filled by Render)
# ============================================

DB_SSL=true
DB_POOL_MIN=2
DB_POOL_MAX=10
```

---

## 🔒 Where to Get Credentials

### Hedera Accounts
```bash
# Location: hedera-setup/output/accounts.json
cat /Users/user/Documents/deralinks/hedera-setup/output/accounts.json
```

### Pinata API Keys
```bash
# 1. Go to https://app.pinata.cloud
# 2. Sign in
# 3. API Keys → New Key
# 4. Copy API Key, API Secret, and JWT
```

### Generate JWT/Session Secrets
```bash
# Run this command twice for two different secrets:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## ⚠️ Security Checklist

Before deploying, verify:

- [ ] All `OPERATOR_KEY` and `TREASURY_PRIVATE_KEY` are kept secret
- [ ] Never commit secrets to git
- [ ] Use different credentials for dev/staging/production
- [ ] JWT_SECRET and SESSION_SECRET are random and unique
- [ ] CORS_ORIGIN matches your frontend URL exactly
- [ ] DATABASE_URL and REDIS_URL are using internal Render hostnames
- [ ] DB_SSL is set to `true` for Render PostgreSQL
- [ ] LOG_LEVEL is set to `info` or `warn` (not `debug`) in production

---

## 📝 Notes

1. **Database URLs**: Render auto-populates these when you link services
2. **CORS Origin**: Update after deploying frontend
3. **Secrets Rotation**: Change JWT_SECRET and SESSION_SECRET periodically
4. **Testnet vs Mainnet**: These settings are for TESTNET only
5. **Frontend URL**: Update once frontend is deployed to Render

---

**Last Updated**: October 28, 2025
**Configuration Version**: 1.0.0
**Network**: Hedera Testnet
