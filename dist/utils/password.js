"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordUtil = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const env_1 = __importDefault(require("../config/env"));
class PasswordUtil {
    static async hash(password) {
        const saltRounds = env_1.default.security.bcryptRounds;
        const hashedPassword = await bcrypt_1.default.hash(password, saltRounds);
        return hashedPassword;
    }
    static async compare(password, hash) {
        const isMatch = await bcrypt_1.default.compare(password, hash);
        return isMatch;
    }
    static validate(password) {
        const errors = [];
        if (password.length < 8) {
            errors.push('Şifre en az 8 karakter olmalıdır');
        }
        if (password.length > 100) {
            errors.push('Şifre en fazla 100 karakter olmalıdır');
        }
        if (!/[A-Z]/.test(password)) {
            errors.push('Şifre en az bir büyük harf içermelidir');
        }
        if (!/[a-z]/.test(password)) {
            errors.push('Şifre en az bir küçük harf içermelidir');
        }
        if (!/[0-9]/.test(password)) {
            errors.push('Şifre en az bir rakam içermelidir');
        }
        return {
            valid: errors.length === 0,
            errors
        };
    }
}
exports.PasswordUtil = PasswordUtil;
//# sourceMappingURL=password.js.map