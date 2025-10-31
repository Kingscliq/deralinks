# Vercel Deployment Guide for DeraLinks Frontend

This guide explains how to deploy the DeraLinks React application to Vercel with proper SPA routing configuration.

## 📋 Prerequisites

- Vercel account ([sign up](https://vercel.com/signup))
- GitHub/GitLab/Bitbucket repository (recommended) or Vercel CLI
- Backend API deployed and accessible

## 🚀 Deployment Methods

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Connect Repository**
   ```
   1. Go to https://vercel.com/new
   2. Import your Git repository
   3. Select the `app-react-version` folder as the root directory
   ```

2. **Configure Build Settings**
   ```
   Framework Preset: Create React App
   Build Command: npm run build
   Output Directory: build
   Install Command: npm install
   ```

3. **Set Environment Variables**
   ```
   REACT_APP_API_BASE_URL=https://your-backend-api.com/api/v1
   REACT_APP_HASHCONNECT_NETWORK=testnet
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-project.vercel.app`

### Method 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend directory
cd app-react-version

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Follow prompts to configure
```

## 🔧 Configuration Files

### `vercel.json`

The `vercel.json` file handles:
- ✅ SPA routing (all routes redirect to `index.html`)
- ✅ Static asset caching (1 year for immutable files)
- ✅ Environment variable mapping
- ✅ Build configuration

Key features:
```json
{
  "routes": [
    // Static assets with cache headers
    { "src": "/static/(.*)", "dest": "/static/$1" },
    
    // Catch-all route for SPA (fixes 404 on refresh)
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

### `public/_redirects`

Fallback configuration for SPA routing:
```
/* /index.html 200
```

This ensures all routes serve `index.html` with a 200 status code.

## 🌍 Environment Variables

Set these in your Vercel project settings:

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_BASE_URL` | Backend API base URL | `https://api.deralinks.com/api/v1` |
| `REACT_APP_HASHCONNECT_NETWORK` | Hedera network | `testnet` or `mainnet` |

**To set via dashboard:**
1. Go to Project Settings
2. Navigate to "Environment Variables"
3. Add each variable
4. Redeploy for changes to take effect

**To set via CLI:**
```bash
vercel env add REACT_APP_API_BASE_URL production
# Enter value when prompted

vercel env add REACT_APP_HASHCONNECT_NETWORK production
# Enter value when prompted
```

## 🔍 Verifying Deployment

### 1. Check Build Logs
- View build logs in Vercel dashboard
- Look for successful compilation
- Verify no errors in the output

### 2. Test SPA Routing
```bash
# These should all work without 404 errors:
https://your-app.vercel.app/
https://your-app.vercel.app/marketplace
https://your-app.vercel.app/my-assets
https://your-app.vercel.app/tokenize
https://your-app.vercel.app/my-listings

# Test direct navigation and page refresh on each route
```

### 3. Test Wallet Connection
- Connect HashPack/Blade wallet
- Verify pairing works
- Check console for errors

### 4. Test API Integration
- Open browser DevTools
- Go to Network tab
- Perform actions (mint, list, buy)
- Verify API calls go to correct backend URL

## 🐛 Troubleshooting

### Issue: 404 on Page Refresh

**Solution:** The `vercel.json` catch-all route handles this. If you still see 404s:

1. Verify `vercel.json` is in the root of `app-react-version/`
2. Check Vercel build logs for configuration errors
3. Ensure the file is properly formatted (valid JSON)

### Issue: Environment Variables Not Working

**Solution:**
1. Environment variables must be set in Vercel dashboard or via CLI
2. They won't work from local `.env` file
3. Redeploy after adding/changing variables
4. Verify with `console.log(process.env.REACT_APP_API_BASE_URL)`

### Issue: CORS Errors

**Solution:**
1. Configure backend CORS to allow Vercel domain
2. Add your Vercel URL to backend's `FRONTEND_URL` whitelist
3. Check backend CORS configuration includes:
   ```
   https://your-project.vercel.app
   https://your-project-*.vercel.app  (for preview deployments)
   ```

### Issue: HashConnect Wallet Connection Fails

**Solution:**
1. Ensure site is served over HTTPS (Vercel does this automatically)
2. Clear browser local storage
3. Remove old pairings from wallet app
4. Check `REACT_APP_HASHCONNECT_NETWORK` matches your backend

### Issue: Static Assets Not Loading

**Solution:**
1. Check `public/` folder contains all assets
2. Verify paths use relative URLs (not absolute)
3. Clear Vercel cache and redeploy:
   ```bash
   vercel --prod --force
   ```

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to your Git repository:

- **Production Branch:** `main` or `master` → `https://your-project.vercel.app`
- **Preview Branches:** Other branches → `https://your-project-git-branch.vercel.app`
- **Pull Requests:** Each PR gets preview URL

Configure in Vercel project settings:
```
Settings → Git → Production Branch: main
```

## 📊 Performance Optimization

### Enable Vercel Analytics (Optional)

```bash
npm install @vercel/analytics

# Add to src/index.js:
import { Analytics } from '@vercel/analytics/react';
// In render:
<Analytics />
```

### Edge Network

Vercel automatically serves your app from their global edge network for optimal performance worldwide.

### Build Cache

Vercel caches dependencies between builds. To clear cache:
```bash
vercel --prod --force
```

## 🔐 Security Headers

Consider adding security headers in `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

## 📱 Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS:
   ```
   Type: CNAME
   Name: www (or @)
   Value: cname.vercel-dns.com
   ```
4. Wait for DNS propagation (up to 48 hours)

## 🎯 Deployment Checklist

Before deploying to production:

- [ ] Backend API is deployed and accessible
- [ ] Environment variables are set in Vercel
- [ ] Backend CORS allows Vercel domain
- [ ] `vercel.json` is in the correct location
- [ ] Test build locally: `npm run build`
- [ ] All routes tested (direct navigation + refresh)
- [ ] Wallet connection tested on HTTPS
- [ ] API integration tested with real backend
- [ ] Static assets loading correctly
- [ ] Error boundaries working
- [ ] Mobile responsiveness checked

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Create React App Deployment](https://create-react-app.dev/docs/deployment)
- [SPA Routing on Vercel](https://vercel.com/docs/frameworks/create-react-app#routing)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

## 🆘 Support

If you encounter issues:

1. Check Vercel build logs
2. Review browser console errors
3. Test locally with production build: `npm run build && npx serve -s build`
4. Verify backend is accessible from deployed URL

---

Happy deploying! 🚀

