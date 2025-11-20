"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const logDir = path_1.default.resolve(process.env.LOG_DIR || 'logs');
if (!fs_1.default.existsSync(logDir)) {
    fs_1.default.mkdirSync(logDir, { recursive: true });
}
const customFormat = winston_1.default.format.printf(({ level, message, timestamp, ...meta }) => {
    const metaStr = Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message} ${metaStr}`;
});
const logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || 'debug',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.errors({ stack: true }), customFormat),
    transports: [
        new winston_1.default.transports.Console({
            format: winston_1.default.format.combine(winston_1.default.format.colorize(), customFormat)
        }),
        new winston_1.default.transports.File({
            filename: path_1.default.join(logDir, 'combined.log'),
            maxsize: 5242880,
            maxFiles: 5
        }),
        new winston_1.default.transports.File({
            level: 'error',
            filename: path_1.default.join(logDir, 'error.log'),
            maxsize: 5242880,
            maxFiles: 5
        })
    ],
    exitOnError: false
});
logger.stream = {
    write: (message) => {
        logger.info(message.trim());
    }
};
exports.default = logger;
//# sourceMappingURL=logger.js.map