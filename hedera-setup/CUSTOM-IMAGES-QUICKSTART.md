# Quick Start: Adding Custom Images to Your NFTs

## Overview

Your NFT collections can now use custom images! Follow these simple steps to add your own property images.

## 🚀 Quick Steps

### 1. Prepare Your Images

Create or download 6 images (one for each property):
- **Size**: 1000x1000px to 2000x2000px (square recommended)
- **Format**: JPG, PNG, or WebP
- **File Size**: Under 10MB each

### 2. Name Your Images

Use these exact filenames:

```
Real Estate:
- RE-001.jpg  → Luxury Villa in Lekki, Lagos
- RE-002.jpg  → Commercial Office Building, Accra

Agriculture:
- AG-001.jpg  → Organic Coffee Farm, Yirgacheffe
- AG-002.jpg  → Cocoa Plantation, Ashanti Region

Properties:
- PROP-001.jpg → Logistics Warehouse, Durban Port
- PROP-002.jpg → Multi-level Parking Garage, Cape Town CBD
```

### 3. Place Images in Correct Folders

```bash
# Copy your images to the correct directories
cp your-villa-image.jpg assets/images/real-estate/RE-001.jpg
cp your-office-image.jpg assets/images/real-estate/RE-002.jpg
cp your-coffee-farm.jpg assets/images/agriculture/AG-001.jpg
cp your-cocoa-farm.jpg assets/images/agriculture/AG-002.jpg
cp your-warehouse.jpg assets/images/properties/PROP-001.jpg
cp your-parking.jpg assets/images/properties/PROP-002.jpg
```

### 4. Upload to IPFS

```bash
npm run upload:ipfs
```

This will:
- Upload your images to IPFS via Pinata
- Create proper NFT metadata
- Save CIDs to `output/ipfs-cids.json`

### 5. Mint New NFTs

```bash
npm run remint:ipfs
```

This will mint 30 new NFTs (5 per property) with your custom images!

### 6. Verify on HashScan

Visit these links to see your NFTs with images:
- [Real Estate Collection](https://hashscan.io/testnet/token/0.0.7128093)
- [Agriculture Collection](https://hashscan.io/testnet/token/0.0.7128095)
- [Properties Collection](https://hashscan.io/testnet/token/0.0.7128101)

---

## 📁 Directory Structure

Your project now has this structure:

```
hedera-setup/
├── assets/
│   └── images/
│       ├── real-estate/
│       │   ├── RE-001.jpg
│       │   └── RE-002.jpg
│       ├── agriculture/
│       │   ├── AG-001.jpg
│       │   └── AG-002.jpg
│       └── properties/
│           ├── PROP-001.jpg
│           └── PROP-002.jpg
├── output/
│   └── ipfs-cids.json  (generated after upload)
└── scripts/
    ├── 06-upload-to-ipfs.ts
    └── 08-remint-with-real-ipfs.ts
```

---

## 💡 Tips

### Finding Images

**Free Stock Images:**
- [Unsplash](https://unsplash.com/) - High quality, free
- [Pexels](https://pexels.com/) - Free stock photos
- [Pixabay](https://pixabay.com/) - Free images

**Search Terms:**
- "luxury villa nigeria" or "modern villa"
- "office building ghana" or "commercial building"
- "coffee plantation ethiopia" or "coffee farm"
- "cocoa plantation ghana" or "cocoa farm"
- "warehouse durban" or "industrial warehouse"
- "parking garage cape town" or "multi-level parking"

### Image Optimization

If your images are too large, compress them:

**Online Tools:**
- [TinyPNG](https://tinypng.com/) - Best for PNG/JPG
- [Squoosh](https://squoosh.app/) - Advanced options
- [CompressJPEG](https://compressjpeg.com/) - Batch compression

**Command Line (if you have ImageMagick):**
```bash
# Resize to 1500x1500px
convert input.jpg -resize 1500x1500^ -gravity center -extent 1500x1500 output.jpg

# Or use sips (Mac built-in)
sips -Z 1500 input.jpg --out output.jpg
```

---

## ⚠️ What If I Don't Have Images Yet?

No problem! The script will automatically create placeholder files if images are missing. You'll see:

```
⚠️  No image found, using placeholder
```

The script will still work and upload placeholder text files. You can add real images later and re-run the upload.

---

## 🔍 Troubleshooting

### "Image not found" during upload
- Check filename matches exactly: `RE-001.jpg` (case-sensitive)
- Check file is in correct subfolder
- Check file extension (.jpg, .jpeg, .png, or .webp)

### Images too large
- Compress images to under 5MB
- Use tools like TinyPNG or Squoosh

### Images not showing on HashScan
- Wait 5-10 minutes for IPFS propagation
- Clear your browser cache
- Check Pinata dashboard: [app.pinata.cloud](https://app.pinata.cloud/)

### Need to change images?
1. Replace image files in `assets/images/`
2. Run `npm run upload:ipfs` again (this creates NEW CIDs)
3. Run `npm run remint:ipfs` to mint NEW NFTs with updated images
4. Note: Old NFTs keep their original images (metadata is immutable)

---

## 📚 More Details

For complete documentation, see: `assets/images/README.md`

---

## ✅ Checklist

- [ ] Downloaded or created 6 property images
- [ ] Named images correctly (RE-001.jpg, AG-001.jpg, etc.)
- [ ] Placed images in correct folders (real-estate, agriculture, properties)
- [ ] Ran `npm run upload:ipfs` successfully
- [ ] Verified CIDs in `output/ipfs-cids.json`
- [ ] Ran `npm run remint:ipfs` to mint NFTs
- [ ] Checked NFTs on HashScan to see images

---

**Need Help?** Check the detailed guide at `assets/images/README.md`
