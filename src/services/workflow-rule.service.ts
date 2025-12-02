import { v4 as uuidv4 } from 'uuid';
import db from '../database/connection';
import {
  WorkflowRule,
  CreateWorkflowRuleDto,
  UpdateWorkflowRuleDto,
  WorkflowActionConfig,
  WorkflowCondition,
} from '../types/workflow.types';

export class WorkflowRuleService {
  private mapRowToRule(row: any): WorkflowRule {
    return {
      id: row.id,
      organizationId: row.organization_id,
      name: row.name,
      event: row.event,
      conditions:
        typeof row.conditions === 'string'
          ? JSON.parse(row.conditions)
          : row.conditions,
      actions:
        typeof row.actions === 'string'
          ? JSON.parse(row.actions)
          : (row.actions as WorkflowActionConfig[]),
      isActive: !!row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async createRule(
    organizationId: string,
    data: CreateWorkflowRuleDto,
  ): Promise<WorkflowRule> {
    const id = uuidv4();

    const conditions: WorkflowCondition[] | null =
      data.conditions && data.conditions.length > 0 ? data.conditions : null;

    db.prepare(`
      INSERT INTO workflow_rules (
        id,
        organization_id,
        name,
        event,
        conditions,
        actions,
        is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      organizationId,
      data.name,
      data.event,
      conditions ? JSON.stringify(conditions) : null,
      JSON.stringify(data.actions),
      data.isActive ?? true,
    );

    return this.getRuleById(organizationId, id);
  }

  async getRuleById(
    organizationId: string,
    id: string,
  ): Promise<WorkflowRule> {
    const rows = db.prepare(`
      SELECT *
      FROM workflow_rules
      WHERE id = ? AND organization_id = ?
    `).all(id, organizationId) as any[];

    if (rows.length === 0) {
      throw new Error('Workflow rule not found');
    }

    return this.mapRowToRule(rows[0]);
  }

  async getRules(organizationId: string): Promise<WorkflowRule[]> {
    const rows = db.prepare(`
      SELECT *
      FROM workflow_rules
      WHERE organization_id = ?
      ORDER BY created_at DESC
    `).all(organizationId) as any[];

    return rows.map((row) => this.mapRowToRule(row));
  }

  async updateRule(
    organizationId: string,
    id: string,
    data: UpdateWorkflowRuleDto,
  ): Promise<WorkflowRule> {
    const existing = await this.getRuleById(organizationId, id);

    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }

    if (data.event !== undefined) {
      updates.push('event = ?');
      values.push(data.event);
    }

    if (data.conditions !== undefined) {
      updates.push('conditions = ?');
      values.push(
        data.conditions ? JSON.stringify(data.conditions) : null,
      );
    }

    if (data.actions !== undefined) {
      updates.push('actions = ?');
      values.push(JSON.stringify(data.actions));
    }

    if (data.isActive !== undefined) {
      updates.push('is_active = ?');
      values.push(data.isActive ? 1 : 0);
    }

    if (updates.length === 0) {
      return existing;
    }

    updates.push('updated_at = NOW()');
    values.push(id, organizationId);

    db.prepare(`
      UPDATE workflow_rules
      SET ${updates.join(', ')}
      WHERE id = ? AND organization_id = ?
    `).run(...values);

    return this.getRuleById(organizationId, id);
  }

  async deleteRule(organizationId: string, id: string): Promise<void> {
    db.prepare(`
      DELETE FROM workflow_rules
      WHERE id = ? AND organization_id = ?
    `).run(id, organizationId);
  }
}

export default new WorkflowRuleService();