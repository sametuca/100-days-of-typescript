"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const backup_controller_1 = require("../controllers/backup.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const types_1 = require("../types");
const router = (0, express_1.Router)();
const backupController = new backup_controller_1.BackupController();
router.use(auth_middleware_1.authenticate);
router.use((0, auth_middleware_1.authorize)(types_1.UserRole.ADMIN));
router.post('/', backupController.createBackup);
router.get('/', backupController.listBackups);
router.get('/status', backupController.getBackupStatus);
router.post('/:backupId/restore', backupController.restoreBackup);
router.get('/:backupId/verify', backupController.verifyBackup);
router.delete('/:backupId', backupController.deleteBackup);
exports.default = router;
//# sourceMappingURL=backup.routes.js.map