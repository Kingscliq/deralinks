# How to Get a WalletConnect Project ID

## The Error You're Seeing

```
401 (Unauthorized)
Fatal socket error: WebSocket connection closed abnormally with code: 3000 (Project not found)
```

**This means your Project ID is invalid or doesn't exist.**

---

## Get a New Project ID (5 minutes)

### Step 1: Go to WalletConnect Cloud

Visit: https://cloud.walletconnect.com/

### Step 2: Sign Up / Sign In

- If you don't have an account: Click "Get started for free"
- If you have an account: Click "Sign In"

You can use:
- Email
- GitHub
- Google

### Step 3: Create a New Project

1. After signing in, you'll see your dashboard
2. Click **"Create"** or **"New Project"** button
3. Fill in the form:
   - **Project Name:** RWA Platform (or anything you like)
   - **Project Homepage URL:** http://localhost:3000 (or your actual domain)

4. Click **"Create"**

### Step 4: Copy Your Project ID

1. You'll be redirected to your project dashboard
2. You'll see **"Project ID"** at the top
3. It looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`
4. Click the **copy icon** to copy it

### Step 5: Update .env.local

1. Open `.env.local` in your project
2. Find this line:
   ```env
   NEXT_PUBLIC_WALLET_PROJECT_ID=e49a89cf70b773fc85b4837ce47ff416
   ```
3. Replace with your NEW Project ID:
   ```env
   NEXT_PUBLIC_WALLET_PROJECT_ID=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
   ```

### Step 6: Restart Dev Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 7: Test Again

1. Navigate to http://localhost:3000
2. Click "Connect Wallet"
3. Select "HashPack"
4. WalletConnect modal should now open properly!

---

## Quick Commands

```bash
# 1. Stop dev server (if running)
# Press Ctrl+C in the terminal

# 2. Edit .env.local with new Project ID
# (Use your editor or run:)
nano .env.local

# 3. Restart dev server
npm run dev
```

---

## Troubleshooting

### Modal Still Shows Error

**Check:**
1. Did you copy the FULL Project ID? (should be 32+ characters)
2. Did you paste it without quotes? Correct: `NEXT_PUBLIC_WALLET_PROJECT_ID=abc123`
3. Did you restart the dev server AFTER updating .env.local?

**Try:**
```bash
# Kill any running processes
pkill -f "next dev"

# Restart fresh
npm run dev
```

### Can't Create Account on WalletConnect

**Alternative:** Use email authentication instead of GitHub/Google

### Need Multiple Projects?

Free tier allows multiple projects. Create one for each environment:
- `RWA Platform - Dev` (for localhost:3000)
- `RWA Platform - Prod` (for your production domain)

---

## What is WalletConnect?

WalletConnect is a protocol that connects dApps to wallets. Think of it as a bridge:

```
Your App  <-->  WalletConnect Cloud  <-->  User's Wallet
```

The Project ID identifies your app to WalletConnect's servers so they can:
- Show your app name in wallet popups
- Track analytics (optional)
- Enable the connection protocol

**It's completely free** and there's no credit card required.

---

## Security Note

✅ **Safe to commit:** The Project ID is meant to be public (it's in your frontend code)
✅ **Not a secret:** It just identifies your project, doesn't grant special access
❌ **Don't share:** Your WalletConnect Cloud login credentials

---

## After You Get the Project ID

Once you've updated `.env.local` with the new Project ID and restarted the server:

1. WalletConnect modal will open properly
2. You'll see available wallets (HashPack, etc.)
3. Connection flow will work
4. No more "Project not found" errors

**The modal will look professional** with wallet logos and your app name!

---

## Next Steps

1. ✅ Get Project ID from https://cloud.walletconnect.com/
2. ✅ Update `.env.local`
3. ✅ Restart dev server
4. ✅ Test HashPack connection
5. ✅ Enjoy working wallet integration! 🎉
