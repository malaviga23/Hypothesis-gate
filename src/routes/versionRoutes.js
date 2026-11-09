const express = require('express');
const router = express.Router();
const versionController = require('../controllers/versionController');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/projects/:projectId/versions', requireAuth, versionController.getProjectVersions);
router.get('/projects/:projectId/versions/:versionId', requireAuth, versionController.getVersionById);
router.post('/projects/:projectId/versions/snapshot', requireAuth, versionController.createManualSnapshot);

module.exports = router;
