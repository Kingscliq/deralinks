# IPFS Setup Guide - Using Pinata

This guide will help you set up IPFS integration for storing NFT images and metadata using Pinata.

## Why IPFS?

IPFS (InterPlanetary File System) is the standard for storing NFT metadata and images because:
- **Decentralized**: Files are distributed across multiple nodes
- **Immutable**: Content is addressed by its hash (CID)
- **Permanent**: Files can't be changed or deleted once pinned
- **Standard**: All NFT wallets and marketplaces support IPFS

## Step 1: Create a Pinata Account

1. Go to [https://app.pinata.cloud/register](https://app.pinata.cloud/register)
2. Sign up for a **free account**
   - Free tier includes: 1GB storage, 100GB bandwidth/month
   - More than enough for testing and small projects
3. Verify your email

## Step 2: Get Your API Key (JWT)

1. Log in to Pinata
2. Go to [API Keys](https://app.pinata.cloud/developers/api-keys)
3. Click **"New Key"** button
4. **Configure permissions** - Choose one of these options:

   **Option A: Admin Permissions (Recommended for development)**
   - ✅ Enable **Admin** permissions
   - This gives full access to all Pinata features
   - Easiest for testing and development

   **Option B: Specific Permissions (More secure)**
   - ✅ Enable `pinFileToIPFS`
   - ✅ Enable `pinJSONToIPFS`
   - ✅ Enable `pinList` (optional, for listing files)
   - Leave others disabled for security

5. Give it a name like `DeraLinks Development`
6. Click **"Create Key"**
7. **IMPORTANT**: Copy the **JWT** token immediately!
   - It looks like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - You won't be able to see it again!

## Step 3: Add JWT to Your .env File

Add the JWT token to your `.env` file:

```bash
PINATA_JWT=your_jwt_token_here
```

Replace `your_jwt_token_here` with the actual JWT you copied.

## Step 4: Test the Connection

Run the IPFS test script to verify everything is working:

```bash
npm run test:ipfs
```

You should see:
```
✅ Pinata connection successful!
✅ IPFS/Pinata Integration Working!
```

If you see errors, check:
- Your PINATA_JWT is correctly set in .env
- The JWT is valid (not expired)
- You have internet connection

## What's Next?

Once Pinata is set up, you can:

1. **Upload Property Images**: Add real property photos to IPFS
2. **Generate NFT Metadata**: Create proper NFT metadata JSON files
3. **Re-mint NFTs**: Update NFTs with real IPFS CIDs instead of placeholders

## IPFS URLs

After uploading, you'll get a CID (Content Identifier) like:
```
QmXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

You can access files via:
- **IPFS Protocol**: `ipfs://QmXxxx...`
- **HTTP Gateway**: `https://gateway.pinata.cloud/ipfs/QmXxxx...`

NFT wallets support both formats!

## Free Tier Limits

Pinata's free tier includes:
- **1 GB** total storage
- **100 GB** bandwidth per month
- Unlimited pins

For 30 NFTs with images, you'll use:
- ~30 MB for images (1MB each)
- ~30 KB for metadata JSON files
- Well within the free tier!

## Troubleshooting

**Error: PINATA_JWT not found**
- Make sure you added it to your `.env` file
- Check there are no extra spaces
- Restart your terminal after adding it

**Error: Authentication failed**
- JWT might be expired (regenerate in Pinata dashboard)
- Make sure you copied the full JWT (very long string)

**Upload errors**
- Check your internet connection
- Verify your Pinata account is active
- Check free tier limits haven't been exceeded

## Resources

- [Pinata Documentation](https://docs.pinata.cloud/)
- [IPFS Documentation](https://docs.ipfs.tech/)
- [NFT Metadata Standards](https://docs.opensea.io/docs/metadata-standards)
