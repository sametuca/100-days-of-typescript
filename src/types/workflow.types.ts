export type WorkflowEventType =
  | 'task.created'
  | 'task.status.changed'
  | 'task.deadline.approaching';

export type WorkflowActionType =
  | 'send_email'
  | 'notify_assignees'
  | 'create_activity_log'
  | 'post_webhook';

export type ConditionOperator =
  | 'eq'
  | 'ne'
  | 'gt'
  | 'lt'
  | 'gte'
  | 'lte'
  | 'in';

export interface WorkflowCondition {
  field: string; // ör: "task.status", "task.priority"
  operator: ConditionOperator;
  value: any;
}

export interface SendEmailActionConfig {
  type: 'send_email';
  to: string[];
  subject: string;
  templateId?: string;
}

export interface NotifyAssigneesActionConfig {
  type: 'notify_assignees';
  message: string;
}

export interface CreateActivityLogActionConfig {
  type: 'create_activity_log';
  message: string;
  level: 'info' | 'warning' | 'error';
}

export interface PostWebhookActionConfig {
  type: 'post_webhook';
  url: string;
  method?: 'POST' | 'PUT';
  headers?: Record<string, string>;
  payloadTemplate?: Record<string, any>;
}

export type WorkflowActionConfig =
  | SendEmailActionConfig
  | NotifyAssigneesActionConfig
  | CreateActivityLogActionConfig
  | PostWebhookActionConfig;

export interface WorkflowRule {
  id: string;
  organizationId: string;
  name: string;
  event: WorkflowEventType;
  conditions: WorkflowCondition[] | null;
  actions: WorkflowActionConfig[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWorkflowRuleDto {
  name: string;
  event: WorkflowEventType;
  conditions?: WorkflowCondition[];
  actions: WorkflowActionConfig[];
  isActive?: boolean;
}

export interface UpdateWorkflowRuleDto {
  name?: string;
  event?: WorkflowEventType;
  conditions?: WorkflowCondition[] | null;
  actions?: WorkflowActionConfig[];
  isActive?: boolean;
}