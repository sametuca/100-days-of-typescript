import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { ValidationError } from './errors';

const UPLOAD_DIR = path.join(__dirname, '../../uploads');
const AVATARS_DIR = path.join(UPLOAD_DIR, 'avatars');
const ATTACHMENTS_DIR = path.join(UPLOAD_DIR, 'attachments');

[UPLOAD_DIR, AVATARS_DIR, ATTACHMENTS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req: Request, _file: Express.Multer.File, cb) => {
    const uploadType = req.path.includes('avatar') ? 'avatars' : 'attachments';
    const destPath = uploadType === 'avatars' ? AVATARS_DIR : ATTACHMENTS_DIR;
    cb(null, destPath);
  },
  filename: (_req: Request, file: Express.Multer.File, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  };

  const isAvatar = req.path.includes('avatar');
  
  if (isAvatar) {
    if (allowedMimes.image.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new ValidationError('Sadece resim dosyaları yüklenebilir (JPEG, PNG, GIF, WEBP)', undefined, 'INVALID_FILE_TYPE'));
    }
  } else {
    const allAllowedTypes = [...allowedMimes.image, ...allowedMimes.document];
    if (allAllowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new ValidationError('Geçersiz dosya tipi', undefined, 'INVALID_FILE_TYPE'));
    }
  }
};

export const uploadAvatar = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
}).single('avatar');

export const uploadAttachment = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
}).single('file');

export const uploadMultipleAttachments = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
}).array('files', 5);

export class FileUtil {
  
  public static deleteFile(filePath: string): void {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  public static getFileUrl(req: Request, filename: string, type: 'avatar' | 'attachment'): string {
    const protocol = req.protocol;
    const host = req.get('host');
    return `${protocol}://${host}/uploads/${type}s/${filename}`;
  }

  public static getFilePath(filename: string, type: 'avatar' | 'attachment'): string {
    return type === 'avatar' 
      ? path.join(AVATARS_DIR, filename)
      : path.join(ATTACHMENTS_DIR, filename);
  }
}