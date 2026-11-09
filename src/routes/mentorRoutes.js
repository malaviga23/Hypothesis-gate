const express = require('express');
const router = express.Router();
const mentorController = require('../controllers/mentorController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

// Student endpoints
router.get('/projects/:projectId/recommendations', requireAuth, requireRole('student'), mentorController.getMentorRecommendations);
router.post('/projects/:projectId/request', requireAuth, requireRole('student'), mentorController.requestMentor);

// Mentor endpoints
router.get('/requests', requireAuth, requireRole('mentor'), mentorController.getIncomingRequests);
router.post('/requests/:requestId/respond', requireAuth, requireRole('mentor'), mentorController.respondToRequest);
router.get('/assigned-projects', requireAuth, requireRole('mentor'), mentorController.getAssignedProjects);
router.post('/projects/:projectId/review', requireAuth, requireRole('mentor'), mentorController.submitReview);

module.exports = router;
