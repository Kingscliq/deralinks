# HashPack Installed But Not Detected - Troubleshooting

## Issue
HashPack extension is installed but browser console shows only MetaMask:
```javascript
Single provider: {
  isHashPack: undefined,
  isHashpack: undefined,
  isMetaMask: true
}
```

---

## Solution Steps (Try in Order)

### Step 1: Verify HashPack is Enabled

1. **Open Chrome extensions:**
   - Type in address bar: `chrome://extensions/`
   - Or click puzzle icon 🧩 → "Manage Extensions"

2. **Find HashPack** in the list

3. **Check the toggle:**
   - ✅ Must be **BLUE/ON**
   - ❌ If gray/off, click to enable it

4. **Click the refresh icon** (↻) next to the toggle

5. **Look for errors:**
   - Check below HashPack for any red error messages
   - If you see errors, click "Remove" and reinstall

---

### Step 2: Refresh HashPack Extension

1. **In `chrome://extensions/`:**
   - Find HashPack
   - Click the **refresh/reload icon** (↻)

2. **Or completely reload it:**
   - Click "Remove" (don't worry, this won't delete your wallet)
   - Click "Load unpacked" or reinstall from Web Store
   - Set up your wallet again

---

### Step 3: Hard Refresh Your App

HashPack injects when page loads, old pages won't have it:

1. **Go to your app tab** (localhost:3000)

2. **Do a HARD refresh:**
   - **Mac:** Cmd + Shift + R
   - **Windows:** Ctrl + Shift + R
   - **Or:** Hold Shift and click reload button

3. **Better yet - Open a NEW tab:**
   - Close the current app tab completely
   - Open a fresh new tab
   - Navigate to http://localhost:3000

4. **Run the test again** in console

---

### Step 4: Restart Chrome Completely

Extensions sometimes need a full restart:

1. **Quit Chrome completely:**
   - **Mac:** Chrome menu → Quit Chrome (or Cmd+Q)
   - **Windows:** File → Exit (or Alt+F4)
   - **Don't just close the window** - actually quit the application

2. **Wait 5 seconds**

3. **Reopen Chrome**

4. **Navigate to your app** in a fresh tab

5. **Run the console test again**

---

### Step 5: Check HashPack is Unlocked

HashPack might not inject if locked:

1. **Click the HashPack extension icon** (in Chrome toolbar)

2. **Is it asking for password?**
   - If YES → Enter password to unlock
   - If NO → Good, it's already unlocked

3. **Check the HashPack interface:**
   - Should show your account
   - Should say "Unlocked" or show balance
   - Should NOT be on a lock screen

4. **After unlocking, refresh your app page**

---

### Step 6: Disable MetaMask Temporarily

MetaMask might be blocking HashPack injection:

1. **Go to:** `chrome://extensions/`

2. **Find MetaMask**

3. **Toggle it OFF** (temporarily)

4. **Refresh your app page**

5. **Run console test:**
   ```javascript
   console.log('After disabling MetaMask:', {
     hasEthereum: !!window.ethereum,
     isHashPack: window.ethereum?.isHashPack,
     isHashpack: window.ethereum?.isHashpack
   });
   ```

6. **If HashPack now shows:**
   - This means both extensions conflict
   - Re-enable MetaMask
   - They should both appear in `window.ethereum.providers[]`

---

### Step 7: Check HashPack Installation

Verify it's actually installed correctly:

1. **Go to:** `chrome://extensions/`

2. **Check HashPack details:**
   - ID should be: `gjagmgiddbbciopjhllkdnddhcglnemk`
   - Version should be: 2.x.x or higher
   - Should say "From Chrome Web Store"

3. **Click "Details" button**

4. **Check permissions:**
   - Should have permission for "all websites"
   - Should be able to "Read and change your data"

5. **If permissions look wrong:**
   - Click "Remove"
   - Reinstall from Chrome Web Store
   - Make sure to accept all permissions

---

### Step 8: Clear Chrome Cache

Cached pages might not load new extensions:

