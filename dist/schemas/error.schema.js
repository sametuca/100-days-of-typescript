"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginationMetaSchema = exports.ErrorSchema = void 0;
const zod_1 = require("zod");
exports.ErrorSchema = zod_1.z.object({
    status: zod_1.z.literal('error'),
    message: zod_1.z.string(),
    code: zod_1.z.string(),
    errors: zod_1.z
        .array(zod_1.z.object({
        field: zod_1.z.string(),
        message: zod_1.z.string(),
    }))
        .optional(),
});
exports.PaginationMetaSchema = zod_1.z.object({
    total: zod_1.z.number().int(),
    page: zod_1.z.number().int(),
    limit: zod_1.z.number().int(),
    totalPages: zod_1.z.number().int(),
});
//# sourceMappingURL=error.schema.js.map