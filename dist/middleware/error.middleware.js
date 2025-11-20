"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.catchAsync = exports.notFoundHandler = exports.errorHandler = void 0;
const errors_1 = require("../utils/errors");
const logger_1 = __importDefault(require("../utils/logger"));
const errorHandler = (err, req, res, _next) => {
    if (err instanceof errors_1.ApiError) {
        if (err.isOperational) {
            logger_1.default.warn(`[${req.method}] ${req.path} - ${err.message}`, {
                statusCode: err.statusCode,
                errorCode: err.errorCode,
                stack: err.stack
            });
        }
        else {
            logger_1.default.error(`[${req.method}] ${req.path} - ${err.message}`, {
                statusCode: err.statusCode,
                errorCode: err.errorCode,
                stack: err.stack
            });
        }
    }
    else {
        logger_1.default.error(`[${req.method}] ${req.path} - ${err.message}`, {
            stack: err.stack
        });
    }
    let statusCode = 500;
    let message = 'Sunucu hatası';
    let errorCode;
    let errors;
    if (err instanceof errors_1.ApiError) {
        statusCode = err.statusCode;
        message = err.message;
        errorCode = err.errorCode;
        if ('errors' in err) {
            errors = err.errors;
        }
    }
    const isDevelopment = process.env.NODE_ENV === 'development';
    const errorResponse = {
        success: false,
        error: {
            message,
            code: errorCode,
            statusCode
        }
    };
    if (errors) {
        errorResponse.error.errors = errors;
    }
    if (isDevelopment) {
        errorResponse.error.stack = err.stack;
    }
    res.status(statusCode).json(errorResponse);
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res, _next) => {
    logger_1.default.warn(`Route not found: [${req.method}] ${req.originalUrl}`);
    res.status(404).json({
        success: false,
        error: {
            message: 'Route bulunamadı',
            code: 'ROUTE_NOT_FOUND',
            statusCode: 404,
            path: req.originalUrl
        }
    });
};
exports.notFoundHandler = notFoundHandler;
const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};
exports.catchAsync = catchAsync;
//# sourceMappingURL=error.middleware.js.map