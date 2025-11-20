"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const user_validation_1 = require("../validation/user.validation");
const validate_middleware_1 = require("../middleware/validate.middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rate_limit_middleware_1 = require("../middleware/rate-limit.middleware");
const router = (0, express_1.Router)();
router.post('/register', rate_limit_middleware_1.authLimiter, (0, validate_middleware_1.validateBody)(user_validation_1.registerSchema), auth_controller_1.AuthController.register);
router.post('/login', rate_limit_middleware_1.authLimiter, (0, validate_middleware_1.validateBody)(user_validation_1.loginSchema), auth_controller_1.AuthController.login);
router.post('/refresh', (0, validate_middleware_1.validateBody)(user_validation_1.refreshTokenSchema), auth_controller_1.AuthController.refreshToken);
router.post('/logout', (0, validate_middleware_1.validateBody)(user_validation_1.refreshTokenSchema), auth_controller_1.AuthController.logout);
router.post('/logout-all', auth_middleware_1.authenticate, auth_controller_1.AuthController.logoutAll);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map