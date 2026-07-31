const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');
const AppError = require('../utils/AppError');

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const localStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const memoryStorage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new AppError('Only image files are allowed', 400), false);
};

const upload = multer({
  storage: isCloudinaryConfigured ? memoryStorage : localStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const processImages = async (req, res, next) => {
  try {
    const files = req.files
      ? Array.isArray(req.files)
        ? req.files
        : Object.values(req.files).flat()
      : req.file
        ? [req.file]
        : [];

    if (!files.length) return next();

    if (isCloudinaryConfigured) {
      const urls = [];
      for (const file of files) {
        if (file.buffer) {
          const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: 'luxewatch' },
              (err, uploaded) => (err ? reject(err) : resolve(uploaded))
            );
            stream.end(file.buffer);
          });
          urls.push(result.secure_url);
        } else if (file.filename) {
          urls.push(`/uploads/${file.filename}`);
        }
      }
      req.uploadedImages = urls;
    } else {
      req.uploadedImages = files.map((f) => `/uploads/${f.filename}`);
    }
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { upload, processImages };
