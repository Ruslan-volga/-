import React, { useState, useMemo } from 'react';
import { FaImages, FaSpinner, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import PhotoCard from './PhotoCard';
import AdvancedFilter from './AdvancedFilter';

function Gallery({ photos, loading, onDelete, onUpdateTags }) {
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');

  // Фильтрация фото
  const filteredPhotos = useMemo(() => {
    let result = photos;

    // Применяем фильтры
    Object.entries(filters).forEach(([key, values]) => {
      if (values && values.length > 0) {
        result = result.filter(photo => {
          if (key === 'categories') return values.includes(photo.category);
          if (key === 'tags') {
            if (!photo.tags || photo.tags.length === 0) return false;
            return values.some(tag => photo.tags.includes(tag));
          }
          if (key === 'locations') return values.includes(photo.location);
          if (key === 'events') return values.includes(photo.event);
          if (key === 'years') {
            if (!photo.uploadedAt) return false;
            const year = new Date(photo.uploadedAt).getFullYear();
            return values.includes(year);
          }
          if (key === 'months') {
            if (!photo.uploadedAt) return false;
            const month = new Date(photo.uploadedAt).toISOString().slice(0, 7);
            return values.includes(month);
          }
          return true;
        });
      }
    });

    // Сортировка
    switch(sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.uploadedAt) - new Date(b.uploadedAt));
        break;
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'size':
        result.sort((a, b) => (b.size || 0) - (a.size || 0));
        break;
      default:
        break;
    }

    return result;
  }, [photos, filters, sortBy]);

  const getActiveFiltersCount = () => {
    let count = 0;
    Object.values(filters).forEach(arr => { if (arr) count += arr.length; });
    return count;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <FaSpinner className="spinner" />
        <p>Loading photos...</p>
      </div>
    );
  }

  return (
    <div className="gallery">
      <div className="gallery-header">
        <div className="gallery-title">
          <h2>📸 Photo Gallery</h2>
          <span className="photo-count">{filteredPhotos.length} photos</span>
          {getActiveFiltersCount() > 0 && (
            <span className="filter-badge">🔍 {getActiveFiltersCount()} filters active</span>
          )}
        </div>
        
        <div className="gallery-controls">
          <div className="sort-controls">
            <label>
              <FaSortAmountDown /> Sort:
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="title">Title</option>
                <option value="size">Size</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      <AdvancedFilter filters={filters} setFilters={setFilters} />

      {filteredPhotos.length === 0 ? (
        <div className="empty-state">
          <FaImages className="empty-icon" />
          <h2>No Photos Found</h2>
          <p>
            {getActiveFiltersCount() > 0 
              ? 'No photos match the selected filters' 
              : 'Upload your first photo to get started!'}
          </p>
        </div>
      ) : (
        <div className="photo-grid">
          {filteredPhotos.map(photo => (
            <PhotoCard 
              key={photo.id} 
              photo={photo} 
              onDelete={onDelete}
              onUpdateTags={onUpdateTags}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Gallery;
