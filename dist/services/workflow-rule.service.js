"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowRuleService = void 0;
const uuid_1 = require("uuid");
const connection_1 = __importDefault(require("../database/connection"));
class WorkflowRuleService {
    mapRowToRule(row) {
        return {
            id: row.id,
            organizationId: row.organization_id,
            name: row.name,
            event: row.event,
            conditions: typeof row.conditions === 'string'
                ? JSON.parse(row.conditions)
                : row.conditions,
            actions: typeof row.actions === 'string'
                ? JSON.parse(row.actions)
                : row.actions,
            isActive: !!row.is_active,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }
    async createRule(organizationId, data) {
        const id = (0, uuid_1.v4)();
        const conditions = data.conditions && data.conditions.length > 0 ? data.conditions : null;
        connection_1.default.prepare(`
      INSERT INTO workflow_rules (
        id,
        organization_id,
        name,
        event,
        conditions,
        actions,
        is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, organizationId, data.name, data.event, conditions ? JSON.stringify(conditions) : null, JSON.stringify(data.actions), data.isActive ?? true);
        return this.getRuleById(organizationId, id);
    }
    async getRuleById(organizationId, id) {
        const rows = connection_1.default.prepare(`
      SELECT *
      FROM workflow_rules
      WHERE id = ? AND organization_id = ?
    `).all(id, organizationId);
        if (rows.length === 0) {
            throw new Error('Workflow rule not found');
        }
        return this.mapRowToRule(rows[0]);
    }
    async getRules(organizationId) {
        const rows = connection_1.default.prepare(`
      SELECT *
      FROM workflow_rules
      WHERE organization_id = ?
      ORDER BY created_at DESC
    `).all(organizationId);
        return rows.map((row) => this.mapRowToRule(row));
    }
    async updateRule(organizationId, id, data) {
        const existing = await this.getRuleById(organizationId, id);
        const updates = [];
        const values = [];
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
            values.push(data.conditions ? JSON.stringify(data.conditions) : null);
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
        connection_1.default.prepare(`
      UPDATE workflow_rules
      SET ${updates.join(', ')}
      WHERE id = ? AND organization_id = ?
    `).run(...values);
        return this.getRuleById(organizationId, id);
    }
    async deleteRule(organizationId, id) {
        connection_1.default.prepare(`
      DELETE FROM workflow_rules
      WHERE id = ? AND organization_id = ?
    `).run(id, organizationId);
    }
}
exports.WorkflowRuleService = WorkflowRuleService;
exports.default = new WorkflowRuleService();
//# sourceMappingURL=workflow-rule.service.js.map