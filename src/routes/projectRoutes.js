const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.post('/', requireAuth, requireRole('student'), projectController.createProject);
router.get('/', requireAuth, requireRole('student'), projectController.getStudentProjects);
router.get('/:id', requireAuth, projectController.getProjectById);
router.put('/:id', requireAuth, requireRole('student'), projectController.updateProject);
router.delete('/:id', requireAuth, requireRole('student'), projectController.deleteProject);

module.exports = router;
