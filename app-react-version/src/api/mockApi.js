import axios from 'axios';

const DEFAULT_IMAGE =
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80';

const API_BASE_URL = (() => {
    const base = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3600/api/v1';
    return base.endsWith('/') ? base.slice(0, -1) : base;
})();

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000,
});

const tryParseJson = value => {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return value;
    try {
        return JSON.parse(trimmed);
    } catch (error) {
        console.warn('Failed to parse JSON value:', value, error);
        return value;
    }
};

const ensureArray = value => {
    if (!value) return [];
    const parsed = tryParseJson(value);
    if (Array.isArray(parsed)) return parsed.filter(Boolean);
    if (typeof parsed === 'string') return [parsed];
    return [parsed];
};

const ensureObject = value => {
    if (!value) return {};
    const parsed = tryParseJson(value);
    return parsed && typeof parsed === 'object' ? parsed : {};
};

const cleanNumeric = value => {
    if (value === undefined || value === null) return undefined;
    if (typeof value === 'number') return value;
    const sanitized = String(value).replace(/[^0-9.-]/g, '');
    return sanitized ? Number(sanitized) : undefined;
};

const normalizeImage = value => {
    if (!value) return DEFAULT_IMAGE;
    if (Array.isArray(value)) {
        const first = value.find(Boolean);
        return normalizeImage(first);
    }
    if (typeof value !== 'string') return DEFAULT_IMAGE;
    const parsed = tryParseJson(value);
    if (Array.isArray(parsed)) {
        return normalizeImage(parsed);
    }
    if (typeof parsed === 'string' && parsed.startsWith('http')) return parsed;
    const candidate = typeof parsed === 'string' ? parsed : value;
    if (candidate.startsWith('http')) return candidate;
    const trimmed = candidate.replace(/^ipfs:\/\//, '').replace(/^ipfs\//, '');
    return trimmed ? `https://gateway.pinata.cloud/ipfs/${trimmed}` : DEFAULT_IMAGE;
};

const formatDisplayValue = value => {
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value === 'number') {
        return value.toLocaleString();
    }
    const numeric = cleanNumeric(value);
    if (numeric !== undefined) return numeric.toLocaleString();
    return value;
};

const toPercent = value => {
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value === 'number') return `${value}%`;
    const numeric = cleanNumeric(value);
    return numeric !== undefined ? `${numeric}%` : value;
};

const mapAssetType = assetType => {
    if (!assetType) return 'real_estate';
    const normalized = assetType.toString().toLowerCase().replace(/[\s-]+/g, '_');
    switch (normalized) {
        case 'real_estate':
        case 'realestate':
            return 'real_estate';
        case 'commodities':
        case 'commodity':
            return 'commodities';
        case 'fine_art':
        case 'fineart':
            return 'fine_art';
        case 'vehicle':
        case 'vehicles':
        case 'luxury_vehicles':
            return 'vehicle';
        case 'equipment':
            return 'equipment';
        case 'natural_resources':
        case 'naturalresources':
            return 'natural_resources';
        case 'infrastructure':
            return 'infrastructure';
        case 'energy':
        case 'energy_assets':
            return 'energy';
        default:
            return normalized;
    }
};

const mapAssetCategory = assetType => {
    const normalized = mapAssetType(assetType);
    if (normalized === 'vehicle') return 'luxury';
    if (normalized === 'commodities') return 'commodities';
    if (normalized === 'energy') return 'energy';
    return 'residential';
};

