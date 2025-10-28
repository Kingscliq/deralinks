# DeraLinks Backend - Render Deployment Guide

Complete guide to deploying the DeraLinks backend API to Render using Docker.

---

## 📋 Prerequisites

Before deploying, ensure you have:

- [x] Render account created (https://render.com)
- [x] GitHub repository with backend code
- [x] Hedera testnet operator account and keys
- [x] Pinata API keys for IPFS
- [x] All environment variables documented

---

## 🚀 Deployment Methods

### **Method 1: Blueprint Deployment (RECOMMENDED - Easiest)**

Uses the `render.yaml` file to automatically create all services.

### **Method 2: Manual Deployment (More Control)**

Manually create each service through Render Dashboard.

---

## 📦 Method 1: Blueprint Deployment

### Step 1: Push Code to GitHub

```bash
cd /Users/user/Documents/deralinks

# If not already a git repo
git init
git add .
git commit -m "Initial commit - DeraLinks backend"

# Create a new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/deralinks.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy via Render Dashboard

1. Go to https://dashboard.render.com
2. Click **"New"** → **"Blueprint"**
3. Connect your GitHub repository
4. Select the repository: `deralinks`
5. Render will detect `backend/render.yaml`
6. Review the services to be created:
   - PostgreSQL database (`deralinks-db`)
   - Redis cache (`deralinks-redis`)
   - Web service (`deralinks-backend`)

### Step 3: Configure Secret Environment Variables

Render will prompt you to set these secrets (marked with `sync: false` in render.yaml):

#### Hedera Configuration
```
OPERATOR_ID=0.0.YOUR_OPERATOR_ID
OPERATOR_KEY=302e020100300506032b657004220420...
TREASURY_ACCOUNT_ID=0.0.YOUR_TREASURY_ID
FEE_COLLECTOR_ACCOUNT_ID=0.0.YOUR_FEE_COLLECTOR_ID
ADMIN_ACCOUNT_ID=0.0.YOUR_ADMIN_ID
```

#### Pinata IPFS
```
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
PINATA_JWT=your_pinata_jwt_token
```

### Step 4: Deploy

1. Click **"Apply"** to create all services
2. Wait for deployment (5-10 minutes)
3. Monitor build logs in Render Dashboard

### Step 5: Run Database Migrations

Once deployed, run migrations via Render Shell:

1. Go to your web service in Render Dashboard
2. Click **"Shell"** tab
3. Run migration commands:

```bash
# Connect to database and run migrations
psql $DATABASE_URL < database/migrations/001-init-schema.sql
psql $DATABASE_URL < database/migrations/002-add-dao-governance.sql

# Verify tables were created
psql $DATABASE_URL -c "\dt"
```

### Step 6: Verify Deployment

Check health endpoint:
```bash
curl https://your-service-name.onrender.com/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-10-28T...",
  "environment": "production",
  "network": "testnet"
}
```

---

## 🔧 Method 2: Manual Deployment

### Step 1: Create PostgreSQL Database

1. Go to Render Dashboard → **New** → **PostgreSQL**
2. Configure:
   - **Name**: `deralinks-db`
   - **Database**: `deralinks`
   - **User**: `deralinks` (auto-generated)
   - **Region**: Choose closest to you
   - **Plan**: Starter ($7/month) or Free
3. Click **"Create Database"**
4. Save the connection details (Internal Database URL)

### Step 2: Create Redis Instance

1. Go to Render Dashboard → **New** → **Redis**
2. Configure:
   - **Name**: `deralinks-redis`
   - **Region**: Same as PostgreSQL
   - **Plan**: Starter ($7/month) or Free
   - **Maxmemory Policy**: `allkeys-lru`
3. Click **"Create Redis"**
4. Save the connection details (Internal Redis URL)

### Step 3: Create Web Service

1. Go to Render Dashboard → **New** → **Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `deralinks-backend`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Environment**: `Docker`
   - **Dockerfile Path**: `./Dockerfile`
   - **Docker Build Context Directory**: `.`
   - **Plan**: Starter ($7/month) or Free

### Step 4: Configure Environment Variables

Click **"Environment"** tab and add all variables:

#### Required Secrets (CRITICAL - Keep Private)

```bash
# Hedera Testnet
OPERATOR_ID=0.0.YOUR_OPERATOR_ID
OPERATOR_KEY=302e020100300506032b657004220420...
TREASURY_ACCOUNT_ID=0.0.YOUR_TREASURY_ID
TREASURY_PRIVATE_KEY=302e020100300506032b657004220420...
FEE_COLLECTOR_ACCOUNT_ID=0.0.YOUR_FEE_COLLECTOR_ID
ADMIN_ACCOUNT_ID=0.0.YOUR_ADMIN_ID

