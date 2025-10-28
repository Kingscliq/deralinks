# Environment Variables - Setup Summary

Complete environment variables setup for DeraLinks backend deployment.

---

## ✅ Files Updated

### 1. `.env.example` - Template File
**Purpose:** Template for developers and deployment

**Features:**
- ✅ All 60+ environment variables documented
- ✅ Clear section headers for organization
- ✅ Inline comments explaining each variable
- ✅ Required variables marked with `<REQUIRED>`
- ✅ Setup instructions at the top
- ✅ Security best practices documented
- ✅ Links to deployment guides

**Usage:**
```bash
# For new developers
cp .env.example .env
# Then fill in required values
```

### 2. `.env` - Active Configuration
**Purpose:** Current working configuration (local development)

**Status:**
- ✅ All variables present
- ✅ Current Hedera testnet credentials preserved
- ✅ Pinata keys intact
- ✅ Added DATABASE_URL and REDIS_URL comments for Render
- ✅ Enhanced with deployment notes

**Security:**
- ✅ Excluded from git via `.gitignore`
- ⚠️ Contains real credentials - NEVER commit to git

---

## 📊 Environment Variables Breakdown

### Total Variables: 60+

| Category | Count | Examples |
|----------|-------|----------|
| **Server** | 3 | NODE_ENV, PORT, API_VERSION |
| **Database** | 10 | DB_HOST, DB_PORT, DATABASE_URL, DB_SSL |
| **Redis** | 6 | REDIS_HOST, REDIS_PORT, REDIS_URL |
| **Hedera** | 4 | OPERATOR_ID, OPERATOR_KEY, HEDERA_NETWORK |
| **Platform Accounts** | 4 | TREASURY_ACCOUNT_ID, FEE_COLLECTOR_ACCOUNT_ID |
| **Verification NFTs** | 6 | VERIFICATION_TOKEN_*, VERIFICATION_SUPPLY_KEY_* |
| **IPFS/Pinata** | 3 | PINATA_API_KEY, PINATA_SECRET_KEY, PINATA_JWT |
| **JWT/Security** | 4 | JWT_SECRET, SESSION_SECRET, JWT_EXPIRES_IN |
| **CORS** | 2 | CORS_ORIGIN, CORS_CREDENTIALS |
| **Rate Limiting** | 2 | RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS |
| **Platform Fees** | 2 | PLATFORM_FEE_PERCENTAGE, ROYALTY_FEE_PERCENTAGE |
| **DAO Governance** | 3 | DEFAULT_QUORUM_PERCENTAGE, DEFAULT_APPROVAL_THRESHOLD |
| **Cache** | 3 | CACHE_TTL_SHORT, CACHE_TTL_MEDIUM, CACHE_TTL_LONG |
| **File Upload** | 2 | MAX_FILE_SIZE_MB, ALLOWED_FILE_TYPES |
| **Logging** | 2 | LOG_LEVEL, LOG_FILE_PATH |
| **KYC** | 5 | KYC_REQUIRED_FOR_PURCHASE, KYC_THRESHOLD_USD |
| **Email** | 5 | SMTP_HOST, SMTP_PORT, EMAIL_FROM |
| **Frontend** | 1 | FRONTEND_URL |
| **External APIs** | 2 | GOOGLE_MAPS_API_KEY, PROPERTY_VALUATION_API_KEY |

---

## 🔐 Required for Deployment

### Critical Secrets (MUST SET)

```bash
# Hedera (from hedera-setup/output/accounts.json)
OPERATOR_ID=0.0.7125108
OPERATOR_KEY=<your_operator_key>

# Pinata (from pinata.cloud)
PINATA_API_KEY=<your_api_key>
PINATA_SECRET_KEY=<your_secret>
PINATA_JWT=<your_jwt>

# Security (generate new)
JWT_SECRET=<generate_random_64_char_hex>
SESSION_SECRET=<generate_random_64_char_hex>
```

### Auto-Provided by Render

```bash
# These are automatically set by Render when you link services
DATABASE_URL=<auto_provided>
REDIS_URL=<auto_provided>
```

### Update After Frontend Deployment

```bash
# Update these once frontend is deployed
CORS_ORIGIN=https://your-frontend.onrender.com
FRONTEND_URL=https://your-frontend.onrender.com
```

---

## 🚀 Quick Setup Guide

### For Local Development

1. **Copy example file:**
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Fill in Hedera credentials:**
   ```bash
   # From hedera-setup/output/accounts.json
   OPERATOR_ID=0.0.7125108
   OPERATOR_KEY=<your_key>
   ```

3. **Add Pinata credentials:**
   ```bash
   # From https://app.pinata.cloud
   PINATA_API_KEY=<your_key>
   PINATA_SECRET_KEY=<your_secret>
   PINATA_JWT=<your_jwt>
   ```

