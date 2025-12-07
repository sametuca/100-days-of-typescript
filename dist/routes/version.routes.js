"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const version_controller_1 = require("../controllers/version.controller");
const router = (0, express_1.Router)();
router.get('/versions', version_controller_1.VersionController.getVersionInfo);
router.get('/versions/:version', version_controller_1.VersionController.getVersionStatus);
exports.default = router;
//# sourceMappingURL=version.routes.js.map