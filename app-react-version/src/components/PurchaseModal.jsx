import React, { useState } from 'react';
import '../styles/PurchaseModal.css';

const PurchaseModal = ({ listing, accountId, onClose, onSubmit }) => {
  const maxQuantity = listing?.quantity || 0;
  const pricePerNFT = Number(listing?.price || listing?.pricePerNFT || 0);

  const [formData, setFormData] = useState({
    quantity: Math.min(maxQuantity, 1),
    paymentMethod: 'HBAR',
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

    const quantity = Number(formData.quantity);
    if (!formData.quantity || !Number.isFinite(quantity) || quantity <= 0) {
      newErrors.quantity = 'Enter a valid quantity greater than zero';
    } else if (quantity > maxQuantity) {
      newErrors.quantity = `Quantity cannot exceed ${maxQuantity}`;
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Select a payment method';
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
          listingId: listing.listingId || listing.id,
          buyerHederaAccount: accountId,
          quantity: Number(formData.quantity),
          paymentMethod: formData.paymentMethod,
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

  const totalPrice = pricePerNFT * Number(formData.quantity || 0);

  return (
    <div className="purchase-modal-backdrop" onClick={handleBackdropClick}>
      <div className="purchase-modal">
        <div className="purchase-modal-header">
          <h2>Purchase NFTs</h2>
          <button
            type="button"
            className="purchase-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="purchase-modal-body">
          <div className="listing-preview">
            <img
              src={listing?.asset?.image || listing?.image}
              alt={listing?.title}
              className="listing-preview-image"
            />
            <div className="listing-preview-details">
              <h3>{listing?.title || 'Asset'}</h3>
              <p className="listing-token-id">{listing?.tokenId}</p>
              <div className="listing-info">
                <span className="listing-price">
                  ${pricePerNFT.toFixed(2)} per NFT
                </span>
                <span className="listing-available">
                  {maxQuantity} available
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="purchase-form">
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
                How many NFTs do you want to purchase?
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="paymentMethod">
                Payment Method <span className="required">*</span>
              </label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className={errors.paymentMethod ? 'error' : ''}
              >
                <option value="HBAR">HBAR</option>
                <option value="USD">USD (Stablecoin)</option>
              </select>
              {errors.paymentMethod && (
                <span className="error-message">{errors.paymentMethod}</span>
              )}
            </div>

            <div className="purchase-summary">
              <div className="summary-row">
                <span>Price per NFT:</span>
                <span>${pricePerNFT.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Quantity:</span>
                <span>{formData.quantity || 0}</span>
              </div>
              <div className="summary-row total">
                <span>Total Price:</span>
                <strong>${totalPrice.toFixed(2)}</strong>
              </div>
            </div>

            <div className="purchase-modal-actions">
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
                    Processing Purchase...
                  </>
                ) : (
                  'Confirm Purchase'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PurchaseModal;

