import React, { useState, useEffect } from 'react';
import { FaTimes, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import axios from 'axios';

function AdvancedFilter({ filters, setFilters }) {
  const [allFilters, setAllFilters] = useState({ tags: [], categories: [], locations: [], events: [], years: [], months: [] });
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [activeFilters, setActiveFilters] = useState({});

  useEffect(() => {
    fetchFilters();
  }, []);

  const fetchFilters = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/filters');
      setAllFilters(response.data);
      // Инициализируем активные фильтры из props
      setActiveFilters(filters);
    } catch (error) {
      console.error('Error fetching filters:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleFilter = (section, value) => {
    const current = activeFilters[section] || [];
    const newValues = current.includes(value) 
      ? current.filter(v => v !== value) 
      : [...current, value];
    
    const newFilters = { ...activeFilters, [section]: newValues };
    setActiveFilters(newFilters);
    setFilters(newFilters);
  };

  const clearSection = (section) => {
    const newFilters = { ...activeFilters, [section]: [] };
    setActiveFilters(newFilters);
    setFilters(newFilters);
  };

  const clearAll = () => {
    const empty = {};
    Object.keys(activeFilters).forEach(key => { empty[key] = []; });
    setActiveFilters(empty);
    setFilters(empty);
  };

  const getActiveCount = () => {
    let count = 0;
    Object.values(activeFilters).forEach(arr => { count += arr.length; });
    return count;
  };

  const filterSections = [
    { key: 'categories', label: '📁 Categories', icon: '📁' },
    { key: 'tags', label: '🏷️ Tags', icon: '🏷️' },
    { key: 'locations', label: '📍 Locations', icon: '📍' },
    { key: 'events', label: '🎪 Events', icon: '🎪' },
    { key: 'years', label: '📅 Years', icon: '📅' },
    { key: 'months', label: '🗓️ Months', icon: '🗓️' }
  ];

  if (loading) {
    return <div className="filter-loading">Loading filters...</div>;
  }

  const totalFilters = Object.values(allFilters).reduce((sum, arr) => sum + arr.length, 0);

  if (totalFilters === 0) {
    return <div className="filter-empty">No filters available. Upload some photos first!</div>;
  }

  return (
    <div className="advanced-filter">
      <div className="filter-header">
        <h3>🔍 Advanced Filters</h3>
        <div className="filter-actions">
          <span className="filter-count">{getActiveCount()} active filters</span>
          {getActiveCount() > 0 && (
            <button className="clear-all-btn" onClick={clearAll}>
              <FaTimes /> Clear All
            </button>
          )}
        </div>
      </div>

      <div className="filter-sections">
        {filterSections.map(section => {
          const items = allFilters[section.key] || [];
          if (items.length === 0) return null;
          
          const selected = activeFilters[section.key] || [];
          const isExpanded = expanded[section.key] || false;

          return (
            <div key={section.key} className="filter-section">
              <div className="filter-section-header" onClick={() => toggleSection(section.key)}>
                <span>{section.label}</span>
                <div className="section-controls">
                  {selected.length > 0 && (
                    <span className="selected-count">{selected.length} selected</span>
                  )}
                  <button 
                    className="clear-section-btn" 
                    onClick={(e) => { e.stopPropagation(); clearSection(section.key); }}
                  >
                    <FaTimes size={12} />
                  </button>
                  {isExpanded ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
                </div>
              </div>
              
              {isExpanded && (
                <div className="filter-items">
                  {items.map(item => (
                    <button
                      key={item}
                      className={`filter-item ${selected.includes(item) ? 'active' : ''}`}
                      onClick={() => toggleFilter(section.key, item)}
                    >
                      {item}
                      {selected.includes(item) && <FaTimes className="remove-icon" size={10} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AdvancedFilter;
