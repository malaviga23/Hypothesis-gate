const express = require('express');
const router = express.Router();
const validationController = require('../controllers/validationController');
const { requireAuth } = require('../middleware/authMiddleware');

router.post('/projects/:projectId', requireAuth, validationController.runValidation);
router.get('/projects/:projectId', requireAuth, validationController.getValidation);

module.exports = router;
