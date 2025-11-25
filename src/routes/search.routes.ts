import { Router } from 'express';
import { searchController } from '../controllers/search.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', searchController.search.bind(searchController));
router.get('/suggestions', searchController.getSuggestions.bind(searchController));
router.post('/saved', searchController.saveSearch.bind(searchController));
router.get('/saved', searchController.getSavedSearches.bind(searchController));
router.delete('/saved/:id', searchController.deleteSavedSearch.bind(searchController));

export default router;
