import express from 'express';
import * as searchController from '../controllers/search.controller.js';

const router = express.Router();

router.get('/', searchController.search);
router.get('/suggestions', searchController.getSearchSuggestions);
router.get('/stats', searchController.getSearchStats);
router.get('/popular', searchController.getPopularSearches);

export default router;
