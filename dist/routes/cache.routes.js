"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cache_controller_1 = require("../controllers/cache.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const types_1 = require("../types");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.use((0, auth_middleware_1.authorize)(types_1.UserRole.ADMIN));
router.get('/stats', cache_controller_1.CacheController.getStats);
router.get('/health', cache_controller_1.CacheController.getHealth);
router.get('/keys', cache_controller_1.CacheController.getKeys);
router.post('/warm', cache_controller_1.CacheController.warmCache);
router.delete('/clear', cache_controller_1.CacheController.clearAll);
router.delete('/pattern/:pattern', cache_controller_1.CacheController.clearPattern);
router.delete('/key/:key', cache_controller_1.CacheController.deleteKey);
exports.default = router;
//# sourceMappingURL=cache.routes.js.map