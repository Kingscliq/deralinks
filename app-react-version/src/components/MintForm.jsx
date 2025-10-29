import React, { useState } from 'react';

const MintForm = ({ onMint, accountId }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '', // fallback URL
    assetType: 'Real Estate',
    location: '',
    valuation: '',
    appraisalDate: '',
    custodian: '',
    fractions: 1000,
    expectedAnnualReturn: '10',
    rentalYield: '6',
    distributionFrequency: 'monthly',
  });

  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageDrag, setImageDrag] = useState(false);
  const [docFiles, setDocFiles] = useState([]); // optional supporting documents
  const [docDrag, setDocDrag] = useState(false);

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
    setDocFiles(prev => [...prev, ...Array.from(files)]);
  };

  const parseNumeric = value => {
    if (value === undefined || value === null || value === '') return undefined;
    const parsed = Number(String(value).replace(/[^0-9.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    if (!accountId) {
      alert('Connect your wallet before tokenizing an asset.');
      setLoading(false);
      return;
    }

    const valuationValue = parseNumeric(formData.valuation);
    const fractionsValue = Number(formData.fractions) || 0;
    const tokenPrice =
      valuationValue && fractionsValue
        ? Number((valuationValue / fractionsValue).toFixed(2))
        : undefined;

    const selectedImage =
      formData.image ||
      `https://via.placeholder.com/600x400/${Math.floor(
        Math.random() * 16777215
      ).toString(16)}/ffffff?text=${encodeURIComponent(
        formData.name || 'Asset'
      )}`;

    const payload = {
      name: formData.name,
      description: formData.description,
      image: selectedImage,
      metadata: {
        creator: accountId,
        collection: `${formData.name || 'Asset'} Collection`,
        assetType: formData.assetType,
        location: formData.location,
        appraisalDate: formData.appraisalDate,
        custodian: formData.custodian,
        fractions: fractionsValue,
        images: [selectedImage],
        totalValue: valuationValue,
        tokenPrice,
        expectedAnnualReturn: parseNumeric(formData.expectedAnnualReturn),
        rentalYield: parseNumeric(formData.rentalYield),
        distributionFrequency: formData.distributionFrequency,
      },
      attributes: {
        valuation: valuationValue,
        documentsAttached: docFiles.length,
      },
      documents: docFiles.map(file => file.name),
      royaltyFee: 5,
    };

    await onMint(payload);
    setLoading(false);

    setFormData({
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
    });
    setImageFile(null);
    setImagePreview('');
    setDocFiles([]);
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
              <span>{docFiles.length} file(s) selected</span>
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
