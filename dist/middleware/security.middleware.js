"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.preventParameterPollution = exports.addSecurityHeaders = exports.preventXSS = exports.sanitizeInput = void 0;
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
exports.sanitizeInput = (0, express_mongo_sanitize_1.default)({
    replaceWith: '_',
    onSanitize: ({ key }) => {
        console.warn(`Sanitized input detected: ${key}`);
    }
});
const preventXSS = (req, _res, next) => {
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = req.body[key]
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#x27;')
                    .replace(/\//g, '&#x2F;');
            }
        });
    }
    next();
};
exports.preventXSS = preventXSS;
const addSecurityHeaders = (req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    if (req.secure) {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    next();
};
exports.addSecurityHeaders = addSecurityHeaders;
const preventParameterPollution = (req, _res, next) => {
    const whitelist = ['status', 'priority', 'role', 'sort', 'order'];
    Object.keys(req.query).forEach(key => {
        if (Array.isArray(req.query[key]) && !whitelist.includes(key)) {
            req.query[key] = req.query[key][0];
        }
    });
    next();
};
exports.preventParameterPollution = preventParameterPollution;
//# sourceMappingURL=security.middleware.js.map