import axios from 'axios';

export const DEFAULT_IMAGE =
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
    timeout: 1500000,
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

    const normalizeString = input => {
        if (!input) return DEFAULT_IMAGE;
        const trimmed = input.trim();
        if (!trimmed) return DEFAULT_IMAGE;

        const parsed = tryParseJson(trimmed);
        if (Array.isArray(parsed) || (parsed && typeof parsed === 'object')) {
            const nested = normalizeImage(parsed);
            if (nested && nested !== DEFAULT_IMAGE) return nested;
        }

        if (trimmed.startsWith('data:image')) return trimmed;
        if (trimmed.startsWith('http')) return trimmed;

        const candidate = trimmed.replace(/^ipfs:\/\//, '').replace(/^ipfs\//, '');
        if (!candidate) return DEFAULT_IMAGE;
        if (candidate.startsWith('http')) return candidate;
        return `https://gateway.pinata.cloud/ipfs/${candidate}`;
    };

    if (Array.isArray(value)) {
        for (const item of value) {
            const normalized = normalizeImage(item);
            if (normalized && normalized !== DEFAULT_IMAGE) {
                return normalized;
            }
        }
        return DEFAULT_IMAGE;
    }

    if (typeof value === 'object') {
        const candidateKeys = [
            'url',
            'href',
            'src',
            'image',
            'preview',
            'original',
            'path',
            'link',
            'thumbnail',
        ];

        for (const key of candidateKeys) {
            if (value[key]) {
                const normalized = normalizeImage(value[key]);
                if (normalized && normalized !== DEFAULT_IMAGE) {
                    return normalized;
                }
            }
        }

        const cidKeys = ['cid', 'CID', 'hash', 'ipfsHash', 'ipfs', 'contentId'];
        for (const key of cidKeys) {
            if (value[key]) {
                const normalized = normalizeImage(String(value[key]));
                if (normalized && normalized !== DEFAULT_IMAGE) {
                    return normalized;
                }
            }
        }

        return DEFAULT_IMAGE;
    }

    if (typeof value === 'string') {
        return normalizeString(value);
    }

    return DEFAULT_IMAGE;
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
        ownerSerialNumbers: ensureArray(holding?.ownerSerialNumbers)
            .map(Number)
            .filter(Number.isFinite),
    };
};

