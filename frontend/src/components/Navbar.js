import React from 'react';
import { FaCamera, FaUpload, FaImages } from 'react-icons/fa';

function Navbar({ activeTab, setActiveTab }) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <FaCamera className="brand-icon" />
        <span>PhotoPortfolio</span>
      </div>
      
      <div className="navbar-menu">
        <button
          className={`nav-item ${activeTab === 'gallery' ? 'active' : ''}`}
          onClick={() => setActiveTab('gallery')}
        >
          <FaImages />
          <span>Gallery</span>
        </button>
        
        <button
          className={`nav-item ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          <FaUpload />
          <span>Upload</span>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
