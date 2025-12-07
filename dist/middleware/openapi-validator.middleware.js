"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupOpenApiValidator = setupOpenApiValidator;
function setupOpenApiValidator(app) {
    app.use((err, _req, res, next) => {
        if (err.status === 400 && err.errors) {
            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                code: 'VALIDATION_ERROR',
                errors: err.errors.map((e) => ({
                    field: e.path,
                    message: e.message,
                })),
            });
        }
        next(err);
    });
}
//# sourceMappingURL=openapi-validator.middleware.js.map