4. **Generate secrets:**
   ```bash
   # Generate JWT_SECRET
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

   # Generate SESSION_SECRET
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

5. **Start services:**
   ```bash
   docker-compose up -d
   ```

### For Render Deployment

1. **Use Render Dashboard** environment variables UI
2. **Copy from `RENDER-ENV-VARIABLES.md`**
3. **Let Render auto-provide** DATABASE_URL and REDIS_URL
4. **Update production-specific values:**
   ```bash
   NODE_ENV=production
   DB_SSL=true
   LOG_FILE_PATH=/tmp/logs
   LOG_LEVEL=info
   ```

---

## 📝 Environment Variable Precedence

### Database Connection

```
Priority 1: DATABASE_URL (if set)
Priority 2: Individual params (DB_HOST, DB_PORT, etc.)
```

**Local Development:**
- Use individual params (DB_HOST, DB_PORT, etc.)
- DATABASE_URL can be commented out

**Render Deployment:**
- DATABASE_URL is auto-provided and takes precedence
- Individual params can remain but are ignored

### Redis Connection

```
Priority 1: REDIS_URL (if set)
Priority 2: Individual params (REDIS_HOST, REDIS_PORT, etc.)
```

Same logic as database connection.

---

## 🔒 Security Checklist

Before deployment, ensure:

- [ ] `.env` file is in `.gitignore` ✅ (already configured)
- [ ] Never commit real credentials to git
- [ ] Generate new JWT_SECRET for production (not development value)
- [ ] Generate new SESSION_SECRET for production
- [ ] Use different Hedera accounts for dev/staging/production
- [ ] Keep operator keys and private keys secure
- [ ] Enable 2FA on Hedera portal account
- [ ] Rotate secrets periodically (every 90 days)
- [ ] Use Render's secret encryption feature
- [ ] Never share credentials via email/Slack/Discord

---

## 🔧 Troubleshooting

### Variables Not Loading

**Problem:** Environment variables not being read

**Solution:**
```bash
# Check if .env exists
ls -la backend/.env

# Check if dotenv is configured
# In backend/src/index.ts, ensure:
# import 'dotenv/config';
```

### Database Connection Failed

**Problem:** Can't connect to PostgreSQL

**Solution:**
```bash
# Local development - Check docker-compose is running
docker-compose ps

# Render - Check DATABASE_URL is set
# Dashboard → Service → Environment → DATABASE_URL
```

### Redis Connection Failed

**Problem:** Can't connect to Redis

**Solution:**
```bash
# Local development - Check Redis container
docker-compose logs redis

# Render - Check REDIS_URL is set
# Dashboard → Service → Environment → REDIS_URL
```

### CORS Errors in Production

**Problem:** Frontend can't access API

**Solution:**
```bash
# Update CORS_ORIGIN with actual frontend URL
CORS_ORIGIN=https://your-actual-frontend.onrender.com

# NOT localhost, NOT wildcard (*)
```

---

## 📚 Related Documentation

| Document | Purpose |
|----------|---------|
| `.env.example` | Template with all variables |
| `RENDER-ENV-VARIABLES.md` | Render-specific setup guide |
| `RENDER-DEPLOYMENT-GUIDE.md` | Complete deployment instructions |
| `DEPLOYMENT-CHECKLIST.md` | Quick deployment checklist |

---

## 💡 Best Practices

### Local Development
- ✅ Use `.env` for local configuration
- ✅ Keep .env excluded from git
- ✅ Use docker-compose for PostgreSQL and Redis
- ✅ Use development/debug log levels
- ✅ Use localhost for CORS_ORIGIN

### Production (Render)
- ✅ Use Render environment variables UI
- ✅ Let Render auto-provide DATABASE_URL and REDIS_URL
- ✅ Set DB_SSL=true
- ✅ Use info/warn log levels (not debug)
- ✅ Use actual frontend URL for CORS_ORIGIN
- ✅ Use /tmp/logs for LOG_FILE_PATH
- ✅ Set NODE_ENV=production

### Security
- ✅ Generate new secrets for each environment
- ✅ Never reuse development secrets in production
- ✅ Rotate secrets every 90 days
- ✅ Use different Hedera accounts per environment
- ✅ Enable Render secret encryption
- ✅ Review environment variables regularly

---

## ✅ Summary

**Files Updated:**
- ✅ `.env` - Enhanced with deployment notes
- ✅ `.env.example` - Complete template with 60+ variables

**Security:**
- ✅ `.env` excluded from git
- ✅ No credentials committed
- ✅ Best practices documented

**Deployment:**
- ✅ Render-compatible configuration
- ✅ DATABASE_URL and REDIS_URL support
- ✅ Production-specific settings documented

**Documentation:**
- ✅ Complete variable reference
- ✅ Setup instructions included
- ✅ Troubleshooting guide added

---

**Status:** ✅ READY FOR DEPLOYMENT

**Last Updated:** October 28, 2025

**Variables Count:** 60+

**Documentation:** Complete
