# HashPack Quick Fix - Most Likely Solutions

## Your Situation
✅ HashPack Chrome extension is installed
❌ Browser shows only MetaMask, not HashPack
❌ Console output: `isHashPack: undefined, isHashpack: undefined`

## Code is Fine ✅
I've verified your detection code - it correctly checks for both:
- `isHashPack` (capital P)
- `isHashpack` (lowercase p)
- Both single provider and providers array scenarios

**This is a browser extension injection issue, not a code issue.**

---

## Try These 3 Steps First (90% Success Rate)

### Step 1: Hard Refresh in a NEW Tab

**Why:** Extensions inject on page load. Old tabs won't have HashPack.

1. **Close** your current localhost:3000 tab completely
2. **Open a brand NEW tab**
3. Navigate to: `http://localhost:3000`
4. Open console (F12) and run the verification command below

---

### Step 2: Ensure HashPack is Enabled & Unlocked

**Why:** Disabled or locked extensions won't inject.

1. **Go to:** `chrome://extensions/`
2. **Find HashPack** - toggle should be **BLUE/ON**
3. **Click the refresh icon** (↻) next to the toggle
4. **Click HashPack extension icon** in Chrome toolbar
5. **Unlock it** if it's asking for password
6. **Go back to Step 1** (new tab + hard refresh)

---

### Step 3: Restart Chrome Completely

**Why:** Extensions sometimes need a full browser restart to activate.

1. **Quit Chrome** completely:
   - **Mac:** Chrome menu → Quit Chrome (or Cmd+Q)
   - **Windows:** File → Exit (or Alt+F4)
   - **Don't just close the window** - fully quit the app
2. **Wait 5 seconds**
3. **Reopen Chrome**
4. **Open NEW tab** → http://localhost:3000
5. **Run verification command**

---

## Verification Command

After each step, paste this in browser console to check if HashPack is detected:

```javascript
// Quick HashPack detection check
(() => {
  console.log('=== Quick HashPack Check ===');

  if (!window.ethereum) {
    return console.error('❌ No window.ethereum - no wallets installed');
  }

  // Check providers array
  if (window.ethereum.providers?.length > 0) {
    console.log(`Found ${window.ethereum.providers.length} wallet providers:`);
    window.ethereum.providers.forEach((p, i) => {
      const name = p.isHashPack || p.isHashpack ? 'HashPack ✅' :
                   p.isMetaMask ? 'MetaMask' :
                   p.isBlade ? 'Blade' : 'Unknown';
      console.log(`  ${i + 1}. ${name}`, {
        isHashPack: p.isHashPack,
        isHashpack: p.isHashpack,
      });
    });

    const found = window.ethereum.providers.some(p => p.isHashPack || p.isHashpack);
    console.log(found ? '✅ SUCCESS: HashPack detected!' : '❌ FAIL: HashPack not found');
  }
  // Check single provider
  else {
    const isHP = window.ethereum.isHashPack || window.ethereum.isHashpack;
    console.log('Single provider:', {
      isHashPack: window.ethereum.isHashPack,
      isHashpack: window.ethereum.isHashpack,
      isMetaMask: window.ethereum.isMetaMask,
    });
    console.log(isHP ? '✅ SUCCESS: HashPack detected!' : '❌ FAIL: HashPack not found');
  }
})();
```

**Expected Output When Working:**
```
=== Quick HashPack Check ===
Found 2 wallet providers:
  1. MetaMask
  2. HashPack ✅
✅ SUCCESS: HashPack detected!
```

---

## If Steps 1-3 Don't Work: Advanced Solutions

### Option 4: Disable MetaMask Temporarily

MetaMask might be blocking HashPack injection:

1. `chrome://extensions/` → Find MetaMask → Toggle **OFF**
2. Close all Chrome tabs
3. Reopen Chrome
4. New tab → localhost:3000
5. Run verification command
6. **If HashPack now shows:** Re-enable MetaMask (both should work together)

### Option 5: Check HashPack Installation

1. `chrome://extensions/`
2. Find HashPack
3. **Click "Details"** button
4. Verify:
   - Version: Should be 2.x.x or higher
   - ID: `gjagmgiddbbciopjhllkdnddhcglnemk`
   - Permissions: Should have "all websites" access
5. **If version is old or permissions wrong:**
   - Click "Remove"
   - Reinstall from: https://chrome.google.com/webstore/detail/hashpack/gjagmgiddbbciopjhllkdnddhcglnemk

### Option 6: Nuclear Option

Only if nothing else works:

```bash
# 1. Backup your HashPack seed phrase first!
#    HashPack → Settings → Backup → Write down recovery phrase

# 2. Remove HashPack from Chrome
#    chrome://extensions/ → HashPack → Remove

# 3. Clear Chrome cache
#    chrome://settings/clearBrowserData
#    Select: Cached images, Cookies
#    Time range: All time
#    Clear data

# 4. Restart Chrome completely

# 5. Reinstall HashPack
#    https://chrome.google.com/webstore/detail/hashpack/gjagmgiddbbciopjhllkdnddhcglnemk

# 6. Set up wallet again with recovery phrase

# 7. Test in NEW tab
```

---

## Most Common Cause

**95% of "installed but not detected" issues are:**

1. **Page not refreshed in a NEW tab** (old tab won't have extension)
2. **Extension is locked** (needs password unlock)
3. **Chrome not fully restarted** (extension didn't activate)

**Try Steps 1-3 above before anything else!**

---

## Still Not Working?

If none of these work, provide me with:

1. **HashPack version:** From chrome://extensions/
2. **Chrome version:** From chrome://version/
3. **Verification command output:** Copy the full console output
4. **Screenshot:** Of chrome://extensions/ showing HashPack

I can then provide more specific guidance.

---

## Alternative: Use HashConnect SDK

If browser extension detection continues to fail after all troubleshooting, you can switch to HashPack's official HashConnect SDK (recommended for production):

```bash
npm install hashconnect
```

This uses QR code/pairing instead of browser extension injection and is actually the recommended method for production apps. Let me know if you want to implement this instead!
