import React, { useState } from 'react';
import '../styles/ListingModal.css';

const ListingModal = ({ asset, onClose, onSubmit }) => {
  const maxQuantity = asset?.serialNumbers?.length || 0;
  
  const [formData, setFormData] = useState({
    pricePerNFT: '',
    quantity: maxQuantity,
    expiresInDays: '30',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const price = Number(formData.pricePerNFT);
    if (!formData.pricePerNFT || !Number.isFinite(price) || price <= 0) {
      newErrors.pricePerNFT = 'Enter a valid price greater than zero';
    }

    const quantity = Number(formData.quantity);
    if (!formData.quantity || !Number.isFinite(quantity) || quantity <= 0) {
      newErrors.quantity = 'Enter a valid quantity greater than zero';
    } else if (quantity > maxQuantity) {
      newErrors.quantity = `Quantity cannot exceed ${maxQuantity}`;
    }

    const days = Number(formData.expiresInDays);
    if (!formData.expiresInDays || !Number.isFinite(days) || days <= 0) {
      newErrors.expiresInDays = 'Enter a valid number of days greater than zero';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        await onSubmit({
          pricePerNFT: Number(formData.pricePerNFT),
          quantity: Number(formData.quantity),
          expiresInDays: Number(formData.expiresInDays),
        });
        // Note: Parent closes modal on success
      } catch (error) {
        // Let parent handle error notification
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBackdropClick = e => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="listing-modal-backdrop" onClick={handleBackdropClick}>
      <div className="listing-modal">
        <div className="listing-modal-header">
          <h2>List Asset for Sale</h2>
          <button
            type="button"
            className="listing-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="listing-modal-body">
          <div className="asset-preview">
            <img
              src={asset?.image}
              alt={asset?.name}
              className="asset-preview-image"
            />
            <div className="asset-preview-details">
              <h3>{asset?.name || 'Asset'}</h3>
              <p className="asset-token-id">{asset?.tokenId}</p>
              <p className="asset-available">
                Available: {maxQuantity} NFT{maxQuantity !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="listing-form">
            <div className="form-group">
              <label htmlFor="pricePerNFT">
                Price per NFT (USD) <span className="required">*</span>
              </label>
              <input
                type="number"
                id="pricePerNFT"
                name="pricePerNFT"
                value={formData.pricePerNFT}
                onChange={handleChange}
                placeholder="Enter price in USD"
                step="0.01"
                min="0"
                className={errors.pricePerNFT ? 'error' : ''}
              />
              {errors.pricePerNFT && (
                <span className="error-message">{errors.pricePerNFT}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="quantity">
                Quantity <span className="required">*</span>
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder={`Max ${maxQuantity}`}
                step="1"
                min="1"
                max={maxQuantity}
                className={errors.quantity ? 'error' : ''}
              />
              {errors.quantity && (
                <span className="error-message">{errors.quantity}</span>
              )}
              <span className="field-hint">
                How many NFTs do you want to list?
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="expiresInDays">
                Listing Duration (days) <span className="required">*</span>
              </label>
              <input
                type="number"
                id="expiresInDays"
                name="expiresInDays"
                value={formData.expiresInDays}
                onChange={handleChange}
                placeholder="Enter number of days"
                step="1"
                min="1"
                className={errors.expiresInDays ? 'error' : ''}
              />
              {errors.expiresInDays && (
                <span className="error-message">{errors.expiresInDays}</span>
              )}
              <span className="field-hint">
                How long should the listing remain active?
              </span>
            </div>

            <div className="listing-summary">
              <div className="summary-row">
                <span>Total Value:</span>
                <strong>
                  {formData.pricePerNFT && formData.quantity
                    ? `$${(
                        Number(formData.pricePerNFT) * Number(formData.quantity)
                      ).toFixed(2)}`
                    : '—'}
                </strong>
              </div>
            </div>

            <div className="listing-modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner"></span>
                    Creating Listing...
                  </>
                ) : (
                  'List for Sale'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ListingModal;

