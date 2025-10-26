# How to Get Your Reown Project ID

## Step 1: Access Your Reown Dashboard

You already have the dashboard open at:
https://dashboard.reown.com/5b756d45-d73a-489e-af3d-35ec6f378429/60df313a-33d2-4c02-b136-d8c4777a3dc2

## Step 2: Find Your Project ID

In your Reown Dashboard, look for the **Project ID** field. Based on your screenshot, I can see:

```
Project ID: 56..8c
```

But we need the **full Project ID**. To get it:

### Option A: Copy from Dashboard

1. In your Reown dashboard, look for the "Project ID" field (usually visible in the top right)
2. Click the copy icon next to the Project ID
3. The full ID should be something like: `566cf5c1-7988-229c-999a-14e048a4bf8c` (with dashes)

### Option B: Check the Settings Tab

1. Click on your project name at the top
2. Go to Settings or Project Details
3. Look for "Project ID" or "Client ID"
4. Copy the full ID

## Step 3: Update Your .env.local File

Once you have the full Project ID, update your `.env.local` file:

```bash
# Open the file
code /Users/user/deralinks/frontend/.env.local
```

Update it to:

```env
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=YOUR_FULL_PROJECT_ID_HERE
```

## Step 4: Restart Your Dev Server

```bash
# Stop the current server (Ctrl+C)
# Then restart
cd /Users/user/deralinks/frontend
yarn dev
```

## Common Issues

### Issue: "400 Bad Request" on WebSocket Connections

**Symptoms:** Multiple errors like:

```
WebSocket connection to 'wss://relay.walletconnect.com/...' failed
```

**Cause:** Invalid or incorrect Project ID

**Solution:**

1. Double-check your Project ID from the Reown dashboard
2. Make sure you copied the FULL ID (usually includes dashes)
3. Ensure there are no extra spaces or characters
4. Restart the dev server after updating

### Issue: Project ID Format

The Project ID should look like one of these formats:

- With dashes: `566cf5c1-7988-229c-999a-14e048a4bf8c`
- Without dashes: `566cf5c17988229c999a14e048a4bf8c`

Both formats usually work, but the dashboard typically shows it with dashes.

## Quick Test

After updating the Project ID:

1. Open http://localhost:3000
2. Open browser console (F12)
3. Click "Connect Wallet"
4. You should NOT see WebSocket 400 errors anymore
5. The wallet selection modal should appear

## If Still Not Working

### Check Project Status

1. Go to your Reown Dashboard
2. Make sure the project is **Active** (not paused or deleted)
3. Check if there are any usage limits reached

### Verify Domain Settings

1. In Reown Dashboard, go to Settings
2. Check "Allowed Domains" or "Allowed Origins"
3. Make sure `localhost` and `localhost:3000` are allowed
4. For production, add your actual domain

### Create New Project (Last Resort)

If the current project ID doesn't work:

1. Go to https://dashboard.reown.com/
2. Click "Create New Project"
3. Name it "Deralinks" or similar
4. Copy the new Project ID
5. Update your `.env.local` with the new ID

---

**Need Help?** The WebSocket errors in your console are specifically because of the Project ID. Once you update it with the correct full ID from your dashboard, the wallet connection should work!

