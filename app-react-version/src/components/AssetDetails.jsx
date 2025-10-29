import React, { useEffect, useMemo, useState } from 'react';

import { getAllListedAssets } from '../api/mockApi';

const AssetDetails = ({ asset, onBack, onBuy }) => {
  const [fullAsset, setFullAsset] = useState(asset);

  useEffect(() => {
    const hydrate = async () => {
      if (asset && (!asset.name || !asset.image)) {
        const res = await getAllListedAssets();
        if (res.success) {
          const found = res.data.find(a => {
            if (a.tokenId !== asset.tokenId) {
              return false;
            }

            if (!asset.serialNumber) {
              return true;
            }

            if (!Array.isArray(a.serialNumbers)) {
              return false;
            }

            return (
              a.serialNumbers.includes(asset.serialNumber) ||
              a.serialNumbers.includes(Number(asset.serialNumber))
            );
          });
          if (found) setFullAsset(found);
        }
      }
    };
    hydrate();
  }, [asset]);

  const metadata = useMemo(() => fullAsset?.metadata || {}, [fullAsset]);
  const attributes = useMemo(() => fullAsset?.attributes || {}, [fullAsset]);
  const property = useMemo(() => fullAsset?.property || {}, [fullAsset]);
  const serialNumbers = useMemo(
    () => fullAsset?.serialNumbers || [],
    [fullAsset]
  );

  const infoChips = useMemo(() => {
    const chips = [
      ['Asset type', metadata.assetType, '🏷️'],
      ['Location', metadata.location, '📍'],
      ['Expected Return', metadata.expectedAnnualReturn, '📈'],
      ['Rental Yield', metadata.rentalYield, '🏠'],
      ['Valuation', attributes.valuation, '💰'],
      ['Token Price', attributes.tokenPrice, '💵'],
      ['Ownership', attributes.ownership, '🎯'],
      ['Dividends', attributes.dividends, '💸'],
      ['Invested', attributes.invested, '📊'],
      ['Quantity', attributes.quantity ?? fullAsset?.quantity, '🔢'],
    ].filter(
      ([, value]) => value !== undefined && value !== null && value !== ''
    );

    return chips.map(([label, value, icon]) => ({
      label,
      value,
      icon,
    }));
  }, [attributes, metadata, fullAsset]);

  const priceLabel = useMemo(() => {
    if (fullAsset?.price === undefined || fullAsset?.price === null)
      return null;
    const currency = (fullAsset?.priceCurrency || 'USD').toUpperCase();
    const numeric = Number(fullAsset.price);
    const formatted = Number.isFinite(numeric)
      ? numeric.toLocaleString()
      : fullAsset.price;
    return currency === 'HBAR' ? `${formatted} ℏ` : `${currency} ${formatted}`;
  }, [fullAsset]);

  if (!fullAsset) {
    return (
      <div className="empty-state">
        <p>Asset not found.</p>
        <button className="account-btn" onClick={onBack}>
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div style={{ marginBottom: 16 }}>
        <button className="account-btn" onClick={onBack}>
          ← Back
        </button>
      </div>
      <div
        className="nft-grid"
        style={{ gridTemplateColumns: '1fr 1fr', alignItems: 'start', gap: 24 }}
      >
        <div>
          <img
            src={
              fullAsset?.image ||
              'https://via.placeholder.com/600x400?text=DeraLinks'
            }
            alt={fullAsset?.name}
            className="nft-image"
          />
        </div>
        <div>
          <h2
            className="nft-name"
            style={{ fontSize: '2rem', marginBottom: 8 }}
          >
            {fullAsset?.name}
          </h2>
          <p
            className="nft-description"
            style={{ fontSize: '1rem', marginBottom: 16 }}
          >
            {fullAsset?.description}
          </p>

          {infoChips.length > 0 && (
            <div className="nft-attributes" style={{ marginBottom: 16 }}>
              {infoChips.map(chip => (
                <span key={chip.label} className="attribute-badge">
                  <span style={{ marginRight: 6 }}>{chip.icon}</span>
                  {chip.label}: {String(chip.value)}
                </span>
              ))}
            </div>
          )}

          {priceLabel && (
            <div className="nft-price">
              <span className="price-label">Price</span>
              <span className="price-value">{priceLabel}</span>
            </div>
          )}

          {fullAsset?.quantity !== undefined &&
            fullAsset?.quantity !== null && (
              <div className="nft-price">
                <span className="price-label">Available</span>
                <span className="price-value">{fullAsset.quantity}</span>
              </div>
            )}

          {serialNumbers.length > 0 && (
            <div className="nft-attributes" style={{ marginTop: 16 }}>
              <strong>Serial Numbers:</strong>{' '}
              <span style={{ opacity: 0.8 }}>{serialNumbers.join(', ')}</span>
            </div>
          )}

          {property?.amenities?.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <strong>Amenities:</strong>
              <div className="nft-attributes" style={{ marginTop: 8 }}>
                {property.amenities.map(item => (
                  <span key={item} className="attribute-badge">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {property?.features &&
            typeof property.features === 'object' &&
            Object.keys(property.features).length > 0 && (
              <div style={{ marginTop: 16 }}>
                <strong>Features</strong>
                <div className="nft-attributes" style={{ marginTop: 8 }}>
                  {Object.entries(property.features)
                    .filter(
                      ([, value]) => value !== undefined && value !== null
                    )
                    .map(([key, value]) => (
                      <span key={key} className="attribute-badge">
                        {key.replace(/([A-Z])/g, ' $1')}: {String(value)}
                      </span>
                    ))}
                </div>
              </div>
            )}

          {onBuy && (
            <button className="submit-btn" onClick={() => onBuy(fullAsset)}>
              Buy now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssetDetails;
