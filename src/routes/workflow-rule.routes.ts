import { Router } from 'express';
import WorkflowRuleController from '../controllers/workflow-rule.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import TenantMiddleware from '../middleware/tenant.middleware';
import PermissionMiddleware from '../middleware/permission.middleware';

const router = Router();

router.use(authMiddleware);

// Tüm workflow rule işlemleri için tenant ve admin/owner gereksin
router.use(TenantMiddleware.requireTenant());
router.use(PermissionMiddleware.requireAdmin());

router.post('/', (req, res) =>
  WorkflowRuleController.createRule(req, res),
);

router.get('/', (req, res) =>
  WorkflowRuleController.getRules(req, res),
);

router.patch('/:ruleId', (req, res) =>
  WorkflowRuleController.updateRule(req, res),
);

router.delete('/:ruleId', (req, res) =>
  WorkflowRuleController.deleteRule(req, res),
);

export default router;