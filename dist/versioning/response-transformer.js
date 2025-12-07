"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseTransformer = void 0;
class ResponseTransformer {
    static transformToV1(data) {
        if (data.success !== undefined && data.data !== undefined) {
            return {
                success: data.success,
                ...data.data,
                meta: undefined,
                pagination: data.pagination ? {
                    total: data.pagination.total,
                    page: data.pagination.page,
                    limit: data.pagination.limit
                } : undefined
            };
        }
        return data;
    }
    static transformToV2(data) {
        if (data.success !== undefined && !data.meta) {
            return {
                success: data.success,
                data: {
                    ...data,
                    success: undefined
                },
                meta: {
                    version: 'v2',
                    timestamp: new Date().toISOString()
                }
            };
        }
        return data;
    }
    static transformByVersion(version, data) {
        switch (version) {
            case 'v1':
                return this.transformToV1(data);
            case 'v2':
                return this.transformToV2(data);
            default:
                return data;
        }
    }
}
exports.ResponseTransformer = ResponseTransformer;
//# sourceMappingURL=response-transformer.js.map