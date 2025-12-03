import { UserService } from '../services/user.service';
import { TaskService } from '../services/task.service';
import { ProjectService } from '../services/project.service';

const projectService = new ProjectService();

export const resolvers = {
  Query: {
    users: async () => {
      const result = await UserService.listUsers();
      return result.data;
    },
    
    user: async ({ id }: { id: string }) => {
      return await UserService.getProfile(id);
    },
    
    tasks: async () => {
      const result = await TaskService.getAllTasks({});
      return result.data;
    },
    
    task: async ({ id }: { id: string }) => {
      return await TaskService.getTaskById(id);
    },
    
    projects: async () => {
      return await projectService.getUserProjects('');
    },
    
    project: async ({ id }: { id: string }) => {
      return await projectService.getProjectById(id, '');
    },
    
    tasksByProject: async ({ projectId }: { projectId: string }) => {
      return await TaskService.getTasksByProject(projectId);
    },
    
    tasksByUser: async ({ userId }: { userId: string }) => {
      return await TaskService.getTasksByUser(userId);
    }
  },

  Mutation: {
    createTask: async ({ input }: { input: any }) => {
      return await TaskService.createTask(input, '');
    },
    
    updateTask: async ({ id, input }: { id: string; input: any }) => {
      return await TaskService.updateTask(id, input);
    },
    
    deleteTask: async ({ id }: { id: string }) => {
      return await TaskService.deleteTask(id);
    },
    
    createProject: async ({ input }: { input: any }) => {
      return await projectService.createProject(input, '');
    },
    
    updateProject: async ({ id, input }: { id: string; input: any }) => {
      return await projectService.updateProject(id, input, '');
    }
  },

  Task: {
    assignedTo: async (parent: any) => {
      if (parent.assignedToId) {
        return await UserService.getProfile(parent.assignedToId);
      }
      return null;
    },
    
    project: async (parent: any) => {
      if (parent.projectId) {
        return await projectService.getProjectById(parent.projectId, '');
      }
      return null;
    }
  },

  Project: {
    owner: async (parent: any) => {
      return await UserService.getProfile(parent.ownerId);
    },
    
    tasks: async (parent: any) => {
      return await TaskService.getTasksByProject(parent.id);
    }
  }
};