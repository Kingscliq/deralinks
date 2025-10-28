// Mock API endpoints for NFT Marketplace on Hedera
// In production, replace these with actual backend calls

// ======================
// SCHEMAS
// ======================

/**
 * Minting Payload Schema
 * @typedef {Object} MintPayload
 * @property {string} name - NFT name
 * @property {string} description - NFT description
 * @property {string} image - Image URL or IPFS hash
 * @property {Object} metadata - Additional metadata
 * @property {string} metadata.creator - Creator wallet address
 * @property {string} metadata.collection - Collection name (optional)
 * @property {Object} attributes - NFT attributes (optional)
 * @property {number} royaltyFee - Royalty fee percentage (0-100)
 */

/**
 * Asset Schema
 * @typedef {Object} Asset
 * @property {string} tokenId - Hedera token ID
 * @property {string} serialNumber - NFT serial number
 * @property {string} name - NFT name
 * @property {string} description - NFT description
 * @property {string} image - Image URL
 * @property {string} owner - Owner wallet address
 * @property {Object} metadata - Additional metadata
 * @property {Object} attributes - NFT attributes
 * @property {boolean} isListed - Whether asset is listed for sale
 * @property {string} price - Price in HBAR (if listed)
 * @property {string} createdAt - Creation timestamp
 */

/**
 * Listing Payload Schema
 * @typedef {Object} ListingPayload
 * @property {string} tokenId - Hedera token ID
 * @property {string} serialNumber - NFT serial number
 * @property {string} price - Price in HBAR
 * @property {string} seller - Seller wallet address
 */

/**
 * Listed Asset Schema
 * @typedef {Object} ListedAsset
 * @property {string} listingId - Unique listing ID
 * @property {string} tokenId - Hedera token ID
 * @property {string} serialNumber - NFT serial number
 * @property {string} name - NFT name
 * @property {string} description - NFT description
 * @property {string} image - Image URL
 * @property {string} price - Price in HBAR
 * @property {string} seller - Seller wallet address
 * @property {string} listedAt - Listing timestamp
 * @property {Object} metadata - Additional metadata
 * @property {Object} attributes - NFT attributes
 */

// ======================
// MOCK DATA
// ======================

let mockAssets = [
    {
        tokenId: '0.0.123456',
        serialNumber: '1',
        name: 'Hedera Wolf #1',
        description: 'A rare Hedera Wolf NFT',
        image: 'https://images.unsplash.com/photo-1520975682039-e61527f1e0a2?q=80&w=800&auto=format&fit=crop',
        owner: '0.0.1001',
        metadata: { creator: '0.0.1001', collection: 'Hedera Wolves' },
        attributes: { rarity: 'Rare', power: 85 },
        isListed: false,
        price: null,
        createdAt: new Date().toISOString(),
    },
    {
        tokenId: '0.0.123457',
        serialNumber: '1',
        name: 'Hedera Dragon #1',
        description: 'An epic Hedera Dragon NFT',
        image: 'https://images.unsplash.com/photo-1517816743773-6e0fd518b4a6?q=80&w=800&auto=format&fit=crop',
        owner: '0.0.1001',
        metadata: { creator: '0.0.1001', collection: 'Hedera Dragons' },
        attributes: { rarity: 'Epic', power: 95 },
        isListed: true,
        price: '100',
        createdAt: new Date().toISOString(),
    },
];

let mockListings = [
    {
        listingId: 'listing-1',
        tokenId: '0.0.123457',
        serialNumber: '1',
        name: 'Hedera Dragon #1',
        description: 'An epic Hedera Dragon NFT',
        image: 'https://picsum.photos/200',
        price: '100',
        seller: '0.0.1001',
        listedAt: new Date().toISOString(),
        metadata: { creator: '0.0.1001', collection: 'Hedera Dragons' },
        attributes: { rarity: 'Epic', power: 95 },
    },
];

// ======================
// API FUNCTIONS
// ======================

export const mintNFT = async payload => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newAsset = {
        tokenId: `0.0.${Math.floor(Math.random() * 999999)}`,
        serialNumber: '1',
        name: payload.name,
        description: payload.description,
        image: payload.image,
        owner: payload.metadata.creator,
        metadata: payload.metadata,
        attributes: payload.attributes || {},
        isListed: false,
        price: null,
        createdAt: new Date().toISOString(),
    };

    mockAssets.push(newAsset);
    return { success: true, data: newAsset };
};

export const getAssetsByWallet = async walletAddress => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const assets = mockAssets.filter(asset => asset.owner === walletAddress);
    return { success: true, data: assets };
};

export const listAsset = async payload => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const asset = mockAssets.find(
        a => a.tokenId === payload.tokenId && a.serialNumber === payload.serialNumber
    );

    if (!asset) {
        return { success: false, error: 'Asset not found' };
    }

    asset.isListed = true;
    asset.price = payload.price;

    const listing = {
        listingId: `listing-${Date.now()}`,
        tokenId: payload.tokenId,
        serialNumber: payload.serialNumber,
        name: asset.name,
        description: asset.description,
        image: asset.image,
        price: payload.price,
        seller: payload.seller,
        listedAt: new Date().toISOString(),
        metadata: asset.metadata,
        attributes: asset.attributes,
    };

    mockListings.push(listing);
    return { success: true, data: listing };
};

export const getAllListedAssets = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, data: mockListings };
};

export const buyAsset = async (listingId, buyer) => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const listingIndex = mockListings.findIndex(l => l.listingId === listingId);
    if (listingIndex === -1) {
        return { success: false, error: 'Listing not found' };
    }

    const listing = mockListings[listingIndex];

    const asset = mockAssets.find(
        a => a.tokenId === listing.tokenId && a.serialNumber === listing.serialNumber
    );

    if (asset) {
        asset.owner = buyer;
        asset.isListed = false;
        asset.price = null;
    }

    mockListings.splice(listingIndex, 1);

    return { success: true, data: { message: 'Asset purchased successfully' } };
};

