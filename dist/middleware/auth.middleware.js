"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const errors_1 = require("../utils/errors");
const authenticate = (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            throw new errors_1.AuthenticationError('Authorization header eksik', 'NO_AUTH_HEADER');
        }
        if (!authHeader.startsWith('Bearer ')) {
            throw new errors_1.AuthenticationError('Bearer token gerekli', 'INVALID_AUTH_FORMAT');
        }
        const token = authHeader.substring(7);
        if (!token) {
            throw new errors_1.AuthenticationError('Token bulunamadı', 'NO_TOKEN');
        }
        const decoded = jwt_1.JwtUtil.verifyAccessToken(token);
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role
        };
        next();
    }
    catch (error) {
        if (error instanceof errors_1.AuthenticationError) {
            next(error);
        }
        else {
            next(new errors_1.AuthenticationError('Geçersiz veya süresi dolmuş token', 'INVALID_TOKEN'));
        }
    }
};
exports.authenticate = authenticate;
const authorize = (...allowedRoles) => {
    return (req, _res, next) => {
        if (!req.user) {
            throw new errors_1.AuthenticationError('Kullanıcı kimliği doğrulanmamış', 'NOT_AUTHENTICATED');
        }
        const userRole = req.user.role;
        if (!allowedRoles.includes(userRole)) {
            throw new errors_1.AuthorizationError(`Bu işlem için ${allowedRoles.join(' veya ')} yetkisi gereklidir`, 'INSUFFICIENT_PERMISSIONS');
        }
        next();
    };
};
exports.authorize = authorize;
//# sourceMappingURL=auth.middleware.js.map