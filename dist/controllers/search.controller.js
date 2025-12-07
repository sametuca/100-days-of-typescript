"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchController = exports.SearchController = void 0;
const search_service_1 = require("../services/search.service");
class SearchController {
    async search(req, res) {
        try {
            const userId = req.user.userId;
            const searchQuery = {
                query: req.query.q || '',
                filters: {
                    status: req.query.status ? req.query.status.split(',') : undefined,
                    priority: req.query.priority ? req.query.priority.split(',') : undefined,
                    assigneeId: req.query.assigneeId ? req.query.assigneeId.split(',') : undefined,
                    projectId: req.query.projectId ? req.query.projectId.split(',') : undefined,
                    tags: req.query.tags ? req.query.tags.split(',') : undefined,
                    dateRange: req.query.from || req.query.to ? {
                        from: req.query.from ? new Date(req.query.from) : undefined,
                        to: req.query.to ? new Date(req.query.to) : undefined
                    } : undefined
                },
                sort: {
                    field: req.query.sortBy || 'relevance',
                    order: req.query.order || 'desc'
                },
                pagination: {
                    page: parseInt(req.query.page) || 1,
                    limit: parseInt(req.query.limit) || 20
                }
            };
            const results = await search_service_1.searchService.searchTasks(searchQuery, userId);
            res.json({
                success: true,
                data: results
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Search failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    async getSuggestions(req, res) {
        try {
            const userId = req.user.userId;
            const query = req.query.q;
            if (!query || query.length < 2) {
                res.json({ success: true, data: [] });
                return;
            }
            const suggestions = await search_service_1.searchService.getSuggestions(query, userId);
            res.json({
                success: true,
                data: suggestions
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to get suggestions',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    async saveSearch(req, res) {
        try {
            const userId = req.user.userId;
            const { name, query } = req.body;
            const savedSearch = await search_service_1.searchService.saveSearch(userId, name, query);
            res.status(201).json({
                success: true,
                data: savedSearch
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to save search',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    async getSavedSearches(req, res) {
        try {
            const userId = req.user.userId;
            const searches = await search_service_1.searchService.getSavedSearches(userId);
            res.json({
                success: true,
                data: searches
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to get saved searches',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    async deleteSavedSearch(req, res) {
        try {
            const userId = req.user.userId;
            const { id } = req.params;
            await search_service_1.searchService.deleteSavedSearch(id, userId);
            res.json({
                success: true,
                message: 'Search deleted successfully'
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to delete search',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}
exports.SearchController = SearchController;
exports.searchController = new SearchController();
//# sourceMappingURL=search.controller.js.map