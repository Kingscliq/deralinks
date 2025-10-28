# Adding More Properties and Images

## Overview

You can easily add more properties and images to your NFT collections! This guide shows you how to scale from 6 properties to 10, 20, 100+ properties.

---

## Quick Answer

**To add more properties:**

1. **Add images** to `assets/images/` folders with new property IDs
2. **Edit** `scripts/06-upload-to-ipfs.ts` to add property data
3. **Run** `npm run upload:ipfs` (uploads new images & metadata)
4. **Run** `npm run remint:ipfs` (mints NFTs for new properties)

That's it! The scripts will handle everything else.

---

## Detailed Process

### Scenario 1: Adding More Properties to Existing Collections

Let's say you want to add 2 more real estate properties.

#### Step 1: Prepare New Images

**Current properties:**
- RE-001: Luxury Villa in Lekki, Lagos
- RE-002: Commercial Office Building, Accra

**New properties to add:**
- RE-003: Beach Resort in Zanzibar
- RE-004: Shopping Mall in Nairobi

**Get images:**
```bash
# Download or create images for new properties
# Name them: RE-003.jpg, RE-004.jpg

# Place in correct folder
cp ~/Downloads/beach-resort.jpg assets/images/real-estate/RE-003.jpg
cp ~/Downloads/shopping-mall.jpg assets/images/real-estate/RE-004.jpg
```

#### Step 2: Update Upload Script

Edit `scripts/06-upload-to-ipfs.ts`:

**Find the `properties` object** (around line 25) and add your new properties:

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
    // ADD NEW PROPERTIES HERE:
    {
      id: "RE-003",
      name: "Beach Resort in Zanzibar, Tanzania",
      description: "Luxury beachfront resort with 50 rooms, private beach access, and world-class amenities. Prime tourist location.",
      location: "Zanzibar, Tanzania",
      type: "Resort",
      attributes: [
        { trait_type: "Property Type", value: "Resort" },
        { trait_type: "Rooms", value: 50 },
        { trait_type: "Beach Access", value: "Private" },
        { trait_type: "Year Built", value: 2020 },
        { trait_type: "Estimated Value", value: "3000000 USD" },
        { trait_type: "Monthly Revenue", value: "50000 USD" },
        { trait_type: "Occupancy Rate", value: "85%" },
        { trait_type: "Location", value: "Zanzibar, Tanzania" },
      ],
    },
    {
      id: "RE-004",
      name: "Shopping Mall in Nairobi, Kenya",
      description: "Modern shopping mall with 100+ retail spaces in central Nairobi. High foot traffic area.",
      location: "Nairobi, Kenya",
      type: "Commercial",
      attributes: [
        { trait_type: "Property Type", value: "Commercial" },
        { trait_type: "Retail Spaces", value: 100 },
        { trait_type: "Year Built", value: 2018 },
        { trait_type: "Estimated Value", value: "5000000 USD" },
        { trait_type: "Monthly Revenue", value: "80000 USD" },
        { trait_type: "Anchor Tenants", value: 5 },
        { trait_type: "Location", value: "Nairobi, Kenya" },
      ],
    },
  ],
  agriculture: [
    // Keep existing properties
  ],
  properties: [
    // Keep existing properties
  ],
};
```

#### Step 3: Upload New Images to IPFS

```bash
npm run upload:ipfs
```

**What happens:**
- Script finds RE-003.jpg and RE-004.jpg
- Uploads new images to IPFS → gets new CIDs
- Creates metadata JSON for new properties
- Uploads metadata to IPFS → gets new metadata CIDs
- **Updates** `output/ipfs-cids.json` with new entries

**Expected output:**
```
📍 Real Estate Properties:

   Processing: Luxury Villa in Lekki, Lagos
   ✅ Found image: RE-001.jpg
   ✅ Already uploaded (skipping)

   Processing: Commercial Office Building, Accra
   ✅ Found image: RE-002.jpg
   ✅ Already uploaded (skipping)

   Processing: Beach Resort in Zanzibar, Tanzania
   ✅ Found image: RE-003.jpg
   📤 Uploading image to IPFS...
   📤 Uploading metadata...
   ✅ Complete!
   📦 Image CID: bafkreig7h3k2l...
   📦 Metadata CID: bafkreia8j4m5n...

   Processing: Shopping Mall in Nairobi, Kenya
   ✅ Found image: RE-004.jpg
   📤 Uploading image to IPFS...
   📤 Uploading metadata...
   ✅ Complete!
```

**Result:**
- `output/ipfs-cids.json` now has 8 properties (was 6)

#### Step 4: Mint NFTs for New Properties

```bash
npm run remint:ipfs
```

**What happens:**
- Script reads updated `output/ipfs-cids.json`
- Mints 5 NFTs for RE-003 (serials will be 11-15)
- Mints 5 NFTs for RE-004 (serials will be 16-20)

**Expected output:**
```
🏠 Minting Real Estate NFTs with real IPFS...

   Minting: Beach Resort in Zanzibar, Tanzania
   Metadata CID: bafkreia8j4m5n...
   ✅ Minted serial #11
   ✅ Minted serial #12
   ✅ Minted serial #13
   ✅ Minted serial #14
   ✅ Minted serial #15

   Minting: Shopping Mall in Nairobi, Kenya
   Metadata CID: bafkreib9k5n6p...
   ✅ Minted serial #16
   ✅ Minted serial #17
   ✅ Minted serial #18
   ✅ Minted serial #19
   ✅ Minted serial #20