# Pinata IPFS
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
PINATA_JWT=your_pinata_jwt_token

# Security
JWT_SECRET=generate_a_random_64_character_string_here
SESSION_SECRET=generate_another_random_64_character_string
```

#### Database Configuration (Auto-filled from Render)

```bash
DATABASE_URL=${POSTGRES_CONNECTION_STRING}  # From PostgreSQL service
REDIS_URL=${REDIS_CONNECTION_STRING}        # From Redis service

# Or configure manually:
DB_HOST=<from PostgreSQL internal hostname>
DB_PORT=5432
DB_USER=<from PostgreSQL>
DB_PASSWORD=<from PostgreSQL>
DB_NAME=deralinks
DB_SSL=true
DB_POOL_MIN=2
DB_POOL_MAX=10

REDIS_HOST=<from Redis internal hostname>
REDIS_PORT=6379
REDIS_PASSWORD=<from Redis>
```

#### Application Configuration

```bash
NODE_ENV=production
PORT=3600
API_VERSION=v1

# Hedera Network
HEDERA_NETWORK=testnet
HEDERA_MIRROR_NODE_URL=https://testnet.mirrornode.hedera.com

# CORS (Update after deploying frontend)
CORS_ORIGIN=https://your-frontend-url.onrender.com
CORS_CREDENTIALS=true

# Platform Fees
PLATFORM_FEE_PERCENTAGE=2.5
ROYALTY_FEE_PERCENTAGE=5.0

# DAO Governance
DEFAULT_QUORUM_PERCENTAGE=50
DEFAULT_APPROVAL_THRESHOLD=50
DEFAULT_VOTING_PERIOD_DAYS=7

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Cache TTL
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

# Frontend URL (Update later)
FRONTEND_URL=https://your-frontend-url.onrender.com
```

### Step 5: Deploy

1. Click **"Create Web Service"**
2. Render will build the Docker image
3. Monitor build logs
4. Wait for first deployment (5-10 minutes)

### Step 6: Run Database Migrations

After deployment, access the Shell:

```bash
# Method 1: Via Render Shell
# Go to your service → Shell tab → Run:
psql $DATABASE_URL < database/migrations/001-init-schema.sql
psql $DATABASE_URL < database/migrations/002-add-dao-governance.sql

# Method 2: From local machine (if database is publicly accessible)
psql "postgres://user:pass@host:port/db" < backend/database/migrations/001-init-schema.sql
psql "postgres://user:pass@host:port/db" < backend/database/migrations/002-add-dao-governance.sql
```

---

## ✅ Post-Deployment Verification

### 1. Check Health Endpoint

```bash
curl https://your-service-name.onrender.com/health
```

Expected:
```json
{
  "status": "ok",
  "timestamp": "2025-10-28T20:00:00.000Z",
  "environment": "production",
  "network": "testnet"
}
```

### 2. Check API Root

```bash
curl https://your-service-name.onrender.com/api/v1
```

### 3. Test Database Connection

Check logs in Render Dashboard for:
```
✅ Connected to PostgreSQL database
✅ Redis connected successfully
```

### 4. Test an Endpoint

```bash
# Get all properties
curl https://your-service-name.onrender.com/api/v1/properties

# Get health with verbose output
curl -v https://your-service-name.onrender.com/health
```

### 5. Monitor Logs

In Render Dashboard:
- Go to your service
- Click **"Logs"** tab
- Watch for errors or warnings

---

## 🔐 Security Best Practices

### Environment Variables Security

✅ **DO:**
- Use Render's encrypted environment variables
- Generate strong random strings for JWT_SECRET and SESSION_SECRET
- Keep operator keys and private keys secure
- Use different credentials for dev/staging/production

❌ **DON'T:**
- Commit `.env` files to git
- Share operator keys publicly
- Use weak/predictable secrets
- Hardcode sensitive data in code

### Generate Secure Secrets

```bash
# Generate JWT_SECRET (64 characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate SESSION_SECRET (64 characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🐛 Troubleshooting

### Build Failures

