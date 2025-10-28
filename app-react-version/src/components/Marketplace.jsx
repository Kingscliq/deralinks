import React, { useEffect, useState } from 'react';
import { buyAsset, getAllListedAssets } from '../api/mockApi';

import NFTCard from './NFTCard';

const Marketplace = ({ accountId }) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    setLoading(true);
    const response = await getAllListedAssets();
    if (response.success) {
      setListings(response.data);
    }
    setLoading(false);
  };

  const handleBuy = async asset => {
    const confirmed = window.confirm(`Buy ${asset.name} for ${asset.price} ℏ?`);
    if (!confirmed) return;

    const response = await buyAsset(asset.listingId, accountId);
    if (response.success) {
      alert('Purchase successful!');
      loadListings();
    } else {
      alert('Purchase failed: ' + response.error);
    }
  };

  if (loading) {
    return <div className="loading">Loading marketplace...</div>;
  }

  const handleView = asset => {
    const params = new URLSearchParams({
      tokenId: asset.tokenId,
      serialNumber: asset.serialNumber,
    });
    window.location.hash = `#/asset?${params.toString()}`;
  };

  return (
    <div className="marketplace-container">
      <div className="section-header">
        <h2>Assets Marketplace</h2>
        <p className="section-subtitle">
          Discover and trade tokenized assets on Hedera
        </p>
      </div>

      {listings.length === 0 ? (
        <div className="empty-state">
          <p>No items listed yet</p>
        </div>
      ) : (
        <div className="nft-grid">
          {listings.map(listing => (
            <NFTCard
              key={listing.listingId}
              asset={listing}
              onView={handleView}
              onBuy={handleBuy}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Marketplace;
