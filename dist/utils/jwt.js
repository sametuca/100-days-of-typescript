"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtUtil = void 0;
const jwt = __importStar(require("jsonwebtoken"));
const env_1 = __importDefault(require("../config/env"));
class JwtUtil {
    static generateAccessToken(payload) {
        const options = { expiresIn: env_1.default.jwt.expiresIn };
        return jwt.sign(payload, env_1.default.jwt.secret, options);
    }
    static generateRefreshToken(payload) {
        const options = { expiresIn: env_1.default.jwt.refreshExpiresIn };
        return jwt.sign(payload, env_1.default.jwt.refreshSecret, options);
    }
    static verifyAccessToken(token) {
        try {
            const decoded = jwt.verify(token, env_1.default.jwt.secret);
            return decoded;
        }
        catch (error) {
            throw new Error('Invalid or expired token');
        }
    }
    static verifyRefreshToken(token) {
        try {
            const decoded = jwt.verify(token, env_1.default.jwt.refreshSecret);
            return decoded;
        }
        catch (error) {
            throw new Error('Invalid or expired refresh token');
        }
    }
    static decodeToken(token) {
        try {
            const decoded = jwt.decode(token);
            return decoded;
        }
        catch (error) {
            return null;
        }
    }
}
exports.JwtUtil = JwtUtil;
//# sourceMappingURL=jwt.js.map