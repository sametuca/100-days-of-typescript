export interface Comment {
    id: string;
    task_id: string;
    user_id: string;
    content: string;
    created_at: string;
    updated_at: string;
}

export interface CreateCommentDTO {
    content: string;
}

export interface UpdateCommentDTO {
    content: string;
}
