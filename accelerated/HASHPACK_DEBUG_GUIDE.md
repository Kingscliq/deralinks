# HashPack Detection Debug Guide

## Quick Check: Is HashPack Actually Installed?

### Step 1: Verify HashPack Extension in Chrome

1. Open Chrome
2. Click the **puzzle icon** (🧩) in the top-right corner
3. Look for **HashPack** in the list
4. Make sure it's **enabled** (toggle should be blue/on)
5. If not visible, visit: https://chrome.google.com/webstore/detail/hashpack/gjagmgiddbbciopjhllkdnddhcglnemk

### Step 2: Check if HashPack is Actually Running

1. Open a **new tab** in Chrome (sometimes extensions only inject on new pages)
2. Open **Developer Console** (F12 or Cmd+Option+I on Mac)
3. Type this in the console:

```javascript
console.log('window.ethereum:', window.ethereum)
console.log('Has providers array?', Array.isArray(window.ethereum?.providers))

if (window.ethereum?.providers) {
  window.ethereum.providers.forEach((p, i) => {
    console.log(`Provider ${i}:`, {
      isHashPack: p.isHashPack,
      isHashpack: p.isHashpack,
      constructor: p.constructor?.name,
      // Show all properties
      allProps: Object.keys(p).filter(k => k.toLowerCase().includes('hash'))
    });
  });
} else {
  console.log('Single provider:', {
    isHashPack: window.ethereum?.isHashPack,
    isHashpack: window.ethereum?.isHashpack,
    constructor: window.ethereum?.constructor?.name,
    // Show all properties
    allProps: window.ethereum ? Object.keys(window.ethereum).filter(k => k.toLowerCase().includes('hash')) : []
  });
}
```

### Step 3: Use the Built-in Wallet Debugger

1. Navigate to: http://localhost:3000/wallet-debug
2. This page shows all detected wallet providers
3. Look for HashPack in the list
4. Check what properties it shows

---

## Common Issues & Fixes

### Issue 1: HashPack Not Showing Up At All

**Problem:** `window.ethereum` is undefined or doesn't show HashPack

**Solutions:**
1. **Refresh the page** - Extensions inject on page load
2. **Open a new tab** - Sometimes old tabs don't get the injection
3. **Restart Chrome** - Extension might not be fully loaded
4. **Reinstall HashPack** - Extension might be corrupted
5. **Check extension is enabled** in chrome://extensions/

### Issue 2: Multiple Wallets Installed

**Problem:** MetaMask or other wallets are interfering

**What's Happening:**
- When multiple wallet extensions are installed, they all inject into `window.ethereum.providers[]`
- Our code should detect HashPack in the array

**Check:**
```javascript
// In browser console
window.ethereum.providers.forEach((p, i) => {
  console.log(`Provider ${i}:`, p.constructor?.name, {
    isHashPack: p.isHashPack,
    isHashpack: p.isHashpack,
  });
});
```

### Issue 3: HashPack Uses Different Property Name

**Problem:** HashPack might be using a different detection property

**Known variations:**
- `isHashPack` (capital P)
- `isHashpack` (lowercase p)
- `isHashConnect`
- `hashconnect`

**Check what property HashPack actually uses:**
```javascript
// In browser console
if (window.ethereum.providers) {
  window.ethereum.providers.forEach(p => {
    const hashProps = Object.keys(p).filter(k =>
      k.toLowerCase().includes('hash')
    );
    console.log('Hash-related properties:', hashProps);
  });
}
```

---

## Manual Detection Test

### Test 1: Basic Detection

Open console and run:
```javascript
const checkHashPack = () => {
  if (!window.ethereum) {
    return 'No window.ethereum found';
  }

  if (window.ethereum.providers && Array.isArray(window.ethereum.providers)) {
    const hashpack = window.ethereum.providers.find(p =>
      p.isHashPack || p.isHashpack || p.isHashConnect
    );
    return hashpack ? 'HashPack found in providers!' : 'HashPack not found in providers';
  }

  if (window.ethereum.isHashPack || window.ethereum.isHashpack) {
    return 'HashPack found as single provider!';
  }

  return 'HashPack not detected';
};

console.log(checkHashPack());
```

