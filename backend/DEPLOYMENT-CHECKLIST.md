# 🚀 Render Deployment Checklist

Quick checklist to deploy DeraLinks backend to Render in under 30 minutes.

---

## ✅ Pre-Deployment Checklist

### 1. Code Ready
- [ ] All code committed to git
- [ ] Backend tests passing locally
- [ ] Health endpoint working (`/health`)
- [ ] All 40 API endpoints tested with Postman
- [ ] Database migrations files ready

### 2. Credentials Ready
- [ ] Hedera operator ID and key (from `hedera-setup/output/accounts.json`)
- [ ] Treasury, fee collector, admin account IDs
- [ ] Pinata API keys (API Key, Secret, JWT)
- [ ] Generated JWT_SECRET (64 char random hex)
- [ ] Generated SESSION_SECRET (64 char random hex)

### 3. GitHub Repository
- [ ] Code pushed to GitHub
- [ ] Repository is accessible
- [ ] `backend/` directory contains Dockerfile
- [ ] `backend/render.yaml` present

---

## 🎯 Deployment Steps (Blueprint Method)

### Step 1: Create Render Account
⏱️ Time: 2 minutes

- [ ] Go to https://render.com
- [ ] Sign up with GitHub
- [ ] Verify email
- [ ] Connect GitHub account

### Step 2: Create New Blueprint
⏱️ Time: 2 minutes

- [ ] Dashboard → New → Blueprint
- [ ] Select your GitHub repository
- [ ] Render detects `backend/render.yaml`
- [ ] Review services:
  - PostgreSQL database
  - Redis cache
  - Web service

### Step 3: Configure Secrets
⏱️ Time: 5 minutes

Add these in Render's environment variable UI:

```bash
# Hedera (CRITICAL - from hedera-setup/output/accounts.json)
OPERATOR_ID=0.0.YOUR_ID
OPERATOR_KEY=302e020100...
TREASURY_ACCOUNT_ID=0.0.YOUR_ID
TREASURY_PRIVATE_KEY=302e020100...
FEE_COLLECTOR_ACCOUNT_ID=0.0.YOUR_ID
ADMIN_ACCOUNT_ID=0.0.YOUR_ID

# Pinata (CRITICAL - from Pinata dashboard)
PINATA_API_KEY=your_key
PINATA_SECRET_KEY=your_secret
PINATA_JWT=eyJhbGciOi...

# Security (CRITICAL - generate new random values)
JWT_SECRET=<64 char hex>
SESSION_SECRET=<64 char hex>
```

Generate secrets:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 4: Deploy
⏱️ Time: 10 minutes

- [ ] Click "Apply" to create services
- [ ] Wait for build to complete
- [ ] Monitor build logs
- [ ] Check for errors

### Step 5: Run Database Migrations
⏱️ Time: 3 minutes

Once deployed:

1. Go to web service in dashboard
2. Click "Shell" tab
3. Run migrations:

```bash
psql $DATABASE_URL < database/migrations/001-init-schema.sql
psql $DATABASE_URL < database/migrations/002-add-dao-governance.sql

# Verify
psql $DATABASE_URL -c "\dt"
```

### Step 6: Verify Deployment
⏱️ Time: 5 minutes

- [ ] Test health endpoint:
```bash
curl https://your-app.onrender.com/health
```

- [ ] Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-10-28T...",
  "environment": "production",
  "network": "testnet"
}
```

- [ ] Test API root:
```bash
curl https://your-app.onrender.com/api/v1
```

- [ ] Check logs for database connection:
```
✅ Connected to PostgreSQL database
✅ Redis connected successfully
```

---

## 🎉 Post-Deployment Tasks

### Immediate (After Deploy)
- [ ] Save Render service URLs
- [ ] Test all 40 endpoints with Postman
- [ ] Update Postman collection base URL
- [ ] Monitor logs for 15 minutes

### Within 24 Hours
- [ ] Update CORS_ORIGIN when frontend is deployed
- [ ] Set up monitoring/alerts
- [ ] Document production URLs
- [ ] Test NFT minting on testnet
- [ ] Test marketplace endpoints

### Within 1 Week
- [ ] Load testing
- [ ] Monitor performance metrics
- [ ] Review logs for errors
- [ ] Optimize slow queries
- [ ] Set up staging environment

---

## 🐛 Common Issues & Quick Fixes

### Build Fails
```bash
# Clear build cache
Dashboard → Service → Settings → Clear Build Cache → Deploy
```

### Database Connection Failed
```bash
# Verify DATABASE_URL is set
Dashboard → Service → Environment → Check DATABASE_URL

# Ensure DB_SSL=true
DB_SSL=true
```

### Migration Failed
```bash
# Check if tables already exist
psql $DATABASE_URL -c "\dt"

# Drop and recreate if needed
psql $DATABASE_URL -c "DROP TABLE IF EXISTS properties CASCADE;"
```

### CORS Errors
```bash
# Update CORS_ORIGIN
CORS_ORIGIN=https://your-actual-frontend.onrender.com
```

### Service Won't Start
```bash
# Check logs
Dashboard → Service → Logs

# Common issues:
# - Missing environment variables
# - Database not connected
# - Redis not connected
# - Invalid Hedera credentials
```

---

## 📊 Success Criteria

Your deployment is successful when:

- ✅ Health endpoint returns `{"status": "ok"}`
- ✅ All 40 API endpoints respond correctly
- ✅ Database migrations completed without errors
- ✅ PostgreSQL connection successful
- ✅ Redis connection successful
- ✅ No errors in service logs
- ✅ Can mint NFT via API
- ✅ Can query Hedera testnet data
- ✅ IPFS uploads work via Pinata
- ✅ Service doesn't crash or restart

---

## 💰 Cost Summary

### Free Tier (Testing - 90 days)
- PostgreSQL Free: $0
- Redis Free: $0
- Web Service Free: $0

**Total: $0/month**

⚠️ **Limitations:**
- Services spin down after 15 min inactivity
- Limited resources
- Expires after 90 days

### Production (Recommended)
- PostgreSQL Starter: $7/month
- Redis Starter: $7/month
- Web Service Starter: $7/month

**Total: $21/month**

✅ **Benefits:**
- Always-on services
- Better performance
- Auto-scaling
- Daily backups

---

## 📞 Support Resources

**Documentation:**
- Render Deployment Guide: `RENDER-DEPLOYMENT-GUIDE.md`
- Environment Variables: `RENDER-ENV-VARIABLES.md`
- API Documentation: `API-DOCUMENTATION.md`

**External:**
- Render Docs: https://render.com/docs
- Render Support: https://render.com/support
- Render Status: https://status.render.com

**Project:**
- Backend README: `README.md`
- Postman Collection: `POSTMAN-COLLECTION.json`
- API Quick Reference: `API-QUICK-REFERENCE.md`

---

## 🎯 Next Steps

After successful deployment:

1. **Deploy Frontend** (if ready)
   - Follow similar process for `app-react-version/`
   - Update CORS_ORIGIN with frontend URL

2. **Test Integration**
   - Connect frontend to backend
   - Test wallet connection
   - Test NFT minting flow
   - Test marketplace features

3. **Production Hardening**
   - Set up monitoring
   - Configure alerts
   - Add rate limiting
   - Review security settings

4. **Go Live**
   - Announce to users
   - Monitor closely for 48 hours
   - Be ready to rollback if needed

---

**Estimated Total Time: 30-45 minutes**

**Difficulty: Easy (Blueprint) / Medium (Manual)**

**Status: Ready to Deploy ✅**

---

Last Updated: October 28, 2025
