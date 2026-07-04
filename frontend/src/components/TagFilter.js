import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import axios from 'axios';

function TagFilter({ selectedTags, onTagToggle, onClearTags }) {
  const [allTags, setAllTags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/tags');
      setAllTags(response.data);
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="tag-filter-loading">Loading tags...</div>;
  }

  if (allTags.length === 0) {
    return <div className="tag-filter-empty">No tags yet</div>;
  }

  return (
    <div className="tag-filter">
      <div className="tag-filter-header">
        <h3>Filter by Tags</h3>
        {selectedTags.length > 0 && (
          <button className="clear-tags-btn" onClick={onClearTags}>
            <FaTimes /> Clear All
          </button>
        )}
      </div>
      <div className="tag-filter-list">
        {allTags.map(tag => (
          <button
            key={tag}
            className={`tag-filter-item ${selectedTags.includes(tag) ? 'active' : ''}`}
            onClick={() => onTagToggle(tag)}
          >
            #{tag}
            {selectedTags.includes(tag) && <FaTimes className="remove-icon" />}
          </button>
        ))}
      </div>
    </div>
  );
}

export default TagFilter;