const parseLocation = value => {
    if (!value) {
        return {
            address: '',
            city: '',
            state: '',
            country: '',
            zip: '',
        };
    }

    const parsed = tryParseJson(value);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return {
            address: parsed.address || '',
            city: parsed.city || '',
            state: parsed.state || '',
            country: parsed.country || '',
            zip: parsed.zipCode || parsed.postalCode || '',
        };
    }

    if (typeof value === 'object') {
        return {
            address: value.address || '',
            city: value.city || '',
            state: value.state || '',
            country: value.country || '',
            zip: value.zipCode || value.postalCode || '',
        };
    }

    const parts = String(value)
        .split(',')
        .map(part => part.trim())
        .filter(Boolean);
    const address = String(value);
    const city = parts[0] || '';
    const country = parts.length > 1 ? parts[parts.length - 1] : '';
    const state = parts.length > 2 ? parts.slice(1, -1).join(', ') : '';
    return { address, city, state, country, zip: '' };
};

const deriveSymbol = name => {
    if (!name) return 'DERA';
    const letters = name
        .toUpperCase()
        .replace(/[^A-Z]/g, '')
        .slice(0, 4);
    return letters.padEnd(3, 'X');
};

const buildMintPayload = payload => {
    const location = parseLocation(
        payload?.metadata?.location || payload?.metadata?.address || ''
    );
    const totalSupply = Number(payload?.metadata?.fractions) || 1000;
    const totalValue =
        cleanNumeric(payload?.attributes?.valuation) ||
        cleanNumeric(payload?.metadata?.totalValue) ||
        0;
    const tokenPrice =
        cleanNumeric(payload?.metadata?.tokenPrice) ||
        (totalSupply && totalValue
            ? Number((totalValue / totalSupply).toFixed(2))
            : undefined) ||
        0;

    const images = ensureArray(payload?.image).concat(
        ensureArray(payload?.metadata?.images)
    );

    const baseFeatures = ensureObject(payload?.metadata?.features);
    const mergedFeatures = {
        ...baseFeatures,
        fractions: baseFeatures?.fractions ?? totalSupply,
        appraisalDate: baseFeatures?.appraisalDate ?? payload?.metadata?.appraisalDate,
        custodian: baseFeatures?.custodian ?? payload?.metadata?.custodian,
    };

    return {
        ownerHederaAccount: payload?.metadata?.creator,
        propertyName: payload?.name,
        collectionName:
            payload?.metadata?.collection || `${payload?.name || 'Dera Property'} Collection`,
        collectionSymbol: deriveSymbol(payload?.name),
        propertyType: mapAssetType(payload?.metadata?.assetType),
        category: mapAssetCategory(payload?.metadata?.assetType),
        address: location.address,
        city: location.city,
        state: location.state,
        country: location.country || 'Nigeria',
        zipCode: location.zip,
        latitude: payload?.metadata?.latitude,
        longitude: payload?.metadata?.longitude,
        totalValue,
        tokenPrice,
        totalSupply,
        expectedAnnualReturn: cleanNumeric(payload?.metadata?.expectedAnnualReturn) || 10,
        rentalYield: cleanNumeric(payload?.metadata?.rentalYield) || 6,
        distributionFrequency: payload?.metadata?.distributionFrequency || 'monthly',
        description: payload?.description,
        features: mergedFeatures,
        amenities: ensureArray(payload?.metadata?.amenities),
        images,
        documents: ensureArray(payload?.documents),
        royaltyPercentage: Number(payload?.royaltyFee ?? 5),
    };
};

