import React, { useEffect, useState } from 'react';
import { buyAsset, getAllListedAssets } from '../api/mockApi';

import NFTCard from './NFTCard';
import PurchaseModal from './PurchaseModal';
import { useNotification } from '../context/NotificationContext.jsx';

const Marketplace = ({ accountId }) => {
  const [listings, setListings] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasingListing, setPurchasingListing] = useState(null);
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

  const handleBuy = listing => {
    if (!accountId) {
      showNotification({
        type: 'error',
        title: 'Wallet required',
        message: 'Connect your wallet to purchase assets.',
      });
      return;
    }
    setPurchasingListing(listing);
  };

  const handlePurchaseSubmit = async purchaseData => {
    try {
      const response = await buyAsset(purchaseData);
      if (response.success) {
        showNotification({
          type: 'success',
          title: 'Purchase successful',
          message: response.message || 'Purchase completed successfully!',
          autoClose: 4000,
        });
        setPurchasingListing(null);
        await loadListings();
      } else {
        const errorMessage =
          response.error?.message || response.error || 'Failed to complete purchase.';
        showNotification({
          type: 'error',
          title: 'Purchase failed',
          message: errorMessage,
        });
        throw new Error(errorMessage);
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.message ||
        'An unexpected error occurred while processing the purchase.';
      showNotification({
        type: 'error',
        title: 'Purchase failed',
        message: errorMessage,
      });
      throw error;
    }
  };

  const handleClosePurchaseModal = () => {
    setPurchasingListing(null);
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

      {purchasingListing && (
        <PurchaseModal
          listing={purchasingListing}
          accountId={accountId}
          onClose={handleClosePurchaseModal}
          onSubmit={handlePurchaseSubmit}
        />
      )}
    </div>
  );
};

export default Marketplace;
