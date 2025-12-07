"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const user_service_1 = require("../services/user.service");
const task_service_1 = require("../services/task.service");
const project_service_1 = require("../services/project.service");
const projectService = new project_service_1.ProjectService();
exports.resolvers = {
    Query: {
        users: async () => {
            const result = await user_service_1.UserService.listUsers();
            return result.data;
        },
        user: async ({ id }) => {
            return await user_service_1.UserService.getProfile(id);
        },
        tasks: async () => {
            const result = await task_service_1.TaskService.getAllTasks({});
            return result.data;
        },
        task: async ({ id }) => {
            return await task_service_1.TaskService.getTaskById(id);
        },
        projects: async () => {
            return await projectService.getUserProjects('');
        },
        project: async ({ id }) => {
            return await projectService.getProjectById(id, '');
        },
        tasksByProject: async ({ projectId }) => {
            return await task_service_1.TaskService.getTasksByProject(projectId);
        },
        tasksByUser: async ({ userId }) => {
            return await task_service_1.TaskService.getTasksByUser(userId);
        }
    },
    Mutation: {
        createTask: async ({ input }) => {
            return await task_service_1.TaskService.createTask(input, '');
        },
        updateTask: async ({ id, input }) => {
            return await task_service_1.TaskService.updateTask(id, input);
        },
        deleteTask: async ({ id }) => {
            return await task_service_1.TaskService.deleteTask(id);
        },
        createProject: async ({ input }) => {
            return await projectService.createProject(input, '');
        },
        updateProject: async ({ id, input }) => {
            return await projectService.updateProject(id, input, '');
        }
    },
    Task: {
        assignedTo: async (parent) => {
            if (parent.assignedToId) {
                return await user_service_1.UserService.getProfile(parent.assignedToId);
            }
            return null;
        },
        project: async (parent) => {
            if (parent.projectId) {
                return await projectService.getProjectById(parent.projectId, '');
            }
            return null;
        }
    },
    Project: {
        owner: async (parent) => {
            return await user_service_1.UserService.getProfile(parent.ownerId);
        },
        tasks: async (parent) => {
            return await task_service_1.TaskService.getTasksByProject(parent.id);
        }
    }
};
//# sourceMappingURL=resolvers.js.map