const mapHolding = holding => {
    const property = holding?.property || {};
    const images = ensureArray(holding?.images).concat(ensureArray(property?.images));
    const image = normalizeImage(images.length ? images : undefined);
    const features = ensureObject(holding?.features || property?.features);
    const amenities = ensureArray(holding?.amenities || property?.amenities);

    return {
        id: holding?.propertyId || holding?.tokenId,
        tokenId: holding?.tokenId,
        serialNumbers: holding?.serialNumbers || [],
        quantity:
            holding?.quantity ||
            (holding?.serialNumbers ? holding.serialNumbers.length : 0),
        name: holding?.propertyName || property?.property_name,
        description: holding?.description || property?.description,
        image,
        metadata: {
            assetType: holding?.propertyType || property?.property_type,
            location: [holding?.city || property?.city, holding?.country || property?.country]
                .filter(Boolean)
                .join(', '),
            fractions: holding?.totalSupply || property?.total_supply,
            expectedAnnualReturn: toPercent(
                holding?.expectedAnnualReturn || property?.expected_annual_return
            ),
            rentalYield: toPercent(holding?.rentalYield || property?.rental_yield),
            appraisalDate: features?.appraisalDate,
            custodian: features?.custodian,
        },
        attributes: {
            valuation: formatDisplayValue(holding?.totalValue || property?.total_value),
            tokenPrice: formatDisplayValue(holding?.tokenPrice || property?.token_price),
            ownership: toPercent(holding?.ownershipPercentage),
            dividends: formatDisplayValue(holding?.dividendsReceived),
            invested: formatDisplayValue(holding?.invested),
            quantity: holding?.quantity,
        },
        property: {
            ...property,
            features,
            amenities,
            images,
        },
        isListed: false,
        price: holding?.tokenPrice || property?.token_price,
        priceCurrency: 'USD',
    };
};

const mapListing = listing => {
    const property = listing?.property || {};
    const images = ensureArray(property?.images || listing?.images);
    const features = ensureObject(property?.features);
    const amenities = ensureArray(property?.amenities);
    const image = normalizeImage(images.length ? images : undefined);

    return {
        listingId: listing?.listingId || listing?.id,
        tokenId: listing?.tokenId,
        serialNumbers: listing?.serialNumbers || [],
        quantity:
            listing?.quantity ||
            (listing?.serialNumbers ? listing.serialNumbers.length : 0),
        name: property?.propertyName || listing?.title,
        description: listing?.description || property?.description,
        image,
        price: listing?.pricePerNFT ?? listing?.price ?? 0,
        priceCurrency: listing?.currency || 'USD',
        totalPrice: listing?.totalPrice,
        seller: listing?.seller?.hederaAccount || listing?.sellerHederaAccount,
        metadata: {
            assetType: property?.propertyType,
            location: [property?.city, property?.country].filter(Boolean).join(', '),
            fractions: property?.totalSupply,
            expectedAnnualReturn: toPercent(property?.expectedAnnualReturn),
            rentalYield: toPercent(property?.rentalYield),
        },
        attributes: {
            valuation: formatDisplayValue(property?.totalValue),
            tokenPrice: formatDisplayValue(listing?.pricePerNFT),
            quantity: listing?.quantity,
        },
        property: {
            ...property,
            features,
            amenities,
            images,
        },
        status: listing?.status,
        createdAt: listing?.createdAt,
        expiresAt: listing?.expiresAt,
        isListed: true,
    };
};

const handleApiError = error => {
    console.error('DeraLinks API error:', error);
    const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'An unexpected error occurred';
    return { success: false, error: message };
};

export const mintNFT = async payload => {
    try {
        const requestBody = buildMintPayload(payload);
        const { data } = await api.post('/properties/mint', requestBody);
        return {
            success: data?.success ?? true,
            data: data?.data,
            message: data?.message,
        };
    } catch (error) {
        return handleApiError(error);
    }
};

export const getAssetsByWallet = async accountId => {
    if (!accountId) {
        return { success: false, error: 'Wallet account ID is required' };
    }

    try {
        const { data } = await api.get(`/users/${accountId}/assets`);
        const payload = data?.data || {};
        const holdings = Array.isArray(payload?.holdings)
            ? payload.holdings.map(mapHolding)
            : [];
        const summary = {
            accountId: payload?.accountId,
            totalProperties: payload?.totalProperties,
            totalNFTs: payload?.totalNFTs,
            totalInvested: payload?.totalInvested,
            totalValue: payload?.currentValue ?? payload?.totalValue,
            totalDividends: payload?.totalDividends,
            roi: payload?.roi,
        };

        return {
            success: true,
            data: {
                summary,
                holdings,
            },
        };
    } catch (error) {
        return handleApiError(error);
    }
};

