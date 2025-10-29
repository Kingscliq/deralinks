import React from 'react';

const NFTCard = ({ asset, onList, onBuy, onView, showActions = true }) => {
  const meta = asset?.metadata || {};
  const attrs = asset?.attributes || {};

  const chips = [
    ['Type', meta.assetType, '🏷️'],
    ['Location', meta.location, '📍'],
    ['Expected Return', meta.expectedAnnualReturn, '📈'],
    ['Rental Yield', meta.rentalYield, '🏠'],
    ['Valuation', attrs.valuation, '💰'],
    ['Token Price', attrs.tokenPrice, '💵'],
    ['Ownership', attrs.ownership, '🎯'],
    ['Dividends', attrs.dividends, '💸'],
    ['Invested', attrs.invested, '📊'],
    ['Quantity', attrs.quantity ?? asset?.quantity, '🔢'],
  ].filter(
    ([, value]) => value !== undefined && value !== null && value !== ''
  );

  const priceCurrency = (asset?.priceCurrency || 'USD').toUpperCase();
  const numericPrice = Number(asset?.price);
  const priceValue = Number.isFinite(numericPrice)
    ? numericPrice.toLocaleString()
    : asset?.price;
  const priceLabel =
    asset?.price !== undefined && asset?.price !== null
      ? priceCurrency === 'HBAR'
        ? `${priceValue} ℏ`
        : `${priceCurrency} ${priceValue}`
      : null;

  return (
    <div
      className="nft-card"
      onClick={() => onView && onView(asset)}
      style={{ cursor: onView ? 'pointer' : 'default' }}
    >
      <img
        src={
          asset?.image || 'https://via.placeholder.com/400x300?text=DeraLinks'
        }
        alt={asset?.name}
        className="nft-image"
      />
      <div className="nft-content">
        <h3 className="nft-name">{asset?.name}</h3>
        <p className="nft-description">{asset?.description}</p>

        {chips.length > 0 && (
          <div className="nft-attributes">
            {chips.map(([label, value, icon]) => (
              <span key={label} className="attribute-badge">
                <span style={{ marginRight: 6 }}>{icon}</span>
                {label}: {String(value)}
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

        {asset?.quantity !== undefined && asset?.quantity !== null && (
          <div className="nft-price">
            <span className="price-label">Available</span>
            <span className="price-value">{asset.quantity}</span>
          </div>
        )}

        {showActions && (
          <div className="nft-actions">
            {asset.isListed ? (
              <span className="listed-badge">Listed</span>
            ) : onList ? (
              <button
                className="action-btn list-btn"
                onClick={e => {
                  e.stopPropagation();
                  onList(asset);
                }}
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
