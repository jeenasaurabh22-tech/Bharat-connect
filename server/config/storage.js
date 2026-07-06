import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import fs from 'fs';
import path from 'path';
import logger from './logger.js';
import dotenv from 'dotenv';
dotenv.config();
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
let storage;
let isCloudinaryActive = false;
const hasCloudinaryConfig =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloudinary_cloud_name' &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;
if (hasCloudinaryConfig) {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    storage = new CloudinaryStorage({
      cloudinary,
      params: {
        folder: 'bharatconnect_documents',
        allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
        resource_type: 'auto',
      },
    });
    isCloudinaryActive = true;
    logger.info('Storage Config: Cloudinary storage active.');
  } catch (error) {
    logger.error(`Storage Config: Failed to initialize Cloudinary storage, falling back to local storage: ${error.message}`);
  }
}
if (!isCloudinaryActive) {
  logger.info('Storage Config: Local disk storage active (uploads folder).');
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  });
}
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images (jpg, jpeg, png) and PDF documents are allowed'));
  },
});
export { upload, cloudinary, isCloudinaryActive };
export default upload;