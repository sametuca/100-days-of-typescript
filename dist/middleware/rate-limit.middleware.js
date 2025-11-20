"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTaskLimiter = exports.apiLimiter = exports.authLimiter = exports.generalLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = __importDefault(require("../config/env"));
exports.generalLimiter = (0, express_rate_limit_1.default)({
    windowMs: env_1.default.security.rateLimit.windowMs,
    max: env_1.default.security.rateLimit.max,
    message: {
        success: false,
        error: {
            message: 'Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.',
            code: 'RATE_LIMIT_EXCEEDED',
            statusCode: 429
        }
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
        res.status(429).json({
            success: false,
            error: {
                message: 'Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.',
                code: 'RATE_LIMIT_EXCEEDED',
                statusCode: 429
            }
        });
    }
});
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 5,
    skipSuccessfulRequests: false,
    message: {
        success: false,
        error: {
            message: 'Çok fazla giriş denemesi. 15 dakika sonra tekrar deneyin.',
            code: 'AUTH_RATE_LIMIT_EXCEEDED',
            statusCode: 429
        }
    },
    handler: (_req, res) => {
        res.status(429).json({
            success: false,
            error: {
                message: 'Çok fazla giriş denemesi. 15 dakika sonra tekrar deneyin.',
                code: 'AUTH_RATE_LIMIT_EXCEEDED',
                statusCode: 429
            }
        });
    }
});
exports.apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 60,
    message: {
        success: false,
        error: {
            message: 'API rate limit aşıldı. Dakikada maksimum 60 istek.',
            code: 'API_RATE_LIMIT_EXCEEDED',
            statusCode: 429
        }
    }
});
exports.createTaskLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000,
    max: 20,
    message: {
        success: false,
        error: {
            message: 'Saatte maksimum 20 task oluşturabilirsiniz.',
            code: 'CREATE_TASK_LIMIT_EXCEEDED',
            statusCode: 429
        }
    }
});
//# sourceMappingURL=rate-limit.middleware.js.map