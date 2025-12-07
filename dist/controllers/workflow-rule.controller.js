"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowRuleController = void 0;
const workflow_rule_service_1 = __importDefault(require("../services/workflow-rule.service"));
class WorkflowRuleController {
    async createRule(req, res) {
        try {
            const organizationId = req.organizationId;
            const data = req.body;
            const rule = await workflow_rule_service_1.default.createRule(organizationId, data);
            res.status(201).json({
                success: true,
                data: rule,
            });
        }
        catch (error) {
            console.error('Create workflow rule error:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to create workflow rule',
            });
        }
    }
    async getRules(req, res) {
        try {
            const organizationId = req.organizationId;
            const rules = await workflow_rule_service_1.default.getRules(organizationId);
            res.json({
                success: true,
                data: rules,
            });
        }
        catch (error) {
            console.error('Get workflow rules error:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to fetch workflow rules',
            });
        }
    }
    async updateRule(req, res) {
        try {
            const organizationId = req.organizationId;
            const { ruleId } = req.params;
            const data = req.body;
            const rule = await workflow_rule_service_1.default.updateRule(organizationId, ruleId, data);
            res.json({
                success: true,
                data: rule,
            });
        }
        catch (error) {
            console.error('Update workflow rule error:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to update workflow rule',
            });
        }
    }
    async deleteRule(req, res) {
        try {
            const organizationId = req.organizationId;
            const { ruleId } = req.params;
            await workflow_rule_service_1.default.deleteRule(organizationId, ruleId);
            res.json({
                success: true,
                message: 'Workflow rule deleted successfully',
            });
        }
        catch (error) {
            console.error('Delete workflow rule error:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to delete workflow rule',
            });
        }
    }
}
exports.WorkflowRuleController = WorkflowRuleController;
exports.default = new WorkflowRuleController();
//# sourceMappingURL=workflow-rule.controller.js.map