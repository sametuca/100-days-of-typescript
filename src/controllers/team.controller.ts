import { Request, Response } from 'express';
import TeamService from '../services/team.service';
import { CreateTeamDto, UpdateTeamDto } from '../types/organization.types';

export class TeamController {
    /**
     * Create new team
     */
    async createTeam(req: Request, res: Response) {
        try {
            const { orgId } = req.params;
            const data: CreateTeamDto = req.body;

            const team = await TeamService.createTeam(orgId, data);

            res.status(201).json({
                success: true,
                data: team
            });
        } catch (error: any) {
            console.error('Create team error:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to create team'
            });
        }
    }

    /**
     * Get all teams in organization
     */
    async getOrganizationTeams(req: Request, res: Response) {
        try {
            const { orgId } = req.params;
            const teams = await TeamService.getOrganizationTeams(orgId);

            res.json({
                success: true,
                data: teams
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to fetch teams'
            });
        }
    }

    /**
     * Get team by ID
     */
    async getTeam(req: Request, res: Response) {
        try {
            const { teamId } = req.params;
            const team = await TeamService.getTeamById(teamId);

            res.json({
                success: true,
                data: team
            });
        } catch (error: any) {
            res.status(404).json({
                success: false,
                error: error.message || 'Team not found'
            });
        }
    }

    /**
     * Update team
     */
    async updateTeam(req: Request, res: Response) {
        try {
            const { teamId } = req.params;
            const data: UpdateTeamDto = req.body;

            const team = await TeamService.updateTeam(teamId, data);

            res.json({
                success: true,
                data: team
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to update team'
            });
        }
    }

    /**
     * Delete team
     */
    async deleteTeam(req: Request, res: Response) {
        try {
            const { teamId } = req.params;
            await TeamService.deleteTeam(teamId);

            res.json({
                success: true,
                message: 'Team deleted successfully'
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to delete team'
            });
        }
    }

    /**
     * Get team members
     */
    async getTeamMembers(req: Request, res: Response) {
        try {
            const { teamId } = req.params;
            const members = await TeamService.getTeamMembers(teamId);

            res.json({
                success: true,
                data: members
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to fetch team members'
            });
        }
    }

    /**
     * Add member to team
     */
    async addTeamMember(req: Request, res: Response) {
        try {
            const { orgId, teamId } = req.params;
            const { userId } = req.body;

            await TeamService.addTeamMember(teamId, userId, orgId);

            res.json({
                success: true,
                message: 'Member added to team successfully'
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to add team member'
            });
        }
    }

    /**
     * Remove member from team
     */
    async removeTeamMember(req: Request, res: Response) {
        try {
            const { teamId, userId } = req.params;

            await TeamService.removeTeamMember(teamId, userId);

            res.json({
                success: true,
                message: 'Member removed from team successfully'
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to remove team member'
            });
        }
    }

    /**
     * Get user's teams
     */
    async getUserTeams(req: Request, res: Response) {
        try {
            const { orgId } = req.params;
            const userId = req.user!.id;

            const teams = await TeamService.getUserTeams(userId, orgId);

            res.json({
                success: true,
                data: teams
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to fetch user teams'
            });
        }
    }
}

export default new TeamController();