export const listAsset = async payload => {
    try {
        const requestBody = {
            sellerHederaAccount: payload?.sellerHederaAccount,
            tokenId: payload?.tokenId,
            serialNumbers: payload?.serialNumbers,
            quantity: payload?.quantity,
            pricePerNFT: payload?.pricePerNFT,
            currency: payload?.currency || 'USD',
            title: payload?.title,
            description: payload?.description,
            minPurchase: payload?.minPurchase,
            maxPurchase: payload?.maxPurchase,
            expiresInDays: payload?.expiresInDays,
        };

        const { data } = await api.post('/marketplace/list', requestBody);
        const listing = mapListing(data?.data);
        return {
            success: data?.success ?? true,
            data: listing,
            message: data?.message,
        };
    } catch (error) {
        return handleApiError(error);
    }
};

export const getAllListedAssets = async (filters = {}) => {
    try {
        const { data } = await api.get('/marketplace/listings', {
            params: filters,
        });

        const payload = data?.data || {};
        const listings = Array.isArray(payload?.listings)
            ? payload.listings.map(mapListing)
            : [];
        const pagination = payload?.pagination || {};

        return {
            success: true,
            data: listings,
            meta: {
                total: pagination?.total,
                limit: pagination?.limit,
                offset: pagination?.offset,
                hasMore: pagination?.hasMore,
            },
        };
    } catch (error) {
        return handleApiError(error);
    }
};

export const buyAsset = async ({
    listingId,
    buyerHederaAccount,
    quantity = 1,
    paymentMethod = 'HBAR',
}) => {
    try {
        const requestBody = {
            listingId,
            buyerHederaAccount,
            quantity,
            paymentMethod,
        };

        const { data } = await api.post('/marketplace/buy', requestBody);
        return {
            success: data?.success ?? true,
            data: data?.data,
            message: data?.message,
        };
    } catch (error) {
        return handleApiError(error);
    }
};

export const buildHoldingFromMint = (payload, result = {}) => {
    if (!payload) return null;

    const location = parseLocation(payload?.metadata?.location);
    const amenities = ensureArray(payload?.metadata?.amenities);
    const features = ensureObject(payload?.metadata?.features);
    const valuation = cleanNumeric(payload?.attributes?.valuation);
    const tokenPrice = cleanNumeric(payload?.metadata?.tokenPrice);
    const fractions = Number(payload?.metadata?.fractions) || 0;
    const images = ensureArray(payload?.metadata?.images).concat(ensureArray(payload?.image));

    return {
        id: result?.propertyId || payload?.metadata?.collection,
        tokenId: result?.tokenId,
        serialNumbers: [],
        quantity: fractions,
        name: payload?.name,
        description: payload?.description,
        image: normalizeImage(images.length ? images : undefined),
        metadata: {
            assetType: mapAssetType(payload?.metadata?.assetType),
            location: [location.city, location.country].filter(Boolean).join(', '),
            fractions,
            expectedAnnualReturn: toPercent(payload?.metadata?.expectedAnnualReturn),
            rentalYield: toPercent(payload?.metadata?.rentalYield),
            appraisalDate: payload?.metadata?.appraisalDate,
            custodian: payload?.metadata?.custodian,
        },
        attributes: {
            valuation: formatDisplayValue(valuation),
            tokenPrice: formatDisplayValue(tokenPrice),
            quantity: fractions,
        },
        price: tokenPrice,
        priceCurrency: 'USD',
        property: {
            totalValue: valuation,
            totalSupply: fractions,
            amenities,
            features,
            images,
            city: location.city,
            country: location.country,
            description: payload?.description,
        },
        isListed: false,
        status: 'draft',
    };
};

export const apiClient = api;
export const API_BASE = API_BASE_URL;

