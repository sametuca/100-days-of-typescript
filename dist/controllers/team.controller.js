"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamController = void 0;
const team_service_1 = __importDefault(require("../services/team.service"));
class TeamController {
    async createTeam(req, res) {
        try {
            const { orgId } = req.params;
            const data = req.body;
            const team = await team_service_1.default.createTeam(orgId, data);
            res.status(201).json({
                success: true,
                data: team
            });
        }
        catch (error) {
            console.error('Create team error:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to create team'
            });
        }
    }
    async getOrganizationTeams(req, res) {
        try {
            const { orgId } = req.params;
            const teams = await team_service_1.default.getOrganizationTeams(orgId);
            res.json({
                success: true,
                data: teams
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to fetch teams'
            });
        }
    }
    async getTeam(req, res) {
        try {
            const { teamId } = req.params;
            const team = await team_service_1.default.getTeamById(teamId);
            res.json({
                success: true,
                data: team
            });
        }
        catch (error) {
            res.status(404).json({
                success: false,
                error: error.message || 'Team not found'
            });
        }
    }
    async updateTeam(req, res) {
        try {
            const { teamId } = req.params;
            const data = req.body;
            const team = await team_service_1.default.updateTeam(teamId, data);
            res.json({
                success: true,
                data: team
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to update team'
            });
        }
    }
    async deleteTeam(req, res) {
        try {
            const { teamId } = req.params;
            await team_service_1.default.deleteTeam(teamId);
            res.json({
                success: true,
                message: 'Team deleted successfully'
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to delete team'
            });
        }
    }
    async getTeamMembers(req, res) {
        try {
            const { teamId } = req.params;
            const members = await team_service_1.default.getTeamMembers(teamId);
            res.json({
                success: true,
                data: members
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to fetch team members'
            });
        }
    }
    async addTeamMember(req, res) {
        try {
            const { orgId, teamId } = req.params;
            const { userId } = req.body;
            await team_service_1.default.addTeamMember(teamId, userId, orgId);
            res.json({
                success: true,
                message: 'Member added to team successfully'
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to add team member'
            });
        }
    }
    async removeTeamMember(req, res) {
        try {
            const { teamId, userId } = req.params;
            await team_service_1.default.removeTeamMember(teamId, userId);
            res.json({
                success: true,
                message: 'Member removed from team successfully'
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to remove team member'
            });
        }
    }
    async getUserTeams(req, res) {
        try {
            const { orgId } = req.params;
            const userId = req.user.id;
            const teams = await team_service_1.default.getUserTeams(userId, orgId);
            res.json({
                success: true,
                data: teams
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to fetch user teams'
            });
        }
    }
}
exports.TeamController = TeamController;
exports.default = new TeamController();
//# sourceMappingURL=team.controller.js.map