const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const db = require('./database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

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
  db.all('SELECT * FROM photos ORDER BY uploadedAt DESC', (err, rows) => {
    if (err) {
      console.error('Error fetching photos:', err);
      return res.status(500).json({ error: 'Failed to fetch photos' });
    }
    res.json(rows);
  });
});

app.post('/api/photos', upload.single('photo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const photo = {
      id: uuidv4(),
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: `/uploads/${req.file.filename}`,
      title: req.body.title || 'Untitled',
      description: req.body.description || '',
      uploadedAt: new Date().toISOString(),
      size: req.file.size,
      mimetype: req.file.mimetype
    };

    db.run(
      `INSERT INTO photos (id, filename, originalName, path, title, description, uploadedAt, size, mimetype)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        photo.id, photo.filename, photo.originalName, photo.path,
        photo.title, photo.description, photo.uploadedAt,
        photo.size, photo.mimetype
      ],
      (err) => {
        if (err) {
          console.error('Error saving photo:', err);
          return res.status(500).json({ error: 'Failed to save photo' });
        }
        res.status(201).json(photo);
      }
    );
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
});

app.delete('/api/photos/:id', async (req, res) => {
  const photoId = req.params.id;
  
  // Сначала получаем информацию о фото
  db.get('SELECT * FROM photos WHERE id = ?', [photoId], async (err, photo) => {
    if (err || !photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    try {
      // Удаляем файл
      const filePath = path.join(__dirname, photo.path);
      if (fs.existsSync(filePath)) {
        await fs.unlink(filePath);
      }

      // Удаляем из базы данных
      db.run('DELETE FROM photos WHERE id = ?', [photoId], (err) => {
        if (err) {
          console.error('Error deleting photo:', err);
          return res.status(500).json({ error: 'Failed to delete photo' });
        }
        res.json({ message: 'Photo deleted successfully' });
      });
    } catch (error) {
      console.error('Delete error:', error);
      res.status(500).json({ error: 'Failed to delete photo' });
    }
  });
});

app.get('/api/photos/:id', (req, res) => {
  db.get('SELECT * FROM photos WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    res.json(row);
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
  console.log(`🗄️  Database: photos.db`);
});