```

#### Step 5: Verify on HashScan

Visit your Real Estate collection:
```
https://hashscan.io/testnet/token/0.0.7128093
```

**You should now see:**
- 20 total NFTs (was 10)
- Serials 1-10: Original properties
- Serials 11-15: Beach Resort
- Serials 16-20: Shopping Mall

---

### Scenario 2: Replacing/Updating Existing Images

If you want to replace an image for an existing property:

**Important:** NFT metadata is **immutable**! You cannot change existing NFTs.

**Options:**

#### Option A: Mint New NFTs with Updated Images

1. Replace image file: `assets/images/real-estate/RE-001.jpg`
2. Run `npm run upload:ipfs` (uploads new image, gets new CID)
3. Run `npm run remint:ipfs` (mints NEW NFTs with new image)

**Result:**
- Old NFTs (serials 1-5) keep old image
- New NFTs (serials 21-25) have new image
- Both sets of NFTs exist simultaneously

#### Option B: Create New Property ID

Better approach for major changes:

1. Create new property ID: `RE-001-v2`
2. Add new image: `assets/images/real-estate/RE-001-v2.jpg`
3. Add property to upload script
4. Upload and mint

**Result:**
- RE-001: Original NFTs with original image
- RE-001-v2: New NFTs with updated image
- Clear version tracking

---

### Scenario 3: Adding Many Properties at Once

Let's say you want to add 10 new real estate properties.

#### Step 1: Prepare All Images

```bash
# Create images RE-003.jpg through RE-012.jpg
assets/images/real-estate/
├── RE-003.jpg
├── RE-004.jpg
├── RE-005.jpg
├── RE-006.jpg
├── RE-007.jpg
├── RE-008.jpg
├── RE-009.jpg
├── RE-010.jpg
├── RE-011.jpg
└── RE-012.jpg
```

#### Step 2: Bulk Update Upload Script

Instead of manually adding each property, you could create a helper function:

```typescript
// Add this to scripts/06-upload-to-ipfs.ts

const additionalRealEstate = [
  {
    id: "RE-003",
    name: "Beach Resort in Zanzibar",
    description: "...",
    location: "Zanzibar, Tanzania",
    type: "Resort",
    attributes: [...],
  },
  // ... add all 10 properties
];

// In the properties object:
const properties = {
  realEstate: [
    // ... existing 2 properties
    ...additionalRealEstate,  // Add all new properties at once
  ],
  // ...
};
```

#### Step 3: Batch Upload & Mint

```bash
# Upload all 10 new properties
npm run upload:ipfs

# Mint 50 NFTs (5 per property × 10 properties)
npm run remint:ipfs
```

**Result:**
- All 10 properties uploaded in one go
- 50 new NFTs minted
- Total collection size: 60 NFTs

---

## How Serial Numbers Work

NFTs are numbered sequentially within each collection.

### Example: Real Estate Collection

**Initial state:**
- RE-001: Serials 1-5
- RE-002: Serials 6-10

**After adding RE-003:**
- RE-001: Serials 1-5
- RE-002: Serials 6-10
- RE-003: Serials 11-15 ← New serials continue from last

**After adding RE-004:**
- RE-001: Serials 1-5
- RE-002: Serials 6-10
- RE-003: Serials 11-15
- RE-004: Serials 16-20 ← Continues sequentially

**Serial numbers never reset or reuse!**

---

## Important Considerations

### 1. Collection Size Limits

**Hedera limits:**
- No hard limit on NFTs per collection
- Practical limit: Millions of NFTs
- Your limit: Storage, IPFS costs, minting fees

**For your use case:**
- 6 properties → 30 NFTs ✅
- 100 properties → 500 NFTs ✅
- 1000 properties → 5000 NFTs ✅
- All feasible!

### 2. IPFS Storage Costs

**Pinata free tier:**
- 100 GB storage
- Each image ~2-5 MB
- Can store ~20,000-50,000 images

**If you exceed free tier:**
- Pinata paid plans start at $20/month
- Still very affordable for thousands of properties

### 3. Minting Costs

**Testnet:** FREE

**Mainnet:**
- ~$0.05 per NFT minted
- 100 properties × 5 NFTs = 500 NFTs = ~$25
- Still very affordable!

### 4. Script Performance

Current script mints one NFT at a time:
- 30 NFTs: ~2 minutes
- 500 NFTs: ~30 minutes
- 5000 NFTs: ~5 hours

**Optimization:** Batch mint multiple NFTs in single transaction (future enhancement)

---

## Best Practices

### 1. Organize Property IDs

Use clear, sequential IDs:

```
Real Estate:
- RE-001, RE-002, RE-003... ✅

