const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const DATA_FILE = path.join(__dirname, 'data.json');

function loadPhotos() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading photos:', error);
  }
  return [];
}

function savePhotos(photos) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(photos, null, 2));
  } catch (error) {
    console.error('Error saving photos:', error);
  }
}

let photos = loadPhotos();
console.log(`📸 Loaded ${photos.length} photos from storage`);

const uploadsDir = path.join(__dirname, 'uploads');
fs.ensureDirSync(uploadsDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: fileFilter
});

// API маршруты
app.get('/api/photos', (req, res) => {
  res.json(photos);
});

app.post('/api/photos', upload.single('photo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const tags = (req.body.tags || '').split(',').map(t => t.trim()).filter(t => t.length > 0);
    
    const photo = {
      id: uuidv4(),
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: `/uploads/${req.file.filename}`,
      title: req.body.title || 'Untitled',
      description: req.body.description || '',
      tags: tags,
      category: req.body.category || 'other',
      location: req.body.location || '',
      event: req.body.event || '',
      uploadedAt: new Date().toISOString(),
      size: req.file.size,
      mimetype: req.file.mimetype
    };

    photos.unshift(photo);
    savePhotos(photos);
    res.status(201).json(photo);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
});

app.delete('/api/photos/:id', async (req, res) => {
  try {
    const photoId = req.params.id;
    const photoIndex = photos.findIndex(p => p.id === photoId);
    
    if (photoIndex === -1) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    const photo = photos[photoIndex];
    const filePath = path.join(__dirname, photo.path);
    
    if (fs.existsSync(filePath)) {
      await fs.unlink(filePath);
    }
    
    photos.splice(photoIndex, 1);
    savePhotos(photos);
    res.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
});

app.put('/api/photos/:id', (req, res) => {
  try {
    const photoId = req.params.id;
    const photoIndex = photos.findIndex(p => p.id === photoId);
    
    if (photoIndex === -1) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    
    const updatedPhoto = {
      ...photos[photoIndex],
      ...req.body,
      tags: (req.body.tags || '').split(',').map(t => t.trim()).filter(t => t.length > 0)
    };
    
    photos[photoIndex] = updatedPhoto;
    savePhotos(photos);
    res.json(updatedPhoto);
  } catch (error) {
    console.error('Error updating photo:', error);
    res.status(500).json({ error: 'Failed to update photo' });
  }
});

// Получить все уникальные значения для фильтров
app.get('/api/filters', (req, res) => {
  const filters = {
    tags: new Set(),
    categories: new Set(),
    locations: new Set(),
    events: new Set(),
    years: new Set(),
    months: new Set()
  };
  
  photos.forEach(photo => {
    if (photo.tags) photo.tags.forEach(tag => filters.tags.add(tag));
    if (photo.category) filters.categories.add(photo.category);
    if (photo.location) filters.locations.add(photo.location);
    if (photo.event) filters.events.add(photo.event);
    
    if (photo.uploadedAt) {
      const date = new Date(photo.uploadedAt);
      filters.years.add(date.getFullYear());
      filters.months.add(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
    }
  });
  
  res.json({
    tags: [...filters.tags],
    categories: [...filters.categories],
    locations: [...filters.locations],
    events: [...filters.events],
    years: [...filters.years].sort(),
    months: [...filters.months].sort()
  });
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'FILE_TOO_LARGE') {
      return res.status(413).json({ error: 'File too large. Maximum size is 10MB' });
    }
    return res.status(400).json({ error: err.message });
  }
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📁 Uploads folder: ${uploadsDir}`);
  console.log(`📸 Photos in storage: ${photos.length}`);
});