**Error: "Cannot find module"**
```bash
# Solution: Clear build cache
# In Render Dashboard → Settings → Clear Build Cache
```

**Error: "npm install failed"**
```bash
# Check package.json is valid
# Ensure all dependencies are listed
```

### Database Connection Issues

**Error: "Connection refused"**
```bash
# Check DATABASE_URL is set correctly
# Verify PostgreSQL service is running
# Check DB_SSL=true for Render PostgreSQL
```

**Fix:**
```bash
# Use internal hostname (not public)
# Example: deralinks-db.internal:5432
```

### Migration Failures

**Error: "relation already exists"**
```sql
-- Migrations already ran, skip or use DROP TABLE IF EXISTS
```

**Error: "permission denied"**
```sql
-- Check database user has CREATE permissions
-- Render PostgreSQL user should have full permissions by default
```

### Runtime Errors

**Error: "CORS blocked"**
```bash
# Update CORS_ORIGIN with actual frontend URL
CORS_ORIGIN=https://your-frontend-url.onrender.com
```

**Error: "ECONNREFUSED redis"**
```bash
# Check REDIS_URL is set correctly
# Verify Redis service is running
```

### Performance Issues

**Slow API responses**
```bash
# Upgrade plan from Free to Starter
# Free tier spins down after 15 min inactivity
# Paid plans have persistent instances
```

---

## 📊 Monitoring & Maintenance

### View Logs

```bash
# Real-time logs in Render Dashboard
# Or use Render CLI:
render logs --service deralinks-backend --tail
```

### Database Backups

Render PostgreSQL auto-backups:
- **Starter plan**: Daily backups (7 days retention)
- **Pro plan**: Continuous backups (30 days retention)

Manual backup:
```bash
# Download backup from Render Dashboard
# Settings → Backups → Download
```

### Scaling

Horizontal scaling (multiple instances):
1. Dashboard → Service → Settings
2. Increase **Instance Count**
3. Load balancing handled automatically

Vertical scaling (more resources):
1. Upgrade plan (Starter → Pro)
2. More CPU, RAM, better performance

---

## 💰 Cost Estimate

### Minimum Setup (Free Tier - Development)

- PostgreSQL: Free (expires after 90 days)
- Redis: Free (limited features)
- Web Service: Free (limited, spins down)

**Total: $0/month** (development only)

### Recommended Setup (Production)

- PostgreSQL Starter: $7/month
- Redis Starter: $7/month
- Web Service Starter: $7/month

**Total: $21/month**

### Professional Setup

- PostgreSQL Pro: $20/month
- Redis Pro: $20/month
- Web Service Pro: $25/month

**Total: $65/month** (better performance, more resources)

---

## 🔄 Continuous Deployment

### Auto-Deploy on Git Push

Enabled by default:
1. Push code to `main` branch
2. Render automatically detects changes
3. Builds new Docker image
4. Deploys with zero downtime

### Manual Deploy

```bash
# In Render Dashboard
Service → Manual Deploy → Deploy latest commit
```

### Deploy Specific Branch/Commit

```bash
# In Render Dashboard
Service → Settings → Branch
# Change to different branch or tag
```

---

## 📚 Additional Resources

- **Render Docs**: https://render.com/docs
- **Render Status**: https://status.render.com
- **Docker Docs**: https://docs.docker.com
- **PostgreSQL Docs**: https://www.postgresql.org/docs
- **Hedera Docs**: https://docs.hedera.com

---

## 🎯 Next Steps After Deployment

1. ✅ Test all 40 API endpoints with Postman
2. ✅ Update CORS_ORIGIN with actual frontend URL (when deployed)
3. ✅ Set up monitoring and alerts
4. ✅ Configure custom domain (optional)
5. ✅ Enable HTTPS (automatic on Render)
6. ✅ Set up staging environment (duplicate services)
7. ✅ Deploy frontend to Render
8. ✅ Test full integration (frontend + backend)

---

## ⚠️ Important Notes

- **Testnet Only**: Currently configured for Hedera testnet
- **Migration to Mainnet**: Requires new environment variables (Phase 12)
- **Free Tier Limits**: Services spin down after 15 min inactivity
- **Database SSL**: Always use SSL=true for Render PostgreSQL
- **Environment Sync**: Don't commit secrets to git

---

**Last Updated**: October 28, 2025
**Deployment Status**: Ready for Production (Testnet)
**Backend Version**: 1.0.0 (40 endpoints operational)
