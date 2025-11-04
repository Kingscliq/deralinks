import React from 'react';
import { DEFAULT_IMAGE } from '../api/mockApi';
import '../styles/PropertyGridCard.css';

const PropertyGridCard = ({ property, onList, onBuy, onView, showActions = true }) => {
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
      ? numericPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : price;
    return formatted;
  };

  const formatCurrency = (price, currency = 'USD') => {
    const priceStr = formatPrice(price);
    if (priceStr === '—') return '—';
    const curr = (currency || 'USD').toUpperCase();
    return curr === 'HBAR' ? `${priceStr} ℏ` : `${curr} ${priceStr}`;
  };

  // Get location from multiple possible sources
  const location = 
    meta.location || 
    property?.city || 
    property?.property?.city || 
    (property?.city && property?.country ? `${property.city}, ${property.country}` : null) ||
    property?.property?.address || 
    '—';

  return (
    <div
      className="property-grid-card"
      onClick={() => onView && onView(property)}
      style={{ cursor: onView ? 'pointer' : 'default' }}
    >
      <div className="property-grid-card-image-wrapper">
        <img
          src={imageSrc}
          alt={property?.name || property?.propertyName}
          className="property-grid-card-image"
          onError={event => {
            if (event.currentTarget?.src !== DEFAULT_IMAGE) {
              event.currentTarget.src = DEFAULT_IMAGE;
            }
          }}
        />
      </div>
      
      <div className="property-grid-card-content">
        <h3 className="property-grid-card-name">
          {property?.name || property?.propertyName || 'Unnamed Property'}
        </h3>
        
        <div className="property-grid-card-location">
          <span className="property-grid-card-location-icon">📍</span>
          <span>{location}</span>
        </div>

        <div className="property-grid-card-details">
          {property?.price || property?.pricePerNFT ? (
            <div className="property-grid-card-price">
              <span className="property-grid-card-price-value">
                {formatCurrency(property?.price || property?.pricePerNFT, property?.priceCurrency)}
              </span>
            </div>
          ) : null}
          
          {property?.quantity !== undefined && property?.quantity !== null && (
            <div className="property-grid-card-quantity">
              <span className="property-grid-card-quantity-label">Available</span>
              <span className="property-grid-card-quantity-value">{property.quantity}</span>
            </div>
          )}
        </div>

        {showActions && (
          <div className="property-grid-card-actions">
            {onBuy && (
              <button
                className="property-grid-card-action-btn property-grid-card-buy-btn"
                onClick={e => {
                  e.stopPropagation();
                  onBuy(property);
                }}
              >
                Buy now
              </button>
            )}
            
            {!onBuy && property.isListed ? (
              <span className="property-grid-card-listed-badge">Listed</span>
            ) : !onBuy && onList ? (
              <button
                className="property-grid-card-action-btn property-grid-card-list-btn"
                onClick={e => {
                  e.stopPropagation();
                  onList(property);
                }}
              >
                List for sale
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyGridCard;

