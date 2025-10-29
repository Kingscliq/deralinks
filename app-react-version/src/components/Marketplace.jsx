import React, { useEffect, useState } from 'react';
import { buyAsset, getAllListedAssets } from '../api/mockApi';

import NFTCard from './NFTCard';
import { useNotification } from '../context/NotificationContext.jsx';

const Marketplace = ({ accountId }) => {
  const [listings, setListings] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    setLoading(true);
    const response = await getAllListedAssets();
    if (response.success) {
      setListings(response.data);
      setMeta(response.meta || null);
    } else {
      setListings([]);
      setMeta(null);
      showNotification({
        type: 'error',
        title: 'Marketplace unavailable',
        message: response.error || 'Failed to load marketplace listings.',
      });
    }
    setLoading(false);
  };

  const formatPrice = asset => {
    if (!asset) return '';
    const price = asset.price || asset.pricePerNFT;
    if (price === undefined || price === null) return 'Not specified';
    const currency = (asset.priceCurrency || 'USD').toUpperCase();
    const numericPrice = Number(price);
    const priceValue = Number.isFinite(numericPrice)
      ? numericPrice.toLocaleString()
      : price;
    return currency === 'HBAR'
      ? `${priceValue} ℏ`
      : `${currency} ${priceValue}`;
  };

  const handleBuy = async asset => {
    if (!accountId) {
      showNotification({
        type: 'error',
        title: 'Wallet required',
        message: 'Connect your wallet to purchase assets.',
      });
      return;
    }

    const availableQuantity =
      asset.quantity || asset.serialNumbers?.length || 1;
    const quantityInput = prompt(
      `Enter quantity to buy (max ${availableQuantity})`,
      '1'
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
    if (quantity > availableQuantity) {
      showNotification({
        type: 'error',
        title: 'Quantity too high',
        message: 'Quantity exceeds available NFTs in this listing.',
      });
      return;
    }

    const priceLabel = formatPrice(asset);
    const confirmed = window.confirm(
      `Buy ${quantity} from ${asset.name} for ${priceLabel} each?`
    );
    if (!confirmed) return;

    const response = await buyAsset({
      listingId: asset.listingId,
      buyerHederaAccount: accountId,
      quantity,
      paymentMethod: asset.priceCurrency === 'HBAR' ? 'HBAR' : 'USD',
    });
    if (response.success) {
      showNotification({
        type: 'success',
        title: 'Purchase successful',
        message: response.message || 'Purchase initiated successfully!',
        autoClose: 4000,
      });
      loadListings();
    } else {
      showNotification({
        type: 'error',
        title: 'Purchase failed',
        message: response.error || 'Failed to complete purchase.',
      });
    }
  };

  if (loading) {
    return <div className="loading">Loading marketplace...</div>;
  }

  const handleView = asset => {
    const params = new URLSearchParams({ tokenId: asset.tokenId });
    const serialNumber = asset.serialNumber ?? asset.serialNumbers?.[0];
    if (serialNumber !== undefined && serialNumber !== null) {
      params.set('serialNumber', serialNumber);
    }
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

      {meta?.total !== undefined && (
        <div className="section-subtitle" style={{ marginBottom: 16 }}>
          {meta.total} listings available
        </div>
      )}

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