1. **Open Chrome settings:** chrome://settings/clearBrowserData

2. **Select:**
   - ✅ Cached images and files
   - ✅ Cookies and other site data

3. **Time range:** Last 24 hours (or All time)

4. **Click "Clear data"**

5. **Restart Chrome**

6. **Navigate to your app in a NEW tab**

---

### Step 9: Check for Extension Conflicts

Other extensions might interfere:

1. **Go to:** `chrome://extensions/`

2. **Look for these that might conflict:**
   - Other crypto wallets (Coinbase Wallet, Phantom, etc.)
   - Privacy/security extensions
   - Ad blockers that modify JavaScript

3. **Disable them temporarily**

4. **Test if HashPack now appears**

5. **Re-enable one by one** to find the culprit

---

### Step 10: Nuclear Option - Fresh Install

If nothing else works:

1. **In HashPack, export your seed phrase:**
   - Open HashPack
   - Settings → Backup
   - **WRITE DOWN your recovery phrase**

2. **Remove HashPack:**
   - `chrome://extensions/`
   - Find HashPack → Remove

3. **Clear ALL Chrome data:**
   - chrome://settings/clearBrowserData
   - Select ALL items
   - Time range: All time
   - Clear data

4. **Restart Chrome**

5. **Reinstall HashPack:**
   - https://chrome.google.com/webstore/detail/hashpack/gjagmgiddbbciopjhllkdnddhcglnemk
   - Click "Add to Chrome"

6. **Set up wallet again** (use your recovery phrase)

7. **Test in a NEW tab**

---

## Verification Commands

After each step, run this in console to check:

```javascript
// Comprehensive check
const checkAllWallets = () => {
  console.log('=== Wallet Detection ===');
  console.log('1. window.ethereum exists:', !!window.ethereum);

  if (window.ethereum?.providers) {
    console.log('2. Multiple providers:', window.ethereum.providers.length);
    window.ethereum.providers.forEach((p, i) => {
      console.log(`   Provider ${i}:`, {
        isHashPack: p.isHashPack,
        isHashpack: p.isHashpack,
        isMetaMask: p.isMetaMask,
        isBlade: p.isBlade,
        constructor: p.constructor?.name,
        // Show ALL properties that might indicate HashPack
        allHashProps: Object.keys(p).filter(k =>
          k.toLowerCase().includes('hash')
        )
      });
    });
  } else if (window.ethereum) {
    console.log('2. Single provider:', {
      isHashPack: window.ethereum.isHashPack,
      isHashpack: window.ethereum.isHashpack,
      isMetaMask: window.ethereum.isMetaMask,
      constructor: window.ethereum.constructor?.name,
      allHashProps: Object.keys(window.ethereum).filter(k =>
        k.toLowerCase().includes('hash')
      )
    });
  } else {
    console.log('2. No providers at all');
  }

  // Check HashPack globally
  console.log('3. Global HashPack:', {
    hashpack: typeof window.hashpack,
    hashconnect: typeof window.hashconnect
  });
};

checkAllWallets();
```

---

## Expected Result When Working

After fixing, you should see:

```javascript
=== Wallet Detection ===
1. window.ethereum exists: true
2. Multiple providers: 2
   Provider 0: {
     isHashPack: false,
     isMetaMask: true,
     constructor: 'MetaMask'
   }
   Provider 1: {
     isHashPack: true,  // ← THIS IS WHAT WE WANT!
     isMetaMask: false,
     constructor: 'HashPackProvider'
   }
```

---

## Most Common Causes

1. **Page not refreshed** - Try new tab
2. **Extension not enabled** - Check chrome://extensions/
3. **Chrome not restarted** - Fully quit and reopen
4. **HashPack locked** - Unlock the wallet
5. **MetaMask blocking** - Disable MetaMask temporarily

---

## Still Not Working?

If none of these work, provide me with:

1. **HashPack version:** From chrome://extensions/
2. **Chrome version:** chrome://version/
3. **Console output:** From the verification command above
4. **Extension list:** What other extensions you have enabled

We can then try more advanced solutions!
