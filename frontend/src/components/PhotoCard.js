import React, { useState } from 'react';
import { FaTrash, FaExpand } from 'react-icons/fa';

function PhotoCard({ photo, onDelete }) {
  const [isHovered, setIsHovered] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>
      <div 
        className="photo-card"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img 
          src={`http://localhost:5000${photo.path}`} 
          alt={photo.title}
          className="photo-image"
          onClick={() => setShowModal(true)}
        />
        
        {isHovered && (
          <div className="photo-overlay">
            <button 
              className="view-btn"
              onClick={() => setShowModal(true)}
            >
              <FaExpand />
            </button>
            <button 
              className="delete-btn"
              onClick={() => onDelete(photo.id)}
            >
              <FaTrash />
            </button>
          </div>
        )}
        
        <div className="photo-info">
          <h3 className="photo-title">{photo.title}</h3>
          <p className="photo-description">{photo.description}</p>
          <span className="photo-date">{formatDate(photo.uploadedAt)}</span>
        </div>
      </div>

      {showModal && (
        <div className="modal" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img 
              src={`http://localhost:5000${photo.path}`} 
              alt={photo.title}
              className="modal-image"
            />
            <div className="modal-info">
              <h2>{photo.title}</h2>
              <p>{photo.description}</p>
              <small>Uploaded: {formatDate(photo.uploadedAt)}</small>
            </div>
            <button 
              className="modal-close"
              onClick={() => setShowModal(false)}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default PhotoCard;
