import { Response } from 'express';
import { ProjectService } from '../services/project.service';
import { AuthRequest } from '../types';
import logger from '../utils/logger';

export class ProjectController {
  private projectService: ProjectService;

  constructor() {
    this.projectService = new ProjectService();
  }

  // GET /api/v1/projects
  public getProjects = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { ownedOnly, memberOnly } = req.query;

      let projects;
      if (ownedOnly === 'true') {
        projects = await this.projectService.getOwnedProjects(userId);
      } else if (memberOnly === 'true') {
        projects = await this.projectService.getUserProjects(userId);
      } else {
        // Default: Get all projects user is member of (including owned)
        projects = await this.projectService.getUserProjects(userId);
      }

      res.status(200).json({
        success: true,
        message: 'Projects retrieved successfully',
        data: projects
      });

      logger.info(`User ${userId} retrieved projects`);
    } catch (error) {
      logger.error('Error getting projects:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get projects',
          code: 'GET_PROJECTS_FAILED'
        }
      });
    }
  };

  // GET /api/v1/projects/:id
  public getProjectById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const project = await this.projectService.getProjectById(id, userId);

      res.status(200).json({
        success: true,
        message: 'Project retrieved successfully',
        data: project
      });

      logger.info(`User ${userId} retrieved project ${id}`);
    } catch (error: any) {
      logger.error('Error getting project by ID:', error);
      
      if (error.statusCode) {
        res.status(error.statusCode).json({
          success: false,
          error: {
            message: error.message,
            code: error.errorCode || 'GET_PROJECT_FAILED'
          }
        });
      } else {
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

  // POST /api/v1/projects
  public createProject = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const createDto = req.body;

      const project = await this.projectService.createProject(createDto, userId);

      res.status(201).json({
        success: true,
        message: 'Project created successfully',
        data: project
      });

      logger.info(`User ${userId} created project ${project.id}`);
    } catch (error: any) {
      logger.error('Error creating project:', error);
      
      if (error.statusCode) {
        res.status(error.statusCode).json({
          success: false,
          error: {
            message: error.message,
            code: error.errorCode || 'CREATE_PROJECT_FAILED'
          }
        });
      } else {
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

  // PUT /api/v1/projects/:id
  public updateProject = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const updateDto = req.body;

      const project = await this.projectService.updateProject(id, updateDto, userId);

      res.status(200).json({
        success: true,
        message: 'Project updated successfully',
        data: project
      });

      logger.info(`User ${userId} updated project ${id}`);
    } catch (error: any) {
      logger.error('Error updating project:', error);
      
      if (error.statusCode) {
        res.status(error.statusCode).json({
          success: false,
          error: {
            message: error.message,
            code: error.errorCode || 'UPDATE_PROJECT_FAILED'
          }
        });
      } else {
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

  // DELETE /api/v1/projects/:id
  public deleteProject = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      await this.projectService.deleteProject(id, userId);

      res.status(200).json({
        success: true,
        message: 'Project deleted successfully'
      });

      logger.info(`User ${userId} deleted project ${id}`);
    } catch (error: any) {
      logger.error('Error deleting project:', error);
      
      if (error.statusCode) {
        res.status(error.statusCode).json({
          success: false,
          error: {
            message: error.message,
            code: error.errorCode || 'DELETE_PROJECT_FAILED'
          }
        });
      } else {
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

  // POST /api/v1/projects/:id/members
  public addMember = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { email } = req.body;
      const userId = req.user!.userId;

      await this.projectService.addMemberToProject(id, email, userId);

      res.status(200).json({
        success: true,
        message: 'Member added to project successfully'
      });

      logger.info(`User ${userId} added member ${email} to project ${id}`);
    } catch (error: any) {
      logger.error('Error adding member:', error);
      
      if (error.statusCode) {
        res.status(error.statusCode).json({
          success: false,
          error: {
            message: error.message,
            code: error.errorCode || 'ADD_MEMBER_FAILED'
          }
        });
      } else {
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

  // DELETE /api/v1/projects/:id/members/:memberId
  public removeMember = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id, memberId } = req.params;
      const userId = req.user!.userId;

      await this.projectService.removeMemberFromProject(id, memberId, userId);

      res.status(200).json({
        success: true,
        message: 'Member removed from project successfully'
      });

      logger.info(`User ${userId} removed member ${memberId} from project ${id}`);
    } catch (error: any) {
      logger.error('Error removing member:', error);
      
      if (error.statusCode) {
        res.status(error.statusCode).json({
          success: false,
          error: {
            message: error.message,
            code: error.errorCode || 'REMOVE_MEMBER_FAILED'
          }
        });
      } else {
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

  // POST /api/v1/projects/:id/leave
  public leaveProject = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      await this.projectService.leaveProject(id, userId);

      res.status(200).json({
        success: true,
        message: 'Left project successfully'
      });

      logger.info(`User ${userId} left project ${id}`);
    } catch (error: any) {
      logger.error('Error leaving project:', error);
      
      if (error.statusCode) {
        res.status(error.statusCode).json({
          success: false,
          error: {
            message: error.message,
            code: error.errorCode || 'LEAVE_PROJECT_FAILED'
          }
        });
      } else {
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

  // GET /api/v1/projects/:id/members
  public getProjectMembers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const members = await this.projectService.getProjectMembers(id, userId);

      // Remove sensitive data (password hash)
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

      logger.info(`User ${userId} retrieved members of project ${id}`);
    } catch (error: any) {
      logger.error('Error getting project members:', error);
      
      if (error.statusCode) {
        res.status(error.statusCode).json({
          success: false,
          error: {
            message: error.message,
            code: error.errorCode || 'GET_MEMBERS_FAILED'
          }
        });
      } else {
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

  // GET /api/v1/projects/:id/stats
  public getProjectStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const stats = await this.projectService.getProjectStats(id, userId);

      res.status(200).json({
        success: true,
        message: 'Project statistics retrieved successfully',
        data: stats
      });

      logger.info(`User ${userId} retrieved stats for project ${id}`);
    } catch (error: any) {
      logger.error('Error getting project stats:', error);
      
      if (error.statusCode) {
        res.status(error.statusCode).json({
          success: false,
          error: {
            message: error.message,
            code: error.errorCode || 'GET_STATS_FAILED'
          }
        });
      } else {
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
}