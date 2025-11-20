"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQuery = exports.validateParams = exports.validateBody = void 0;
const zod_1 = require("zod");
const errors_1 = require("../utils/errors");
const validateBody = (schema) => {
    return (req, _res, next) => {
        try {
            const validatedBody = schema.parse(req.body);
            req.body = validatedBody;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const formattedErrors = error.issues.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }));
                throw new errors_1.ValidationError(formattedErrors[0]?.message || 'Validation hatası', formattedErrors, 'VALIDATION_ERROR');
            }
            next(error);
        }
    };
};
exports.validateBody = validateBody;
const validateParams = (schema) => {
    return (req, _res, next) => {
        try {
            const validatedParams = schema.parse(req.params);
            req.params = validatedParams;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const formattedErrors = error.issues.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }));
                throw new errors_1.ValidationError(formattedErrors[0]?.message || 'Validation hatası', formattedErrors, 'VALIDATION_ERROR');
            }
            next(error);
        }
    };
};
exports.validateParams = validateParams;
const validateQuery = (schema) => {
    return (req, _res, next) => {
        try {
            const validatedQuery = schema.parse(req.query);
            req.query = validatedQuery;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const formattedErrors = error.issues.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }));
                throw new errors_1.ValidationError(formattedErrors[0]?.message || 'Validation hatası', formattedErrors, 'VALIDATION_ERROR');
            }
            next(error);
        }
    };
};
exports.validateQuery = validateQuery;
//# sourceMappingURL=validate.middleware.js.map