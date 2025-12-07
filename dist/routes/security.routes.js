"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const security_controller_1 = require("../controllers/security.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware.authenticate);
router.post('/scan/code', security_controller_1.SecurityController.scanCode);
router.post('/scan/dependencies', security_controller_1.SecurityController.scanDependencies);
router.get('/compliance/:standard', security_controller_1.SecurityController.checkCompliance);
router.get('/threats', security_controller_1.SecurityController.getThreats);
router.get('/dashboard', security_controller_1.SecurityController.getSecurityDashboard);
exports.default = router;
//# sourceMappingURL=security.routes.js.map