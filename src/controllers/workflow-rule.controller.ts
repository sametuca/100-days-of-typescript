import { Request, Response } from 'express';
import WorkflowRuleService from '../services/workflow-rule.service';
import {
  CreateWorkflowRuleDto,
  UpdateWorkflowRuleDto,
} from '../types/workflow.types';

export class WorkflowRuleController {
  async createRule(req: Request, res: Response) {
    try {
      const organizationId = req.organizationId!;
      const data: CreateWorkflowRuleDto = req.body;

      const rule = await WorkflowRuleService.createRule(
        organizationId,
        data,
      );

      res.status(201).json({
        success: true,
        data: rule,
      });
    } catch (error: any) {
      console.error('Create workflow rule error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create workflow rule',
      });
    }
  }

  async getRules(req: Request, res: Response) {
    try {
      const organizationId = req.organizationId!;
      const rules = await WorkflowRuleService.getRules(organizationId);

      res.json({
        success: true,
        data: rules,
      });
    } catch (error: any) {
      console.error('Get workflow rules error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch workflow rules',
      });
    }
  }

  async updateRule(req: Request, res: Response) {
    try {
      const organizationId = req.organizationId!;
      const { ruleId } = req.params;
      const data: UpdateWorkflowRuleDto = req.body;

      const rule = await WorkflowRuleService.updateRule(
        organizationId,
        ruleId,
        data,
      );

      res.json({
        success: true,
        data: rule,
      });
    } catch (error: any) {
      console.error('Update workflow rule error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update workflow rule',
      });
    }
  }

  async deleteRule(req: Request, res: Response) {
    try {
      const organizationId = req.organizationId!;
      const { ruleId } = req.params;

      await WorkflowRuleService.deleteRule(organizationId, ruleId);

      res.json({
        success: true,
        message: 'Workflow rule deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete workflow rule error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete workflow rule',
      });
    }
  }
}

export default new WorkflowRuleController();