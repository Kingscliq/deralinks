import React from 'react';
import { DEFAULT_IMAGE } from '../api/mockApi';
import '../styles/PropertyTable.css';

const PropertyTable = ({ properties, onList, onBuy, onView, selectedRows = [], onSelectRow, onSelectAll }) => {
  const imageCandidates = (property) => {
    const meta = property?.metadata || {};
    return [
      property?.image,
      ...(Array.isArray(property?.images) ? property.images : []),
      ...(Array.isArray(meta?.images) ? meta.images : []),
      ...(Array.isArray(property?.property?.images) ? property.property.images : []),
    ];
  };

  const getImageSrc = (property) => {
    const candidates = imageCandidates(property);
    return candidates.find(
      value => typeof value === 'string' && value.trim().length > 0
    ) || DEFAULT_IMAGE;
  };

  const formatPrice = (price, currency = 'USD') => {
    if (price === undefined || price === null) return '—';
    const numericPrice = Number(price);
    const formatted = Number.isFinite(numericPrice)
      ? numericPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : price;
    const curr = (currency || 'USD').toUpperCase();
    return curr === 'HBAR' ? `${formatted} ℏ` : `${curr} ${formatted}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return '—';
    }
  };

  const getLocation = (property) => {
    const meta = property?.metadata || {};
    return meta.location || property?.property?.city || property?.property?.address || '—';
  };

  const getCategory = (property) => {
    const meta = property?.metadata || {};
    return meta.assetType || property?.property?.category || property?.property?.propertyType || '—';
  };

  const allSelected = properties.length > 0 && selectedRows.length === properties.length;
  const someSelected = selectedRows.length > 0 && selectedRows.length < properties.length;

  if (properties.length === 0) {
    return (
      <div className="property-table-empty">
        <p>No properties found.</p>
      </div>
    );
  }

  return (
    <div className="property-table-wrapper">
      <table className="property-table">
        <thead>
          <tr>
            <th className="property-table-checkbox">
              <input
                type="checkbox"
                checked={allSelected}
                ref={input => {
                  if (input) input.indeterminate = someSelected;
                }}
                onChange={e => {
                  if (onSelectAll) {
                    onSelectAll(e.target.checked);
                  }
                }}
              />
            </th>
            <th className="property-table-merchant">Property</th>
            <th className="property-table-date">Created</th>
            <th className="property-table-amount">Price</th>
            <th className="property-table-location">Location</th>
            <th className="property-table-category">Category</th>
            <th className="property-table-quantity">Available</th>
            <th className="property-table-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {properties.map((property, index) => {
            const isSelected = selectedRows.includes(index);
            const imageSrc = getImageSrc(property);
            
            return (
              <tr 
                key={property.id || property.tokenId || index}
                className={isSelected ? 'property-table-row-selected' : ''}
                onClick={() => onView && onView(property)}
                style={{ cursor: onView ? 'pointer' : 'default' }}
              >
                <td className="property-table-checkbox">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={e => {
                      e.stopPropagation();
                      if (onSelectRow) {
                        onSelectRow(index, e.target.checked);
                      }
                    }}
                    onClick={e => e.stopPropagation()}
                  />
                </td>
                <td className="property-table-merchant">
                  <div className="property-table-merchant-cell">
                    <img
                      src={imageSrc}
                      alt={property?.name || property?.propertyName}
                      className="property-table-merchant-icon"
                      onError={event => {
                        if (event.currentTarget?.src !== DEFAULT_IMAGE) {
                          event.currentTarget.src = DEFAULT_IMAGE;
                        }
                      }}
                    />
                    <div className="property-table-merchant-info">
                      <div className="property-table-merchant-name">
                        {property?.name || property?.propertyName || 'Unnamed Property'}
                      </div>
                      <div className="property-table-merchant-desc">
                        {property?.description || property?.property?.description || '—'}
                      </div>
                    </div>
                    <span className="property-table-merchant-check">✓</span>
                  </div>
                </td>
                <td className="property-table-date">
                  {formatDate(property?.createdAt || property?.created_at)}
                </td>
                <td className="property-table-amount">
                  {formatPrice(property?.price || property?.pricePerNFT, property?.priceCurrency)}
                </td>
                <td className="property-table-location">
                  {getLocation(property)}
                </td>
                <td className="property-table-category">
                  {getCategory(property)}
                </td>
                <td className="property-table-quantity">
                  {property?.quantity !== undefined && property?.quantity !== null
                    ? property.quantity
                    : '—'}
                </td>
                <td className="property-table-actions">
                  <div className="property-table-action-buttons" onClick={e => e.stopPropagation()}>
                    {property.isListed ? (
                      <span className="property-table-action-status">Ready to sync</span>
                    ) : (
                      <>
                        {onList && (
                          <button
                            className="property-table-action-btn property-table-list-btn"
                            onClick={e => {
                              e.stopPropagation();
                              onList(property);
                            }}
                          >
                            List
                          </button>
                        )}
                        {onBuy && (
                          <button
                            className="property-table-action-btn property-table-buy-btn"
                            onClick={e => {
                              e.stopPropagation();
                              onBuy(property);
                            }}
                          >
                            Buy
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PropertyTable;

