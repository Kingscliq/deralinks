import React, { useEffect, useState } from 'react';
import { getAssetsByWallet, listAsset } from '../api/mockApi';

import NFTCard from './NFTCard';

const MyAssets = ({ accountId }) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssets();
  }, [accountId]);

  const loadAssets = async () => {
    setLoading(true);
    const response = await getAssetsByWallet(accountId);
    if (response.success) {
      setAssets(response.data);
    }
    setLoading(false);
  };

  const handleList = async asset => {
    const price = prompt('Enter price in HBAR:');
    if (!price || isNaN(price)) {
      alert('Invalid price');
      return;
    }

    const payload = {
      tokenId: asset.tokenId,
      serialNumber: asset.serialNumber,
      price: price,
      seller: accountId,
    };

    const response = await listAsset(payload);
    if (response.success) {
      alert('Asset listed successfully!');
      loadAssets();
    } else {
      alert('Failed to list asset: ' + response.error);
    }
  };

  if (loading) {
    return <div className="loading">Loading your assets...</div>;
  }

  return (
    <div className="my-assets-container">
      <div className="section-header">
        <h2>My Assets</h2>
        <p className="section-subtitle">Manage and list your assets</p>
      </div>

      {assets.length === 0 ? (
        <div className="empty-state">
          <p>No assets found. Mint your first NFT!</p>
        </div>
      ) : (
        <div className="nft-grid">
          {assets.map(asset => (
            <NFTCard
              key={`${asset.tokenId}-${asset.serialNumber}`}
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
