"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const user_repository_1 = require("../repositories/user.repository");
const password_1 = require("../utils/password");
const errors_1 = require("../utils/errors");
const logger_1 = __importDefault(require("../utils/logger"));
const jwt_1 = require("../utils/jwt");
const refresh_token_repository_1 = require("../repositories/refresh-token.repository");
const email_service_1 = require("./email.service");
class AuthService {
    static async register(data) {
        const { email, username, password, firstName, lastName } = data;
        const emailExists = await user_repository_1.userRepository.emailExists(email);
        if (emailExists) {
            throw new errors_1.ConflictError('Bu email adresi zaten kullanılıyor', 'EMAIL_EXISTS');
        }
        const usernameExists = await user_repository_1.userRepository.usernameExists(username);
        if (usernameExists) {
            throw new errors_1.ConflictError('Bu kullanıcı adı zaten kullanılıyor', 'USERNAME_EXISTS');
        }
        const passwordValidation = password_1.PasswordUtil.validate(password);
        if (!passwordValidation.valid) {
            throw new errors_1.ValidationError('Şifre gereksinimleri karşılanmıyor', passwordValidation.errors, 'WEAK_PASSWORD');
        }
        const passwordHash = await password_1.PasswordUtil.hash(password);
        const user = await user_repository_1.userRepository.create({
            email,
            username,
            passwordHash,
            firstName,
            lastName
        });
        logger_1.default.info(`User registered: ${user.id} (${user.email})`);
        const { passwordHash: _, ...userWithoutPassword } = user;
        try {
            await email_service_1.emailService.sendWelcomeEmail(user.email, user.firstName || user.username, user.username);
        }
        catch (err) {
            logger_1.default.error('Welcome email failed:', err);
        }
        return userWithoutPassword;
    }
    static async login(email, password) {
        const user = await user_repository_1.userRepository.findByEmail(email);
        if (!user) {
            throw new errors_1.AuthenticationError('Email veya şifre hatalı', 'INVALID_CREDENTIALS');
        }
        if (!user.isActive) {
            throw new errors_1.AuthenticationError('Hesabınız aktif değil', 'ACCOUNT_INACTIVE');
        }
        const isPasswordValid = await password_1.PasswordUtil.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new errors_1.AuthenticationError('Email veya şifre hatalı', 'INVALID_CREDENTIALS');
        }
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role
        };
        const accessToken = jwt_1.JwtUtil.generateAccessToken(payload);
        const refreshToken = jwt_1.JwtUtil.generateRefreshToken(payload);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        await refresh_token_repository_1.refreshTokenRepository.create({
            userId: user.id,
            token: refreshToken,
            expiresAt
        });
        logger_1.default.info(`User logged in: ${user.id} (${user.email})`);
        const { passwordHash: _, ...userWithoutPassword } = user;
        return {
            user: userWithoutPassword,
            accessToken,
            refreshToken
        };
    }
    static async refreshToken(refreshToken) {
        const decoded = jwt_1.JwtUtil.verifyRefreshToken(refreshToken);
        const storedToken = await refresh_token_repository_1.refreshTokenRepository.findByToken(refreshToken);
        if (!storedToken) {
            throw new errors_1.AuthenticationError('Refresh token bulunamadı', 'REFRESH_TOKEN_NOT_FOUND');
        }
        if (storedToken.revoked) {
            throw new errors_1.AuthenticationError('Refresh token iptal edilmiş', 'REFRESH_TOKEN_REVOKED');
        }
        if (new Date() > storedToken.expiresAt) {
            throw new errors_1.AuthenticationError('Refresh token süresi dolmuş', 'REFRESH_TOKEN_EXPIRED');
        }
        const user = await user_repository_1.userRepository.findById(decoded.userId);
        if (!user) {
            throw new errors_1.AuthenticationError('Kullanıcı bulunamadı', 'USER_NOT_FOUND');
        }
        if (!user.isActive) {
            throw new errors_1.AuthenticationError('Hesap aktif değil', 'ACCOUNT_INACTIVE');
        }
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role
        };
        const newAccessToken = jwt_1.JwtUtil.generateAccessToken(payload);
        const newRefreshToken = jwt_1.JwtUtil.generateRefreshToken(payload);
        await refresh_token_repository_1.refreshTokenRepository.revoke(refreshToken);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        await refresh_token_repository_1.refreshTokenRepository.create({
            userId: user.id,
            token: newRefreshToken,
            expiresAt
        });
        logger_1.default.info(`Tokens refreshed for user: ${user.id}`);
        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        };
    }
    static async logout(refreshToken) {
        const revoked = await refresh_token_repository_1.refreshTokenRepository.revoke(refreshToken);
        if (!revoked) {
            throw new errors_1.AuthenticationError('Refresh token bulunamadı', 'REFRESH_TOKEN_NOT_FOUND');
        }
        logger_1.default.info('User logged out');
    }
    static async logoutAll(userId) {
        const count = await refresh_token_repository_1.refreshTokenRepository.revokeAllForUser(userId);
        logger_1.default.info(`All sessions logged out for user: ${userId} (${count} tokens revoked)`);
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map