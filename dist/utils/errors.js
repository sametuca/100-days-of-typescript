"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFoundError = exports.AuthorizationError = exports.AuthenticationError = exports.ConflictError = exports.ValidationError = exports.ApiError = void 0;
class ApiError extends Error {
    constructor(message, statusCode = 500, errorCode, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.ApiError = ApiError;
class ValidationError extends ApiError {
    constructor(message, details = [], errorCode = 'VALIDATION_ERROR') {
        super(message, 400, errorCode);
        this.details = details;
    }
}
exports.ValidationError = ValidationError;
class ConflictError extends ApiError {
    constructor(message, errorCode = 'CONFLICT_ERROR') {
        super(message, 409, errorCode);
    }
}
exports.ConflictError = ConflictError;
class AuthenticationError extends ApiError {
    constructor(message, errorCode = 'AUTHENTICATION_ERROR') {
        super(message, 401, errorCode);
    }
}
exports.AuthenticationError = AuthenticationError;
class AuthorizationError extends ApiError {
    constructor(message, errorCode = 'AUTHORIZATION_ERROR') {
        super(message, 403, errorCode);
    }
}
exports.AuthorizationError = AuthorizationError;
class NotFoundError extends ApiError {
    constructor(message, errorCode = 'NOT_FOUND_ERROR') {
        super(message, 404, errorCode);
    }
}
exports.NotFoundError = NotFoundError;
//# sourceMappingURL=errors.js.map