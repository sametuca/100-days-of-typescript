"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const error_middleware_1 = require("../middleware/error.middleware");
const logger_1 = __importDefault(require("../utils/logger"));
class AuthController {
}
exports.AuthController = AuthController;
_a = AuthController;
AuthController.register = (0, error_middleware_1.catchAsync)(async (req, res) => {
    const userData = req.body;
    const user = await auth_service_1.AuthService.register(userData);
    logger_1.default.info(`Registration successful: ${user.email}`);
    res.status(201).json({
        success: true,
        message: 'Kayıt başarılı',
        data: {
            user
        }
    });
});
AuthController.login = (0, error_middleware_1.catchAsync)(async (req, res) => {
    const { email, password } = req.body;
    const result = await auth_service_1.AuthService.login(email, password);
    logger_1.default.info(`Login successful: ${result.user.email}`);
    res.status(200).json({
        success: true,
        message: 'Giriş başarılı',
        data: result
    });
});
AuthController.refreshToken = (0, error_middleware_1.catchAsync)(async (req, res) => {
    const { refreshToken } = req.body;
    const tokens = await auth_service_1.AuthService.refreshToken(refreshToken);
    logger_1.default.info('Tokens refreshed successfully');
    res.status(200).json({
        success: true,
        message: 'Token yenilendi',
        data: tokens
    });
});
AuthController.logout = (0, error_middleware_1.catchAsync)(async (req, res) => {
    const { refreshToken } = req.body;
    await auth_service_1.AuthService.logout(refreshToken);
    logger_1.default.info('Logout successful');
    res.status(200).json({
        success: true,
        message: 'Çıkış başarılı'
    });
});
AuthController.logoutAll = (0, error_middleware_1.catchAsync)(async (req, res) => {
    const userId = req.user.userId;
    await auth_service_1.AuthService.logoutAll(userId);
    logger_1.default.info(`All sessions logged out for user: ${userId}`);
    res.status(200).json({
        success: true,
        message: 'Tüm oturumlardan çıkış yapıldı'
    });
});
//# sourceMappingURL=auth.controller.js.map