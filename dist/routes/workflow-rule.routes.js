"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const workflow_rule_controller_1 = __importDefault(require("../controllers/workflow-rule.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const tenant_middleware_1 = __importDefault(require("../middleware/tenant.middleware"));
const permission_middleware_1 = __importDefault(require("../middleware/permission.middleware"));
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware.authenticate);
router.use(tenant_middleware_1.default.requireTenant());
router.use(permission_middleware_1.default.requireAdmin());
router.post('/', (req, res) => workflow_rule_controller_1.default.createRule(req, res));
router.get('/', (req, res) => workflow_rule_controller_1.default.getRules(req, res));
router.patch('/:ruleId', (req, res) => workflow_rule_controller_1.default.updateRule(req, res));
router.delete('/:ruleId', (req, res) => workflow_rule_controller_1.default.deleteRule(req, res));
exports.default = router;
//# sourceMappingURL=workflow-rule.routes.js.map