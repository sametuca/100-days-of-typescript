"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectService = void 0;
const project_repository_1 = require("../repositories/project.repository");
const user_repository_1 = require("../repositories/user.repository");
const errors_1 = require("../utils/errors");
class ProjectService {
    constructor() {
        this.projectRepository = new project_repository_1.ProjectRepository();
        this.userRepository = new user_repository_1.UserRepository();
    }
    async createProject(createDto, ownerId) {
        const owner = await this.userRepository.findById(ownerId);
        if (!owner) {
            throw new errors_1.ApiError('Owner not found', 404, 'OWNER_NOT_FOUND');
        }
        if (createDto.memberIds && createDto.memberIds.length > 0) {
            for (const memberId of createDto.memberIds) {
                const member = await this.userRepository.findById(memberId);
                if (!member) {
                    throw new errors_1.ApiError(`Member with ID ${memberId} not found`, 404, 'MEMBER_NOT_FOUND');
                }
            }
        }
        return await this.projectRepository.create(createDto, ownerId);
    }
    async getProjectById(id, userId) {
        const project = await this.projectRepository.findById(id);
        if (!project) {
            throw new errors_1.ApiError('Project not found', 404, 'PROJECT_NOT_FOUND');
        }
        if (!project.memberIds.includes(userId)) {
            throw new errors_1.ApiError('Access denied. You are not a member of this project', 403, 'ACCESS_DENIED');
        }
        return project;
    }
    async getUserProjects(userId) {
        return await this.projectRepository.findByMemberId(userId);
    }
    async getOwnedProjects(ownerId) {
        return await this.projectRepository.findByOwnerId(ownerId);
    }
    async updateProject(id, updateDto, userId) {
        const project = await this.projectRepository.findById(id);
        if (!project) {
            throw new errors_1.ApiError('Project not found', 404, 'PROJECT_NOT_FOUND');
        }
        if (project.ownerId !== userId) {
            throw new errors_1.ApiError('Only project owner can update project details', 403, 'ACCESS_DENIED');
        }
        const updatedProject = await this.projectRepository.update(id, updateDto);
        if (!updatedProject) {
            throw new errors_1.ApiError('Failed to update project', 500, 'UPDATE_FAILED');
        }
        return updatedProject;
    }
    async deleteProject(id, userId) {
        const project = await this.projectRepository.findById(id);
        if (!project) {
            throw new errors_1.ApiError('Project not found', 404, 'PROJECT_NOT_FOUND');
        }
        if (project.ownerId !== userId) {
            throw new errors_1.ApiError('Only project owner can delete project', 403, 'ACCESS_DENIED');
        }
        const deleted = await this.projectRepository.delete(id);
        if (!deleted) {
            throw new errors_1.ApiError('Failed to delete project', 500, 'DELETE_FAILED');
        }
    }
    async addMemberToProject(projectId, memberEmail, userId) {
        const project = await this.projectRepository.findById(projectId);
        if (!project) {
            throw new errors_1.ApiError('Project not found', 404, 'PROJECT_NOT_FOUND');
        }
        if (project.ownerId !== userId) {
            throw new errors_1.ApiError('Only project owner can add members', 403, 'ACCESS_DENIED');
        }
        const newMember = await this.userRepository.findByEmail(memberEmail);
        if (!newMember) {
            throw new errors_1.ApiError('User not found', 404, 'USER_NOT_FOUND');
        }
        if (project.memberIds.includes(newMember.id)) {
            throw new errors_1.ApiError('User is already a member of this project', 400, 'ALREADY_MEMBER');
        }
        const added = await this.projectRepository.addMember(projectId, newMember.id);
        if (!added) {
            throw new errors_1.ApiError('Failed to add member', 500, 'ADD_MEMBER_FAILED');
        }
    }
    async removeMemberFromProject(projectId, memberId, userId) {
        const project = await this.projectRepository.findById(projectId);
        if (!project) {
            throw new errors_1.ApiError('Project not found', 404, 'PROJECT_NOT_FOUND');
        }
        if (project.ownerId !== userId) {
            throw new errors_1.ApiError('Only project owner can remove members', 403, 'ACCESS_DENIED');
        }
        if (memberId === project.ownerId) {
            throw new errors_1.ApiError('Project owner cannot be removed', 400, 'CANNOT_REMOVE_OWNER');
        }
        if (!project.memberIds.includes(memberId)) {
            throw new errors_1.ApiError('User is not a member of this project', 400, 'NOT_A_MEMBER');
        }
        const removed = await this.projectRepository.removeMember(projectId, memberId);
        if (!removed) {
            throw new errors_1.ApiError('Failed to remove member', 500, 'REMOVE_MEMBER_FAILED');
        }
    }
    async leaveProject(projectId, userId) {
        const project = await this.projectRepository.findById(projectId);
        if (!project) {
            throw new errors_1.ApiError('Project not found', 404, 'PROJECT_NOT_FOUND');
        }
        if (project.ownerId === userId) {
            throw new errors_1.ApiError('Project owner cannot leave project. Transfer ownership first or delete the project.', 400, 'OWNER_CANNOT_LEAVE');
        }
        if (!project.memberIds.includes(userId)) {
            throw new errors_1.ApiError('You are not a member of this project', 400, 'NOT_A_MEMBER');
        }
        const removed = await this.projectRepository.removeMember(projectId, userId);
        if (!removed) {
            throw new errors_1.ApiError('Failed to leave project', 500, 'LEAVE_PROJECT_FAILED');
        }
    }
    async getProjectMembers(projectId, userId) {
        const project = await this.projectRepository.findById(projectId);
        if (!project) {
            throw new errors_1.ApiError('Project not found', 404, 'PROJECT_NOT_FOUND');
        }
        if (!project.memberIds.includes(userId)) {
            throw new errors_1.ApiError('Access denied. You are not a member of this project', 403, 'ACCESS_DENIED');
        }
        const members = [];
        for (const memberId of project.memberIds) {
            const member = await this.userRepository.findById(memberId);
            if (member) {
                members.push(member);
            }
        }
        return members;
    }
    async getProjectStats(projectId, userId) {
        const project = await this.projectRepository.findById(projectId);
        if (!project) {
            throw new errors_1.ApiError('Project not found', 404, 'PROJECT_NOT_FOUND');
        }
        if (!project.memberIds.includes(userId)) {
            throw new errors_1.ApiError('Access denied. You are not a member of this project', 403, 'ACCESS_DENIED');
        }
        const stats = await this.projectRepository.getProjectStats(projectId);
        return {
            ...stats,
            completionRate: stats.totalTasks > 0 ?
                Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0
        };
    }
    async transferOwnership(projectId, newOwnerId, currentUserId) {
        const project = await this.projectRepository.findById(projectId);
        if (!project) {
            throw new errors_1.ApiError('Project not found', 404, 'PROJECT_NOT_FOUND');
        }
        if (project.ownerId !== currentUserId) {
            throw new errors_1.ApiError('Only project owner can transfer ownership', 403, 'ACCESS_DENIED');
        }
        if (!project.memberIds.includes(newOwnerId)) {
            throw new errors_1.ApiError('New owner must be a member of the project', 400, 'NOT_A_MEMBER');
        }
        const newOwner = await this.userRepository.findById(newOwnerId);
        if (!newOwner) {
            throw new errors_1.ApiError('New owner not found', 404, 'USER_NOT_FOUND');
        }
        await this.projectRepository.update(projectId, {});
    }
}
exports.ProjectService = ProjectService;
//# sourceMappingURL=project.service.js.map