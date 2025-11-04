import React, { useState, useMemo } from 'react';
import PropertyTable from './PropertyTable';
import PropertyGridCard from './PropertyGridCard';
import '../styles/PropertiesPage.css';

const PropertiesPage = ({
  properties = [],
  onList,
  onBuy,
  onView,
  title = 'Properties',
  tabs = [
    { key: 'overview', label: 'Overview', count: null },
    { key: 'needs_review', label: 'Needs review', count: null },
    { key: 'ready_to_sync', label: 'Ready to sync', count: null },
    { key: 'waiting', label: 'Waiting for cardholder', count: null },
  ],
  defaultTab = 'overview',
  showViewToggle = true,
  showSearch = true,
  showSettings = true,
  emptyMessage = 'No properties found.',
  tabFilterFunction = null, // Function to filter properties by tab: (properties, tabKey) => filteredProperties
  defaultViewMode = 'table', // 'table' or 'grid'
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [viewMode, setViewMode] = useState(defaultViewMode);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter properties based on active tab
  const filteredByTab = useMemo(() => {
    if (tabFilterFunction && typeof tabFilterFunction === 'function') {
      return tabFilterFunction(properties, activeTab);
    }
    
    // Default filtering logic
    if (activeTab === 'overview') {
      return properties;
    } else if (activeTab === 'ready_to_sync') {
      return properties.filter(p => p.isListed === true);
    } else if (activeTab === 'needs_review') {
      // Properties that might need review (e.g., missing required fields)
      return properties.filter(p => {
        const hasName = p?.name || p?.propertyName;
        const hasPrice = p?.price || p?.pricePerNFT;
        const hasImages = Array.isArray(p?.images) && p.images.length > 0;
        return !hasName || !hasPrice || !hasImages;
      });
    } else if (activeTab === 'waiting') {
      // Properties waiting for cardholder action
      return properties.filter(p => p.isListed === false && (p.quantity > 0));
    }
    return properties;
  }, [properties, activeTab, tabFilterFunction]);

  // Filter by search query
  const filteredProperties = useMemo(() => {
    if (!searchQuery.trim()) {
      return filteredByTab;
    }
    const query = searchQuery.toLowerCase();
    return filteredByTab.filter(property => {
      const name = (property?.name || property?.propertyName || '').toLowerCase();
      const description = (property?.description || property?.property?.description || '').toLowerCase();
      const location = (property?.property?.city || property?.property?.address || '').toLowerCase();
      const category = (property?.property?.category || property?.property?.propertyType || '').toLowerCase();
      return name.includes(query) || 
             description.includes(query) || 
             location.includes(query) || 
             category.includes(query);
    });
  }, [filteredByTab, searchQuery]);

  // Calculate tab counts based on filtered properties for each tab
  const tabsWithCounts = useMemo(() => {
    return tabs.map(tab => {
      let count = tab.count;
      if (count === null) {
        // Calculate count for this tab
        if (tabFilterFunction && typeof tabFilterFunction === 'function') {
          const filtered = tabFilterFunction(properties, tab.key);
          count = filtered.length;
        } else {
          // Use default logic
          if (tab.key === 'overview') {
            count = properties.length;
          } else if (tab.key === 'ready_to_sync') {
            count = properties.filter(p => p.isListed === true).length;
          } else if (tab.key === 'needs_review') {
            count = properties.filter(p => {
              const hasName = p?.name || p?.propertyName;
              const hasPrice = p?.price || p?.pricePerNFT;
              const hasImages = Array.isArray(p?.images) && p.images.length > 0;
              return !hasName || !hasPrice || !hasImages;
            }).length;
          } else if (tab.key === 'waiting') {
            count = properties.filter(p => p.isListed === false && (p.quantity > 0)).length;
          } else {
            count = properties.length;
          }
        }
      }
      return {
        ...tab,
        count,
      };
    });
  }, [tabs, properties, tabFilterFunction]);

  const handleSelectRow = (index, checked) => {
    if (checked) {
      setSelectedRows(prev => [...prev, index]);
    } else {
      setSelectedRows(prev => prev.filter(i => i !== index));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(filteredProperties.map((_, index) => index));
    } else {
      setSelectedRows([]);
    }
  };

  const handleView = (property) => {
    if (onView) {
      onView(property);
    } else {
      const params = new URLSearchParams({ tokenId: property.tokenId });
      const serialNumber = property.serialNumber ?? property.serialNumbers?.[0];
      if (serialNumber !== undefined && serialNumber !== null) {
        params.set('serialNumber', serialNumber);
      }
      window.location.hash = `#/asset?${params.toString()}`;
    }
  };

  return (
    <div className="properties-page">
      <div className="properties-page-header">
        <div className="properties-page-title-section">
          <h1 className="properties-page-title">
            {title}
            {filteredProperties.length > 0 && (
              <span className="properties-page-count"> {filteredProperties.length}</span>
            )}
          </h1>
        </div>
        <div className="properties-page-actions">
          {showSettings && (
            <button className="properties-page-settings-btn">Settings</button>
          )}
          {selectedRows.length > 0 && (
            <button className="properties-page-sync-btn">
              Sync all {selectedRows.length}
            </button>
          )}
        </div>
      </div>

      <div className="properties-page-tabs">
        {tabsWithCounts.map(tab => (
          <button
            key={tab.key}
            className={`properties-page-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            {tab.count !== null && tab.count > 0 && (
              <span className="properties-page-tab-count"> {tab.count}</span>
            )}
          </button>
        ))}
      </div>

      <div className="properties-page-toolbar">
        {showSearch && (
          <div className="properties-page-search">
            <span className="properties-page-search-icon">🔍</span>
            <input
              type="text"
              className="properties-page-search-input"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}
        <div className="properties-page-toolbar-right">
          {showViewToggle && (
            <div className="properties-page-view-toggle">
              <button
                className={`properties-page-view-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
                title="Table view"
              >
                📊
              </button>
              <button
                className={`properties-page-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid view"
              >
                ⬜
              </button>
            </div>
          )}
          {!showViewToggle && viewMode === 'grid' && (
            <div className="properties-page-view-indicator" title="Grid view">
              ⬜
            </div>
          )}
          <button className="properties-page-filter-btn" title="Filter">
            🔽
          </button>
          <button className="properties-page-sort-btn" title="Sort">
            ↕️
          </button>
          <button className="properties-page-options-btn" title="Options">
            ⋮
          </button>
        </div>
      </div>

      <div className="properties-page-content">
        {filteredProperties.length === 0 ? (
          <div className="properties-page-empty">
            <p>{emptyMessage}</p>
          </div>
        ) : viewMode === 'table' ? (
          <PropertyTable
            properties={filteredProperties}
            onList={onList}
            onBuy={onBuy}
            onView={handleView}
            selectedRows={selectedRows}
            onSelectRow={handleSelectRow}
            onSelectAll={handleSelectAll}
          />
        ) : (
          <div className="properties-page-grid">
            {filteredProperties.map((property, index) => (
              <PropertyGridCard
                key={property.id || property.tokenId || index}
                property={property}
                onList={onList}
                onBuy={onBuy}
                onView={handleView}
                showActions={true}
              />
            ))}
          </div>
        )}
      </div>

      {filteredProperties.length > 0 && (
        <div className="properties-page-footer">
          <span className="properties-page-footer-text">
            {selectedRows.length > 0
              ? `${selectedRows.length} of ${filteredProperties.length} selected`
              : `1-${filteredProperties.length} of ${filteredProperties.length} properties`}
          </span>
        </div>
      )}
    </div>
  );
};

export default PropertiesPage;

