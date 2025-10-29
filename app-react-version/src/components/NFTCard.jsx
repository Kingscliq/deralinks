import React from 'react';

const NFTCard = ({ asset, onList, onBuy, onView, showActions = true }) => {
  const meta = asset?.metadata || {};
  const attrs = asset?.attributes || {};
  const icon = {
    Type: '🏷️',
    Location: '📍',
    Valuation: '💰',
    Appraised: '📅',
    Custodian: '👤',
    Fractions: '🔢',
  };
  const chips = [
    ['Type', meta.assetType],
    ['Location', meta.location],
    ['Valuation', attrs.valuation],
    ['Appraised', meta.appraisalDate],
    ['Custodian', meta.custodian],
    ['Fractions', meta.fractions],
  ].filter(([, v]) => v !== undefined && v !== '' && v !== null);
  return (
    <div
      className="nft-card"
      onClick={() => onView && onView(asset)}
      style={{ cursor: onView ? 'pointer' : 'default' }}
    >
      <img src={asset.image} alt={asset.name} className="nft-image" />
      <div className="nft-content">
        <h3 className="nft-name">{asset.name}</h3>
        <p className="nft-description">{asset.description}</p>

        {chips.length > 0 && (
          <div className="nft-attributes">
            {chips.map(([label, value]) => (
              <span key={label} className="attribute-badge">
                <span style={{ marginRight: 6 }}>{icon[label] || '•'}</span>
                {label}: {String(value)}
              </span>
            ))}
          </div>
        )}

        {asset.price && (
          <div className="nft-price">
            <span className="price-label">Price</span>
            <span className="price-value">{asset.price} ℏ</span>
          </div>
        )}

        {showActions && (
          <div className="nft-actions">
            {asset.isListed ? (
              <span className="listed-badge">Listed</span>
            ) : onList ? (
              <button
                className="action-btn list-btn"
                onClick={() => onList(asset)}
              >
                List for sale
              </button>
            ) : null}

            {onBuy && (
              <button
                className="action-btn buy-btn"
                onClick={e => {
                  e.stopPropagation();
                  onBuy(asset);
                }}
              >
                Buy now
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NFTCard;
