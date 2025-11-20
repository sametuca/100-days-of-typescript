"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestId = void 0;
const crypto_1 = require("crypto");
const requestId = (req, res, next) => {
    req.id = (0, crypto_1.randomUUID)();
    res.setHeader('X-Request-Id', req.id);
    next();
};
exports.requestId = requestId;
//# sourceMappingURL=request-id.middleware.js.map