import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { getAssetsByWallet, getProperties, listAsset } from '../api/mockApi';

import NFTCard from './NFTCard';
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
      const nextSerials =
        Array.isArray(item.serialNumbers) && item.serialNumbers.length
          ? item.serialNumbers
          : existing.serialNumbers;

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

      if (holdingsResponse.success) {
        setAssets(holdingsResponse.data?.holdings || []);
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

      if (propertiesResponse.success) {
        const ownedProperties = (propertiesResponse.data || []).filter(
          asset => {
            const ownerId = asset?.ownerHederaAccount || asset?.owner;
            return ownerId && ownerId.toString() === accountId.toString();
          }
        );
        setCreatorAssets(ownedProperties);
      } else {
        setCreatorAssets([]);
        if (propertiesResponse.error) {
          console.warn(
            'Unable to load minted properties:',
            propertiesResponse.error
          );
        }
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

  const handleList = async asset => {
    if (!asset?.serialNumbers || asset.serialNumbers.length === 0) {
      showNotification({
        type: 'error',
        title: 'Listing unavailable',
        message: 'No NFT serial numbers available for this asset.',
      });
      return;
    }

    const priceInput = prompt('Enter price per NFT (in USD):');
    if (priceInput === null) return;
    const pricePerNFT = Number(priceInput);
    if (!Number.isFinite(pricePerNFT) || pricePerNFT <= 0) {
      showNotification({
        type: 'error',
        title: 'Invalid price',
        message: 'Enter a valid price per NFT greater than zero.',
      });
      return;
    }

    const maxQuantity = asset.serialNumbers.length;
    const quantityInput = prompt(
      `How many NFTs do you want to list? (max ${maxQuantity})`,
      String(maxQuantity)
    );
    if (quantityInput === null) return;
    const quantity = Number(quantityInput);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      showNotification({
        type: 'error',
        title: 'Invalid quantity',
        message: 'Enter a quantity greater than zero.',
      });
      return;
    }
    if (quantity > maxQuantity) {
      showNotification({
        type: 'error',
        title: 'Quantity too high',
        message: 'Quantity exceeds owned NFTs for this property.',
      });
      return;
    }

    const serialNumbers = asset.serialNumbers.slice(0, quantity);

    const expiresInput = prompt(
      'How many days should the listing remain active? (default 30)',
      '30'
    );
    if (expiresInput === null) return;
    const expiresValue = expiresInput.trim();
    const expiresInDays = Number(expiresValue === '' ? 30 : expiresValue);
    if (!Number.isFinite(expiresInDays) || expiresInDays <= 0) {
      showNotification({
        type: 'error',
        title: 'Invalid duration',
        message: 'Enter a valid number of days greater than zero.',
      });
      return;
    }

    const payload = {
      sellerHederaAccount: accountId,
      tokenId: asset.tokenId,
      serialNumbers,
      quantity,
      pricePerNFT,
      currency: 'USD',
      title: `${asset.name || 'Asset'} NFTs`,
      description:
        asset.description ||
        `Listing ${quantity} NFTs from ${asset.name || asset.tokenId}`,
      expiresInDays,
    };

    const response = await listAsset(payload);
    if (response.success) {
      showNotification({
        type: 'success',
        title: 'Listing created',
        message: response.message || 'Asset listed successfully!',
        autoClose: 4000,
      });
      await loadAssets();
    } else {
      showNotification({
        type: 'error',
        title: 'Listing failed',
        message: response.error || 'Failed to list asset on marketplace.',
      });
    }
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

  return (
    <div className="my-assets-container">
      <div className="section-header">
        <h2>My Assets</h2>
        <p className="section-subtitle">Manage and list your assets</p>
      </div>

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

      {mergedAssets.length === 0 ? (
        <div className="empty-state">
          <p>No assets found yet.</p>
          {summary?.totalNFTs ? (
            <p style={{ marginTop: 8 }}>
              We detected {summary.totalNFTs} NFT(s) for this account. Newly
              minted collections may take a few minutes to appear from the
              Hedera mirror node.
            </p>
          ) : (
            <p style={{ marginTop: 8 }}>
              Mint an asset to see it here once the blockchain confirms
              ownership.
            </p>
          )}
        </div>
      ) : (
        <div className="nft-grid">
          {mergedAssets.map(asset => (
            <NFTCard
              key={`${asset.tokenId}-${
                asset.id || asset.serialNumbers?.join('-') || 'holding'
              }`}
              asset={asset}
              onList={!asset.isListed ? handleList : null}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAssets;
