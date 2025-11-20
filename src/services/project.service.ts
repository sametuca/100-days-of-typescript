import { ProjectRepository } from '../repositories/project.repository';
import { UserRepository } from '../repositories/user.repository';
import { Project, CreateProjectDto, UpdateProjectDto, User } from '../types';
import { ApiError } from '../utils/errors';

export class ProjectService {
  private projectRepository: ProjectRepository;
  private userRepository: UserRepository;

  constructor() {
    this.projectRepository = new ProjectRepository();
    this.userRepository = new UserRepository();
  }

  async createProject(createDto: CreateProjectDto, ownerId: string): Promise<Project> {
    // Validate owner exists
    const owner = await this.userRepository.findById(ownerId);
    if (!owner) {
      throw new ApiError('Owner not found', 404, 'OWNER_NOT_FOUND');
    }

    // Validate member IDs if provided
    if (createDto.memberIds && createDto.memberIds.length > 0) {
      for (const memberId of createDto.memberIds) {
        const member = await this.userRepository.findById(memberId);
        if (!member) {
          throw new ApiError(`Member with ID ${memberId} not found`, 404, 'MEMBER_NOT_FOUND');
        }
      }
    }

    return await this.projectRepository.create(createDto, ownerId);
  }

  async getProjectById(id: string, userId: string): Promise<Project> {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new ApiError('Project not found', 404, 'PROJECT_NOT_FOUND');
    }

    // Check if user is a member or owner
    if (!project.memberIds.includes(userId)) {
      throw new ApiError('Access denied. You are not a member of this project', 403, 'ACCESS_DENIED');
    }

    return project;
  }

  async getUserProjects(userId: string): Promise<Project[]> {
    return await this.projectRepository.findByMemberId(userId);
  }

  async getOwnedProjects(ownerId: string): Promise<Project[]> {
    return await this.projectRepository.findByOwnerId(ownerId);
  }

  async updateProject(id: string, updateDto: UpdateProjectDto, userId: string): Promise<Project> {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new ApiError('Project not found', 404, 'PROJECT_NOT_FOUND');
    }

    // Only owner can update project details
    if (project.ownerId !== userId) {
      throw new ApiError('Only project owner can update project details', 403, 'ACCESS_DENIED');
    }

    const updatedProject = await this.projectRepository.update(id, updateDto);
    if (!updatedProject) {
      throw new ApiError('Failed to update project', 500, 'UPDATE_FAILED');
    }

    return updatedProject;
  }

  async deleteProject(id: string, userId: string): Promise<void> {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new ApiError('Project not found', 404, 'PROJECT_NOT_FOUND');
    }

    // Only owner can delete project
    if (project.ownerId !== userId) {
      throw new ApiError('Only project owner can delete project', 403, 'ACCESS_DENIED');
    }

    const deleted = await this.projectRepository.delete(id);
    if (!deleted) {
      throw new ApiError('Failed to delete project', 500, 'DELETE_FAILED');
    }
  }

  async addMemberToProject(projectId: string, memberEmail: string, userId: string): Promise<void> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new ApiError('Project not found', 404, 'PROJECT_NOT_FOUND');
    }

    // Only owner can add members
    if (project.ownerId !== userId) {
      throw new ApiError('Only project owner can add members', 403, 'ACCESS_DENIED');
    }

    // Find user by email
    const newMember = await this.userRepository.findByEmail(memberEmail);
    if (!newMember) {
      throw new ApiError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Check if already a member
    if (project.memberIds.includes(newMember.id)) {
      throw new ApiError('User is already a member of this project', 400, 'ALREADY_MEMBER');
    }

    const added = await this.projectRepository.addMember(projectId, newMember.id);
    if (!added) {
      throw new ApiError('Failed to add member', 500, 'ADD_MEMBER_FAILED');
    }
  }

  async removeMemberFromProject(projectId: string, memberId: string, userId: string): Promise<void> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new ApiError('Project not found', 404, 'PROJECT_NOT_FOUND');
    }

    // Only owner can remove members (and owner cannot be removed)
    if (project.ownerId !== userId) {
      throw new ApiError('Only project owner can remove members', 403, 'ACCESS_DENIED');
    }

    if (memberId === project.ownerId) {
      throw new ApiError('Project owner cannot be removed', 400, 'CANNOT_REMOVE_OWNER');
    }

    // Check if user is actually a member
    if (!project.memberIds.includes(memberId)) {
      throw new ApiError('User is not a member of this project', 400, 'NOT_A_MEMBER');
    }

    const removed = await this.projectRepository.removeMember(projectId, memberId);
    if (!removed) {
      throw new ApiError('Failed to remove member', 500, 'REMOVE_MEMBER_FAILED');
    }
  }

  async leaveProject(projectId: string, userId: string): Promise<void> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new ApiError('Project not found', 404, 'PROJECT_NOT_FOUND');
    }

    // Owner cannot leave their own project
    if (project.ownerId === userId) {
      throw new ApiError('Project owner cannot leave project. Transfer ownership first or delete the project.', 400, 'OWNER_CANNOT_LEAVE');
    }

    // Check if user is a member
    if (!project.memberIds.includes(userId)) {
      throw new ApiError('You are not a member of this project', 400, 'NOT_A_MEMBER');
    }

    const removed = await this.projectRepository.removeMember(projectId, userId);
    if (!removed) {
      throw new ApiError('Failed to leave project', 500, 'LEAVE_PROJECT_FAILED');
    }
  }

  async getProjectMembers(projectId: string, userId: string): Promise<User[]> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new ApiError('Project not found', 404, 'PROJECT_NOT_FOUND');
    }

    // Check if user is a member
    if (!project.memberIds.includes(userId)) {
      throw new ApiError('Access denied. You are not a member of this project', 403, 'ACCESS_DENIED');
    }

    const members: User[] = [];
    for (const memberId of project.memberIds) {
      const member = await this.userRepository.findById(memberId);
      if (member) {
        members.push(member);
      }
    }

    return members;
  }

  async getProjectStats(projectId: string, userId: string): Promise<{
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    memberCount: number;
    completionRate: number;
  }> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new ApiError('Project not found', 404, 'PROJECT_NOT_FOUND');
    }

    // Check if user is a member
    if (!project.memberIds.includes(userId)) {
      throw new ApiError('Access denied. You are not a member of this project', 403, 'ACCESS_DENIED');
    }

    const stats = await this.projectRepository.getProjectStats(projectId);
    
    return {
      ...stats,
      completionRate: stats.totalTasks > 0 ? 
        Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0
    };
  }

  async transferOwnership(projectId: string, newOwnerId: string, currentUserId: string): Promise<void> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new ApiError('Project not found', 404, 'PROJECT_NOT_FOUND');
    }

    // Only current owner can transfer ownership
    if (project.ownerId !== currentUserId) {
      throw new ApiError('Only project owner can transfer ownership', 403, 'ACCESS_DENIED');
    }

    // New owner must be a member of the project
    if (!project.memberIds.includes(newOwnerId)) {
      throw new ApiError('New owner must be a member of the project', 400, 'NOT_A_MEMBER');
    }

    // Validate new owner exists
    const newOwner = await this.userRepository.findById(newOwnerId);
    if (!newOwner) {
      throw new ApiError('New owner not found', 404, 'USER_NOT_FOUND');
    }

    await this.projectRepository.update(projectId, {
      // Update owner in database
    });
    
    // Note: We'd need to add an owner_id field update in the repository
  }
}
