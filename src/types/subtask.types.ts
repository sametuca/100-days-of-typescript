import { BaseEntity } from './index';

export interface Subtask extends BaseEntity {
    task_id: string;
    title: string;
    is_completed: boolean;
}

export interface CreateSubtaskDto {
    title: string;
}

export interface UpdateSubtaskDto {
    title?: string;
    is_completed?: boolean;
}
