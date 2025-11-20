"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginationUtil = void 0;
class PaginationUtil {
    static validateParams(params) {
        let page = params.page || this.DEFAULT_PAGE;
        let limit = params.limit || this.DEFAULT_LIMIT;
        if (page < 1)
            page = 1;
        if (limit < 1)
            limit = this.DEFAULT_LIMIT;
        if (limit > this.MAX_LIMIT)
            limit = this.MAX_LIMIT;
        return { page, limit };
    }
    static calculateOffset(page, limit) {
        return (page - 1) * limit;
    }
    static createMeta(page, limit, totalItems) {
        const totalPages = Math.ceil(totalItems / limit);
        return {
            currentPage: page,
            totalPages,
            pageSize: limit,
            totalItems,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1
        };
    }
    static paginate(items, page, limit) {
        const offset = this.calculateOffset(page, limit);
        const paginatedItems = items.slice(offset, offset + limit);
        return {
            data: paginatedItems,
            pagination: this.createMeta(page, limit, items.length)
        };
    }
}
exports.PaginationUtil = PaginationUtil;
PaginationUtil.DEFAULT_PAGE = 1;
PaginationUtil.DEFAULT_LIMIT = 10;
PaginationUtil.MAX_LIMIT = 100;
//# sourceMappingURL=pagination.js.map