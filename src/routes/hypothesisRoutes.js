const express = require('express');
const router = express.Router();
const hypothesisController = require('../controllers/hypothesisController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

// Hypotheses
router.post('/projects/:projectId/hypotheses', requireAuth, requireRole('student'), hypothesisController.createHypothesis);
router.get('/projects/:projectId/hypotheses', requireAuth, hypothesisController.getHypotheses);

// Experiments
router.post('/projects/:projectId/experiments', requireAuth, requireRole('student'), hypothesisController.createExperiment);
router.get('/projects/:projectId/experiments', requireAuth, hypothesisController.getExperiments);
router.put('/experiments/:experimentId', requireAuth, hypothesisController.updateExperiment);
router.post('/experiments/:experimentId/mentor-review', requireAuth, requireRole('mentor'), hypothesisController.mentorReviewExperiment);

module.exports = router;
