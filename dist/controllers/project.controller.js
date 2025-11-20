"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectController = void 0;
const project_service_1 = require("../services/project.service");
const logger_1 = __importDefault(require("../utils/logger"));
class ProjectController {
    constructor() {
        this.getProjects = async (req, res) => {
            try {
                const userId = req.user.userId;
                const { ownedOnly, memberOnly } = req.query;
                let projects;
                if (ownedOnly === 'true') {
                    projects = await this.projectService.getOwnedProjects(userId);
                }
                else if (memberOnly === 'true') {
                    projects = await this.projectService.getUserProjects(userId);
                }
                else {
                    projects = await this.projectService.getUserProjects(userId);
                }
                res.status(200).json({
                    success: true,
                    message: 'Projects retrieved successfully',
                    data: projects
                });
                logger_1.default.info(`User ${userId} retrieved projects`);
            }
            catch (error) {
                logger_1.default.error('Error getting projects:', error);
                res.status(500).json({
                    success: false,
                    error: {
                        message: 'Failed to get projects',
                        code: 'GET_PROJECTS_FAILED'
                    }
                });
            }
        };
        this.getProjectById = async (req, res) => {
            try {
                const { id } = req.params;
                const userId = req.user.userId;
                const project = await this.projectService.getProjectById(id, userId);
                res.status(200).json({
                    success: true,
                    message: 'Project retrieved successfully',
                    data: project
                });
                logger_1.default.info(`User ${userId} retrieved project ${id}`);
            }
            catch (error) {
                logger_1.default.error('Error getting project by ID:', error);
                if (error.statusCode) {
                    res.status(error.statusCode).json({
                        success: false,
                        error: {
                            message: error.message,
                            code: error.errorCode || 'GET_PROJECT_FAILED'
                        }
                    });
                }
                else {
                    res.status(500).json({
                        success: false,
                        error: {
                            message: 'Failed to get project',
                            code: 'GET_PROJECT_FAILED'
                        }
                    });
                }
            }
        };
        this.createProject = async (req, res) => {
            try {
                const userId = req.user.userId;
                const createDto = req.body;
                const project = await this.projectService.createProject(createDto, userId);
                res.status(201).json({
                    success: true,
                    message: 'Project created successfully',
                    data: project
                });
                logger_1.default.info(`User ${userId} created project ${project.id}`);
            }
            catch (error) {
                logger_1.default.error('Error creating project:', error);
                if (error.statusCode) {
                    res.status(error.statusCode).json({
                        success: false,
                        error: {
                            message: error.message,
                            code: error.errorCode || 'CREATE_PROJECT_FAILED'
                        }
                    });
                }
                else {
                    res.status(500).json({
                        success: false,
                        error: {
                            message: 'Failed to create project',
                            code: 'CREATE_PROJECT_FAILED'
                        }
                    });
                }
            }
        };
        this.updateProject = async (req, res) => {
            try {
                const { id } = req.params;
                const userId = req.user.userId;
                const updateDto = req.body;
                const project = await this.projectService.updateProject(id, updateDto, userId);
                res.status(200).json({
                    success: true,
                    message: 'Project updated successfully',
                    data: project
                });
                logger_1.default.info(`User ${userId} updated project ${id}`);
            }
            catch (error) {
                logger_1.default.error('Error updating project:', error);
                if (error.statusCode) {
                    res.status(error.statusCode).json({
                        success: false,
                        error: {
                            message: error.message,
                            code: error.errorCode || 'UPDATE_PROJECT_FAILED'
                        }
                    });
                }
                else {
                    res.status(500).json({
                        success: false,
                        error: {
                            message: 'Failed to update project',
                            code: 'UPDATE_PROJECT_FAILED'
                        }
                    });
                }
            }
        };
        this.deleteProject = async (req, res) => {
            try {
                const { id } = req.params;
                const userId = req.user.userId;
                await this.projectService.deleteProject(id, userId);
                res.status(200).json({
                    success: true,
                    message: 'Project deleted successfully'
                });
                logger_1.default.info(`User ${userId} deleted project ${id}`);
            }
            catch (error) {
                logger_1.default.error('Error deleting project:', error);
                if (error.statusCode) {
                    res.status(error.statusCode).json({
                        success: false,
                        error: {
                            message: error.message,
                            code: error.errorCode || 'DELETE_PROJECT_FAILED'
                        }
                    });
                }
                else {
                    res.status(500).json({
                        success: false,
                        error: {
                            message: 'Failed to delete project',
                            code: 'DELETE_PROJECT_FAILED'
                        }
                    });
                }
            }
        };
        this.addMember = async (req, res) => {
            try {
                const { id } = req.params;
                const { email } = req.body;
                const userId = req.user.userId;
                await this.projectService.addMemberToProject(id, email, userId);
                res.status(200).json({
                    success: true,
                    message: 'Member added to project successfully'
                });
                logger_1.default.info(`User ${userId} added member ${email} to project ${id}`);
            }
            catch (error) {
                logger_1.default.error('Error adding member:', error);
                if (error.statusCode) {
                    res.status(error.statusCode).json({
                        success: false,
                        error: {
                            message: error.message,
                            code: error.errorCode || 'ADD_MEMBER_FAILED'
                        }
                    });
                }
                else {
                    res.status(500).json({
                        success: false,
                        error: {
                            message: 'Failed to add member',
                            code: 'ADD_MEMBER_FAILED'
                        }
                    });
                }
            }
        };
        this.removeMember = async (req, res) => {
            try {
                const { id, memberId } = req.params;
                const userId = req.user.userId;
                await this.projectService.removeMemberFromProject(id, memberId, userId);
                res.status(200).json({
                    success: true,
                    message: 'Member removed from project successfully'
                });
                logger_1.default.info(`User ${userId} removed member ${memberId} from project ${id}`);
            }
            catch (error) {
                logger_1.default.error('Error removing member:', error);
                if (error.statusCode) {
                    res.status(error.statusCode).json({
                        success: false,
                        error: {
                            message: error.message,
                            code: error.errorCode || 'REMOVE_MEMBER_FAILED'
                        }
                    });
                }
                else {
                    res.status(500).json({
                        success: false,
                        error: {
                            message: 'Failed to remove member',
                            code: 'REMOVE_MEMBER_FAILED'
                        }
                    });
                }
            }
        };
        this.leaveProject = async (req, res) => {
            try {
                const { id } = req.params;
                const userId = req.user.userId;
                await this.projectService.leaveProject(id, userId);
                res.status(200).json({
                    success: true,
                    message: 'Left project successfully'
                });
                logger_1.default.info(`User ${userId} left project ${id}`);
            }
            catch (error) {
                logger_1.default.error('Error leaving project:', error);
                if (error.statusCode) {
                    res.status(error.statusCode).json({
                        success: false,
                        error: {
                            message: error.message,
                            code: error.errorCode || 'LEAVE_PROJECT_FAILED'
                        }
                    });
                }
                else {
                    res.status(500).json({
                        success: false,
                        error: {
                            message: 'Failed to leave project',
                            code: 'LEAVE_PROJECT_FAILED'
                        }
                    });
                }
            }
        };
        this.getProjectMembers = async (req, res) => {
            try {
                const { id } = req.params;
                const userId = req.user.userId;
                const members = await this.projectService.getProjectMembers(id, userId);
                const safeMembers = members.map(member => ({
                    id: member.id,
                    email: member.email,
                    username: member.username,
                    firstName: member.firstName,
                    lastName: member.lastName,
                    avatar: member.avatar,
                    role: member.role,
                    createdAt: member.createdAt
                }));
                res.status(200).json({
                    success: true,
                    message: 'Project members retrieved successfully',
                    data: safeMembers
                });
                logger_1.default.info(`User ${userId} retrieved members of project ${id}`);
            }
            catch (error) {
                logger_1.default.error('Error getting project members:', error);
                if (error.statusCode) {
                    res.status(error.statusCode).json({
                        success: false,
                        error: {
                            message: error.message,
                            code: error.errorCode || 'GET_MEMBERS_FAILED'
                        }
                    });
                }
                else {
                    res.status(500).json({
                        success: false,
                        error: {
                            message: 'Failed to get project members',
                            code: 'GET_MEMBERS_FAILED'
                        }
                    });
                }
            }
        };
        this.getProjectStats = async (req, res) => {
            try {
                const { id } = req.params;
                const userId = req.user.userId;
                const stats = await this.projectService.getProjectStats(id, userId);
                res.status(200).json({
                    success: true,
                    message: 'Project statistics retrieved successfully',
                    data: stats
                });
                logger_1.default.info(`User ${userId} retrieved stats for project ${id}`);
            }
            catch (error) {
                logger_1.default.error('Error getting project stats:', error);
                if (error.statusCode) {
                    res.status(error.statusCode).json({
                        success: false,
                        error: {
                            message: error.message,
                            code: error.errorCode || 'GET_STATS_FAILED'
                        }
                    });
                }
                else {
                    res.status(500).json({
                        success: false,
                        error: {
                            message: 'Failed to get project statistics',
                            code: 'GET_STATS_FAILED'
                        }
                    });
                }
            }
        };
        this.projectService = new project_service_1.ProjectService();
    }
}
exports.ProjectController = ProjectController;
//# sourceMappingURL=project.controller.js.map