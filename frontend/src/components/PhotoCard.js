import React, { useState } from 'react';
import { FaTrash, FaExpand, FaTags, FaEdit } from 'react-icons/fa';
import axios from 'axios';

function PhotoCard({ photo, onDelete, onUpdateTags }) {
  const [isHovered, setIsHovered] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTags, setEditingTags] = useState(false);
  const [tagsInput, setTagsInput] = useState(photo.tags?.join(', ') || '');
  const [updating, setUpdating] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleUpdateTags = async () => {
    try {
      setUpdating(true);
      const response = await axios.put(`http://localhost:5000/api/photos/${photo.id}/tags`, {
        tags: tagsInput
      });
      onUpdateTags(response.data);
      setEditingTags(false);
    } catch (error) {
      console.error('Error updating tags:', error);
      alert('Failed to update tags');
    } finally {
      setUpdating(false);
    }
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
          
          {photo.tags && photo.tags.length > 0 && (
            <div className="photo-tags">
              <FaTags className="tags-icon" />
              {photo.tags.map((tag, index) => (
                <span key={index} className="tag-item">#{tag}</span>
              ))}
              <button 
                className="edit-tags-btn"
                onClick={() => setEditingTags(true)}
              >
                <FaEdit size={12} />
              </button>
            </div>
          )}
          
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
              {photo.tags && photo.tags.length > 0 && (
                <div className="modal-tags">
                  <strong>Tags:</strong>
                  {photo.tags.map((tag, index) => (
                    <span key={index} className="tag-item">#{tag}</span>
                  ))}
                </div>
              )}
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

      {editingTags && (
        <div className="modal" onClick={() => setEditingTags(false)}>
          <div className="modal-content edit-tags-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Tags</h3>
            <div className="form-group">
              <label>Tags (comma separated)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g. portrait, nature, wedding"
                disabled={updating}
              />
            </div>
            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => setEditingTags(false)}
                disabled={updating}
              >
                Cancel
              </button>
              <button 
                className="save-btn"
                onClick={handleUpdateTags}
                disabled={updating}
              >
                {updating ? 'Saving...' : 'Save Tags'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PhotoCard;
