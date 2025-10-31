import React, { useMemo, useState } from 'react';
import { uploadFileToIPFS, uploadMultipleFilesToIPFS } from '../api/mockApi';

import { useNotification } from '../context/NotificationContext.jsx';

const INITIAL_FORM_DATA = {
  name: '',
  description: '',
  image: '',
  assetType: 'Real Estate',
  location: '',
  valuation: '',
  appraisalDate: '',
  custodian: '',
  fractions: 1000,
  expectedAnnualReturn: '10',
  rentalYield: '6',
  distributionFrequency: 'monthly',
};

const normalizeAssetType = value => {
  if (!value) return 'real_estate';
  return value
    .toString()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
};

const deriveCategoryFromType = assetType => {
  const normalized = normalizeAssetType(assetType);
  switch (normalized) {
    case 'vehicle':
      return 'luxury';
    case 'commodities':
    case 'commodity':
      return 'commodities';
    case 'energy':
    case 'energy_assets':
      return 'energy';
    default:
      return 'residential';
  }
};

const deriveSymbol = name => {
  if (!name) return 'DERA';
  const letters = name
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 4);
  return letters.padEnd(3, 'X');
};

const parseLocationInput = value => {
  if (!value) {
    return {
      address: '',
      city: '',
      state: '',
      country: '',
      zip: '',
    };
  }

  const parts = value
    .split(',')
    .map(part => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return {
      address: value,
      city: '',
      state: '',
      country: '',
      zip: '',
    };
  }

  const city = parts[0] || '';
  const country = parts.length > 1 ? parts[parts.length - 1] : '';
  const state = parts.length > 2 ? parts.slice(1, -1).join(', ') : '';

  return {
    address: value,
    city,
    state,
    country,
    zip: '',
  };
};

const sanitizeObject = source => {
  return Object.entries(source).reduce((acc, [key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      acc[key] = val;
    }
    return acc;
  }, {});
};

