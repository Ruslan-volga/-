import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import Gallery from './components/Gallery';
import Upload from './components/Upload';
import './styles/App.css';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('gallery');

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/photos`);
      setPhotos(response.data);
    } catch (error) {
      console.error('Error fetching photos:', error);
      toast.error('Failed to load photos');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (photoData) => {
    try {
      if (photoData && photoData.id) {
        setPhotos(prev => [photoData, ...prev]);
        toast.success('Photo uploaded successfully!');
        setActiveTab('gallery');
      } else {
        toast.error('Invalid response from server');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to process uploaded photo');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/photos/${id}`);
      setPhotos(prev => prev.filter(photo => photo.id !== id));
      toast.success('Photo deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete photo');
    }
  };

  const handleUpdateTags = (updatedPhoto) => {
    setPhotos(prev => prev.map(photo => 
      photo.id === updatedPhoto.id ? updatedPhoto : photo
    ));
    toast.success('Tags updated successfully!');
  };

  return (
    <div className="App">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="container">
        {activeTab === 'gallery' && (
          <Gallery 
            photos={photos} 
            loading={loading} 
            onDelete={handleDelete}
            onUpdateTags={handleUpdateTags}
          />
        )}
        
        {activeTab === 'upload' && (
          <Upload onUpload={handleUpload} />
        )}
      </div>

      <ToastContainer 
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}

export default App;
