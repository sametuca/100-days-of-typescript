"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const search_controller_1 = require("../controllers/search.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get('/', search_controller_1.searchController.search.bind(search_controller_1.searchController));
router.get('/suggestions', search_controller_1.searchController.getSuggestions.bind(search_controller_1.searchController));
router.post('/saved', search_controller_1.searchController.saveSearch.bind(search_controller_1.searchController));
router.get('/saved', search_controller_1.searchController.getSavedSearches.bind(search_controller_1.searchController));
router.delete('/saved/:id', search_controller_1.searchController.deleteSavedSearch.bind(search_controller_1.searchController));
exports.default = router;
//# sourceMappingURL=search.routes.js.map