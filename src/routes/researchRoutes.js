const express = require('express');
const router = express.Router();
const researchController = require('../controllers/researchController');
const { requireAuth } = require('../middleware/authMiddleware');

// Search academic literature (OpenAlex)
router.get('/search', requireAuth, researchController.searchLiterature);

// Compare paper with project idea
router.post('/projects/:projectId/compare', requireAuth, researchController.analyzePaperComparison);

// Link/save paper to project
router.post('/projects/:projectId/papers', requireAuth, researchController.savePaper);

// Get saved papers for a project
router.get('/projects/:projectId/papers', requireAuth, researchController.getSavedPapers);

// Remove saved paper from project
router.delete('/projects/:projectId/papers/:paperId', requireAuth, researchController.deletePaper);

module.exports = router;