NOT:
- Villa1, Office2, BeachHouse ❌
```

### 2. Maintain Property Data File

Create `data/properties.json`:

```json
{
  "realEstate": [
    {
      "id": "RE-001",
      "name": "Luxury Villa in Lekki",
      "description": "...",
      "attributes": [...]
    }
  ]
}
```

Then import in upload script:
```typescript
import properties from '../data/properties.json';
```

This separates data from code!

### 3. Version Control Images

Keep original high-res images separate:

```
assets/
├── originals/          ← High-res originals
│   └── RE-001.png      (5000x5000px, 20MB)
├── images/             ← Optimized for NFTs
│   └── real-estate/
│       └── RE-001.jpg  (1500x1500px, 500KB)
```

### 4. Batch Operations

When adding many properties:
- Prepare all images first
- Update script with all properties
- Run upload once (not per property)
- Run mint once (creates all NFTs)

### 5. Track Additions

Update `output/nfts-with-ipfs.json` tracks all minted NFTs:

```json
{
  "results": [
    {
      "collectionId": "0.0.7128093",
      "property": {
        "id": "RE-003",
        "name": "Beach Resort in Zanzibar"
      },
      "serialNumbers": [11, 12, 13, 14, 15]
    }
  ]
}
```

Use this to track which properties have NFTs minted.

---

## Complete Example: Adding 4 New Properties

Let's add:
- 2 Real Estate: RE-003, RE-004
- 1 Agriculture: AG-003
- 1 Properties: PROP-003

### Step-by-Step

```bash
# 1. Add images
cp beach-resort.jpg assets/images/real-estate/RE-003.jpg
cp shopping-mall.jpg assets/images/real-estate/RE-004.jpg
cp rice-farm.jpg assets/images/agriculture/AG-003.jpg
cp hotel.jpg assets/images/properties/PROP-003.jpg

# 2. Edit upload script
nano scripts/06-upload-to-ipfs.ts
# (Add 4 new property definitions)

# 3. Upload to IPFS
npm run upload:ipfs
# Uploads 4 new images + metadata

# 4. Mint NFTs
npm run remint:ipfs
# Mints 20 NFTs (5 per property)

# 5. Verify
# Real Estate: Now has 20 NFTs (was 10)
# Agriculture: Now has 15 NFTs (was 10)
# Properties: Now has 15 NFTs (was 10)
```

**Total NFTs:** 30 → 50 (added 20)

---

## Automation Script (Advanced)

For adding many properties, create a helper script:

`scripts/add-property.ts`:

```typescript
import fs from 'fs';
import path from 'path';

interface NewProperty {
  id: string;
  category: 'real-estate' | 'agriculture' | 'properties';
  name: string;
  description: string;
  location: string;
  type: string;
  attributes: Array<{ trait_type: string; value: string | number }>;
  imagePath: string;
}

function addProperty(property: NewProperty) {
  // 1. Copy image to correct location
  const destPath = path.join(
    process.cwd(),
    'assets/images',
    property.category,
    `${property.id}.jpg`
  );
  fs.copyFileSync(property.imagePath, destPath);
  console.log(`✅ Image copied: ${property.id}.jpg`);

  // 2. Update properties.json
  const propertiesFile = path.join(process.cwd(), 'data/properties.json');
  const data = JSON.parse(fs.readFileSync(propertiesFile, 'utf-8'));

  const categoryKey = property.category === 'real-estate' ? 'realEstate' : property.category;
  data[categoryKey].push({
    id: property.id,
    name: property.name,
    description: property.description,
    location: property.location,
    type: property.type,
    attributes: property.attributes,
  });

  fs.writeFileSync(propertiesFile, JSON.stringify(data, null, 2));
  console.log(`✅ Property added to data file`);
}

// Usage:
addProperty({
  id: 'RE-003',
  category: 'real-estate',
  name: 'Beach Resort in Zanzibar',
  description: '...',
  location: 'Zanzibar, Tanzania',
  type: 'Resort',
  attributes: [...],
  imagePath: '/Users/user/Downloads/resort.jpg'
});
```

---

## Summary

### Adding More Properties is Easy!

1. ✅ **Add images** to `assets/images/` folders
2. ✅ **Edit upload script** with property data
3. ✅ **Run upload** to get IPFS CIDs
4. ✅ **Run mint** to create NFTs
5. ✅ **Verify** on HashScan

### Key Points

- Serial numbers continue sequentially
- Old NFTs are never modified
- New NFTs get new serial numbers
- No limit on properties/NFTs (within reason)
- Process is the same for 1 or 100 properties

### Scaling

- 6 properties → 100 properties: Same process
- 30 NFTs → 500 NFTs: Same scripts
- Just takes longer to mint (bulk operations)

---

**Questions?** Check `COMPLETE-NFT-GUIDE.md` for detailed documentation!
