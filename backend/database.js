const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'photos.db');

// Создаем подключение к базе данных
const db = new sqlite3.Database(DB_PATH);

// Создаем таблицу для фото
db.run(`
  CREATE TABLE IF NOT EXISTS photos (
    id TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    originalName TEXT NOT NULL,
    path TEXT NOT NULL,
    title TEXT,
    description TEXT,
    uploadedAt TEXT,
    size INTEGER,
    mimetype TEXT
  )
`, (err) => {
  if (err) {
    console.error('Error creating table:', err);
  } else {
    console.log('✅ Database initialized');
  }
});

module.exports = db;
