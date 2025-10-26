# How to Clear Browser Cache to Fix resumeId Error

## The Problem

The error `Cannot read properties of undefined (reading 'resumeId')` is coming from a **cached JavaScript file** (`contents.04ff201a.js`).

Even though we've added cleanup code, your browser is still using the OLD cached version of the WalletConnect library that tries to read corrupted data.

---

## Solution: Clear Browser Cache

### Option 1: Hard Refresh (Try This First)

**Chrome/Edge:**
1. **Windows:** `Ctrl + Shift + Delete`
2. **Mac:** `Cmd + Shift + Delete`
3. Select "Cached images and files"
4. Click "Clear data"
5. **Then:** `Ctrl/Cmd + Shift + R` to hard refresh

**Or manually:**
1. Go to `chrome://settings/clearBrowserData`
2. Select "Cached images and files" ONLY
3. Time range: "Last 24 hours"
4. Click "Clear data"
5. Hard refresh: `Ctrl/Cmd + Shift + R`

### Option 2: Open in Incognito/Private Window

This bypasses all cache:

**Chrome:**
- `Cmd + Shift + N` (Mac) or `Ctrl + Shift + N` (Windows)
- Navigate to http://localhost:3500
- Test the connection

**Firefox:**
- `Cmd + Shift + P` (Mac) or `Ctrl + Shift + P` (Windows)

**Safari:**
- `Cmd + Shift + N`

### Option 3: Disable Cache in DevTools (Recommended for Development)

This prevents future cache issues:

1. Open DevTools (F12)
2. Go to **Network** tab
3. Check **"Disable cache"** checkbox
4. Keep DevTools open while testing
5. Refresh the page

---

## After Clearing Cache

1. **Refresh** the page: http://localhost:3500
2. **Check console** - you should see:
   ```
   [WC Cleanup] Removed X stale WalletConnect keys
   ```
3. **Try connecting** to HashPack
4. **No more resumeId error!** ✅

---

## Why This Is Necessary

**Cached file:** `contents.04ff201a.js` (old corrupted version)
- Contains WalletConnect library
- Tries to read `resumeId` from localStorage
- Corrupted data causes error

**After cache clear:**
- Browser loads fresh version
- Cleanup script runs first
- Clears corrupted data
- WalletConnect works properly

---

## Verification

After clearing cache, open the console and run:
```javascript
localStorage.length
```

It should show much fewer items (corrupted WalletConnect data cleared).

---

## If Error Still Persists

Try this nuclear option:

**Clear ALL browser data:**
1. `chrome://settings/clearBrowserData`
2. Select:
   - ✅ Browsing history
   - ✅ Cookies and other site data
   - ✅ Cached images and files
3. Time range: **All time**
4. Click "Clear data"
5. **Restart Chrome completely**
6. Navigate to http://localhost:3500 in a new tab

---

## Prevent This in Future

**Keep DevTools open** with "Disable cache" enabled while developing. This ensures you always get fresh JavaScript bundles.

---

**TL;DR:**
1. Open Incognito window: `Cmd/Ctrl + Shift + N`
2. Go to http://localhost:3500
3. Test HashPack connection
4. Should work! ✅
