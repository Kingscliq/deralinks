import React, { useEffect, useMemo, useState } from 'react';
import { getAssetsByWallet, listAsset } from '../api/mockApi';

import NFTCard from './NFTCard';

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

const mergeHoldings = (apiHoldings, localHoldings) => {
  const map = new Map();
  (localHoldings || []).forEach(item => {
    if (item?.tokenId) {
      map.set(item.tokenId, item);
    }
  });
  (apiHoldings || []).forEach(item => {
    if (item?.tokenId) {
      map.set(item.tokenId, item);
    }
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssets();
  }, [accountId]);

  const loadAssets = async () => {
    if (!accountId) {
      setAssets([]);
      setSummary(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const response = await getAssetsByWallet(accountId);
    if (response.success) {
      setAssets(response.data?.holdings || []);
      setSummary(response.data?.summary || null);
    } else {
      setAssets([]);
      setSummary(null);
      alert('Failed to fetch your assets: ' + response.error);
    }
    setLoading(false);
  };

  const handleList = async asset => {
    if (!asset?.serialNumbers || asset.serialNumbers.length === 0) {
      alert('No NFT serial numbers available for this asset.');
      return;
    }

    const priceInput = prompt('Enter price per NFT (in USD):');
    if (priceInput === null) return;
    const pricePerNFT = Number(priceInput);
    if (!Number.isFinite(pricePerNFT) || pricePerNFT <= 0) {
      alert('Invalid price');
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
      alert('Invalid quantity');
      return;
    }
    if (quantity > maxQuantity) {
      alert('Quantity exceeds owned NFTs for this property.');
      return;
    }

    const serialNumbers = asset.serialNumbers.slice(0, quantity);

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
    };

    const response = await listAsset(payload);
    if (response.success) {
      alert(response.message || 'Asset listed successfully!');
      loadAssets();
    } else {
      alert('Failed to list asset: ' + response.error);
    }
  };

  const mergedAssets = useMemo(
    () => mergeHoldings(assets, localHoldings),
    [assets, localHoldings]
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
