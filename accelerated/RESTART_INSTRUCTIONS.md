# Fresh Restart Instructions

## What We Just Fixed
- ✅ Killed 3 old processes that were running on port 3000
- ✅ Cleared Next.js cache
- ✅ Port 3000 is now completely free

---

## How to Start Fresh

### Option 1: Start with Clean Cache (Recommended)

```bash
# 1. Navigate to project directory
cd /Users/user/Documents/deralinks/accelerated

# 2. Make absolutely sure nothing is running
pkill -f "next dev"

# 3. Clear all caches
rm -rf .next

# 4. Start the development server
npm run dev
```

### Option 2: Use a Different Port (If issues persist)

```bash
# Start on port 3001 instead
PORT=3001 npm run dev
```

Then visit: http://localhost:3001

---

## Clear Your Browser Cache

The old service might be cached in your browser. Here's how to do a hard refresh:

### Chrome/Edge (Mac)
- **Command + Shift + R** or **Command + Option + R**

### Chrome/Edge (Windows/Linux)
- **Ctrl + Shift + R** or **Ctrl + F5**

### Firefox (Mac)
- **Command + Shift + R**

### Firefox (Windows/Linux)
- **Ctrl + Shift + R** or **Ctrl + F5**

### Safari
- **Command + Option + R**

---

## Or Open in Incognito/Private Window

This bypasses all cache:
- **Chrome:** Command + Shift + N (Mac) or Ctrl + Shift + N (Windows)
- **Firefox:** Command + Shift + P (Mac) or Ctrl + Shift + P (Windows)
- **Safari:** Command + Shift + N

---

## Verify It's Working

Once the server starts, you should see:

```
 ✓ Ready in 2.5s
 ○ Local:        http://localhost:3000
 ○ Network:      http://192.168.x.x:3000
```

Then navigate to http://localhost:3000 and you should see:
- RWA Platform landing page
- Dark theme
- "Connect Wallet" button
- Hero section with stats

---

## Still Seeing Old Content?

### Check What's Actually Running

```bash
# See what's on port 3000
lsof -ti:3000

# Check Next.js processes
ps aux | grep "next dev"
```

### Nuclear Option - Complete Fresh Start

```bash
# Stop everything
pkill -f "next"

# Clear everything
rm -rf .next
rm -rf node_modules/.cache

# Restart
npm run dev
```

---

## Expected Result

You should now see the **RWA Platform** with:
- Dark slate background
- Blue gradient text in hero section
- WalletButton in navigation
- Landing page sections (How It Works, Features, etc.)
- Environment variables loaded from `.env.local`

**Not** the old service that was running before!
