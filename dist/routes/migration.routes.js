"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const migration_controller_1 = require("../controllers/migration.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const types_1 = require("../types");
const router = (0, express_1.Router)();
router.get('/migrations/status', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(types_1.UserRole.ADMIN), migration_controller_1.MigrationController.getMigrationStatus);
router.post('/migrations/run', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(types_1.UserRole.ADMIN), migration_controller_1.MigrationController.runMigrations);
router.post('/migrations/rollback', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(types_1.UserRole.ADMIN), migration_controller_1.MigrationController.rollbackMigrations);
exports.default = router;
//# sourceMappingURL=migration.routes.js.map