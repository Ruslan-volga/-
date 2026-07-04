import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaUpload, FaSpinner } from 'react-icons/fa';
import axios from 'axios';

function Upload({ onUpload }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

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
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      alert('Please select a photo');
      return;
    }

    const formData = new FormData();
    formData.append('photo', file);
    formData.append('title', title || file.name);
    formData.append('description', description || '');

    try {
      setUploading(true);
      console.log('Uploading with title:', title || file.name);
      console.log('Description:', description || '');
      
      const response = await axios.post('http://localhost:5000/api/photos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Upload response:', response.data);
      
      // Передаем данные о фото в App.js
      onUpload(response.data);
      
      // Сбрасываем форму
      setFile(null);
      setPreview(null);
      setTitle('');
      setDescription('');
      
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
        <div 
          {...getRootProps()} 
          className={`dropzone ${isDragActive ? 'active' : ''}`}
        >
          <input {...getInputProps()} />
          {preview ? (
            <div className="preview-container">
              <img src={preview} alt="Preview" className="preview-image" />
              <button 
                type="button" 
                className="remove-file"
                onClick={removeFile}
              >
                Remove
              </button>
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
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter photo title"
            disabled={uploading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter photo description"
            rows="4"
            disabled={uploading}
          />
        </div>

        <button 
          type="submit" 
          className="upload-btn"
          disabled={!file || uploading}
        >
          {uploading ? (
            <>
              <FaSpinner className="spinner" />
              Uploading...
            </>
          ) : (
            <>
              <FaUpload />
              Upload Photo
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default Upload;
