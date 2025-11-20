"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("../services/user.service");
const error_middleware_1 = require("../middleware/error.middleware");
const logger_1 = __importDefault(require("../utils/logger"));
const errors_1 = require("../utils/errors");
const file_upload_1 = require("../utils/file-upload");
class UserController {
}
exports.UserController = UserController;
_a = UserController;
UserController.listUsers = (0, error_middleware_1.catchAsync)(async (req, res) => {
    const { role, isActive, search, page, limit } = req.query;
    const filters = {};
    if (role)
        filters.role = role;
    if (isActive !== undefined)
        filters.isActive = isActive === 'true';
    if (search)
        filters.search = search;
    const pageNum = page ? parseInt(page, 10) : undefined;
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    const result = await user_service_1.UserService.listUsers(pageNum, limitNum, filters);
    res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
    });
});
UserController.getProfile = (0, error_middleware_1.catchAsync)(async (req, res) => {
    const userId = req.user.userId;
    const user = await user_service_1.UserService.getProfile(userId);
    res.status(200).json({
        success: true,
        data: { user }
    });
});
UserController.updateProfile = (0, error_middleware_1.catchAsync)(async (req, res) => {
    const userId = req.user.userId;
    const updateData = req.body;
    const user = await user_service_1.UserService.updateProfile(userId, updateData);
    logger_1.default.info(`Profile updated for user: ${userId}`);
    res.status(200).json({
        success: true,
        message: 'Profil güncellendi',
        data: { user }
    });
});
UserController.changePassword = (0, error_middleware_1.catchAsync)(async (req, res) => {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;
    await user_service_1.UserService.changePassword(userId, { currentPassword, newPassword });
    logger_1.default.info(`Password changed for user: ${userId}`);
    res.status(200).json({
        success: true,
        message: 'Şifre değiştirildi'
    });
});
UserController.deleteAccount = (0, error_middleware_1.catchAsync)(async (req, res) => {
    const userId = req.user.userId;
    const { password } = req.body;
    await user_service_1.UserService.deleteAccount(userId, password);
    logger_1.default.info(`Account deleted: ${userId}`);
    res.status(200).json({
        success: true,
        message: 'Hesap silindi'
    });
});
UserController.uploadAvatar = (0, error_middleware_1.catchAsync)(async (req, res) => {
    const userId = req.user.userId;
    if (!req.file) {
        throw new errors_1.ValidationError('Dosya yüklenmedi', undefined, 'NO_FILE');
    }
    const user = await user_service_1.UserService.uploadAvatar(userId, req.file);
    const avatarUrl = file_upload_1.FileUtil.getFileUrl(req, user.avatar, 'avatar');
    res.status(200).json({
        success: true,
        message: 'Avatar yüklendi',
        data: {
            user: {
                ...user,
                avatarUrl
            }
        }
    });
});
UserController.deleteAvatar = (0, error_middleware_1.catchAsync)(async (req, res) => {
    const userId = req.user.userId;
    await user_service_1.UserService.deleteAvatar(userId);
    res.status(200).json({
        success: true,
        message: 'Avatar silindi'
    });
});
//# sourceMappingURL=user.controller.js.map