const MintForm = ({ onMint, accountId }) => {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageDrag, setImageDrag] = useState(false);
  const [docFiles, setDocFiles] = useState([]); // optional supporting documents
  const [docDrag, setDocDrag] = useState(false);
  const { showNotification } = useNotification();

  const selectedDocNames = useMemo(
    () => docFiles.map(file => file.name).join(', '),
    [docFiles]
  );

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSelectImage = file => {
    if (!file) return;
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

  const onSelectDocs = files => {
    if (!files || !files.length) return;
    const accepted = Array.from(files || []).filter(Boolean);
    if (!accepted.length) return;

    const existing = new Set(docFiles.map(file => file.name));
    const deduped = accepted.filter(file => !existing.has(file.name));

    setDocFiles(prev => [...prev, ...deduped]);
  };

  const parseNumeric = value => {
    if (value === undefined || value === null || value === '') return undefined;
    const parsed = Number(String(value).replace(/[^0-9.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!accountId) {
      showNotification({
        type: 'error',
        title: 'Wallet required',
        message: 'Connect your wallet before tokenizing an asset.',
      });
      return;
    }

    if (!imageFile) {
      showNotification({
        type: 'error',
        title: 'Asset image required',
        message: 'Upload at least one asset image before minting.',
      });
      return;
    }

    if (docFiles.length > 8) {
      showNotification({
        type: 'error',
        title: 'Too many documents',
        message: 'Please upload 8 or fewer supporting documents at a time.',
      });
      return;
    }

    setLoading(true);

    const valuationValue = parseNumeric(formData.valuation);
    const fractionsValue = Number(formData.fractions) || 0;
    const tokenPrice =
      valuationValue && fractionsValue
        ? Number((valuationValue / fractionsValue).toFixed(2))
        : undefined;

    try {
      let uploadedImageData = null;

      if (imageFile) {
        const imageUploadResponse = await uploadFileToIPFS(imageFile);

        if (!imageUploadResponse?.success || !imageUploadResponse?.data?.url) {
          throw new Error(
            imageUploadResponse?.error ||
              'Failed to upload asset image to IPFS.'
          );
        }

        uploadedImageData = imageUploadResponse.data;
      }

      const manualImage = formData.image?.trim();
      const uploadedImageUrl = uploadedImageData?.url;

      const imageUrls = [uploadedImageUrl, manualImage]
        .filter(Boolean)
        .filter((value, index, self) => self.indexOf(value) === index);

      if (!imageUrls.length) {
        throw new Error('Failed to upload asset image to IPFS.');
      }

      let uploadedDocuments = [];

      if (docFiles.length === 1) {
        const singleDocUpload = await uploadFileToIPFS(docFiles[0]);
        if (!singleDocUpload?.success || !singleDocUpload?.data?.url) {
          throw new Error(
            singleDocUpload?.error ||
              'Failed to upload supporting document to IPFS.'
          );
        }

        uploadedDocuments = [
          {
            name:
              singleDocUpload.data?.name ||
              docFiles[0]?.name ||
              'supporting-document',
            cid: singleDocUpload.data?.cid,
            url: singleDocUpload.data?.url,
            size: singleDocUpload.data?.size,
            type: docFiles[0]?.type,
          },
        ];
      } else if (docFiles.length > 1) {
        const multiDocUpload = await uploadMultipleFilesToIPFS(docFiles);
        if (!multiDocUpload?.success) {
          throw new Error(
            multiDocUpload?.error || 'Failed to upload supporting documents.'
          );
        }

        const responseFiles = multiDocUpload.data?.files || [];
        uploadedDocuments = responseFiles
          .map((file, index) => ({
            name:
              file?.name || docFiles[index]?.name || `document-${index + 1}`,
            cid: file?.cid,
            url: file?.url,
            size: file?.size,
            type: docFiles[index]?.type,
          }))
          .filter(doc => doc?.url);

        if (uploadedDocuments.length !== docFiles.length) {
          throw new Error('Failed to retrieve IPFS URLs for all documents.');
        }
      }

      const documentUrls = uploadedDocuments.map(doc => doc.url);

      const location = parseLocationInput(formData.location);
      const propertyType = normalizeAssetType(formData.assetType);
      const category = deriveCategoryFromType(formData.assetType);

      const features = sanitizeObject({
        custodian: formData.custodian,
        appraisalDate: formData.appraisalDate,
        fractions: fractionsValue,
      });

      const payload = sanitizeObject({
        ownerHederaAccount: accountId,
        propertyName: formData.name,
        collectionName: `${formData.name || 'Asset'} Collection`,
        collectionSymbol: deriveSymbol(formData.name),
        propertyType,
        category,
        address: location.address,
        city: location.city,
        state: location.state,
        country: location.country || 'Nigeria',
        zipCode: location.zip,
        totalValue: valuationValue,
        tokenPrice: tokenPrice ?? valuationValue ?? 0,
        totalSupply: fractionsValue,
        expectedAnnualReturn: parseNumeric(formData.expectedAnnualReturn),
        rentalYield: parseNumeric(formData.rentalYield),
        distributionFrequency: formData.distributionFrequency,
        description: formData.description,
        features,
        amenities: [],
        images: imageUrls,
        documents: documentUrls,
        royaltyPercentage: 5,
      });

      const response = await onMint(payload);

      if (response?.success === false) {
        // Parent already handled notification; nothing else to do
        return;
      }

      setFormData(INITIAL_FORM_DATA);
      setImageFile(null);
      setImagePreview('');
      setDocFiles([]);
    } catch (error) {
      console.error('Error preparing mint payload:', error);
      showNotification({
        type: 'error',
        title: 'Tokenization failed',
        message:
          error?.message ||
          'An unexpected error occurred while preparing your asset. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mint-form-container">
      <h2>Tokenize Your Asset</h2>
      <form onSubmit={handleSubmit} className="mint-form">
        <div className="form-group">
          <label>Asset name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Enter asset name"
          />
        </div>

        <div className="form-group">
          <label>Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="Describe the asset"
            rows="3"
          />
        </div>

        {/* Image upload - drag & drop */}
        <div className="form-group">
          <label>Asset image</label>
          <div
            className={`dropzone ${imageDrag ? 'dragover' : ''}`}
            onDragOver={e => {
              e.preventDefault();
              setImageDrag(true);
            }}
            onDragLeave={() => setImageDrag(false)}
            onDrop={e => {
              e.preventDefault();
              setImageDrag(false);
              const file = e.dataTransfer.files?.[0];
              if (file) onSelectImage(file);
            }}
            onClick={() => document.getElementById('assetImageInput').click()}
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="preview"
                className="dropzone-preview"
              />
            ) : (
              <span>Drag & drop an image here, or click to select</span>
            )}
          </div>
          <input
            id="assetImageInput"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={e => onSelectImage(e.target.files?.[0])}
          />
          <small className="hint">
            You can also paste a URL below if preferred.
          </small>
          <input
            type="text"
            name="image"
            value={formData.image}
            onChange={handleChange}
            placeholder="https://image.url (optional if you uploaded above)"
          />
        </div>

        {/* Asset details */}
        <div className="form-row">
          <div className="form-group">
            <label>Asset type</label>
            <select
              name="assetType"
              value={formData.assetType}
              onChange={handleChange}
            >
              <option>Real Estate</option>
              <option>Commodities</option>
              <option>Fine Art</option>
              <option>Vehicle</option>
              <option>Equipment</option>
              <option>Natural Resources</option>
              <option>Infrastructure</option>
              <option>Energy</option>
            </select>
          </div>
          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="City, Country"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Valuation (currency)</label>
            <input
              type="text"
              name="valuation"
              value={formData.valuation}
              onChange={handleChange}
              placeholder="e.g. ₦25,000,000"
            />
          </div>
          <div className="form-group">
            <label>Appraisal date</label>
            <input
              type="date"
              name="appraisalDate"
              value={formData.appraisalDate}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Expected annual return (%)</label>
            <input
              type="number"
              name="expectedAnnualReturn"
              value={formData.expectedAnnualReturn}
              onChange={handleChange}
              min="0"
              step="0.1"
              placeholder="e.g. 10"
            />
          </div>
          <div className="form-group">
            <label>Rental yield (%)</label>
            <input
              type="number"
              name="rentalYield"
              value={formData.rentalYield}
              onChange={handleChange}
              min="0"
              step="0.1"
              placeholder="e.g. 6"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Custodian / Holder</label>
            <input
              type="text"
              name="custodian"
              value={formData.custodian}
              onChange={handleChange}
              placeholder="Who holds the asset in custody?"
            />
          </div>
          <div className="form-group">
            <label>Fractions to mint</label>
            <input
              type="number"
              name="fractions"
              value={formData.fractions}
              onChange={handleChange}
              min="1"
              placeholder="e.g. 1000"
            />
          </div>
          <div className="form-group">
            <label>Distribution frequency</label>
            <select
              name="distributionFrequency"
              value={formData.distributionFrequency}
              onChange={handleChange}
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="semiannual">Semiannual</option>
              <option value="annual">Annual</option>
            </select>
          </div>
        </div>

        {/* Documents upload */}
        <div className="form-group">
          <label>Supporting documents (optional)</label>
          <div
            className={`dropzone ${docDrag ? 'dragover' : ''}`}
            onDragOver={e => {
              e.preventDefault();
              setDocDrag(true);
            }}
            onDragLeave={() => setDocDrag(false)}
            onDrop={e => {
              e.preventDefault();
              setDocDrag(false);
              onSelectDocs(e.dataTransfer.files);
            }}
            onClick={() => document.getElementById('docInput').click()}
          >
            {docFiles.length ? (
              <span>
                {docFiles.length} file(s) selected
                {selectedDocNames ? `: ${selectedDocNames}` : ''}
              </span>
            ) : (
              <span>Drag & drop PDFs or images here, or click to select</span>
            )}
          </div>
          <input
            id="docInput"
            type="file"
            accept="application/pdf,image/*"
            multiple
            style={{ display: 'none' }}
            onChange={e => onSelectDocs(e.target.files)}
          />
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Tokenizing...' : 'Tokenize asset'}
        </button>
      </form>
    </div>
  );
};

export default MintForm;
