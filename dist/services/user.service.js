"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_repository_1 = require("../repositories/user.repository");
const password_1 = require("../utils/password");
const errors_1 = require("../utils/errors");
const logger_1 = __importDefault(require("../utils/logger"));
const pagination_1 = require("../utils/pagination");
const file_upload_1 = require("../utils/file-upload");
const email_service_1 = require("./email.service");
class UserService {
    static async getProfile(userId) {
        const user = await user_repository_1.userRepository.findById(userId);
        if (!user) {
            throw new errors_1.NotFoundError('Kullanıcı bulunamadı', 'USER_NOT_FOUND');
        }
        const { passwordHash, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    static async updateProfile(userId, data) {
        const user = await user_repository_1.userRepository.findById(userId);
        if (!user) {
            throw new errors_1.NotFoundError('Kullanıcı bulunamadı', 'USER_NOT_FOUND');
        }
        if (data.email && data.email !== user.email) {
            const emailExists = await user_repository_1.userRepository.emailExists(data.email);
            if (emailExists) {
                throw new errors_1.ConflictError('Bu email adresi zaten kullanılıyor', 'EMAIL_EXISTS');
            }
        }
        if (data.username && data.username !== user.username) {
            const usernameExists = await user_repository_1.userRepository.usernameExists(data.username);
            if (usernameExists) {
                throw new errors_1.ConflictError('Bu kullanıcı adı zaten kullanılıyor', 'USERNAME_EXISTS');
            }
        }
        const updatedUser = await user_repository_1.userRepository.update(userId, data);
        if (!updatedUser) {
            throw new errors_1.NotFoundError('Kullanıcı güncellenemedi', 'UPDATE_FAILED');
        }
        logger_1.default.info(`User profile updated: ${userId}`);
        const { passwordHash, ...userWithoutPassword } = updatedUser;
        return userWithoutPassword;
    }
    static async changePassword(userId, data) {
        const user = await user_repository_1.userRepository.findById(userId);
        if (!user) {
            throw new errors_1.NotFoundError('Kullanıcı bulunamadı', 'USER_NOT_FOUND');
        }
        const isCurrentPasswordValid = await password_1.PasswordUtil.compare(data.currentPassword, user.passwordHash);
        if (!isCurrentPasswordValid) {
            throw new errors_1.ValidationError('Mevcut şifre hatalı', undefined, 'INVALID_PASSWORD');
        }
        if (data.currentPassword === data.newPassword) {
            throw new errors_1.ValidationError('Yeni şifre eski şifre ile aynı olamaz', undefined, 'SAME_PASSWORD');
        }
        const passwordValidation = password_1.PasswordUtil.validate(data.newPassword);
        if (!passwordValidation.valid) {
            throw new errors_1.ValidationError('Şifre gereksinimleri karşılanmıyor', passwordValidation.errors, 'WEAK_PASSWORD');
        }
        const newPasswordHash = await password_1.PasswordUtil.hash(data.newPassword);
        await user_repository_1.userRepository.updatePassword(userId, newPasswordHash);
        logger_1.default.info(`Password changed for user: ${userId}`);
        email_service_1.emailService.sendPasswordChangedEmail(user.email, user.firstName || user.username).catch(err => logger_1.default.error('Password changed email failed:', err));
    }
    static async deleteAccount(userId, password) {
        const user = await user_repository_1.userRepository.findById(userId);
        if (!user) {
            throw new errors_1.NotFoundError('Kullanıcı bulunamadı', 'USER_NOT_FOUND');
        }
        const isPasswordValid = await password_1.PasswordUtil.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new errors_1.ValidationError('Şifre hatalı', undefined, 'INVALID_PASSWORD');
        }
        await user_repository_1.userRepository.delete(userId);
        logger_1.default.info(`User account deleted: ${userId}`);
    }
    static async listUsers(page, limit, filters) {
        const validatedParams = pagination_1.PaginationUtil.validateParams({ page, limit });
        const { users, total } = await user_repository_1.userRepository.findAllPaginated(validatedParams.page, validatedParams.limit, filters);
        const usersWithoutPassword = users.map(user => {
            const { passwordHash, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
        const paginationMeta = pagination_1.PaginationUtil.createMeta(validatedParams.page, validatedParams.limit, total);
        return {
            data: usersWithoutPassword,
            pagination: paginationMeta
        };
    }
    static async uploadAvatar(userId, file) {
        const user = await user_repository_1.userRepository.findById(userId);
        if (!user) {
            throw new errors_1.NotFoundError('Kullanıcı bulunamadı', 'USER_NOT_FOUND');
        }
        if (user.avatar) {
            const oldAvatarPath = file_upload_1.FileUtil.getFilePath(user.avatar, 'avatar');
            file_upload_1.FileUtil.deleteFile(oldAvatarPath);
        }
        const updatedUser = await user_repository_1.userRepository.update(userId, {
            avatar: file.filename
        });
        if (!updatedUser) {
            throw new errors_1.NotFoundError('Avatar güncellenemedi', 'UPDATE_FAILED');
        }
        logger_1.default.info(`Avatar uploaded for user: ${userId}`);
        const { passwordHash, ...userWithoutPassword } = updatedUser;
        return userWithoutPassword;
    }
    static async deleteAvatar(userId) {
        const user = await user_repository_1.userRepository.findById(userId);
        if (!user) {
            throw new errors_1.NotFoundError('Kullanıcı bulunamadı', 'USER_NOT_FOUND');
        }
        if (!user.avatar) {
            throw new errors_1.ValidationError('Kullanıcının avatarı yok', undefined, 'NO_AVATAR');
        }
        const avatarPath = file_upload_1.FileUtil.getFilePath(user.avatar, 'avatar');
        file_upload_1.FileUtil.deleteFile(avatarPath);
        await user_repository_1.userRepository.update(userId, { avatar: null });
        logger_1.default.info(`Avatar deleted for user: ${userId}`);
    }
}
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map