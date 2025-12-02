import { Request, Response } from 'express';
import { searchService } from '../services/search.service';
import { SearchQuery } from '../types/search.types';

export class SearchController {
  async search(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const searchQuery: SearchQuery = {
        query: req.query.q as string || '',
        filters: {
          status: req.query.status ? (req.query.status as string).split(',') : undefined,
          priority: req.query.priority ? (req.query.priority as string).split(',') : undefined,
          assigneeId: req.query.assigneeId ? (req.query.assigneeId as string).split(',') : undefined,
          projectId: req.query.projectId ? (req.query.projectId as string).split(',') : undefined,
          tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
          dateRange: req.query.from || req.query.to ? {
            from: req.query.from ? new Date(req.query.from as string) : undefined,
            to: req.query.to ? new Date(req.query.to as string) : undefined
          } : undefined
        },
        sort: {
          field: (req.query.sortBy as any) || 'relevance',
          order: (req.query.order as any) || 'desc'
        },
        pagination: {
          page: parseInt(req.query.page as string) || 1,
          limit: parseInt(req.query.limit as string) || 20
        }
      };

      const results = await searchService.searchTasks(searchQuery, userId);

      res.json({
        success: true,
        data: results
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Search failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getSuggestions(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const query = req.query.q as string;

      if (!query || query.length < 2) {
        res.json({ success: true, data: [] });
        return;
      }

      const suggestions = await searchService.getSuggestions(query, userId);

      res.json({
        success: true,
        data: suggestions
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get suggestions',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async saveSearch(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { name, query } = req.body;

      const savedSearch = await searchService.saveSearch(userId, name, query);

      res.status(201).json({
        success: true,
        data: savedSearch
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to save search',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getSavedSearches(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const searches = await searchService.getSavedSearches(userId);

      res.json({
        success: true,
        data: searches
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get saved searches',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async deleteSavedSearch(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      await searchService.deleteSavedSearch(id, userId);

      res.json({
        success: true,
        message: 'Search deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete search',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export const searchController = new SearchController();
