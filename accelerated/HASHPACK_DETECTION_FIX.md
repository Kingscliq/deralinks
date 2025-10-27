# HashPack Detection Fix

Based on your error logs, HashPack is not installed or not enabled in Chrome.

## Error Analysis

Your console shows:
```
❌ HashPack properties not found on provider
💡 Detected wallet: Object (empty)
Error: HashPack not detected
```

This means you have a wallet extension (likely MetaMask), but NOT HashPack.

---

## Solution 1: Install HashPack (Most Likely)

### Chrome Web Store Installation

1. **Visit:** https://chrome.google.com/webstore/detail/hashpack/gjagmgiddbbciopjhllkdnddhcglnemk

2. **Click:** "Add to Chrome" button

3. **Confirm:** Click "Add extension" in the popup

4. **Wait:** For the "HashPack has been added to Chrome" message

5. **Pin it (Optional):** Click the puzzle icon 🧩 and pin HashPack

6. **Set up HashPack:**
   - Click the HashPack extension icon
   - Choose "Create new wallet" or "Import existing wallet"
   - Follow the setup wizard
   - **Keep the wallet unlocked**

7. **Refresh your app:**
   - Go back to http://localhost:3000
   - Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
   - Try "Connect Wallet" again

---

## Solution 2: HashPack is Installed but Disabled

If you already have HashPack installed but it's not working:

### Check Extension Status

1. Go to: `chrome://extensions/`

2. Find **HashPack** in the list

3. **Check the toggle:**
   - ✅ Should be **blue/on**
   - ❌ If gray/off, click to enable

4. **Click the refresh icon** (↻) next to the toggle

5. **Check for errors:**
   - Look for any red error messages under HashPack
   - If you see errors, try removing and reinstalling

6. **Restart Chrome:**
   - Completely quit Chrome (not just close the window)
   - Reopen Chrome
   - Navigate to your app

---

## Solution 3: Multiple Wallets Conflict

If you have multiple wallet extensions (MetaMask, Coinbase Wallet, etc.):

### Temporarily Disable Other Wallets

1. Go to: `chrome://extensions/`

2. **Disable MetaMask** (or other wallets) temporarily:
   - Find MetaMask
   - Toggle it **OFF**

3. **Refresh your app** and try connecting to HashPack

4. **After testing:** You can re-enable other wallets

---

## Solution 4: Check HashPack Version

HashPack might be outdated:

1. Go to: `chrome://extensions/`

2. Find HashPack, look at the version

3. **Current version should be 2.x.x or higher**

4. If outdated:
   - Toggle "Developer mode" in top-right
   - Click "Update" button at the top
   - Or remove and reinstall from Chrome Web Store

---

## Verification Steps

After installing/enabling HashPack, verify it works:

### Test 1: Check Extension is Active

1. Click the HashPack extension icon
2. You should see the HashPack interface
3. Make sure wallet is **unlocked** (not asking for password)

### Test 2: Console Detection Test

Open browser console (F12) and run:

```javascript
// Test if HashPack is detected
const testHashPack = () => {
  console.log('=== HashPack Detection Test ===');

  if (!window.ethereum) {
    return '❌ No window.ethereum - no wallet extensions detected';
  }

  // Check for providers array
  if (window.ethereum.providers && Array.isArray(window.ethereum.providers)) {
    console.log(`Found ${window.ethereum.providers.length} providers`);

    window.ethereum.providers.forEach((p, i) => {
      console.log(`Provider ${i}:`, {
        isHashPack: p.isHashPack,
        isHashpack: p.isHashpack,
        isMetaMask: p.isMetaMask,
        name: p.constructor?.name
      });
    });

    const hasHashPack = window.ethereum.providers.some(p =>
      p.isHashPack || p.isHashpack
    );

    return hasHashPack
      ? '✅ HashPack FOUND in providers array!'
      : '❌ HashPack NOT found in providers array';
  }

  // Check single provider
  console.log('Single provider:', {
    isHashPack: window.ethereum.isHashPack,
    isHashpack: window.ethereum.isHashpack,
    isMetaMask: window.ethereum.isMetaMask,
    name: window.ethereum.constructor?.name
  });

  if (window.ethereum.isHashPack || window.ethereum.isHashpack) {
    return '✅ HashPack FOUND as single provider!';
  }

  return '❌ HashPack NOT detected. Other wallet installed instead.';
};

console.log(testHashPack());
```

Expected output if working:
```
=== HashPack Detection Test ===
Provider 0: { isHashPack: true, ... }
✅ HashPack FOUND in providers array!
```

### Test 3: Use Wallet Debugger Page

Navigate to: http://localhost:3000/wallet-debug

You should see:
- "✓ Found - At least one wallet is installed"
- HashPack listed in the detected providers
- isHashpack: true (or isHashPack: true)

---

## Still Not Working?

### Nuclear Option: Fresh Installation

1. **Remove HashPack:**
   ```
   chrome://extensions/ → Find HashPack → Click "Remove"
   ```

2. **Clear Chrome cache:**
   ```
   Settings → Privacy and security → Clear browsing data
   - Cached images and files ✓
   - Cookies and other site data ✓
   ```

3. **Restart Chrome completely**

4. **Reinstall HashPack:**
   ```
   https://chrome.google.com/webstore/detail/hashpack/gjagmgiddbbciopjhllkdnddhcglnemk
   ```

5. **Set up the wallet**

6. **Test again**

---

## Alternative: Use HashConnect Instead

If browser extension detection continues to fail, you can use HashPack's official HashConnect SDK (recommended for production):

```bash
npm install hashconnect
```

This bypasses the browser extension entirely and uses a QR code/pairing method.

Let me know if you need help implementing HashConnect!

---

## Expected Behavior After Fix

Once HashPack is properly installed and detected:

1. **Wallet dropdown shows:** "✓ Installed" under HashPack
2. **Clicking HashPack:** Opens HashPack popup to approve connection
3. **After connecting:** Your account address shows in the navbar
4. **Console shows:** No errors about HashPack not detected

---

## Quick Commands for Debugging

```javascript
// Check what wallet you have
console.log('Detected wallet:', {
  ethereum: !!window.ethereum,
  isMetaMask: window.ethereum?.isMetaMask,
  isHashPack: window.ethereum?.isHashPack,
  isHashpack: window.ethereum?.isHashpack
});

// List all providers
if (window.ethereum?.providers) {
  window.ethereum.providers.forEach((p, i) => {
    console.log(`Provider ${i}:`, Object.keys(p).filter(k => k.startsWith('is')));
  });
}
```

---

**TL;DR: You need to install HashPack from the Chrome Web Store first!**

https://chrome.google.com/webstore/detail/hashpack/gjagmgiddbbciopjhllkdnddhcglnemk
