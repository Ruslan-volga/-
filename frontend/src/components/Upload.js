import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaUpload, FaSpinner, FaTags, FaMapMarkerAlt, FaCalendarAlt, FaFolder } from 'react-icons/fa';
import axios from 'axios';

function Upload({ onUpload }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    category: 'other',
    location: '',
    event: ''
  });
  const [uploading, setUploading] = useState(false);

  const categories = [
    'portrait',
    'nature',
    'wedding', 
    'sport',
    'street',
    'architecture',
    'food',
    'animals',
    'other'
  ];

  const onDrop = useCallback((acceptedFiles) => {
    const uploadedFile = acceptedFiles[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(uploadedFile);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'] },
    maxSize: 10 * 1024 * 1024,
    multiple: false
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a photo');
      return;
    }

    const submitData = new FormData();
    submitData.append('photo', file);
    Object.keys(formData).forEach(key => {
      submitData.append(key, formData[key]);
    });

    try {
      setUploading(true);
      const response = await axios.post('http://localhost:5000/api/photos', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onUpload(response.data);
      setFile(null);
      setPreview(null);
      setFormData({
        title: '',
        description: '',
        tags: '',
        category: 'other',
        location: '',
        event: ''
      });
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload photo: ' + (error.response?.data?.error || error.message));
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
  };

  return (
    <div className="upload-container">
      <h2>Upload Photo</h2>
      
      <form onSubmit={handleSubmit} className="upload-form">
        <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
          <input {...getInputProps()} />
          {preview ? (
            <div className="preview-container">
              <img src={preview} alt="Preview" className="preview-image" />
              <button type="button" className="remove-file" onClick={removeFile}>Remove</button>
            </div>
          ) : (
            <div className="dropzone-content">
              <FaUpload className="upload-icon" />
              <p>Drag & drop a photo here, or click to select</p>
              <small>Supported: JPG, PNG, GIF, WebP (Max 10MB)</small>
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input type="text" id="title" name="title" value={formData.title} onChange={handleInputChange} placeholder="Enter photo title" disabled={uploading} />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} placeholder="Enter photo description" rows="3" disabled={uploading} />
        </div>

        <div className="form-group">
          <label><FaTags /> Tags (comma separated)</label>
          <input type="text" name="tags" value={formData.tags} onChange={handleInputChange} placeholder="e.g. portrait, nature, wedding" disabled={uploading} />
          <small>Separate tags with commas</small>
        </div>

        <div className="form-group">
          <label><FaFolder /> Category</label>
          <select name="category" value={formData.category} onChange={handleInputChange} disabled={uploading}>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label><FaMapMarkerAlt /> Location</label>
          <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="e.g. Paris, France" disabled={uploading} />
        </div>

        <div className="form-group">
          <label><FaCalendarAlt /> Event</label>
          <input type="text" name="event" value={formData.event} onChange={handleInputChange} placeholder="e.g. Wedding of John & Mary" disabled={uploading} />
        </div>

        <button type="submit" className="upload-btn" disabled={!file || uploading}>
          {uploading ? <><FaSpinner className="spinner" /> Uploading...</> : <><FaUpload /> Upload Photo</>}
        </button>
      </form>
    </div>
  );
}

export default Upload;
