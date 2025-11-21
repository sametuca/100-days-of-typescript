import { BaseEntity } from './index';

export type ActionType =
    | 'CREATED'
    | 'UPDATED'
    | 'DELETED'
    | 'STATUS_CHANGE'
    | 'PRIORITY_CHANGE'
    | 'ASSIGNED'
    | 'COMMENT_ADDED';

export interface ActivityLog extends BaseEntity {
    task_id: string;
    user_id: string;
    action_type: ActionType;
    details: string | null; // JSON string
}

export interface CreateActivityLogDTO {
    task_id: string;
    user_id: string;
    action_type: ActionType;
    details?: any;
}
