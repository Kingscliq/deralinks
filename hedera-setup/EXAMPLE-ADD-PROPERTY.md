# Example: Adding a New Property (Step-by-Step)

This is a **practical example** showing exactly what to do when you want to add one more property.

---

## Scenario

You currently have:
- **RE-001**: Luxury Villa in Lekki
- **RE-002**: Office Building in Accra

You want to add:
- **RE-003**: Beach Resort in Zanzibar

---

## Step 1: Get Your Image

Download or create an image for the beach resort.

**Image specs:**
- Size: 1500x1500px (or 1000-2000px square)
- Format: JPG recommended
- File size: Under 5MB
- Name: Anything for now (we'll rename it)

**Example:**
```bash
# You downloaded: resort-zanzibar.jpg from Unsplash
ls ~/Downloads/resort-zanzibar.jpg
```

---

## Step 2: Place Image in Correct Location

```bash
# Copy and rename to correct location
cp ~/Downloads/resort-zanzibar.jpg \
   /Users/user/Documents/deralinks/hedera-setup/assets/images/real-estate/RE-003.jpg

# Verify it's there
ls -lh assets/images/real-estate/
```

**You should see:**
```
RE-001.jpg   ← Existing
RE-002.jpg   ← Existing
RE-003.jpg   ← NEW!
```

---

## Step 3: Edit Upload Script

Open the upload script:

```bash
nano scripts/06-upload-to-ipfs.ts
# or use your preferred editor
```

**Find this section** (around line 25-50):

```typescript
const properties = {
  realEstate: [
    {
      id: "RE-001",
      name: "Luxury Villa in Lekki, Lagos",
      description: "Modern luxury villa with 5 bedrooms, infinity pool, and smart home features. Prime location in Lekki Phase 1.",
      location: "Lekki, Lagos, Nigeria",
      type: "Luxury Villa",
      attributes: [
        { trait_type: "Property Type", value: "Residential" },
        { trait_type: "Bedrooms", value: 5 },
        { trait_type: "Bathrooms", value: 6 },
        { trait_type: "Square Footage", value: 5000 },
        { trait_type: "Year Built", value: 2022 },
        { trait_type: "Estimated Value", value: "500000 USD" },
        { trait_type: "Monthly Rental Income", value: "3000 USD" },
        { trait_type: "Location", value: "Lagos, Nigeria" },
      ],
    },
    {
      id: "RE-002",
      name: "Commercial Office Building, Accra",
      description: "6-story modern office building in the heart of Accra's business district. Fully leased with long-term tenants.",
      location: "Accra, Ghana",
      type: "Commercial Office",
      attributes: [
        { trait_type: "Property Type", value: "Commercial" },
        { trait_type: "Floors", value: 6 },
        { trait_type: "Total Area", value: 30000 },
        { trait_type: "Year Built", value: 2020 },
        { trait_type: "Estimated Value", value: "1200000 USD" },
        { trait_type: "Monthly Income", value: "10000 USD" },
        { trait_type: "Tenants", value: 8 },
        { trait_type: "Location", value: "Accra, Ghana" },
      ],
    },
  ],
```

**Add your new property** after RE-002 (before the closing bracket):

```typescript
const properties = {
  realEstate: [
    {
      id: "RE-001",
      name: "Luxury Villa in Lekki, Lagos",
      // ... existing data
    },
    {
      id: "RE-002",
      name: "Commercial Office Building, Accra",
      // ... existing data
    },
    // ========================================
    // ADD THIS NEW PROPERTY:
    // ========================================
    {
      id: "RE-003",
      name: "Beach Resort in Zanzibar, Tanzania",
      description: "Luxury 50-room beachfront resort on pristine white sand beach. Full-service spa, three restaurants, private beach access. Prime tourist location with year-round occupancy.",
      location: "Zanzibar, Tanzania",
      type: "Resort",
      attributes: [
        { trait_type: "Property Type", value: "Resort" },
        { trait_type: "Rooms", value: 50 },
        { trait_type: "Beach Access", value: "Private" },
        { trait_type: "Restaurants", value: 3 },
        { trait_type: "Spa", value: "Full Service" },
        { trait_type: "Year Built", value: 2021 },
        { trait_type: "Estimated Value", value: "3000000 USD" },
        { trait_type: "Monthly Revenue", value: "50000 USD" },
        { trait_type: "Occupancy Rate", value: "85%" },
        { trait_type: "Location", value: "Zanzibar, Tanzania" },
      ],
    },
    // ========================================
  ],
  agriculture: [
    // ... keep existing
  ],
  properties: [
    // ... keep existing
  ],
};
```

**Important formatting:**
- Add a comma after RE-002's closing brace `},`
- Copy the structure exactly
- Customize the values for your property

Save the file: `Ctrl+X`, then `Y`, then `Enter`

---

## Step 4: Upload to IPFS

```bash
npm run upload:ipfs
```

**Expected output:**

```
🚀 Uploading Property Assets to IPFS
============================================================

📍 Real Estate Properties:

   Processing: Luxury Villa in Lekki, Lagos
   ✅ Found image: RE-001.jpg
   📤 Uploading image to IPFS...
   📦 Image CID: bafkreihyjuiej3hx46sdibpy6bd7r254hmj4z2g5vl56zdvoybisq47wza
   ✅ Complete!

   Processing: Commercial Office Building, Accra
   ✅ Found image: RE-002.jpg
   📤 Uploading image to IPFS...
   📦 Image CID: bafkreiee5uy3c6foxchvymo4wc76mkrz5egcvug7ht5rgfqcnb35deq3fy
   ✅ Complete!

   Processing: Beach Resort in Zanzibar, Tanzania
   ✅ Found image: RE-003.jpg                    ← NEW!
   📤 Uploading image to IPFS...
   📦 Image CID: bafkreig7h3k2l9m8n5o6p...       ← NEW CID!
   📤 Uploading metadata...
   📦 Metadata CID: bafkreia8j4m5n6o7p8q...      ← NEW CID!
   ✅ Complete!

🌾 Agriculture Properties:
   [Processes existing AG-001, AG-002]

🏭 Properties (Industrial/Commercial):
   [Processes existing PROP-001, PROP-002]

============================================================
✅ Upload Complete!

📄 Results saved to: output/ipfs-cids.json

Summary:
   Total properties: 7                          ← Was 6!
   Real Estate: 3 properties                    ← Was 2!
   Agriculture: 2 properties
   Properties: 2 properties
```

**What happened:**
- Script detected RE-003.jpg
- Uploaded image to IPFS → Got image CID
- Created metadata JSON with property details
- Uploaded metadata to IPFS → Got metadata CID
- Saved both CIDs to `output/ipfs-cids.json`

---

## Step 5: Verify IPFS Upload

Check the CIDs file:

```bash
cat output/ipfs-cids.json
```

**You should see your new property:**

```json
{
  "realEstate": [
    {
      "propertyId": "RE-001",
      "name": "Luxury Villa in Lekki, Lagos",
      "imageCID": "bafkreihyjuiej...",
      "metadataCID": "bafkreihyzr4rz..."
    },
    {
      "propertyId": "RE-002",
      "name": "Commercial Office Building, Accra",
      "imageCID": "bafkreiee5uy3c...",
      "metadataCID": "bafkreieshiqat..."
    },
    {
      "propertyId": "RE-003",                      ← NEW!
      "name": "Beach Resort in Zanzibar, Tanzania",
      "imageCID": "bafkreig7h3k2l...",             ← NEW!
      "metadataCID": "bafkreia8j4m5n..."           ← NEW!
    }
  ],
  "agriculture": [...],
  "properties": [...]
}
```

**Test image URL:**

Copy the image CID and open in browser:
```
https://gateway.pinata.cloud/ipfs/bafkreig7h3k2l...
```

You should see your resort image! 🏖️

---

## Step 6: Mint NFTs

Now create NFTs for the new property:

```bash
npm run remint:ipfs
```

**Expected output:**

```
🔄 Re-minting NFTs with Real IPFS CIDs
============================================================
✅ Connected to Hedera Testnet
📋 Operator: 0.0.7144121

🏠 Minting Real Estate NFTs with real IPFS...

   Minting: Luxury Villa in Lekki, Lagos
   [Serials 1-5 already exist, will mint new ones 11-15 or skip]

   Minting: Commercial Office Building, Accra
   [Serials already exist]

   Minting: Beach Resort in Zanzibar, Tanzania    ← NEW!
   Metadata CID: bafkreia8j4m5n...
   Image CID: bafkreig7h3k2l...
   ✅ Minted serial #11                           ← NEW SERIALS!
   ✅ Minted serial #12
   ✅ Minted serial #13
   ✅ Minted serial #14
   ✅ Minted serial #15
   🎉 Minted 5 NFTs for Beach Resort in Zanzibar

============================================================
✅ Minting Complete!

📊 Summary:
   Total NFTs minted: 5                          ← Just the new ones
   Real Estate: 3 properties (15 total NFTs)     ← Was 10!
```

**What happened:**
- Script read the new property from `output/ipfs-cids.json`
- Minted 5 NFTs (20% ownership each)
- Assigned serial numbers 11-15 (continuing from last serial 10)
- Each NFT links to the IPFS metadata

---

## Step 7: Verify on HashScan

Open your Real Estate collection:

```
https://hashscan.io/testnet/token/0.0.7128093
```

**What to check:**

1. **Total Supply**: Should now show **15** (was 10)

2. **NFTs Tab**: Click to see all NFTs
   - Serials 1-5: Luxury Villa
   - Serials 6-10: Office Building
   - **Serials 11-15: Beach Resort** ← NEW!

3. **Click on Serial #11**:
   - **Image should display!** 🏖️
   - Name: "Beach Resort in Zanzibar, Tanzania"
   - Description: Full text
   - Attributes: All property details

4. **Check Metadata**:
   ```json
   {
     "name": "Beach Resort in Zanzibar, Tanzania",
     "description": "Luxury 50-room beachfront resort...",
     "image": "ipfs://bafkreig7h3k2l...",
     "attributes": [
       { "trait_type": "Property Type", "value": "Resort" },
       { "trait_type": "Rooms", "value": 50 },
       ...
     ]
   }
   ```

---

## Step 8: Transfer Test (Optional)

Test transferring one of the new NFTs:

```bash
npm run test:transfer 0.0.YOUR_ACCOUNT_ID
```

**What happens:**
- Script will transfer **serial #11** (first Beach Resort NFT)
- From: Treasury account
- To: Your account

**Verify:**
- Check your account on HashScan
- You should now own Beach Resort NFT #11
- Image displays in your account!

---

## Summary of Changes

### Files Changed

**Added:**
- `assets/images/real-estate/RE-003.jpg` ← Your image

**Modified:**
- `scripts/06-upload-to-ipfs.ts` ← Added property data
- `output/ipfs-cids.json` ← Auto-updated with new CIDs
- `output/nfts-with-ipfs.json` ← Auto-updated with new NFTs

### Blockchain Changes

**On Hedera:**
- Collection 0.0.7128093 total supply: 10 → 15
- New NFTs: Serials 11-15
- Owner: Treasury account

**On IPFS:**
- New image uploaded (CID: bafkreig...)
- New metadata uploaded (CID: bafkreia...)

---

## What If You Want to Add More?

**To add RE-004 (Shopping Mall in Nairobi):**

```bash
# 1. Add image
cp shopping-mall.jpg assets/images/real-estate/RE-004.jpg

# 2. Edit upload script
nano scripts/06-upload-to-ipfs.ts
# Add RE-004 property data after RE-003

# 3. Upload
npm run upload:ipfs

# 4. Mint
npm run remint:ipfs
# Will create serials 16-20 for RE-004
```

**Same process every time!**

---

## Troubleshooting

### "Image not found"

```
⚠️  No image found, using placeholder
```

**Problem:** Image filename doesn't match or not in correct folder

**Solution:**
```bash
# Check file exists
ls assets/images/real-estate/RE-003.jpg

# Check filename exactly (case-sensitive!)
# Should be: RE-003.jpg
# NOT: re-003.jpg or RE-003.png or RE-3.jpg
```

### TypeScript errors after editing

```
error TS2345: Argument of type...
```

**Problem:** Syntax error in property data

**Solution:**
- Check all opening/closing braces match
- Check commas after each property
- Validate JSON structure

### "Already minted" or duplicate serials

**Problem:** Script tries to mint same property twice

**Solution:** This is normal! The remint script mints NEW NFTs with incrementing serials. Old NFTs remain unchanged.

### Image doesn't show on HashScan

**Problem:** IPFS propagation delay

**Solution:**
- Wait 5-10 minutes
- Clear browser cache
- Check image loads directly: `https://gateway.pinata.cloud/ipfs/YOUR_CID`

---

## Complete Code Example

Here's exactly what the properties section looks like with RE-003 added:

```typescript
const properties = {
  realEstate: [
    {
      id: "RE-001",
      name: "Luxury Villa in Lekki, Lagos",
      description: "Modern luxury villa with 5 bedrooms, infinity pool, and smart home features.",
      location: "Lekki, Lagos, Nigeria",
      type: "Luxury Villa",
      attributes: [
        { trait_type: "Property Type", value: "Residential" },
        { trait_type: "Bedrooms", value: 5 },
        { trait_type: "Estimated Value", value: "500000 USD" },
        { trait_type: "Location", value: "Lagos, Nigeria" },
      ],
    },
    {
      id: "RE-002",
      name: "Commercial Office Building, Accra",
      description: "6-story modern office building in Accra's business district.",
      location: "Accra, Ghana",
      type: "Commercial Office",
      attributes: [
        { trait_type: "Property Type", value: "Commercial" },
        { trait_type: "Floors", value: 6 },
        { trait_type: "Estimated Value", value: "1200000 USD" },
        { trait_type: "Location", value: "Accra, Ghana" },
      ],
    },
    {
      id: "RE-003",
      name: "Beach Resort in Zanzibar, Tanzania",
      description: "Luxury 50-room beachfront resort with private beach.",
      location: "Zanzibar, Tanzania",
      type: "Resort",
      attributes: [
        { trait_type: "Property Type", value: "Resort" },
        { trait_type: "Rooms", value: 50 },
        { trait_type: "Estimated Value", value: "3000000 USD" },
        { trait_type: "Location", value: "Zanzibar, Tanzania" },
      ],
    },
  ],
  // agriculture and properties remain unchanged
};
```

---

**That's it!** You've successfully added a new property with a custom image to your NFT collection. 🎉

**Want to add more?** Repeat the same process for each new property!