### Test 2: Full Provider Info

```javascript
const getProviderInfo = () => {
  if (!window.ethereum) return 'No ethereum provider';

  const info = {
    isSingleProvider: !window.ethereum.providers,
    providerCount: window.ethereum.providers?.length || 1,
    providers: []
  };

  if (window.ethereum.providers) {
    info.providers = window.ethereum.providers.map((p, i) => ({
      index: i,
      name: p.constructor?.name || 'Unknown',
      isHashPack: !!p.isHashPack,
      isHashpack: !!p.isHashpack,
      isMetaMask: !!p.isMetaMask,
      isBlade: !!p.isBlade,
      allHashProps: Object.keys(p).filter(k => k.toLowerCase().includes('hash'))
    }));
  } else {
    info.providers.push({
      index: 0,
      name: window.ethereum.constructor?.name || 'Unknown',
      isHashPack: !!window.ethereum.isHashPack,
      isHashpack: !!window.ethereum.isHashpack,
      isMetaMask: !!window.ethereum.isMetaMask,
      allHashProps: Object.keys(window.ethereum).filter(k => k.toLowerCase().includes('hash'))
    });
  }

  return info;
};

console.table(getProviderInfo());
```

---

## If HashPack Still Won't Detect

### Option 1: Check HashPack Version

1. Go to chrome://extensions/
2. Find HashPack
3. Look at version number
4. Check if it's outdated (latest should be 2.x.x+)
5. Update if needed

### Option 2: Try HashPack's Built-in Test

1. Click the HashPack extension icon
2. Create/unlock wallet
3. Check if HashPack shows "Connected" for any sites
4. Try connecting to a known working dApp like hashscan.io

### Option 3: Clear Browser Cache & Extension Data

```bash
# In Chrome:
1. Settings → Privacy and Security → Clear browsing data
2. Select "Cached images and files"
3. Select "Cookies and other site data"
4. Clear data
5. Restart Chrome
6. Try again
```

---

## Expected Behavior

When HashPack is properly installed and detected, you should see:

**In WalletButton dropdown:**
```
✓ Installed
```
under HashPack option

**In browser console:**
```javascript
Provider 0: {
  isHashPack: true,  // or isHashpack: true
  isMetaMask: false,
  ...
}
```

**In /wallet-debug page:**
- Shows "HashPack" in the detected wallets list
- Shows provider properties with isHashPack = true

---

## Debugging Commands

Run these in the browser console to gather info:

```javascript
// 1. Check if window.ethereum exists
console.log('Ethereum provider exists:', !!window.ethereum);

// 2. Check provider type
console.log('Is array of providers:', Array.isArray(window.ethereum?.providers));

// 3. List all providers
if (window.ethereum?.providers) {
  window.ethereum.providers.forEach((p, i) => {
    console.log(`Provider ${i}:`, {
      name: p.constructor?.name,
      properties: Object.keys(p).slice(0, 20) // First 20 properties
    });
  });
}

// 4. Check HashPack specifically
console.log('HashPack detection:', {
  singleProvider: {
    isHashPack: window.ethereum?.isHashPack,
    isHashpack: window.ethereum?.isHashpack,
  },
  inProviders: window.ethereum?.providers?.some(p => p.isHashPack || p.isHashpack)
});
```

---

## Still Not Working?

If HashPack still won't detect after all these steps:

1. **Take a screenshot** of the browser console output from the debug commands above
2. **Check** the /wallet-debug page and screenshot that too
3. **Verify** HashPack is installed and enabled in chrome://extensions/
4. **Try** connecting from HashPack's side:
   - Open HashPack extension
   - Look for "Connected Sites"
   - Try manually connecting to localhost:3000

---

## Alternative: Use HashConnect SDK

If browser extension detection continues to fail, you can use HashPack's HashConnect protocol instead:

```typescript
// This bypasses window.ethereum entirely
import { HashConnect } from 'hashconnect';

const hashconnect = new HashConnect();
// ... use HashConnect pairing instead
```

This is actually the recommended way for production apps!
