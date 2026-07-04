import React, { useState } from 'react';
import { uploadToBackblaze } from '../utils/backblaze';
import { FaUpload, FaSpinner } from 'react-icons/fa';

function BackblazeUpload({ onUpload }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a photo');
      return;
    }

    try {
      setUploading(true);
      const result = await uploadToBackblaze(file, title, description);
      onUpload(result);
      setFile(null);
      setPreview(null);
      setTitle('');
      setDescription('');
      alert('Photo uploaded to Backblaze B2 successfully!');
    } catch (error) {
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload to Backblaze B2</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Select Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="file-input"
          />
          {preview && (
            <div className="preview-container">
              <img src={preview} alt="Preview" className="preview-image" />
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter photo title"
            disabled={uploading}
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter photo description"
            rows="4"
            disabled={uploading}
          />
        </div>

        <button type="submit" className="upload-btn" disabled={!file || uploading}>
          {uploading ? (
            <>
              <FaSpinner className="spinner" />
              Uploading to Backblaze...
            </>
          ) : (
            <>
              <FaUpload />
              Upload to Backblaze B2
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default BackblazeUpload;
