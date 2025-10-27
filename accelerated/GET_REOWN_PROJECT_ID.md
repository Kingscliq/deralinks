# How to Get a Reown (WalletConnect) Project ID

## Important: WalletConnect is now Reown

WalletConnect has rebranded to **Reown**. The dashboard is now at:
**https://dashboard.reown.com/**

---

## Get Your Project ID (5 minutes)

### Step 1: Go to Reown Dashboard

Visit: **https://dashboard.reown.com/**

(This is the same as cloud.walletconnect.com - they redirect to the new brand)

### Step 2: Sign Up / Sign In

- **New user:** Click "Get started" or "Sign up"
- **Existing user:** Click "Sign in"

Sign in options:
- Email
- GitHub
- Google

### Step 3: Create a New Project

1. After signing in, you'll see the dashboard
2. Click **"Create"** or **"New Project"** button
3. Fill in the project details:

   **Project Information:**
   - **Name:** `RWA Platform` (or any name you prefer)
   - **Homepage URL:** `http://localhost:3000` (or your actual domain)

4. Click **"Create"** or **"Create Project"**

### Step 4: Copy Your Project ID

After creating the project:

1. You'll be on your project's dashboard page
2. Look for **"Project ID"** (usually displayed prominently at the top)
3. The ID looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`
4. Click the **copy icon** 📋 next to it to copy

### Step 5: Update Your .env.local File

1. Open `.env.local` in your project:
   ```bash
   /Users/user/Documents/deralinks/accelerated/.env.local
   ```

2. Find this line (currently line 6):
   ```env
   NEXT_PUBLIC_WALLET_PROJECT_ID=e49a89cf70b773fc85b4837ce47ff416
   ```

3. **Replace with your NEW Project ID:**
   ```env
   NEXT_PUBLIC_WALLET_PROJECT_ID=paste-your-project-id-here
   ```

4. Save the file

### Step 6: Restart the Dev Server

The server needs to be restarted to load the new environment variable.

**I can restart it for you** - just let me know once you've updated `.env.local`!

Or restart manually:
```bash
# Kill the current server (Ctrl+C in terminal)
# Then restart:
PORT=3500 npm run dev
```

---

## What You'll See on Reown Dashboard

The Reown dashboard will show:

- **Project ID** - This is what you need to copy
- **Project settings** - Configure allowed domains (optional for now)
- **Analytics** - See wallet connection stats (after you start connecting)
- **Billing** - Free tier is generous, no card required

---

## Verification After Update

Once you've updated `.env.local` and restarted:

1. Navigate to http://localhost:3500
2. Click "Connect Wallet"
3. Select "HashPack"
4. You should see:
   - ✅ **Reown WalletConnect modal opens** (professional looking)
   - ✅ List of available wallets (HashPack, Blade, etc.)
   - ✅ QR code option for mobile
   - ✅ No "Project not found" errors

---

## Troubleshooting

### Still Getting "Project not found" Error?

**Check:**
1. Did you copy the FULL Project ID? (should be 32 characters)
2. Did you paste it WITHOUT quotes?
   - ✅ Correct: `NEXT_PUBLIC_WALLET_PROJECT_ID=abc123def456...`
   - ❌ Wrong: `NEXT_PUBLIC_WALLET_PROJECT_ID="abc123def456..."`
3. Did you save the `.env.local` file?
4. Did you restart the dev server AFTER updating?

### Can't Access Reown Dashboard?

Try these direct links:
- https://dashboard.reown.com/
- https://cloud.walletconnect.com/ (redirects to Reown)
- https://cloud.reown.com/ (alternative)

### Need Multiple Projects?

Free tier allows multiple projects. Create separate ones for:
- **Development:** `RWA Platform - Dev` (localhost)
- **Staging:** `RWA Platform - Staging` (staging.yourdomain.com)
- **Production:** `RWA Platform - Prod` (yourdomain.com)

---

## Why Reown/WalletConnect?

Reown (formerly WalletConnect) provides the infrastructure to connect your dApp to wallets:

```
Your App  <-->  Reown Cloud  <-->  User's Wallet
           (relay servers)
```

The Project ID:
- ✅ Identifies your app to Reown's relay servers
- ✅ Shows your app name in wallet connection popups
- ✅ Enables connection tracking (optional analytics)
- ✅ **Completely free** for most use cases

---

## Security Notes

**Project ID is PUBLIC:**
- ✅ Safe to commit to git
- ✅ Included in your frontend bundle
- ✅ Not a secret credential
- ✅ Only identifies your project

**Keep these PRIVATE:**
- ❌ Reown dashboard login credentials
- ❌ Any API keys (if you add them later)

---

## After You Update

Once `.env.local` is updated with the new Reown Project ID:

1. ✅ WalletConnect modal will work properly
2. ✅ Professional wallet selection UI
3. ✅ HashPack connection will function
4. ✅ No more "Project not found" errors
5. ✅ Beautiful user experience! 🎉

---

## Quick Summary

**What you need:**
1. Go to https://dashboard.reown.com/
2. Sign up/in
3. Create project → Copy Project ID
4. Paste in `.env.local` → Line 6
5. Restart dev server
6. Test at http://localhost:3500

**Current server:** Running on port 3500, waiting for valid Project ID!
