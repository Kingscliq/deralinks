# NFT Images Guide

This directory contains the images for your NFT collections. Follow these instructions to add custom images for your properties.

## Directory Structure

```
assets/images/
├── real-estate/
│   ├── RE-001.jpg    (Luxury Villa in Lekki, Lagos)
│   └── RE-002.jpg    (Commercial Office Building, Accra)
├── agriculture/
│   ├── AG-001.jpg    (Organic Coffee Farm, Yirgacheffe)
│   └── AG-002.jpg    (Cocoa Plantation, Ashanti Region)
└── properties/
    ├── PROP-001.jpg  (Logistics Warehouse, Durban Port)
    └── PROP-002.jpg  (Multi-level Parking Garage, Cape Town CBD)
```

## Image Requirements

### Technical Requirements
- **Format**: JPG, PNG, or WebP
- **Size**: Recommended 1000x1000px to 2000x2000px
- **File Size**: Under 10MB per image (smaller is better for loading speed)
- **Aspect Ratio**: Square (1:1) recommended for best display

### Naming Convention
Images must be named using the property ID:
- Real Estate: `RE-001.jpg`, `RE-002.jpg`
- Agriculture: `AG-001.jpg`, `AG-002.jpg`
- Properties: `PROP-001.jpg`, `PROP-002.jpg`

**File extension can be**: `.jpg`, `.jpeg`, `.png`, or `.webp`

## How to Add Your Images

### Step 1: Prepare Your Images
1. Collect or create images for each property
2. Resize/optimize images to meet requirements above
3. Name them according to the property ID

### Step 2: Add Images to Folders
Place each image in the correct folder:

```bash
# Example:
cp your-villa-photo.jpg assets/images/real-estate/RE-001.jpg
cp your-office-photo.jpg assets/images/real-estate/RE-002.jpg
cp your-farm-photo.jpg assets/images/agriculture/AG-001.jpg
# ... etc
```

### Step 3: Upload to IPFS
Run the upload script to upload images to IPFS:

```bash
npm run upload:ipfs
```

This will:
- Upload each image to IPFS
- Create proper NFT metadata JSON files
- Upload metadata to IPFS
- Save all CIDs to `output/ipfs-cids.json`

### Step 4: Mint NFTs with New Images
After uploading, mint new NFTs with the image CIDs:

```bash
npm run remint:ipfs
```

This will mint 5 NFTs per property (30 total) with your custom images.

### Step 5: Verify
Check your NFTs on HashScan to see the images:
- https://hashscan.io/testnet/token/0.0.7128093 (Real Estate)
- https://hashscan.io/testnet/token/0.0.7128095 (Agriculture)
- https://hashscan.io/testnet/token/0.0.7128101 (Properties)

## Image Sources & Tips

### Where to Get Images

1. **Your Own Photos**: Best option for authenticity
2. **Free Stock Images**:
   - [Unsplash](https://unsplash.com/) - High quality, free for commercial use
   - [Pexels](https://pexels.com/) - Free stock photos
   - [Pixabay](https://pixabay.com/) - Free images and vectors
3. **AI Generated**: Use Midjourney, DALL-E, or Stable Diffusion
4. **Licensed Images**: Purchase from stock photo sites

### Image Optimization Tools
- **Online**: TinyPNG, Squoosh.app, CompressJPEG.com
- **Desktop**: ImageOptim (Mac), GIMP, Photoshop
- **CLI**: `imagemagick`, `jpegoptim`, `optipng`

### Example: Resize with ImageMagick
```bash
# Install imagemagick
brew install imagemagick  # Mac
apt-get install imagemagick  # Linux

# Resize to 1500x1500px
convert input.jpg -resize 1500x1500^ -gravity center -extent 1500x1500 RE-001.jpg
```

## Property Details

Use these details to find/create appropriate images:

### Real Estate
- **RE-001**: Luxury Villa in Lekki, Lagos
  - Modern residential villa
  - Lagos, Nigeria
  - 5 bedrooms, luxury features

- **RE-002**: Commercial Office Building, Accra
  - Modern office building
  - Accra, Ghana
  - Commercial property

### Agriculture
- **AG-001**: Organic Coffee Farm, Yirgacheffe
  - Coffee plantation
  - Yirgacheffe, Ethiopia
  - Organic farming

- **AG-002**: Cocoa Plantation, Ashanti Region
  - Cocoa farm
  - Ashanti Region, Ghana
  - Agricultural land

### Properties
- **PROP-001**: Logistics Warehouse, Durban Port
  - Industrial warehouse
  - Durban, South Africa
  - Port logistics

- **PROP-002**: Multi-level Parking Garage, Cape Town CBD
  - Parking structure
  - Cape Town, South Africa
  - Multi-level facility

## Troubleshooting

### "Image file not found"
- Check filename matches property ID exactly
- Check file is in correct subfolder
- Check file extension (must be .jpg, .jpeg, .png, or .webp)

### Images too large
- Compress images before uploading
- Recommended max: 5MB per image
- Use online tools like TinyPNG or Squoosh

### Images don't display on HashScan
- Wait 5-10 minutes for IPFS propagation
- Check CIDs are correct in `output/ipfs-cids.json`
- Verify images uploaded successfully to Pinata
- Check Pinata dashboard: https://app.pinata.cloud/

## Next Steps

After adding images, you may want to:
1. Create more properties with different images
2. Mint more NFTs (increase quantity per property)
3. Set up batch transfers for marketplace sales
4. Integrate with frontend application
