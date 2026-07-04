import React from 'react';
import { FaImages, FaSpinner } from 'react-icons/fa';
import PhotoCard from './PhotoCard';

function Gallery({ photos, loading, onDelete }) {
  if (loading) {
    return (
      <div className="loading-container">
        <FaSpinner className="spinner" />
        <p>Loading photos...</p>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="empty-state">
        <FaImages className="empty-icon" />
        <h2>No Photos Yet</h2>
        <p>Upload your first photo to get started!</p>
      </div>
    );
  }

  return (
    <div className="gallery">
      <div className="gallery-header">
        <h2>Photo Gallery</h2>
        <span>{photos.length} photos</span>
      </div>
      
      <div className="photo-grid">
        {photos.map(photo => (
          <PhotoCard 
            key={photo.id} 
            photo={photo} 
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}

export default Gallery;
