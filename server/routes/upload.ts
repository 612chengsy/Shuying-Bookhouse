import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { UPLOADS_DIR } from '../db';

const router = Router();

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_\-]/g, '_');
    const uniqueName = `${Date.now()}-${basename}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB max
});

// Multipart file upload endpoint
router.post('/file', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    success: true,
    url: fileUrl,
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size
  });
});

// Base64 upload fallback endpoint
router.post('/base64', (req, res) => {
  const { data, filename, type } = req.body;
  if (!data) {
    return res.status(400).json({ error: 'No base64 data provided' });
  }

  try {
    const base64Data = data.replace(/^data:[^;]+;base64,/, '');
    const ext = filename ? path.extname(filename) : (type === 'audio' ? '.mp3' : '.jpg');
    const nameWithoutExt = filename ? path.basename(filename, ext).replace(/[^a-zA-Z0-9_\-]/g, '_') : 'upload';
    const safeFilename = `${Date.now()}-${nameWithoutExt}${ext}`;
    const filePath = path.join(UPLOADS_DIR, safeFilename);

    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }

    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

    const fileUrl = `/uploads/${safeFilename}`;
    res.json({
      success: true,
      url: fileUrl,
      filename: safeFilename
    });
  } catch (err: any) {
    console.error('Base64 upload failed:', err);
    res.status(500).json({ error: 'Failed to save uploaded file' });
  }
});

export default router;
