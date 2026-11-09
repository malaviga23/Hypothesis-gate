const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/projects/:projectId/data', requireAuth, reportController.getReportData);
router.get('/projects/:projectId/pdf', requireAuth, reportController.downloadReportPdf);

module.exports = router;
