import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { getAssetsByWallet, getProperties, listAsset } from '../api/mockApi';

import ListingModal from './ListingModal';
import PropertiesPage from './PropertiesPage';
import { useNotification } from '../context/NotificationContext.jsx';

const parseAmount = value => {
  if (value === undefined || value === null || value === '') return 0;
  const numeric = Number(String(value).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(numeric) ? numeric : 0;
};

const buildFallbackSummary = holdings => {
  if (!holdings || holdings.length === 0) return null;
  const totalProperties = holdings.length;
  const totalNFTs = holdings.reduce(
    (acc, item) => acc + (Number(item.quantity) || 0),
    0
  );
  const totalValue = holdings.reduce(
    (acc, item) => acc + parseAmount(item.attributes?.valuation),
    0
  );
  return {
    totalProperties,
    totalNFTs,
    totalValue: totalValue ? totalValue.toLocaleString() : '0',
    totalDividends: '—',
  };
};

const mergeHoldings = (...holdingsLists) => {
  const map = new Map();

  holdingsLists.forEach(list => {
    (list || []).forEach(item => {
      if (!item?.tokenId) return;

      const existing = map.get(item.tokenId) || {};
      const nextSerials = Array.isArray(item.serialNumbers)
        ? item.serialNumbers
        : existing.serialNumbers || [];

      const mergedMetadata = {
        ...(existing.metadata || {}),
        ...(item.metadata || {}),
      };

      const mergedAttributes = {
        ...(existing.attributes || {}),
        ...(item.attributes || {}),
      };

      const mergedProperty = {
        ...(existing.property || {}),
        ...(item.property || {}),
      };

      map.set(item.tokenId, {
        ...existing,
        ...item,
        metadata: mergedMetadata,
        attributes: mergedAttributes,
        property: mergedProperty,
        serialNumbers: nextSerials,
        quantity:
          item.quantity !== undefined && item.quantity !== null
            ? item.quantity
            : existing.quantity,
      });
    });
  });

  return Array.from(map.values());
};

const formatMetricValue = value => {
  if (value === undefined || value === null) return '—';
  if (typeof value === 'number') return value.toLocaleString();
  return value;
};

const MyAssets = ({ accountId, localHoldings = [] }) => {
  const [assets, setAssets] = useState([]);
  const [summary, setSummary] = useState(null);
  const [creatorAssets, setCreatorAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listingAsset, setListingAsset] = useState(null);
  const { showNotification } = useNotification();

  const loadAssets = useCallback(async () => {
    if (!accountId) {
      setAssets([]);
      setCreatorAssets([]);
      setSummary(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const [holdingsResponse, propertiesResponse] = await Promise.all([
        getAssetsByWallet(accountId),
        getProperties({
          status: 'active',
          limit: 100,
          ownerAccountId: accountId,
        }),
      ]);

      const normalizedHoldings = holdingsResponse.success
        ? (holdingsResponse.data?.holdings || []).map(holding => ({
            ...holding,
            serialNumbers: Array.isArray(holding?.serialNumbers)
              ? holding.serialNumbers
              : [],
          }))
        : [];

      if (holdingsResponse.success) {
        setAssets(normalizedHoldings);
        setSummary(holdingsResponse.data?.summary || null);
      } else {
        setAssets([]);
        setSummary(null);
        showNotification({
          type: 'error',
          title: 'Unable to load assets',
          message: holdingsResponse.error || 'Failed to fetch your assets.',
        });
      }

      const transformedProperties = propertiesResponse.success
        ? (propertiesResponse.data || []).map(asset => ({
            ...asset,
            serialNumbers: Array.isArray(asset?.serialNumbers)
              ? asset.serialNumbers
              : Array.isArray(asset?.all_serial_numbers)
              ? asset.all_serial_numbers
              : [],
          }))
        : [];

      setCreatorAssets(transformedProperties);

      if (!propertiesResponse.success && propertiesResponse.error) {
        console.warn(
          'Unable to load minted properties:',
          propertiesResponse.error
        );
      }
    } catch (error) {
      console.error('Error loading assets', error);
      setAssets([]);
      setCreatorAssets([]);
      setSummary(null);
      showNotification({
        type: 'error',
        title: 'Unable to load assets',
        message: 'An unexpected error occurred while fetching your assets.',
      });
    }

    setLoading(false);
  }, [accountId, showNotification]);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  const handleList = asset => {
    if (!asset?.serialNumbers || asset.serialNumbers.length === 0) {
      showNotification({
        type: 'error',
        title: 'Listing unavailable',
        message: 'No NFT serial numbers available for this asset.',
      });
      return;
    }
    setListingAsset(asset);
  };

  const handleListingSubmit = async formData => {
    const { pricePerNFT, quantity, expiresInDays } = formData;
    const serialNumbers = listingAsset.serialNumbers.slice(0, quantity);

    const payload = {
      sellerHederaAccount: accountId,
      tokenId: listingAsset.tokenId,
      serialNumbers,
      quantity,
      pricePerNFT,
      currency: 'USD',
      title: `${listingAsset.name || 'Asset'} NFTs`,
      description:
        listingAsset.description ||
        `Listing ${quantity} NFTs from ${
          listingAsset.name || listingAsset.tokenId
        }`,
      expiresInDays,
    };

    try {
      const response = await listAsset(payload);
      if (response.success) {
        showNotification({
          type: 'success',
          title: 'Listing created',
          message: response.message || 'Asset listed successfully!',
          autoClose: 4000,
        });
        setListingAsset(null);
        await loadAssets();
      } else {
        const errorMessage =
          response.error?.message ||
          response.error ||
          'Failed to list asset on marketplace.';
        showNotification({
          type: 'error',
          title: 'Listing failed',
          message: errorMessage,
        });
        throw new Error(errorMessage);
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.message ||
        'An unexpected error occurred while creating the listing.';
      showNotification({
        type: 'error',
        title: 'Listing failed',
        message: errorMessage,
      });
      throw error;
    }
  };

  const handleCloseModal = () => {
    setListingAsset(null);
  };

  const mergedAssets = useMemo(
    () => mergeHoldings(creatorAssets, assets, localHoldings),
    [creatorAssets, assets, localHoldings]
  );

  const summaryToShow = useMemo(() => {
    if (summary && (summary.totalProperties || summary.totalNFTs))
      return summary;
    return buildFallbackSummary(localHoldings);
  }, [summary, localHoldings]);

  const metricCards = useMemo(() => {
    if (!summaryToShow) return [];
    return [
      {
        label: 'Total Properties',
        value: formatMetricValue(summaryToShow.totalProperties || 0),
        icon: '🏢',
        gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
      },
      {
        label: 'Total NFTs',
        value: formatMetricValue(summaryToShow.totalNFTs || 0),
        icon: '🧩',
        gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
      },
      {
        label: 'Total Value',
        value: formatMetricValue(summaryToShow.totalValue || '—'),
        icon: '💎',
        gradient: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
      },
      {
        label: 'Total Dividends',
        value: formatMetricValue(summaryToShow.totalDividends || '—'),
        icon: '💸',
        gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
      },
    ];
  }, [summaryToShow]);

  if (loading) {
    return <div className="loading">Loading your assets...</div>;
  }

  const handleView = asset => {
    const params = new URLSearchParams({ tokenId: asset.tokenId });
    const serialNumber = asset.serialNumber ?? asset.serialNumbers?.[0];
    if (serialNumber !== undefined && serialNumber !== null) {
      params.set('serialNumber', serialNumber);
    }
    window.location.hash = `#/asset?${params.toString()}`;
  };

  // Filter function for MyAssets tabs
  const myAssetsTabFilter = (properties, tabKey) => {
    if (tabKey === 'overview') {
      return properties;
    } else if (tabKey === 'ready_to_sync') {
      // Assets that are already listed (ready to sync)
      return properties.filter(a => a.isListed === true);
    } else if (tabKey === 'needs_review') {
      // Assets that might need review (missing info)
      return properties.filter(a => {
        const hasName = a?.name || a?.propertyName;
        const hasPrice = a?.price || a?.pricePerNFT;
        const hasImages = Array.isArray(a?.images) && a.images.length > 0;
        const hasSerialNumbers = Array.isArray(a?.serialNumbers) && a.serialNumbers.length > 0;
        return !hasName || !hasPrice || !hasImages || !hasSerialNumbers;
      });
    } else if (tabKey === 'waiting') {
      // Assets waiting to be listed (have quantity but not listed)
      return properties.filter(a => a.isListed === false && (a.quantity > 0 || (Array.isArray(a?.serialNumbers) && a.serialNumbers.length > 0)));
    }
    return properties;
  };

  const tabs = [
    { key: 'overview', label: 'Overview', count: null },
    { key: 'needs_review', label: 'Needs review', count: null },
    { key: 'ready_to_sync', label: 'Ready to sync', count: null },
    { key: 'waiting', label: 'Waiting for cardholder', count: null },
  ];

  const emptyMessage = mergedAssets.length === 0
    ? (summary?.totalNFTs
        ? `We detected ${summary.totalNFTs} NFT(s) for this account. Newly minted collections may take a few minutes to appear from the Hedera mirror node.`
        : 'Mint an asset to see it here once the blockchain confirms ownership.')
    : 'No assets found yet.';

  return (
    <div className="my-assets-container">
      {metricCards.length > 0 && (
        <div
          className="portfolio-summary"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 20,
            marginBottom: 32,
          }}
        >
          {metricCards.map(card => (
            <div
              key={card.label}
              style={{
                background: card.gradient,
                color: '#1f1f1f',
                borderRadius: 18,
                padding: '18px 20px',
                boxShadow: '0 12px 25px rgba(0, 0, 0, 0.15)',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <span
                style={{
                  fontSize: 32,
                  lineHeight: 1,
                  filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.08))',
                }}
              >
                {card.icon}
              </span>
              <div>
                <div
                  style={{
                    fontSize: 13,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    fontWeight: 600,
                  }}
                >
                  {card.label}
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    marginTop: 6,
                  }}
                >
                  {card.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <PropertiesPage
        properties={mergedAssets}
        onList={(asset) => {
          if (!asset?.serialNumbers || asset.serialNumbers.length === 0) {
            showNotification({
              type: 'error',
              title: 'Listing unavailable',
              message: 'No NFT serial numbers available for this asset.',
            });
            return;
          }
          handleList(asset);
        }}
        onView={handleView}
        title="My Assets"
        tabs={tabs}
        defaultTab="overview"
        showViewToggle={true}
        showSearch={true}
        showSettings={true}
        emptyMessage={emptyMessage}
        tabFilterFunction={myAssetsTabFilter}
        defaultViewMode="table"
      />

      {listingAsset && (
        <ListingModal
          asset={listingAsset}
          onClose={handleCloseModal}
          onSubmit={handleListingSubmit}
        />
      )}
    </div>
  );
};

export default MyAssets;
