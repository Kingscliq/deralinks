import React, { useEffect, useState } from 'react';
import { buyAsset, getAllListedAssets } from '../api/mockApi';

import PropertiesPage from './PropertiesPage';
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

  const handleView = asset => {
    const params = new URLSearchParams({ tokenId: asset.tokenId });
    const serialNumber = asset.serialNumber ?? asset.serialNumbers?.[0];
    if (serialNumber !== undefined && serialNumber !== null) {
      params.set('serialNumber', serialNumber);
    }
    window.location.hash = `#/asset?${params.toString()}`;
  };

  if (loading) {
    return <div className="loading">Loading marketplace...</div>;
  }

  // Filter function for marketplace tabs
  const marketplaceTabFilter = (properties, tabKey) => {
    if (tabKey === 'overview') {
      return properties;
    } else if (tabKey === 'ready_to_sync') {
      // All active listings (all marketplace items are ready to sync/buy)
      return properties;
    } else if (tabKey === 'needs_review') {
      // Listings that might need review (missing info, price, etc.)
      return properties.filter(p => {
        const hasName = p?.name || p?.propertyName;
        const hasPrice = p?.price || p?.pricePerNFT;
        const hasImages = Array.isArray(p?.images) && p.images.length > 0;
        return !hasName || !hasPrice || !hasImages;
      });
    } else if (tabKey === 'waiting') {
      // Listings waiting for something (e.g., pending approval)
      return properties.filter(p => p.status === 'pending' || p.status === 'waiting');
    }
    return properties;
  };

  const tabs = [
    { key: 'overview', label: 'Overview', count: null },
    { key: 'needs_review', label: 'Needs review', count: null },
    { key: 'ready_to_sync', label: 'Ready to sync', count: null },
    { key: 'waiting', label: 'Waiting for cardholder', count: null },
  ];

  return (
    <div className="marketplace-container">
      <PropertiesPage
        properties={listings}
        onBuy={handleBuy}
        onView={handleView}
        title="Assets Marketplace"
        tabs={tabs}
        defaultTab="overview"
        showViewToggle={false}
        showSearch={true}
        showSettings={true}
        emptyMessage="No items listed yet"
        tabFilterFunction={marketplaceTabFilter}
        defaultViewMode="grid"
      />

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
