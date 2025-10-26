# 🔑 WalletConnect Project ID Setup

## The Issue

The errors you're seeing are because the library is trying to use `projectId=your-project-id` which is a placeholder. You need a real WalletConnect Project ID.

## Quick Fix (5 minutes)

### Step 1: Get Project ID

1. Go to **https://cloud.walletconnect.com/**
2. Click **"Sign Up"** or **"Login"** (it's free!)
3. Create a new project
4. Copy the **Project ID**

### Step 2: Create Environment File

Create `/Users/user/deralinks/frontend/.env.local`:

```env
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_actual_project_id_here
```

**Replace** `your_actual_project_id_here` with the Project ID you copied.

### Step 3: Restart Dev Server

```bash
cd /Users/user/deralinks/frontend

# Stop the current dev server (Ctrl+C)
# Then restart it:
yarn dev
```

## What This Fixes

✅ **All WebSocket errors** - WalletConnect needs a valid project ID to connect  
✅ **Explorer API errors** - The wallet listing API requires authentication  
✅ **TypeError: Cannot convert undefined or null** - Caused by missing project ID

## After Setup

Once you add your Project ID and restart:

1. Click "Connect Wallet"
2. Select **HashPack** or **MetaMask**
3. The wallet extension will prompt you to connect
4. After approval, you'll see your account and balance!

## Alternative: Test Without WalletConnect Modal

If you want to test immediately without WalletConnect, I can create a simpler version that:

- Uses **direct HashPack connection** (no WalletConnect modal)
- Uses **MetaMask directly** (no WalletConnect)

This would skip the WalletConnect dependency entirely for now.

**Let me know if you:**

1. Want to get the WalletConnect Project ID (recommended - more features)
2. Want me to create a simpler direct connection version (faster to test)

## Expected Behavior After Fix

**Before (current):**

```
❌ WebSocket connection to 'wss://relay.walletconnect.com/...' failed
❌ GET https://explorer-api.walletconnect.com/... 400 (Bad Request)
❌ TypeError: Cannot convert undefined or null to object
```

**After (with Project ID):**

```
✅ Successfully connected to WalletConnect
✅ Wallet modal opens smoothly
✅ HashPack/MetaMask connect without errors
```

---

**Choose your path and let me know!** 🚀
