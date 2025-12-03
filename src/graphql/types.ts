export interface GraphQLContext {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status: string;
  priority: string;
  assignedToId?: number;
  projectId: number;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  assignedToId?: number;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  status: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  status?: string;
}