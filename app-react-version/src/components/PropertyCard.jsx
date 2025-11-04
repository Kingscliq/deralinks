import React from 'react';
import { DEFAULT_IMAGE } from '../api/mockApi';
import '../styles/PropertyCard.css';

const PropertyCard = ({ property, onList, onBuy, onView, showActions = true }) => {
  const meta = property?.metadata || {};
  
  const imageCandidates = [
    property?.image,
    ...(Array.isArray(property?.images) ? property.images : []),
    ...(Array.isArray(meta?.images) ? meta.images : []),
    ...(Array.isArray(property?.property?.images) ? property.property.images : []),
  ];

  const imageSrc =
    imageCandidates.find(
      value => typeof value === 'string' && value.trim().length > 0
    ) || DEFAULT_IMAGE;

  const formatPrice = (price) => {
    if (price === undefined || price === null) return '—';
    const numericPrice = Number(price);
    const formatted = Number.isFinite(numericPrice)
      ? numericPrice.toLocaleString()
      : price;
    return formatted;
  };

  const formatCurrency = (price, currency = 'USD') => {
    const priceStr = formatPrice(price);
    if (priceStr === '—') return '—';
    const curr = (currency || 'USD').toUpperCase();
    return curr === 'HBAR' ? `${priceStr} ℏ` : `${curr} ${priceStr}`;
  };

  const location = meta.location || property?.property?.city || property?.property?.address || '—';

  return (
    <div
      className="property-card"
      onClick={() => onView && onView(property)}
      style={{ cursor: onView ? 'pointer' : 'default' }}
    >
      <div className="property-card-image-wrapper">
        <img
          src={imageSrc}
          alt={property?.name || property?.propertyName}
          className="property-card-image"
          onError={event => {
            if (event.currentTarget?.src !== DEFAULT_IMAGE) {
              event.currentTarget.src = DEFAULT_IMAGE;
            }
          }}
        />
      </div>
      
      <div className="property-card-content">
        <h3 className="property-card-name">
          {property?.name || property?.propertyName || 'Unnamed Property'}
        </h3>
        
        <div className="property-card-location">
          <span className="property-card-location-icon">📍</span>
          <span>{location}</span>
        </div>

        <div className="property-card-details">
          {property?.price || property?.pricePerNFT ? (
            <div className="property-card-price">
              <span className="property-card-price-label">Price</span>
              <span className="property-card-price-value">
                {formatCurrency(property?.price || property?.pricePerNFT, property?.priceCurrency)}
              </span>
            </div>
          ) : null}
          
          {property?.quantity !== undefined && property?.quantity !== null && (
            <div className="property-card-quantity">
              <span className="property-card-quantity-label">Available</span>
              <span className="property-card-quantity-value">{property.quantity}</span>
            </div>
          )}
        </div>

        {showActions && (
          <div className="property-card-actions">
            {property.isListed ? (
              <span className="property-card-listed-badge">Listed</span>
            ) : onList ? (
              <button
                className="property-card-action-btn property-card-list-btn"
                onClick={e => {
                  e.stopPropagation();
                  onList(property);
                }}
              >
                List for sale
              </button>
            ) : null}

            {onBuy && (
              <button
                className="property-card-action-btn property-card-buy-btn"
                onClick={e => {
                  e.stopPropagation();
                  onBuy(property);
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

export default PropertyCard;

