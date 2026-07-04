const express = require('express');
const router = express.Router();
const { s3GeneratePresignedUrl } = require('upup-react-file-uploader/server');
require('dotenv').config();

// Эндпоинт для получения подписанной ссылки на загрузку
router.post('/upload-token', async (req, res) => {
  try {
    // Проверка аутентификации (если есть)
    // const userId = req.user.id;
    
    const presignedData = await s3GeneratePresignedUrl({
      provider: 'AWS',
      bucketName: process.env.BACKBLAZE_BUCKET_NAME,
      s3ClientConfig: {
        region: process.env.BACKBLAZE_BUCKET_REGION || 'us-west-004',
        credentials: {
          accessKeyId: process.env.BACKBLAZE_KEY_ID,
          secretAccessKey: process.env.BACKBLAZE_APP_KEY,
        },
        endpoint: process.env.BACKBLAZE_S3_ENDPOINT || 'https://s3.us-west-004.backblazeb2.com',
        forcePathStyle: false,
      },
      // Опционально: ограничения для файла
      // expiresIn: 3600, // время жизни ссылки в секундах
      // conditions: [
      //   ['content-length-range', 0, 10 * 1024 * 1024], // макс 10MB
      //   ['starts-with', '$Content-Type', 'image/'],
      // ],
    });

    res.json(presignedData);
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    res.status(500).json({ error: 'Failed to generate upload token' });
  }
});

module.exports = router;