const mapProperty = property => {
    if (!property) return null;

    const tokenId = property?.tokenId || property?.token_id;
    if (!tokenId) return null;

    const owner = property?.ownerHederaAccount || property?.owner_hedera_account;
    const totalSupplyRaw = property?.total_supply ?? property?.totalSupply;
    const totalSupply = Number.isFinite(Number(totalSupplyRaw))
        ? Number(totalSupplyRaw)
        : undefined;
    const availableSupplyRaw =
        property?.available_supply ?? property?.availableSupply;
    const availableSupply = Number.isFinite(Number(availableSupplyRaw))
        ? Number(availableSupplyRaw)
        : undefined;

    const images = ensureArray(property?.images);
    const documents = ensureArray(property?.documents);
    const features = ensureObject(property?.features);
    const amenities = ensureArray(property?.amenities);

    const tokenPrice = cleanNumeric(
        property?.token_price ?? property?.tokenPrice
    );
    const valuation = cleanNumeric(
        property?.total_value ?? property?.totalValue
    );

    const rawOwnerSerials = ensureArray(property?.all_serial_numbers);
    const ownerSerialNumbers = rawOwnerSerials
        .map(value => Number(value))
        .filter(Number.isFinite);
    const ownerCount = Number(
        property?.total_nfts_held ?? property?.owner_nft_count
    );

    return {
        id: property?.id || tokenId,
        tokenId,
        serialNumbers: [],
        quantity:
            availableSupply !== undefined
                ? availableSupply
                : totalSupply !== undefined
                    ? totalSupply
                    : undefined,
        name:
            property?.property_name ||
            property?.collection_name ||
            tokenId,
        description: property?.description,
        image: normalizeImage(images.length ? images : undefined),
        metadata: {
            assetType:
                property?.property_type || property?.propertyType,
            location: [property?.city, property?.country]
                .filter(Boolean)
                .join(', '),
            expectedAnnualReturn: toPercent(
                property?.expected_annual_return ??
                property?.expectedAnnualReturn
            ),
            rentalYield: toPercent(
                property?.rental_yield ?? property?.rentalYield
            ),
            fractions: totalSupply,
            collection: property?.collection_name,
        },
        attributes: {
            valuation: formatDisplayValue(
                valuation ?? property?.total_value ?? property?.totalValue
            ),
            tokenPrice: formatDisplayValue(tokenPrice),
            quantity:
                availableSupply !== undefined
                    ? availableSupply
                    : totalSupply,
        },
        property: {
            ...property,
            images,
            documents,
            features,
            amenities,
        },
        price: tokenPrice,
        priceCurrency: 'USD',
        owner,
        ownerHederaAccount: owner,
        status: property?.status,
        createdAt: property?.created_at ?? property?.createdAt,
        updatedAt: property?.updated_at ?? property?.updatedAt,
        isListed: false,
        isCreatorAsset: true,
        ownerSerialNumbers,
        ownerSerialCount: Number.isFinite(ownerCount)
            ? ownerCount
            : ownerSerialNumbers.length,
        all_serial_numbers: rawOwnerSerials,
        total_nfts_held: Number.isFinite(ownerCount)
            ? ownerCount
            : ownerSerialNumbers.length,
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

    // Extract error message from various possible structures
    const errorData = error?.response?.data;
    let message = 'An unexpected error occurred';
    let code = null;

    if (errorData) {
        // Handle structured error response: { success: false, error: { code, message } }
        if (errorData.error) {
            if (typeof errorData.error === 'object') {
                message = errorData.error.message || errorData.error.code || message;
                code = errorData.error.code;
            } else {
                message = errorData.error;
            }
        }
        // Handle direct message field
        else if (errorData.message) {
            message = errorData.message;
        }
    }
    // Fallback to axios error message
    else if (error?.message) {
        message = error.message;
    }

    return {
        success: false,
        error: {
            message,
            code,
        }
    };
};

export const mintNFT = async payload => {
    try {
        const requestBody = payload?.ownerHederaAccount
            ? payload
            : buildMintPayload(payload);
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

export const getProperties = async (filters = {}) => {
    try {
        const { data } = await api.get('/properties', {
            params: filters,
        });

        const payload = data?.data || {};
        const rawProperties = Array.isArray(payload?.properties)
            ? payload.properties
            : [];

        const properties = rawProperties
            .map(property => {
                const mapped = mapProperty(property);

                if (!mapped) {
                    return null;
                }

                const allSerials = Array.isArray(property?.all_serial_numbers)
                    ? property.all_serial_numbers
                        .map(value => Number(value))
                        .filter(Number.isFinite)
                    : [];

                const ownerCount = Number(property?.total_nfts_held);

                return {
                    ...mapped,
                    serialNumbers: allSerials,
                    ownerSerialNumbers: allSerials,
                    ownerSerialCount: Number.isFinite(ownerCount)
                        ? ownerCount
                        : allSerials.length,
                };
            })
            .filter(Boolean);

        const filteredProperties = properties;

        return {
            success: true,
            data: filteredProperties,
            meta: {
                total: payload?.count ?? filteredProperties.length,
                returned: filteredProperties.length,
            },
        };
    } catch (error) {
        return handleApiError(error);
    }
};

const normalizeUploadedFile = (entry, fallbackName) => {
    if (!entry) return null;

    const cid =
        entry.cid ||
        entry.CID ||
        entry.hash ||
        entry.ipfsHash ||
        entry.ipfs ||
        entry.contentId;

    const directUrl =
        entry.gatewayUrl ||
        entry.ipfsUrl ||
        entry.url ||
        entry.href ||
        entry.src ||
        entry.path;
    const url = directUrl || (cid ? `https://gateway.pinata.cloud/ipfs/${cid}` : undefined);

    const name = entry.fileName || entry.name || fallbackName || null;
    const size = entry.fileSize || entry.size || null;
    const type = entry.mimeType || entry.type || null;

    return {
        cid: cid || null,
        url: url || null,
        name,
        size,
        type,
        gatewayUrl: entry.gatewayUrl || null,
        ipfsUrl: entry.ipfsUrl || null,
    };
};

export const uploadFileToIPFS = async file => {
    if (!file) {
        return {
            success: false,
            error: 'No file provided for upload',
        };
    }

    try {
        const formData = new FormData();
        formData.append('file', file);

        const { data } = await api.post('/files/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        const rawEntry = data?.data || data;
        const normalized = normalizeUploadedFile(rawEntry, file.name);

        return {
            success: data?.success ?? true,
            data: normalized,
            message: data?.message,
        };
    } catch (error) {
        return handleApiError(error);
    }
};

export const uploadMultipleFilesToIPFS = async files => {
    const fileArray = Array.from(files || []).filter(Boolean);

    if (!fileArray.length) {
        return {
            success: false,
            error: 'No files provided for upload',
        };
    }

    try {
        const formData = new FormData();
        fileArray.forEach(file => formData.append('files', file));

        const { data } = await api.post('/files/upload-multiple', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        const rawFiles = data?.data?.files || data?.data || [];
        const normalizedFiles = Array.isArray(rawFiles)
            ? rawFiles.map((entry, index) => normalizeUploadedFile(entry, fileArray[index]?.name))
            : [];

        return {
            success: data?.success ?? true,
            data: {
                files: normalizedFiles,
                count:
                    data?.data?.count ??
                    data?.data?.totalFiles ??
                    normalizedFiles.length,
            },
            message: data?.message,
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

    const isContractPayload = !!payload?.ownerHederaAccount;

    if (!isContractPayload) {
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
    }

    const images = ensureArray(payload.images);
    const features = ensureObject(payload.features);
    const amenities = ensureArray(payload.amenities);
    const valuation = cleanNumeric(payload.totalValue);
    const tokenPrice = cleanNumeric(payload.tokenPrice);
    const locationLabel = [payload.city, payload.country].filter(Boolean).join(', ');

    return {
        id: result?.propertyId || payload?.collectionName,
        tokenId: result?.tokenId,
        serialNumbers: [],
        quantity: Number(payload.totalSupply) || 0,
        name: payload.propertyName,
        description: payload.description,
        image: normalizeImage(images.length ? images : undefined),
        metadata: {
            assetType: payload.propertyType,
            location: locationLabel,
            fractions: Number(payload.totalSupply) || 0,
            expectedAnnualReturn: toPercent(payload.expectedAnnualReturn),
            rentalYield: toPercent(payload.rentalYield),
        },
        attributes: {
            valuation: formatDisplayValue(valuation),
            tokenPrice: formatDisplayValue(tokenPrice),
            quantity: Number(payload.totalSupply) || 0,
        },
        price: tokenPrice,
        priceCurrency: 'USD',
        property: {
            totalValue: valuation,
            totalSupply: Number(payload.totalSupply) || 0,
            amenities,
            features,
            images,
            city: payload.city,
            country: payload.country,
            description: payload.description,
        },
        isListed: false,
        status: payload.status || 'draft',
    };
};

export const apiClient = api;
export const API_BASE = API_BASE_URL;

