import { BaseEntity } from './index';

export interface Comment extends BaseEntity {
    task_id: string;
    user_id: string;
    content: string;
}

export interface CreateCommentDTO {
    content: string;
}

export interface UpdateCommentDTO {
    content: string;
}
