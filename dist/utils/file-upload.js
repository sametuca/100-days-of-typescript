"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileUtil = exports.uploadMultipleAttachments = exports.uploadAttachment = exports.uploadAvatar = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const errors_1 = require("./errors");
const UPLOAD_DIR = path_1.default.join(__dirname, '../../uploads');
const AVATARS_DIR = path_1.default.join(UPLOAD_DIR, 'avatars');
const ATTACHMENTS_DIR = path_1.default.join(UPLOAD_DIR, 'attachments');
[UPLOAD_DIR, AVATARS_DIR, ATTACHMENTS_DIR].forEach(dir => {
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
});
const storage = multer_1.default.diskStorage({
    destination: (req, _file, cb) => {
        const uploadType = req.path.includes('avatar') ? 'avatars' : 'attachments';
        const destPath = uploadType === 'avatars' ? AVATARS_DIR : ATTACHMENTS_DIR;
        cb(null, destPath);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path_1.default.extname(file.originalname);
        const name = path_1.default.basename(file.originalname, ext);
        cb(null, `${name}-${uniqueSuffix}${ext}`);
    }
});
const fileFilter = (req, file, cb) => {
    const allowedMimes = {
        image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    };
    const isAvatar = req.path.includes('avatar');
    if (isAvatar) {
        if (allowedMimes.image.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new errors_1.ValidationError('Sadece resim dosyaları yüklenebilir (JPEG, PNG, GIF, WEBP)', undefined, 'INVALID_FILE_TYPE'));
        }
    }
    else {
        const allAllowedTypes = [...allowedMimes.image, ...allowedMimes.document];
        if (allAllowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new errors_1.ValidationError('Geçersiz dosya tipi', undefined, 'INVALID_FILE_TYPE'));
        }
    }
};
exports.uploadAvatar = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
}).single('avatar');
exports.uploadAttachment = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
}).single('file');
exports.uploadMultipleAttachments = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
}).array('files', 5);
class FileUtil {
    static deleteFile(filePath) {
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
        }
    }
    static getFileUrl(req, filename, type) {
        const protocol = req.protocol;
        const host = req.get('host');
        return `${protocol}://${host}/uploads/${type}s/${filename}`;
    }
    static getFilePath(filename, type) {
        return type === 'avatar'
            ? path_1.default.join(AVATARS_DIR, filename)
            : path_1.default.join(ATTACHMENTS_DIR, filename);
    }
}
exports.FileUtil = FileUtil;
//# sourceMappingURL=file-upload.js.map