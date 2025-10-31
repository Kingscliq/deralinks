import React, { useEffect, useState } from 'react';

import NFTCard from './NFTCard';
import { getAllListedAssets } from '../api/mockApi';

const MyListings = ({ accountId }) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!accountId) {
      setListings([]);
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      const response = await getAllListedAssets({
        sellerAccountId: accountId,
        status: 'active',
        limit: 100,
        offset: 0,
      });
      if (response.success) {
        setListings(response.data || []);
        setError(null);
      } else {
        setListings([]);
        setError(response.error || 'Failed to load listings');
      }
      setLoading(false);
    };

    load();
  }, [accountId]);

  const handleView = listing => {
    const params = new URLSearchParams({ tokenId: listing.tokenId });
    const serialNumber = listing.serialNumber ?? listing.serialNumbers?.[0];
    if (serialNumber !== undefined && serialNumber !== null) {
      params.set('serialNumber', serialNumber);
    }
    window.location.hash = `#/asset?${params.toString()}`;
  };

  if (!accountId) {
    return (
      <div className="empty-state">
        <p>Connect your wallet to manage your marketplace listings.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Loading your listings...</div>;
  }

  if (error) {
    return (
      <div className="empty-state">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="my-assets-container">
      <div className="section-header">
        <h2>My Listings</h2>
        <p className="section-subtitle">
          Assets you currently have listed on the marketplace
        </p>
      </div>

      {listings.length === 0 ? (
        <div className="empty-state">
          <p>You do not have any active listings yet.</p>
          <p style={{ marginTop: 8 }}>
            List an asset from your portfolio to have it appear here and on the
            public marketplace.
          </p>
        </div>
      ) : (
        <div className="nft-grid">
          {listings.map(listing => (
            <div key={listing.listingId} style={{ position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  top: 12,
                  left: 12,
                  background:
                    'linear-gradient(135deg, #ffe259 0%, #ffa751 100%)',
                  color: '#212121',
                  padding: '6px 12px',
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 700,
                  boxShadow: '0 6px 14px rgba(0, 0, 0, 0.12)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  pointerEvents: 'none',
                }}
              >
                ✨ Your Listing
              </span>
              <NFTCard
                asset={listing}
                onView={handleView}
                showActions={false}
              />
              <div
                style={{
                  marginTop: 12,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div style={{ fontSize: 12, opacity: 0.8 }}>
                  Visible to all buyers on Marketplace
                </div>
                <button
                  className="action-btn list-btn"
                  style={{
                    background:
                      'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                    color: '#212121',
                    cursor: 'not-allowed',
                  }}
                  title="Delist functionality coming soon"
                  disabled
                >
                  Manage Listing
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyListings;
