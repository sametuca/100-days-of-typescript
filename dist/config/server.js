"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CORS_CONFIG = exports.SERVER_CONFIG = void 0;
const env_1 = __importDefault(require("./env"));
exports.SERVER_CONFIG = {
    PORT: env_1.default.server.port,
    HOST: env_1.default.server.host,
    NODE_ENV: env_1.default.app.env,
    API_PREFIX: env_1.default.server.apiPrefix
};
exports.CORS_CONFIG = {
    origin: env_1.default.cors.origin,
    credentials: env_1.default.cors.credentials
};
//# sourceMappingURL=server.js.map