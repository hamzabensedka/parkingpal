import multer, { FileFilterCallback, StorageEngine } from 'multer';
import path from 'path';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env';
import { UPLOAD, HTTP_STATUS } from '../config/constants';

// Custom error for file upload
export class FileUploadError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = HTTP_STATUS.BAD_REQUEST) {
    super(message);
    this.name = 'FileUploadError';
    this.statusCode = statusCode;
  }
}

// Configure storage
const storage: StorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, env.upload.uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${uniqueId}${ext}`;
    cb(null, filename);
  },
});

// File filter for allowed types
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  // Check MIME type
  if (!(UPLOAD.ALLOWED_MIME_TYPES as readonly string[]).includes(file.mimetype)) {
    cb(new FileUploadError(`File type ${file.mimetype} is not allowed`));
    return;
  }

  // Check extension
  const ext = path.extname(file.originalname).toLowerCase();
  if (!(UPLOAD.ALLOWED_EXTENSIONS as readonly string[]).includes(ext)) {
    cb(new FileUploadError(`File extension ${ext} is not allowed`));
    return;
  }

  cb(null, true);
};

// Create multer upload instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.upload.maxFileSize,
    files: 1, // Single file upload
  },
});

/**
 * Single file upload middleware for profile photos
 */
export const uploadProfilePhoto = upload.single('profilePhoto');

/**
 * Single file upload middleware for ID documents
 */
export const uploadIdDocument = upload.single('idDocument');

/**
 * Multiple file upload middleware (e.g., for spot photos)
 * Max 10 photos
 */
export const uploadMultiplePhotos = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.upload.maxFileSize,
    files: 10,
  },
}).array('photos', 10);

/**
 * Single file upload middleware for spot ownership documents
 * Supports PDF and images, max 10MB
 */
export const uploadSpotDocument = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB for documents
    files: 1,
  },
}).single('document');

/**
 * Handle multer errors
 */
export const handleMulterError = (
  err: Error,
  req: Request,
  res: any,
  next: any
): void => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: `File too large. Maximum size is ${env.upload.maxFileSize / (1024 * 1024)}MB`,
      });
      return;
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Too many files uploaded',
      });
      return;
    }
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: err.message,
    });
    return;
  }

  if (err instanceof FileUploadError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
    return;
  }

  next(err);
};

/**
 * Get the URL for an uploaded file
 */
export const getFileUrl = (filename: string): string => {
  return `${env.apiUrl}/uploads/${filename}`;
};
