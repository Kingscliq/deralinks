import React, { useEffect, useMemo, useState } from 'react';

import { getAllListedAssets } from '../api/mockApi';

const AssetDetails = ({ asset, onBack, onBuy }) => {
  const [fullAsset, setFullAsset] = useState(asset);

  useEffect(() => {
    const hydrate = async () => {
      if (asset && (!asset.name || !asset.image)) {
        const res = await getAllListedAssets();
        if (res.success) {
          const found = res.data.find(
            a =>
              a.tokenId === asset.tokenId &&
              a.serialNumber === asset.serialNumber
          );
          if (found) setFullAsset(found);
        }
      }
    };
    hydrate();
  }, [asset]);

  const attributes = useMemo(() => fullAsset?.attributes || {}, [fullAsset]);
  const metadata = useMemo(() => fullAsset?.metadata || {}, [fullAsset]);
  const infoChips = useMemo(() => {
    const icon = {
      'Asset type': '🏷️',
      Location: '📍',
      Valuation: '💰',
      'Appraisal date': '📅',
      Custodian: '👤',
      Fractions: '🔢',
    };
    const chips = [
      ['Asset type', metadata.assetType],
      ['Location', metadata.location],
      ['Valuation', attributes.valuation],
      ['Appraisal date', metadata.appraisalDate],
      ['Custodian', metadata.custodian],
      ['Fractions', metadata.fractions],
    ].filter(([, v]) => v !== undefined && v !== '' && v !== null);
    return chips.map(([label, value]) => ({
      label,
      value,
      icon: icon[label] || '•',
    }));
  }, [attributes, metadata]);

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
            src={fullAsset.image}
            alt={fullAsset.name}
            className="nft-image"
          />
        </div>
        <div>
          <h2
            className="nft-name"
            style={{ fontSize: '2rem', marginBottom: 8 }}
          >
            {fullAsset.name}
          </h2>
          <p
            className="nft-description"
            style={{ fontSize: '1rem', marginBottom: 16 }}
          >
            {fullAsset.description}
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

          {fullAsset.price && (
            <div className="nft-price">
              <span className="price-label">Price</span>
              <span className="price-value">{fullAsset.price} ℏ</span>
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
